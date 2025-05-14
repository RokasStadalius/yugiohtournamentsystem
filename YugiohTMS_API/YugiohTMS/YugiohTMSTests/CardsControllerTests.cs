using Moq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using YugiohTMS.Controllers;
using YugiohTMS.Models;
using YugiohTMS;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using Microsoft.AspNetCore.Hosting;
using System.Net.Http;
using Microsoft.Extensions.Configuration;
using YugiohTMS.DTO_Models;

namespace YugiohTMS.Tests.Controllers
{
    public class CardsControllerTests
    {
        private readonly Mock<CardService> _mockCardService;
        private readonly ApplicationDbContext _dbContext;
        private readonly IWebHostEnvironment _mockEnv;
        private readonly HttpClient _mockHttpClient;
        private readonly LocalFileService _localFileService;
        private readonly Mock<IConfiguration> _mockConfiguration;

        public CardsControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase("TestDatabase")
                .Options;
            _dbContext = new ApplicationDbContext(options);

            _mockCardService = new Mock<CardService>(new HttpClient());

            _mockEnv = Mock.Of<IWebHostEnvironment>(env =>
                env.ContentRootPath == "C:\\MockedPath" &&
                env.WebRootPath == "C:\\MockedWebRoot" 
            );

            _mockConfiguration = new Mock<IConfiguration>();
            _mockConfiguration.Setup(c => c["LocalStorage:Path"]).Returns("TestStorage");

            _mockHttpClient = new HttpClient();

            _localFileService = new LocalFileService(_mockEnv, _mockConfiguration.Object, _mockHttpClient);
        }



        [Fact]
        public async Task FetchAndStoreCards_ShouldReturnOk_IfCardsStored()
        {
            _mockCardService.Setup(x => x.SaveCardsToDatabase(It.IsAny<ApplicationDbContext>(), It.IsAny<LocalFileService>()))
                .ReturnsAsync(new List<Card> { new Card { Name = "Card 1", ID_YGOPRODECK = 1, ImageURL = "http://localhost:5042/images/1.jpg" } });

            var controller = new CardsController(_dbContext, _mockCardService.Object, _localFileService);

            var result = await controller.FetchAndStoreCards();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var cards = Assert.IsType<List<Card>>(okResult.Value);
            Assert.Single(cards);
            Assert.Equal("Card 1", cards[0].Name);
            Assert.Equal("http://localhost:5042/images/1.jpg", cards[0].ImageURL);
        }

        [Fact]
        public async Task SyncCards_ShouldReturnOk_WithSyncMessage()
        {
            var newCards = new List<Card> { new Card { Name = "New Card", ID_YGOPRODECK = 1, ImageURL = "http://localhost:5042/images/1.jpg" } };
            _mockCardService.Setup(x => x.SyncCardsWithDatabase(It.IsAny<ApplicationDbContext>(), It.IsAny<LocalFileService>()))
                .ReturnsAsync((newCards, 10));

            var controller = new CardsController(_dbContext, _mockCardService.Object, _localFileService);

            var result = await controller.SyncCards();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<SyncResponseDto>(okResult.Value);

            Assert.Equal("Sync completed. Added 1 new cards.", response.Message);
            Assert.Equal(1, response.NewCards.Count);
            Assert.Equal(10, response.TotalProcessed);
            Assert.Equal("New Card", response.NewCards[0].Name);
            Assert.Equal("http://localhost:5042/images/1.jpg", response.NewCards[0].ImageURL);
        }


        [Fact]
        public async Task GetCards_ShouldReturnOk_WithCardsList()
        {
            _dbContext.Card.Add(new Card
            {
                Name = "Card 1",
                ID_YGOPRODECK = 1,
                ImageURL = "http://localhost:5042/images/1.jpg",
                Description = "Sample card description"
            });
            await _dbContext.SaveChangesAsync();

            var controller = new CardsController(_dbContext, _mockCardService.Object, _localFileService);

            var result = await controller.GetCards();

            var actionResult = Assert.IsType<ActionResult<IEnumerable<Card>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);

            var cards = Assert.IsType<List<Card>>(okResult.Value);
            Assert.Single(cards);
            Assert.Equal("Card 1", cards[0].Name);
            Assert.Equal("http://localhost:5042/images/1.jpg", cards[0].ImageURL);
        }



        [Fact]
        public async Task GetPendingUpdates_ShouldReturnOk_WithUpdateStatus()
        {
            var apiCards = new List<Card> { new Card { Name = "Card 1", ID_YGOPRODECK = 1, ImageURL = "http://localhost:5042/images/1.jpg" } };
            _mockCardService.Setup(x => x.FetchCardsFromAPI()).ReturnsAsync(apiCards);
            _mockCardService.Setup(x => x.SyncCardsWithDatabase(It.IsAny<ApplicationDbContext>(), It.IsAny<LocalFileService>()))
                .ReturnsAsync((new List<Card>(), 0));

            _dbContext.Card.Add(new Card { Name = "Card 1", ID_YGOPRODECK = 1, ImageURL = "http://localhost:5042/images/1.jpg", Description = "A detailed description of Card 1" });
            await _dbContext.SaveChangesAsync();

            var controller = new CardsController(_dbContext, _mockCardService.Object, _localFileService);

            var result = await controller.GetPendingUpdates();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<UpdateStatusDto>(okResult.Value);
            Assert.False(response.NeedsUpdate);
            Assert.Equal(0, response.NewCardsCount);

        }

    }
}
