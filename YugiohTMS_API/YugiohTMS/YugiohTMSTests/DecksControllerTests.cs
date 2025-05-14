using Xunit;
using Moq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using YugiohTMS.Models;
using YugiohTMS.Controllers;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using Moq.Protected;
using System.Threading;
using System.Net;
using Newtonsoft.Json;
using YugiohTMS;
using YugiohTMS.DTO_Models;

namespace YugiohTMSTests
{
    public class DecksControllerTests
    {
        private ApplicationDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var context = new ApplicationDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        private IHttpClientFactory GetMockHttpClientFactory(string responseContent)
        {
            var handlerMock = new Mock<HttpMessageHandler>();
            handlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(responseContent)
                });

            var client = new HttpClient(handlerMock.Object);
            var factoryMock = new Mock<IHttpClientFactory>();
            factoryMock.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(client);

            return factoryMock.Object;
        }

        [Fact]
        public async Task CreateDeck_ValidRequest_ReturnsCreatedDeck()
        {
            var context = GetDbContext();

            var user = new User { ID_User = 1, Username = "TestUser", Email = "Email", PasswordHash = "Hash" };
            context.User.Add(user);
            await context.SaveChangesAsync();

            var controller = new DecksController(context, GetMockHttpClientFactory(""));

            var result = await controller.CreateDeck(new Deck { Name = "My Deck", ID_User = 1 });

            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var deck = Assert.IsType<Deck>(createdResult.Value);
            Assert.Equal("My Deck", deck.Name);
        }

        [Fact]
        public async Task CreateDeck_UserNotFound_ReturnsBadRequest()
        {
            var context = GetDbContext();
            var controller = new DecksController(context, GetMockHttpClientFactory(""));

            var result = await controller.CreateDeck(new Deck { Name = "Test", ID_User = 99 });

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("User with ID", badRequest.Value.ToString());
        }

        [Fact]
        public async Task GetDeckById_DeckExists_ReturnsDeck()
        {
            var context = GetDbContext();
            context.Deck.Add(new Deck { ID_Deck = 10, Name = "Sample", ID_User = 1 });
            await context.SaveChangesAsync();

            var controller = new DecksController(context, GetMockHttpClientFactory(""));

            var result = await controller.GetDeckById(10);

            var deck = Assert.IsType<Deck>(result.Value);
            Assert.Equal("Sample", deck.Name);
        }

        [Fact]
        public async Task GetUserDecks_UserExists_ReturnsDecks()
        {
            var context = GetDbContext();
            var user = new User { ID_User = 1, Username = "TestUser", Email = "Email", PasswordHash = "Hash" };
            context.User.Add(user);
            context.Deck.Add(new Deck { ID_Deck = 1, Name = "Deck 1", ID_User = 1 });
            context.Deck.Add(new Deck { ID_Deck = 2, Name = "Deck 2", ID_User = 1 });
            await context.SaveChangesAsync();

            var controller = new DecksController(context, GetMockHttpClientFactory(""));

            var result = await controller.GetUserDecks(1);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var decks = Assert.IsType<List<Deck>>(okResult.Value);
            Assert.Equal(2, decks.Count);
        }

        [Fact]
        public async Task ValidateDeck_WithBanlistViolations_ReturnsViolations()
        {
            var banlistResponse = JsonConvert.SerializeObject(new
            {
                data = new[]
                {
                new { name = "Card A", banlist_info = new { ban_tcg = "Limited" } }
            }
            });

            var context = GetDbContext();
            var card = new Card { ID_Card = 1, Name = "Card A", Description = "test", ImageURL = "http://localhost:5042/images/1.jpg" };
            context.Card.Add(card);
            context.Deck.Add(new Deck { ID_Deck = 1, Name = "Deck", ID_User = 1 });
            context.Decklist.AddRange(
                new Decklist { ID_Card = 1, ID_Deck = 1, WhichDeck = 0 },
                new Decklist { ID_Card = 1, ID_Deck = 1, WhichDeck = 0 },
                new Decklist { ID_Card = 1, ID_Deck = 1, WhichDeck = 0 }
            );
            await context.SaveChangesAsync();

            var controller = new DecksController(context, GetMockHttpClientFactory(banlistResponse));

            var result = await controller.ValidateDeck(1);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = Assert.IsType<DeckValidationResult>(okResult.Value);
            Assert.False(value.IsValid);
           
            Assert.Contains("Main deck must contain 40-60 cards (current: 3)", value.Violations);
            Assert.Contains("Card A: 3 copies (Status: Limited, Allowed: 1)", value.Violations);
        }

        [Fact]
        public async Task SaveDecklist_ValidRequest_SavesDecklistSuccessfully()
        {
            var context = GetDbContext();
            var user = new User { ID_User = 1, Username = "TestUser", Email = "Email", PasswordHash = "Hash" };
            context.User.Add(user);
            var deck = new Deck { ID_Deck = 1, Name = "Deck1", ID_User = 1 };
            var card1 = new Card { ID_Card = 1, Name = "Card1", Description = "Description", ImageURL = "http://localhost:5042/images/1.jpg" };
            var card2 = new Card { ID_Card = 2, Name = "Card2", Description = "Description",  ImageURL = "http://localhost:5042/images/2.jpg" };
            var card3 = new Card { ID_Card = 3, Name = "Card3", Description = "Description", ImageURL = "http://localhost:5042/images/3.jpg" };

            context.Deck.Add(deck);
            context.Card.AddRange(card1, card2, card3);
            await context.SaveChangesAsync();

            var controller = new DecksController(context, GetMockHttpClientFactory(""));

            var decklistDtos = new List<DecklistDto>
            {
                new DecklistDto { ID_Card = 1, WhichDeck = 0 },
                new DecklistDto { ID_Card = 1, WhichDeck = 0 },
                new DecklistDto { ID_Card = 2, WhichDeck = 0 },
                new DecklistDto { ID_Card = 3, WhichDeck = 1 }
            };

            var result = await controller.SaveDecklist(1, decklistDtos);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Decklist saved successfully.", okResult.Value);

            var saved = context.Decklist.Where(d => d.ID_Deck == 1).ToList();
            Assert.Equal(4, saved.Count);
            Assert.Equal(2, saved.Count(d => d.ID_Card == 1 && d.WhichDeck == 0));
            Assert.Single(saved.Where(d => d.ID_Card == 2 && d.WhichDeck == 0));
            Assert.Single(saved.Where(d => d.ID_Card == 3 && d.WhichDeck == 1));
        }


        [Fact]
        public async Task GetDeckCards_DeckExists_ReturnsDecklistEntries()
        {
            var context = GetDbContext();
            var deck = new Deck { ID_Deck = 1, Name = "Deck1", ID_User = 1 };
            var card1 = new Card { ID_Card = 1, Name = "Card1", Description = "Description", ImageURL = "http://localhost:5042/images/1.jpg" };
            var card2 = new Card { ID_Card = 2, Name = "Card2", Description = "Description", ImageURL = "http://localhost:5042/images/2.jpg" };
            var card3 = new Card { ID_Card = 3, Name = "Card3", Description = "Description", ImageURL = "http://localhost:5042/images/3.jpg" };

            context.Deck.Add(deck);
            context.Card.AddRange(card1, card2, card3);
            context.Decklist.AddRange(
                new Decklist { ID_Deck = 1, ID_Card = 1, WhichDeck = 0, Card = card1 },
                new Decklist { ID_Deck = 1, ID_Card = 2, WhichDeck = 1, Card = card2 },
                new Decklist { ID_Deck = 1, ID_Card = 3, WhichDeck = 2, Card = card3 }
            );
            await context.SaveChangesAsync();

            var controller = new DecksController(context, GetMockHttpClientFactory(""));

            var result = await controller.GetDeckCards(1);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var decklists = Assert.IsAssignableFrom<List<Decklist>>(okResult.Value);

            Assert.Equal(3, decklists.Count);
            Assert.Single(decklists.Where(d => d.WhichDeck == 0 && d.Card.Name == "Card1"));
            Assert.Single(decklists.Where(d => d.WhichDeck == 1 && d.Card.Name == "Card2"));
            Assert.Single(decklists.Where(d => d.WhichDeck == 2 && d.Card.Name == "Card3"));
        }


    }
}
