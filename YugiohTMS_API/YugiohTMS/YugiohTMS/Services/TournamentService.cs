using System.Linq;
using YugiohTMS.Models;

namespace YugiohTMS.Services
{
    public class TournamentService
    {

        public static  List<Models.Match> GenerateSingleEliminationMatches(int tournamentId, List<int> players)
        {
            int totalRounds = (int)Math.Ceiling(Math.Log2(players.Count));
            players = players.OrderBy(p => new Random().Next()).ToList();

            List<Models.Match> allMatches = new List<Models.Match>();

            for (int round = 1; round <= totalRounds; round++)
            {
                int matchesInRound = (int)Math.Pow(2, totalRounds - round);
                for (int i = 0; i < matchesInRound; i++)
                {
                    int? user1 = (i * 2 < players.Count) ? players[i * 2] : (int?)null;
                    int? user2 = (i * 2 + 1 < players.Count) ? players[i * 2 + 1] : (int?)null;

                    var match = new Models.Match
                    {
                        ID_Tournament = tournamentId,
                        RoundNumber = round,
                        ID_User1 = (round == 1) ? user1 : null,
                        ID_User2 = (round == 1) ? user2 : null,
                        Status = "Scheduled",
                        ID_NextMatch = null
                    };
                    allMatches.Add(match);
                }
            }

            return allMatches;
        }

        public static void LinkSingleEliminationMatches(List<Models.Match> matches)
        {
            var rounds = matches
                .OrderBy(m => m.RoundNumber)
                .GroupBy(m => m.RoundNumber)
                .OrderBy(g => g.Key)
                .ToList();

            for (int i = 0; i < rounds.Count - 1; i++)
            {
                var currentRound = rounds[i].ToList();
                var nextRound = rounds[i + 1].ToList();

                for (int j = 0; j < currentRound.Count; j++)
                {
                    int nextMatchIndex = j / 2;
                    if (nextMatchIndex < nextRound.Count)
                    {
                        currentRound[j].ID_NextMatch = nextRound[nextMatchIndex].ID_Match;
                    }
                }
            }
        }

        public static List<Models.Match> GenerateRoundRobinMatches(int tournamentId, List<int> players)
        {
            List<Models.Match> matches = new List<Models.Match>();
            int numPlayers = players.Count;

            bool hasBye = numPlayers % 2 != 0;
            if (hasBye)
            {
                players.Add(-1);
                numPlayers++;
            }

            int numRounds = numPlayers - 1;
            int halfSize = numPlayers / 2;

            for (int round = 0; round < numRounds; round++)
            {
                for (int i = 0; i < halfSize; i++)
                {
                    int player1 = players[i];
                    int player2 = players[numPlayers - 1 - i];

                    if (player1 == -1 || player2 == -1)
                        continue;

                    matches.Add(new Models.Match
                    {
                        ID_Tournament = tournamentId,
                        RoundNumber = round + 1,
                        ID_User1 = player1,
                        ID_User2 = player2,
                        Status = "Scheduled"
                    });
                }

                List<int> rotatedPlayers = new List<int> { players[0] };
                rotatedPlayers.Add(players[^1]);
                rotatedPlayers.AddRange(players.Skip(1).Take(players.Count - 2));
                players = rotatedPlayers;
            }

            return matches;
        }

        public static List<Models.Match> GenerateSwissMatches(int tournamentId, List<int> players)
        {
            List<Models.Match> matches = new List<Models.Match>();
            int numPlayers = players.Count;
            Random rng = new Random();

            bool hasBye = numPlayers % 2 != 0;
            if (hasBye)
            {
                players.Add(-1);
                numPlayers++;
            }

            List<int> shuffledPlayers = players.OrderBy(p => rng.Next()).ToList();

            for (int i = 0; i < numPlayers; i += 2)
            {
                int player1 = shuffledPlayers[i];
                int player2 = shuffledPlayers[i + 1];

                if (player1 == -1 || player2 == -1)
                    continue;

                matches.Add(new Models.Match
                {
                    ID_Tournament = tournamentId,
                    RoundNumber = 1,
                    ID_User1 = player1,
                    ID_User2 = player2,
                    Status = "Scheduled"
                });
            }

            return matches;
        }

        public static Dictionary<int, int> CalculateRatingChanges(List<TournamentPlayer> participants, Dictionary<int, int> standings)
        {
            const int kFactor = 32;
            const int scaleFactor = 1000;
            var ratingChanges = new Dictionary<int, int>();

            var allRatings = participants.Select(p => p.InitialRating).ToList();
            var totalRating = allRatings.Sum();

            foreach (var participant in participants)
            {
                var position = standings[participant.User.ID_User];
                var actualScore = CalculateActualScore(position, participants.Count, scaleFactor);
                var expectedScore = CalculateExpectedScore(participant.InitialRating, totalRating, scaleFactor);

                int change = (kFactor * (actualScore - expectedScore)) / scaleFactor;

                ratingChanges.Add(participant.User.ID_User, change);
            }

            return ratingChanges;
        }

        public static int CalculateActualScore(int position, int totalPlayers, int scaleFactor)
        {

            return (totalPlayers - position + 1) * scaleFactor;
        }

        public static int CalculateExpectedScore(int playerRating, int totalRating, int scaleFactor)
        {
            return (playerRating * scaleFactor) / totalRating;
        }

        public static async Task<(int? WinnerId, Dictionary<int, int> Standings)> DetermineTournamentResults(Tournament tournament)
        {
            var standings = new Dictionary<int, int>();
            int? winnerId = null;
            var matches = tournament.Matches;

            switch (tournament.Type)
            {
                case "Single Elimination":
                    var finalMatch = matches
                        .OrderByDescending(m => m.RoundNumber)
                        .FirstOrDefault(m => m.RoundNumber > 0);

                    winnerId = finalMatch?.ID_Winner;

                    if (winnerId.HasValue)
                    {
                        standings[winnerId.Value] = 1;
                        var runnerUp = GetRunnerUp(finalMatch);
                        if (runnerUp.HasValue) standings[runnerUp.Value] = 2;

                        var otherPlayers = tournament.Participants
                            .Select(p => p.User.ID_User)
                            .Except(standings.Keys)
                            .ToList();
                        for (int i = 0; i < otherPlayers.Count; i++)
                        {
                            standings[otherPlayers[i]] = 3 + i;
                        }
                    }
                    break;

                case "Round Robin":
                case "Swiss Stage":
                    break;
            }

            return (winnerId, standings);
        }

        public static int? GetRunnerUp(Models.Match finalMatch)
        {
            if (finalMatch?.ID_User1 == finalMatch?.ID_Winner)
                return finalMatch.ID_User2;
            if (finalMatch?.ID_User2 == finalMatch?.ID_Winner)
                return finalMatch.ID_User1;
            return null;
        }
    }
}
