using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Text.RegularExpressions;
using YugiohTMS.DTO_Models;
using YugiohTMS.Models;
using YugiohTMS.Services;
using static YugiohTMS.Models.TournamentPlayer;

namespace YugiohTMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TournamentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TournamentController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("create-tournament")]
        public async Task<IActionResult> CreateTournament([FromBody] Tournament tournament)
        {
            if (string.IsNullOrWhiteSpace(tournament.Name) ||
                string.IsNullOrWhiteSpace(tournament.Type) ||
                tournament.StartDate == null ||
                string.IsNullOrWhiteSpace(tournament.Location))
            {
                return BadRequest("All fields need to be filled");
            }

            if (tournament.Type == "Swiss Stage" &&
                (tournament.NumOfRounds == null || tournament.NumOfRounds < 1))
            {
                return BadRequest("Swiss Stage tournaments require at least 1 round");
            }

            var newTournament = new Tournament
            {
                Name = tournament.Name,
                Type = tournament.Type,
                ID_User = tournament.ID_User,
                Status = tournament.Status ?? "NotStarted",
                StartDate = tournament.StartDate,
                Location = tournament.Location,
                NumOfRounds = tournament.Type == "Swiss Stage"
                    ? tournament.NumOfRounds
                    : 0
            };

            _context.Tournament.Add(newTournament);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTournamentById),
                new { id = newTournament.ID_Tournament },
                newTournament);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Tournament>> GetTournamentById(int id)
        {
            var tournament = await _context.Tournament
                .AsNoTracking()
                .Include(t => t.Winner)
                .FirstOrDefaultAsync(t => t.ID_Tournament == id);

            return tournament ?? (ActionResult<Tournament>)NotFound($"Tournament {id} not found");
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Tournament>>> GetUserTournaments(int userId)
        {
            var tournaments = await _context.Tournament
                .Where(t => t.ID_User == userId)
                .Include(t => t.Winner)
                .AsNoTracking()
                .ToListAsync();
            return Ok(tournaments);
        }

        [HttpGet("all-tournaments")]
        public async Task<ActionResult<IEnumerable<Tournament>>> GetTournaments()
        {
            var tournaments = await _context.Tournament
                .Include(t => t.Winner)
                .AsNoTracking()
                .ToListAsync();

            return Ok(tournaments);
        }

        [HttpGet("tournament/{ID_Tournament}")]
        public async Task<ActionResult<TournamentPlayersDto>> GetTournamentPlayers(int ID_Tournament)
        {
            var tournament = await _context.Tournament
                .Where(t => t.ID_Tournament == ID_Tournament)
                .Select(t => new
                {
                    OwnerID = t.ID_User,
                    Status = t.Status,
                    Type = t.Type,
                    Winner = t.Winner != null ? t.Winner.Username : null,
                    NumOfRounds = t.NumOfRounds
                })
                .FirstOrDefaultAsync();

            if (tournament == null)
            {
                return NotFound($"Tournament with ID {ID_Tournament} does not exist.");
            }

            var players = await _context.TournamentPlayer
    .Where(tp => tp.ID_Tournament == ID_Tournament)
    .Include(tp => tp.User)
    .Include(tp => tp.Deck)
    .Select(tp => new PlayerDto
    {
        Id = tp.User.ID_User,
        Name = tp.User.Username,
        DeckName = tp.Deck != null ? tp.Deck.Name : null,
        Rating = tp.InitialRating
    })
    .ToListAsync();


            var dto = new TournamentPlayersDto
            {
                OwnerID = tournament.OwnerID,
                Status = tournament.Status,
                Type = tournament.Type,
                Winner = tournament.Winner,
                Players = players,
                NumOfRounds = (int)tournament.NumOfRounds
            };

            return Ok(dto);
        }

        [HttpPost("jointournament")]
        public async Task<IActionResult> JoinTournament([FromBody] TournamentPlayerDto playerDto)
        {
            if (playerDto.ID_Tournament == 0 || playerDto.ID_User == 0)
            {
                return BadRequest("Tournament ID and User ID are required.");
            }

            var userExists = await _context.User.AnyAsync(u => u.ID_User == playerDto.ID_User);
            if (!userExists)
            {
                return BadRequest($"User with ID {playerDto.ID_User} does not exist.");
            }

            var deckExists = await _context.Deck.AnyAsync(d => d.ID_Deck == playerDto.ID_Deck);
            if (!deckExists)
            {
                return BadRequest("Selected deck does not exist.");
            }

            var player = await _context.User.Where(tp => tp.ID_User == playerDto.ID_User).FirstOrDefaultAsync();

            var newPlayer = new TournamentPlayer
            {
                ID_Tournament = playerDto.ID_Tournament,
                ID_User = playerDto.ID_User,
                ID_Deck = playerDto.ID_Deck,
                InitialRating = player.Rating,

            };

            _context.TournamentPlayer.Add(newPlayer);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("start-tournament/{tournamentId}")]
        public async Task<IActionResult> StartTournament(int tournamentId)
        {
            if (tournamentId == null || tournamentId <= 0)
                return BadRequest("Invalid tournament ID.");

            var tournament = await _context.Tournament.FindAsync(tournamentId);

            if (tournament == null)
                return NotFound("Tournament not found.");

            if (tournament.Status == "InProgress")
                return BadRequest("Tournament has already started.");

            tournament.Status = "InProgress";

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new JoinResponseDto { Message = "Tournament started successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error updating tournament status: " + ex.Message);
            }
        }




        [HttpGet("tournament/generate-matches/{tournamentId}")]
        public IActionResult GenerateMatches(int tournamentId)
        {
            var tournament = _context.Tournament
                .FirstOrDefault(t => t.ID_Tournament == tournamentId);

            if (tournament == null)
                return NotFound("Tournament not found.");

            var players = _context.TournamentPlayer
                .Where(p => p.ID_Tournament == tournamentId)
                .Select(p => p.ID_User)
                .ToList();

            if (players.Count < 2)
                return BadRequest("Not enough players to create matches.");

            var existingMatches = _context.Match
                .Where(m => m.ID_Tournament == tournamentId)
                .ToList();

            _context.Match.RemoveRange(existingMatches);
            _context.SaveChanges();

            List<Models.Match> matches = new List<Models.Match>();

            switch (tournament.Type.ToLower())
            {
                case "single elimination":
                    matches = TournamentService.GenerateSingleEliminationMatches(tournamentId, players);
                    break;

                case "round robin":
                    matches = TournamentService.GenerateRoundRobinMatches(tournamentId, players);
                    break;

                case "swiss stage":
                    matches = TournamentService.GenerateSwissMatches(tournamentId, players);
                    break;

                default:
                    return BadRequest("Unsupported tournament type.");
            }

            _context.Match.AddRange(matches);
            _context.SaveChanges();

            if (tournament.Type.Equals("Single Elimination", StringComparison.OrdinalIgnoreCase))
            {
                TournamentService.LinkSingleEliminationMatches(matches);
                _context.SaveChanges();
            }

            return Ok($"Generated {matches.Count} matches for {tournament.Type} tournament.");
        }



        [HttpGet("tournament/fetch-matches/{tournamentId}")]
        public IActionResult GetTournamentMatches(int tournamentId)
        {
            var matches = _context.Match
                .Where(m => m.ID_Tournament == tournamentId)
                .OrderBy(m => m.RoundNumber)
                .ThenBy(m => m.ID_Match)
                .ToList();

            if (!matches.Any())
                return NotFound("No matches found for this tournament.");

            var rounds = new List<object>();
            var playerCache = new Dictionary<int, string>();

            foreach (var roundGroup in matches.GroupBy(m => m.RoundNumber).OrderBy(g => g.Key))
            {
                var seeds = new List<object>();

                foreach (var match in roundGroup)
                {
                    string player1Name = "-";
                    string player2Name = "-";
                    int? player1Id = null;
                    int? player2Id = null;

                    if (match.ID_User1.HasValue)
                    {
                        player1Id = match.ID_User1.Value;
                        if (!playerCache.TryGetValue(player1Id.Value, out player1Name!))
                        {
                            player1Name = _context.User
                                .FirstOrDefault(u => u.ID_User == player1Id.Value)?.Username ?? "-";
                            playerCache[player1Id.Value] = player1Name;
                        }
                    }

                    if (match.ID_User2.HasValue)
                    {
                        player2Id = match.ID_User2.Value;
                        if (!playerCache.TryGetValue(player2Id.Value, out player2Name!))
                        {
                            player2Name = _context.User
                                .FirstOrDefault(u => u.ID_User == player2Id.Value)?.Username ?? "-";
                            playerCache[player2Id.Value] = player2Name;
                        }
                    }

                    seeds.Add(new
                    {
                        id = match.ID_Match,
                        teams = new[]
                        {
                    new
                    {
                        name = player1Name,
                        id = player1Id
                    },
                    new
                    {
                        name = player2Name,
                        id = player2Id
                    }
                },
                        status = match.Status,
                        winner = match.ID_Winner
                    });
                }

                rounds.Add(new
                {
                    id = $"tournament-{tournamentId}-round-{roundGroup.Key}",
                    title = $"Round {roundGroup.Key}",
                    seeds,
                    status = roundGroup.Any(m => m.Status != "Completed") ? "InProgress" : "Completed"
                });
            }

            return Ok(rounds);
        }

        [HttpPost("match/assign-winner/{matchId}")]
        public IActionResult AssignWinner(int matchId, [FromBody] WinnerRequest request)
        {
            var match = _context.Match.FirstOrDefault(m => m.ID_Match == matchId);
            if (match == null) return NotFound("Match not found");

            var tournament = _context.Tournament
                .FirstOrDefault(t => t.ID_Tournament == match.ID_Tournament);

            if (tournament == null)
                return BadRequest("Associated tournament not found");

            if (request.WinnerId != match.ID_User1 && request.WinnerId != match.ID_User2)
            {
                if (match.ID_User1 == null && match.ID_User2.HasValue)
                {
                    request.WinnerId = match.ID_User2.Value;
                }
                else if (match.ID_User2 == null && match.ID_User1.HasValue)
                {
                    request.WinnerId = match.ID_User1.Value;
                }
                else
                {
                    return BadRequest("Winner is not a participant in this match");
                }
            }

            match.ID_Winner = request.WinnerId;
            match.Status = "Completed";

            if (tournament.Type == "Single Elimination")
            {
                if (match.ID_NextMatch.HasValue)
                {
                    var nextMatch = _context.Match.Find(match.ID_NextMatch.Value);
                    if (nextMatch != null)
                    {
                        if (nextMatch.ID_User1 == null)
                        {
                            nextMatch.ID_User1 = request.WinnerId;
                        }
                        else if (nextMatch.ID_User2 == null)
                        {
                            nextMatch.ID_User2 = request.WinnerId;
                        }
                        else
                        {
                            return BadRequest("Next match already has two players");
                        }
                    }
                }
            }

            try
            {
                _context.SaveChanges();
                return Ok(new TournamentResponseDto
                {
                    Message = "Winner assigned successfully",
                    TournamentType = tournament.Type
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error saving changes: {ex.Message}");
            }
        }

        [HttpPost("tournament/generate-next-swiss-round/{tournamentId}")]
        public IActionResult GenerateNextRound(int tournamentId)
        {
            var tournament = _context.Tournament
                .FirstOrDefault(t => t.ID_Tournament == tournamentId);

            if (tournament == null) return NotFound("Tournament not found");
            if (tournament.Type != "Swiss Stage") return BadRequest("Not a Swiss tournament");

            var matches = _context.Match
                .Where(m => m.ID_Tournament == tournamentId)
                .ToList();

            var currentRound = matches
                .Where(m => m.Status == "Completed")
                .Select(m => m.RoundNumber)
                .DefaultIfEmpty(0)
                .Max();

            var incompleteMatches = matches
                .Any(m => m.RoundNumber == currentRound && m.Status != "Completed");

            if (incompleteMatches) return BadRequest("Current round not finished");

            var standings = matches
                .Where(m => m.Status == "Completed")
                .SelectMany(m => new[]
                {
            new { Player = m.ID_User1, Win = m.ID_Winner == m.ID_User1 },
            new { Player = m.ID_User2, Win = m.ID_Winner == m.ID_User2 }
                })
                .GroupBy(p => p.Player)
                .Select(g => new
                {
                    PlayerId = g.Key,
                    Wins = g.Count(x => x.Win),
                    Losses = g.Count(x => !x.Win)
                })
                .OrderByDescending(s => s.Wins)
                .ThenBy(s => s.Losses)
                .ToList();

            var players = standings
                .Where(s => s.PlayerId != -1)
                .Select(s => s.PlayerId)
                .ToList();

            var hasBye = players.Count % 2 != 0;
            if (hasBye)
            {
                var byePlayer = standings.Last().PlayerId;
                players.Remove(byePlayer);

                _context.Match.Add(new Models.Match
                {
                    ID_Tournament = tournamentId,
                    RoundNumber = currentRound + 1,
                    ID_User1 = byePlayer,
                    ID_User2 = -1,
                    Status = "Completed",
                    ID_Winner = byePlayer
                });
            }

            var previousPairings = matches
                .Where(m => m.Status == "Completed")
                .Select(m => new
                {
                    Player1 = m.ID_User1,
                    Player2 = m.ID_User2
                })
                .ToList();

            var pairedPlayers = new HashSet<int>();
            var newMatches = new List<Models.Match>();
            int roundNumber = currentRound + 1;

            for (int i = 0; i < players.Count; i++)
            {
                if (pairedPlayers.Contains((int)players[i])) continue;

                var opponent = players
                    .Skip(i + 1)
                    .FirstOrDefault(p =>
                        !pairedPlayers.Contains((int)p) &&
                        !HasPreviousMatch((int)players[i], (int)p, previousPairings));

                if (opponent == default)
                {
                    opponent = players.FirstOrDefault(p =>
                        !pairedPlayers.Contains((int)p) && p != players[i]);
                }

                if (opponent != default)
                {
                    newMatches.Add(new Models.Match
                    {
                        ID_Tournament = tournamentId,
                        RoundNumber = roundNumber,
                        ID_User1 = players[i],
                        ID_User2 = opponent,
                        Status = "Scheduled"
                    });

                    pairedPlayers.Add((int)players[i]);
                    pairedPlayers.Add((int)opponent);
                }
            }

            _context.Match.AddRange(newMatches);
            _context.SaveChanges();

            return Ok($"Generated {newMatches.Count} matches for round {roundNumber}");
        }

        private bool HasPreviousMatch(int player1, int player2, IEnumerable<dynamic> pairings)
        {
            return pairings.Any(p =>
                (p.Player1 == player1 && p.Player2 == player2) ||
                (p.Player1 == player2 && p.Player2 == player1));
        }


        [HttpPut("complete/{tournamentId}")]
        public async Task<IActionResult> CompleteTournament(int tournamentId)
        {
            try
            {
                var tournament = await _context.Tournament
                    .Include(t => t.Participants)
                        .ThenInclude(p => p.User)
                    .Include(t => t.Matches)
                    .FirstOrDefaultAsync(t => t.ID_Tournament == tournamentId);

                if (tournament == null) return NotFound("Tournament not found");
                if (tournament.Status == "Completed") return BadRequest("Tournament already completed");


                var (winnerId, standings) = await TournamentService.DetermineTournamentResults(tournament);

                if (!winnerId.HasValue)
                    return BadRequest("Could not determine winner");

                var ratingChanges = TournamentService.CalculateRatingChanges(tournament.Participants.ToList(), standings);

                foreach (var participant in tournament.Participants)
                {
                    var user = participant.User;
                    user.TournamentsPlayed++;

                    if (user.ID_User == winnerId.Value)
                        user.TournamentsWon++;

                    if (ratingChanges.TryGetValue(user.ID_User, out var change))
                    {
                        user.Rating = Math.Max(user.Rating + change, 0);
                    }
                }

                tournament.ID_Winner = winnerId.Value;
                tournament.Status = "Completed";

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    TournamentId = tournament.ID_Tournament,
                    WinnerId = tournament.ID_Winner,
                    RatingChanges = ratingChanges,
                    NewRatings = tournament.Participants.ToDictionary(
                        p => p.User.ID_User,
                        p => p.User.Rating
                    )
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error completing tournament: {ex.Message}");
            }
        }


    }
}
