using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YugiohTMS.Controllers;
using YugiohTMS.Models;
using YugiohTMS;
using Microsoft.AspNetCore.Mvc;
using YugiohTMS.DTO_Models;
using Newtonsoft.Json;
using YugiohTMS.Services;
using Moq;

namespace YugiohTMSTests
{
    public class TournamentControllerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly TournamentController _controller;

        public TournamentControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _controller = new TournamentController(_context);
        }

        private async Task SeedUserAsync(int userId = 1)
        {
            _context.User.Add(new User { ID_User = userId, Username = "TestUser", Email = "Email", PasswordHash = "Hash", Rating = 1000 });
            await _context.SaveChangesAsync();
        }

        private async Task<int> SeedDeckAsync()
        {
            var deck = new Deck { ID_Deck = 1, Name = "Starter Deck" };
            _context.Deck.Add(deck);
            await _context.SaveChangesAsync();
            return deck.ID_Deck;
        }

        [Fact]
        public async Task CreateTournament_ReturnsCreatedResult_WhenValid()
        {
            var tournament = new Tournament { Name = "Test Tournament", Type = "Single Elimination", ID_User = 1, Status = "Pending" };

            var result = await _controller.CreateTournament(tournament);

            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var createdTournament = Assert.IsType<Tournament>(createdResult.Value);
            Assert.Equal("Test Tournament", createdTournament.Name);
        }

        [Fact]
        public async Task GetTournamentById_ReturnsNotFound_WhenInvalidId()
        {
            var result = await _controller.GetTournamentById(999);
            var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Contains("not found", notFound.Value.ToString());
        }

        [Fact]
        public async Task JoinTournament_ReturnsOk_WhenValid()
        {
            await SeedUserAsync();
            var deckId = await SeedDeckAsync();
            var tournament = new Tournament { Name = "Swiss", Type = "Swiss Stage", ID_User = 1, Status = "NotStarted" };
            _context.Tournament.Add(tournament);
            await _context.SaveChangesAsync();

            var dto = new TournamentPlayerDto { ID_Tournament = tournament.ID_Tournament, ID_User = 1, ID_Deck = deckId };
            var result = await _controller.JoinTournament(dto);

            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task JoinTournament_ReturnsBadRequest_WhenIdsAreMissing()
        {
            // Arrange
            var playerDto = new TournamentPlayerDto
            {
                ID_Tournament = 0,
                ID_User = 0,
                ID_Deck = 0
            };

            // Act
            var result = await _controller.JoinTournament(playerDto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Tournament ID and User ID are required.", badRequest.Value);
        }

        [Fact]
        public async Task JoinTournament_ReturnsBadRequest_WhenUserDoesNotExist()
        {
            // Arrange
            var tournament = new Tournament { Name = "Swiss", Type = "Swiss Stage", ID_User = 1, Status = "NotStarted" };
            var deck = new Deck { ID_Deck = 1, Name = "Name",  ID_User = 999 }; // Invalid user

            _context.Tournament.Add(tournament);
            _context.Deck.Add(deck);
            await _context.SaveChangesAsync();

            var playerDto = new TournamentPlayerDto
            {
                ID_Tournament = 1,
                ID_User = 999, // user does not exist
                ID_Deck = 1
            };

            // Act
            var result = await _controller.JoinTournament(playerDto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("User with ID 999 does not exist.", badRequest.Value);
        }

        [Fact]
        public async Task JoinTournament_ReturnsBadRequest_WhenDeckDoesNotExist()
        {
            // Arrange
            var user = new User { ID_User = 1, Username = "Test", Email = "Email", PasswordHash = "Hash", Rating = 1200 };
            var tournament = new Tournament { Name = "Swiss", Type = "Swiss Stage", ID_User = 1, Status = "NotStarted" };

            _context.User.Add(user);
            _context.Tournament.Add(tournament);
            await _context.SaveChangesAsync();

            var playerDto = new TournamentPlayerDto
            {
                ID_Tournament = 1,
                ID_User = 1,
                ID_Deck = 999 // deck doesn't exist
            };

            // Act
            var result = await _controller.JoinTournament(playerDto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Selected deck does not exist.", badRequest.Value);
        }



        [Fact]
        public void GenerateMatches_ReturnsBadRequest_IfNotEnoughPlayers()
        {
            var tournament = new Tournament { ID_Tournament = 1, Name = "Test", Type = "Single Elimination", ID_User = 1, Status = "NotStarted" };
            _context.Tournament.Add(tournament);
            _context.SaveChanges();

            var result = _controller.GenerateMatches(tournament.ID_Tournament);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Not enough players to create matches.", badRequest.Value);
        }

        [Fact]
        public async Task GenerateMatches_ReturnsOk_WhenSingleEliminationTournament()
        {
            // Arrange
            var tournament = new Tournament
            {
                ID_Tournament = 1,
                Name = "Spring Tournament",
                Type = "Single Elimination",
                Status = "NotStarted"
            };

            var players = new List<TournamentPlayer>
        {
        new TournamentPlayer { ID_Tournament = 1, ID_User = 1 },
        new TournamentPlayer { ID_Tournament = 1, ID_User = 2 }
        };

            _context.Tournament.Add(tournament);
            _context.TournamentPlayer.AddRange(players);
            await _context.SaveChangesAsync();

            // Act
            var result = _controller.GenerateMatches(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Generated 1 matches for Single Elimination tournament.", okResult.Value);

            var matches = await _context.Match
                .Where(m => m.ID_Tournament == 1)
                .ToListAsync();

            Assert.Single(matches);
        }

        [Fact]
        public async Task GenerateMatches_ReturnsNotFound_WhenTournamentDoesNotExist()
        {
            // Act
            var result =  _controller.GenerateMatches(999); // Non-existent tournament ID

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Tournament not found.", notFoundResult.Value);
        }

        [Fact]
        public async Task GenerateMatches_ReturnsBadRequest_WhenNotEnoughPlayers()
        {
            // Arrange
            var tournament = new Tournament
            {
                ID_Tournament = 1,
                Name = "Spring Tournament",
                Type = "Single Elimination",
                Status = "NotStarted"
            };

            var player = new TournamentPlayer { ID_Tournament = 1, ID_User = 1 };

            _context.Tournament.Add(tournament);
            _context.TournamentPlayer.Add(player);
            await _context.SaveChangesAsync();

            // Act
            var result =  _controller.GenerateMatches(1);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Not enough players to create matches.", badRequestResult.Value);
        }

        [Fact]
        public async Task GenerateMatches_ReturnsOk_WhenRoundRobinTournament()
        {
            // Arrange
            var tournament = new Tournament
            {
                ID_Tournament = 1,
                Name = "Spring Tournament",
                Type = "Round Robin",
                Status = "NotStarted"
            };

            var players = new List<TournamentPlayer>
            {
                new TournamentPlayer { ID_Tournament = 1, ID_User = 1 },
                new TournamentPlayer { ID_Tournament = 1, ID_User = 2 },
                new TournamentPlayer { ID_Tournament = 1, ID_User = 3 }
            };

            _context.Tournament.Add(tournament);
            _context.TournamentPlayer.AddRange(players);
            await _context.SaveChangesAsync();

            // Act
            var result =  _controller.GenerateMatches(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Generated 3 matches for Round Robin tournament.", okResult.Value);

            var matches = await _context.Match
                .Where(m => m.ID_Tournament == 1)
                .ToListAsync();

            Assert.Equal(3, matches.Count);
        }

        [Fact]
        public async Task GenerateMatches_ReturnsBadRequest_WhenUnsupportedTournamentType()
        {
            // Arrange
            var tournament = new Tournament
            {
                ID_Tournament = 1,
                Name = "Spring Tournament",
                Type = "Unknown Type",
                Status = "NotStarted"
            };

            var players = new List<TournamentPlayer>
            {
                new TournamentPlayer { ID_Tournament = 1, ID_User = 1 },
                new TournamentPlayer { ID_Tournament = 1, ID_User = 2 }
            };

            _context.Tournament.Add(tournament);
            _context.TournamentPlayer.AddRange(players);
            await _context.SaveChangesAsync();

            // Act
            var result =  _controller.GenerateMatches(1);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Unsupported tournament type.", badRequestResult.Value);
        }

        [Fact]
        public async Task GenerateMatches_ReturnsOk_WhenSwissStageTournament()
        {
            // Arrange
            var tournament = new Tournament
            {
                ID_Tournament = 1,
                Name = "Spring Tournament",
                Type = "Swiss Stage",
                Status = "NotStarted"
            };

            var players = new List<TournamentPlayer>
            {
                new TournamentPlayer { ID_Tournament = 1, ID_User = 1 },
                new TournamentPlayer { ID_Tournament = 1, ID_User = 2 },
                new TournamentPlayer { ID_Tournament = 1, ID_User = 3 },
                new TournamentPlayer { ID_Tournament = 1, ID_User = 4 }
            };

            _context.Tournament.Add(tournament);
            _context.TournamentPlayer.AddRange(players);
            await _context.SaveChangesAsync();

            // Act
            var result =  _controller.GenerateMatches(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Generated 2 matches for Swiss Stage tournament.", okResult.Value);

            var matches = await _context.Match
                .Where(m => m.ID_Tournament == 1)
                .ToListAsync();

            Assert.Equal(2, matches.Count);
        }


        [Fact]
        public async Task AssignWinner_ReturnsNotFound_WhenMatchNotFound()
        {
            // Act
            var result = _controller.AssignWinner(999, new WinnerRequest { WinnerId = 1 });

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Match not found", notFoundResult.Value);
        }

        [Fact]
        public async Task AssignWinner_ReturnsBadRequest_WhenTournamentNotFound()
        {
            // Arrange
            var match = new YugiohTMS.Models.Match
            {
                ID_Match = 1,
                ID_Tournament = 1,
                ID_User1 = 1,
                ID_User2 = 2,
                Status = "InProgress"
            };

            _context.Match.Add(match);
            await _context.SaveChangesAsync();

            var winnerRequest = new WinnerRequest { WinnerId = 1 };

            // Act
            var result = _controller.AssignWinner(1, winnerRequest);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Associated tournament not found", badRequestResult.Value);
        }

        [Fact]
        public async Task AssignWinner_ReturnsBadRequest_WhenWinnerIsNotAParticipant()
        {
            // Arrange
            var tournament = new Tournament
            {
                ID_Tournament = 1,
                Name = "Spring Tournament",
                Type = "Single Elimination",
                Status = "InProgress"
            };

            var match = new YugiohTMS.Models.Match
            {
                ID_Match = 1,
                ID_Tournament = 1,
                ID_User1 = 1,
                ID_User2 = 2,
                Status = "InProgress"
            };

            _context.Tournament.Add(tournament);
            _context.Match.Add(match);
            await _context.SaveChangesAsync();

            var winnerRequest = new WinnerRequest { WinnerId = 999 }; // Non-participant

            // Act
            var result =  _controller.AssignWinner(1, winnerRequest);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Winner is not a participant in this match", badRequestResult.Value);
        }

        [Fact]
        public async Task AssignWinner_AutomaticallyAssignsWinner_WhenOneUserIsNull()
        {
            // Arrange
            var tournament = new Tournament
            {
                ID_Tournament = 1,
                Name = "Spring Tournament",
                Type = "Single Elimination",
                Status = "InProgress"
            };

            var match = new YugiohTMS.Models.Match
            {
                ID_Match = 1,
                ID_Tournament = 1,
                ID_User1 = null,
                ID_User2 = 2,
                Status = "InProgress"
            };

            _context.Tournament.Add(tournament);
            _context.Match.Add(match);
            await _context.SaveChangesAsync();

            var winnerRequest = new WinnerRequest { WinnerId = 2 };

            // Act
            var result = _controller.AssignWinner(1, winnerRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value as TournamentResponseDto;  // Cast to TournamentResponseDto

            // Ensure the response is not null and check the expected properties
            Assert.NotNull(response);
            Assert.Equal("Winner assigned successfully", response.Message);  // Assuming Message is in the response
            Assert.Equal("Single Elimination", response.TournamentType);  // Assuming TournamentType is in the response

            var updatedMatch = await _context.Match.FindAsync(1);
            Assert.Equal("Completed", updatedMatch.Status);
            Assert.Equal(2, updatedMatch.ID_Winner);
        }



        [Fact]
        public async Task AssignWinner_ReturnsBadRequest_WhenNextMatchAlreadyHasTwoPlayers()
        {
            // Arrange
            var tournament = new Tournament
            {
                ID_Tournament = 1,
                Name = "Spring Tournament",
                Type = "Single Elimination",
                Status = "InProgress"
            };

            var match = new YugiohTMS.Models.Match
            {
                ID_Match = 1,
                ID_Tournament = 1,
                ID_User1 = 1,
                ID_User2 = 2,
                Status = "InProgress",
                ID_NextMatch = 2
            };

            var nextMatch = new YugiohTMS.Models.Match
            {
                ID_Match = 2,
                ID_Tournament = 1,
                ID_User1 = 3,
                ID_User2 = 4
            };

            _context.Tournament.Add(tournament);
            _context.Match.Add(match);
            _context.Match.Add(nextMatch);
            await _context.SaveChangesAsync();

            var winnerRequest = new WinnerRequest { WinnerId = 1 };

            // Act
            var result =  _controller.AssignWinner(1, winnerRequest);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Next match already has two players", badRequestResult.Value);
        }


        [Fact]
        public async Task StartTournament_ReturnsBadRequest_IfAlreadyStarted()
        {
            var tournament = new Tournament { ID_Tournament = 1, Name = "Started Tour", Type = "Round Robin", Status = "InProgress" };
            _context.Tournament.Add(tournament);
            await _context.SaveChangesAsync();

            var result = await _controller.StartTournament(tournament.ID_Tournament);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Tournament has already started.", badRequest.Value);
        }

        [Fact]
        public async Task StartTournament_ReturnsOk_WhenTournamentStartedSuccessfully()
        {
            // Arrange
            var tournament = new Tournament
            {
                ID_Tournament = 1,
                Name = "Test Tournament",
                Type = "Single Elimination",
                Status = "NotStarted"
            };

            _context.Tournament.Add(tournament);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.StartTournament(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<JoinResponseDto>(okResult.Value); // Cast to your DTO
            Assert.Equal("Tournament started successfully.", response.Message);

            var updatedTournament = await _context.Tournament.FindAsync(1);
            Assert.Equal("InProgress", updatedTournament.Status);
        }


        [Fact]
        public async Task StartTournament_ReturnsBadRequest_WhenIdIsInvalid()
        {
            var result = await _controller.StartTournament(0);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Invalid tournament ID.", badRequest.Value);
        }

        [Fact]
        public async Task StartTournament_ReturnsNotFound_WhenTournamentDoesNotExist()
        {
            // Act
            var result = await _controller.StartTournament(999);

            // Assert
            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Tournament not found.", notFound.Value);
        }

        [Fact]
        public async Task GetAllTournaments_ReturnsAllTournaments()
        {
            // Arrange
            _context.Tournament.AddRange(
                new Tournament { Name = "Tour 1", Type = "Swiss Stage", ID_User = 1, Status = "InProgress" },
                new Tournament { Name = "Tour 2", Type = "Single Elimination", ID_User = 2, Status = "InProgress" }
            );
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetTournaments();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var tournaments = Assert.IsType<List<Tournament>>(okResult.Value);
            Assert.Equal(2, tournaments.Count);
        }


        [Fact]
        public async Task GetUserTournaments_ReturnsOnlyUserTournaments()
        {
            _context.Tournament.AddRange(
                new Tournament { Name = "User 1 Tour", Type = "Swiss", ID_User = 1, Status = "InProgress" },
                new Tournament { Name = "User 2 Tour", Type = "Single Elimination", ID_User = 2, Status = "InProgress" }
            );
            await _context.SaveChangesAsync();

            var result = await _controller.GetUserTournaments(1);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var tournaments = Assert.IsType<List<Tournament>>(okResult.Value);
            Assert.Single(tournaments);
            Assert.Equal("User 1 Tour", tournaments[0].Name);
        }

        [Fact]
        public async Task GetTournamentMatches_ReturnsMatches_WhenTournamentExists()
        {
            // Arrange
            _context.Tournament.Add(new Tournament { ID_Tournament = 1, Name = "Tour", Type = "Single Elimination", ID_User = 1, Status = "InProgress" });
            _context.Match.AddRange(
                new YugiohTMS.Models.Match { ID_Match = 1, ID_Tournament = 1, ID_User1 = 1, ID_User2 = 2, RoundNumber = 1 },
                new YugiohTMS.Models.Match { ID_Match = 2, ID_Tournament = 1, ID_User1 = 3, ID_User2 = 4, RoundNumber = 1 }
            );
            await _context.SaveChangesAsync();

            // Act
            var result = _controller.GetTournamentMatches(1);
            var okResult = Assert.IsType<OkObjectResult>(result);

            // Result is a list of rounds
            var rounds = Assert.IsType<List<object>>(okResult.Value);

            // Now deserialize rounds to access seeds (matches)
            var json = JsonConvert.SerializeObject(rounds);
            dynamic parsed = JsonConvert.DeserializeObject<List<dynamic>>(json);

            // Total seeds (matches) across all rounds
            int totalMatches = 0;
            foreach (var round in parsed)
            {
                foreach (var seed in round.seeds)
                {
                    totalMatches++;
                }
            }

            Assert.Equal(2, totalMatches);
        }


        [Fact]
        public void GetTournamentMatches_ReturnsNotFound_WhenTournamentNotExists()
        {
            var result = _controller.GetTournamentMatches(12345);

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("no matches found for this tournament.", notFound.Value?.ToString()?.ToLower());
        }

        [Fact]
        public void GenerateNextRound_ReturnsOk_WhenEnoughPlayers()
        {
            _context.Tournament.Add(new Tournament { ID_Tournament = 1, Name = "Name", Type = "Swiss Stage", ID_User = 1, Status = "InProgress" });
            _context.User.AddRange(
                new User { ID_User = 1, Username = "Username", Email = "Email", PasswordHash = "Hash", Rating = 1000 },
                new User { ID_User = 2, Username = "Username", Email = "Email", PasswordHash = "Hash", Rating = 1100 },
                new User { ID_User = 3, Username = "Username", Email = "Email", PasswordHash = "Hash", Rating = 1050 },
                new User { ID_User = 4, Username = "Username", Email = "Email", PasswordHash = "Hash", Rating = 1200 }
            );
            _context.TournamentPlayer.AddRange(
                new TournamentPlayer { ID_Tournament = 1, ID_User = 1, ID_Deck = 1 },
                new TournamentPlayer { ID_Tournament = 1, ID_User = 2, ID_Deck = 2 },
                new TournamentPlayer { ID_Tournament = 1, ID_User = 3, ID_Deck = 3 },
                new TournamentPlayer { ID_Tournament = 1, ID_User = 4, ID_Deck = 4 }
            );
            _context.SaveChanges();

            var result = _controller.GenerateNextRound(1);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public void GenerateNextRound_ReturnsNotFound_WhenTournamentMissing()
        {
            var result = _controller.GenerateNextRound(999);
            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("not found", notFound.Value.ToString());
        }

        [Fact]
        public void GenerateNextRound_ReturnsBadRequest_WhenNotSwiss()
        {
            _context.Tournament.Add(new Tournament { ID_Tournament = 1, Name = "Name", Type = "Single Elimination", ID_User = 1, Status = "InProgress" });
            _context.SaveChanges();

            var result = _controller.GenerateNextRound(1);
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Not a Swiss tournament", badRequest.Value);
        }

        [Fact]
        public void AssignWinner_ReturnsBadRequest_WhenWinnerNotInMatch()
        {
            _context.Match.Add(new YugiohTMS.Models.Match { ID_Match = 1, ID_User1 = 1, ID_User2 = 2, Status = "Pending", ID_Tournament = 1 });
            _context.Tournament.Add(new Tournament { ID_Tournament = 1, Name = "Name", Type = "Single Elimination", Status = "InProgress" });
            _context.SaveChanges();

            var request = new WinnerRequest { WinnerId = 3 }; // Not one of the match users
            var result = _controller.AssignWinner(1, request);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Winner is not a participant in this match", badRequest.Value);
        }

        [Fact]
        public void GenerateSingleEliminationMatches_CreatesCorrectMatchCount()
        {
            var players = Enumerable.Range(1, 8).ToList();
            var matches = TournamentService.GenerateSingleEliminationMatches(1, players);

            // 8 players = 7 matches in total for single elimination
            Assert.Equal(7, matches.Count);
            Assert.All(matches, m => Assert.Equal(1, m.ID_Tournament));
        }

        [Fact]
        public void LinkSingleEliminationMatches_SetsNextMatchIds()
        {
            var players = Enumerable.Range(1, 4).ToList(); // 4 players => 3 matches
            var matches = TournamentService.GenerateSingleEliminationMatches(1, players);

            // Assign fake IDs to simulate DB-assigned values
            for (int i = 0; i < matches.Count; i++) matches[i].ID_Match = i + 1;

            TournamentService.LinkSingleEliminationMatches(matches);

            var round1 = matches.Where(m => m.RoundNumber == 1).ToList();
            var round2 = matches.Where(m => m.RoundNumber == 2).ToList();

            Assert.All(round1, m => Assert.Contains(m.ID_NextMatch, round2.Select(r => (int?)r.ID_Match)));
        }

        [Fact]
        public void GenerateRoundRobinMatches_GeneratesAllPairings()
        {
            var players = new List<int> { 1, 2, 3, 4 };
            var matches = TournamentService.GenerateRoundRobinMatches(1, players);

            // 4 players = 6 matches (n*(n-1)/2)
            Assert.Equal(6, matches.Count);
            Assert.All(matches, m => Assert.Equal(1, m.ID_Tournament));
        }

        [Fact]
        public void GenerateSwissMatches_GeneratesCorrectPairings()
        {
            var players = new List<int> { 1, 2, 3, 4 };
            var matches = TournamentService.GenerateSwissMatches(1, players);

            // Should generate 2 matches (1st round, 2 players per match)
            Assert.Equal(2, matches.Count);
            Assert.All(matches, m => Assert.Equal(1, m.RoundNumber));
        }

        [Fact]
        public async Task DetermineTournamentResults_SingleElimination_WinnerAndRunnerUpCorrect()
        {
            var participants = new List<TournamentPlayer>
            {
                new() { User = new User { ID_User = 1 } },
                new() { User = new User { ID_User = 2 } },
                new() { User = new User { ID_User = 3 } }
            };

            var finalMatch = new YugiohTMS.Models.Match
            {
                ID_Match = 3,
                RoundNumber = 2,
                ID_User1 = 1,
                ID_User2 = 2,
                ID_Winner = 1
            };

            var matches = new List<YugiohTMS.Models.Match>
            {
                new() { ID_Match = 1, RoundNumber = 1 },
                new() { ID_Match = 2, RoundNumber = 1 },
                finalMatch
            };

            var tournament = new Tournament
            {
                Type = "Single Elimination",
                Matches = matches,
                Participants = participants,
                Status = "InProgress"
            };

            var (winner, standings) = await TournamentService.DetermineTournamentResults(tournament);

            Assert.Equal(1, winner);
            Assert.Equal(1, standings[1]); // Winner
            Assert.Equal(2, standings[2]); // Runner-up
            Assert.Equal(3, standings[3]); // 3rd place
        }

        [Fact]
        public async Task GetTournamentPlayers_ReturnsCorrectData()
        {


            var winnerUser = new User { ID_User = 3, Username = "WinnerUser", Email = "Email", PasswordHash = "Hash" };
            var ownerUser = new User { ID_User = 1, Username = "OwnerUser", Email = "Email", PasswordHash = "Hash" };
            var player2 = new User {ID_User = 2, Username = "PlayerTwo", Email = "Email", PasswordHash = "Hash" };

            _context.User.AddRange(winnerUser, ownerUser, player2);
            var tournament = new Tournament
            {
                ID_Tournament = 100,
                Name = "Name",
                ID_User = ownerUser.ID_User,
                Status = "Finished",
                Type = "Single Elimination",
                Winner = winnerUser
            };
            _context.Tournament.Add(tournament);

            _context.TournamentPlayer.AddRange(
                new TournamentPlayer { ID_Tournament = 100, User = winnerUser },
                new TournamentPlayer { ID_Tournament = 100, User = player2 }
            );

            await _context.SaveChangesAsync();

            var result = await _controller.GetTournamentPlayers(100);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var resultData = Assert.IsType<TournamentPlayersDto>(okResult.Value);

            Assert.Equal(1, resultData.OwnerID);
            Assert.Equal("Finished", resultData.Status);
            Assert.Equal("Single Elimination", resultData.Type);
            Assert.Equal("WinnerUser", resultData.Winner);

            Assert.NotNull(resultData.Players);
            Assert.Contains(resultData.Players, p => p.Id == 3 && p.Name == "WinnerUser");
            Assert.Contains(resultData.Players, p => p.Id == 2 && p.Name == "PlayerTwo");

        }

        [Fact]
        public async Task GetTournamentPlayers_TournamentNotFound_ReturnsNotFound()
        {

            var result = await _controller.GetTournamentPlayers(999); // ID not present

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Tournament with ID 999 does not exist.", notFoundResult.Value);
        }

        [Fact]
        public async Task CompleteTournament_ReturnsNotFound_WhenTournamentDoesNotExist()
        {
            var result = await _controller.CompleteTournament(999); // nonexistent ID
            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Tournament not found", notFound.Value);
        }

        [Fact]
        public async Task CompleteTournament_ReturnsBadRequest_WhenTournamentAlreadyCompleted()
        {
            var tournament = new Tournament
            {
                ID_Tournament = 2,
                Name = "Completed Tournament",
                Type = "Single Elimination",
                Status = "Completed"
            };
            _context.Tournament.Add(tournament);
            await _context.SaveChangesAsync();

            var result = await _controller.CompleteTournament(2);
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Tournament already completed", badRequest.Value);
        }

        [Fact]
        public void GenerateNextRound_ReturnsNotFound_WhenTournamentDoesNotExist()
        {
            // Arrange
            var invalidTournamentId = 9999; // An ID that doesn't exist
            _context.Tournament.Add(new Tournament { ID_Tournament = 1, Name = "Test Tournament", Type = "Swiss Stage", Status = "InProgress" });
            _context.SaveChanges();

            // Act
            var result = _controller.GenerateNextRound(invalidTournamentId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Tournament not found", notFoundResult.Value);
        }

        [Fact]
        public void GenerateNextRound_ReturnsBadRequest_WhenTournamentIsNotSwiss()
        {
            // Arrange
            var tournamentId = 1;
            var tournament = new Tournament { ID_Tournament = tournamentId, Name = "Test Tournament", Type = "Single Elimination", Status = "InProgress" };
            _context.Tournament.Add(tournament);
            _context.SaveChanges();

            // Act
            var result = _controller.GenerateNextRound(tournamentId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Not a Swiss tournament", badRequestResult.Value);
        }

        [Fact]
        public void GenerateNextRound_GeneratesCorrectMatches_ForNextRound()
        {
            // Arrange
            var tournament = new Tournament { ID_Tournament = 1, Name = "Test Tournament", Type = "Swiss Stage", Status = "InProgress" };
            var match1 = new YugiohTMS.Models.Match
            {
                ID_Match = 1,
                ID_Tournament = 1,
                ID_User1 = 1,
                ID_User2 = 2,
                Status = "Completed",
                RoundNumber = 1,
                ID_Winner = 1
            };

            var match2 = new YugiohTMS.Models.Match
            {
                ID_Match = 2,
                ID_Tournament = 1,
                ID_User1 = 3,
                ID_User2 = 4,
                Status = "Completed",
                RoundNumber = 1,
                ID_Winner = 3
            };

            _context.Tournament.Add(tournament);
            _context.Match.Add(match1);
            _context.Match.Add(match2);
            _context.SaveChanges();

            // Act
            var result = _controller.GenerateNextRound(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var responseMessage = okResult.Value as string;

            Assert.Contains("Generated", responseMessage);
            var newMatches = _context.Match.Where(m => m.RoundNumber == 2).ToList();
            Assert.Equal(2, newMatches.Count); // Two new matches should be generated
        }

        [Fact]
        public void GenerateNextRound_PairsPlayersCorrectly()
        {
            // Arrange
            var tournament = new Tournament { ID_Tournament = 1, Name = "Test Tournament", Type = "Swiss Stage", Status = "InProgress" };
            var match1 = new YugiohTMS.Models.Match
            {
                ID_Match = 1,
                ID_Tournament = 1,
                ID_User1 = 1,
                ID_User2 = 2,
                Status = "Completed",
                RoundNumber = 1,
                ID_Winner = 1
            };

            var match2 = new YugiohTMS.Models.Match
            {
                ID_Match = 2,
                ID_Tournament = 1,
                ID_User1 = 3,
                ID_User2 = 4,
                Status = "Completed",
                RoundNumber = 1,
                ID_Winner = 3
            };

            _context.Tournament.Add(tournament);
            _context.Match.Add(match1);
            _context.Match.Add(match2);
            _context.SaveChanges();

            // Act
            var result = _controller.GenerateNextRound(1);

            // Assert
            var newMatches = _context.Match.Where(m => m.RoundNumber == 2).ToList();
            Assert.Equal(2, newMatches.Count); // Ensure that 2 matches are generated

            // Check player pairings
            var matchPair1 = newMatches[0];
            var matchPair2 = newMatches[1];

            Assert.True(matchPair1.ID_User1 != matchPair1.ID_User2); // Players in the match should be different
            Assert.True(matchPair2.ID_User1 != matchPair2.ID_User2); // Players in the match should be different
        }

        [Fact]
        public void GenerateNextRound_SavesNewMatches()
        {
            // Arrange
            var tournament = new Tournament { ID_Tournament = 1, Name = "Test Tournament", Type = "Swiss Stage", Status = "InProgress" };
            var match1 = new YugiohTMS.Models.Match
            {
                ID_Match = 1,
                ID_Tournament = 1,
                ID_User1 = 1,
                ID_User2 = 2,
                Status = "Completed",
                RoundNumber = 1,
                ID_Winner = 1
            };

            _context.Tournament.Add(tournament);
            _context.Match.Add(match1);
            _context.SaveChanges();

            // Act
            var result = _controller.GenerateNextRound(1);

            // Assert
            var newMatches = _context.Match.Where(m => m.RoundNumber == 2).ToList();
            Assert.NotEmpty(newMatches); // Ensure that matches are saved to the database
        }



    }

}
