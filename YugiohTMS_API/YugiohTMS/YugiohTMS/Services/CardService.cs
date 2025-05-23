﻿using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using YugiohTMS.Models;
using YugiohTMS;
using Microsoft.EntityFrameworkCore;

public class CardService
{
    private readonly HttpClient _httpClient;

    public CardService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public virtual async Task<List<Card>> FetchCardsFromAPI()
    {
        string url = "https://db.ygoprodeck.com/api/v7/cardinfo.php";
        var response = await _httpClient.GetStringAsync(url);

        var jsonDoc = JsonDocument.Parse(response);
        var cardArray = jsonDoc.RootElement.GetProperty("data");

        var cards = new List<Card>();

        foreach (var card in cardArray.EnumerateArray())
        {
            var newCard = new Card
            {
                Name = card.GetProperty("name").GetString(),
                Type = card.GetProperty("type").GetString(),
                FrameType = card.GetProperty("frameType").GetString(),
                Race = card.GetProperty("race").GetString(),
                Attribute = card.TryGetProperty("attribute", out var attr) ? attr.GetString() : null,
                Atk = card.TryGetProperty("atk", out var atk) && atk.ValueKind != JsonValueKind.Null ? atk.GetInt32() : (int?)null,
                Def = card.TryGetProperty("def", out var def) && def.ValueKind != JsonValueKind.Null ? def.GetInt32() : (int?)null,
                Level = card.TryGetProperty("level", out var level) && level.ValueKind != JsonValueKind.Null ? level.GetInt32() : (int?)null,
                ImageURL = card.GetProperty("card_images")[0].GetProperty("image_url").GetString(),
                Description = card.GetProperty("desc").GetString(),
                ID_YGOPRODECK = card.GetProperty("id").GetInt32(),

            };

            cards.Add(newCard);
        }

        return cards;
    }

    public virtual async Task<(List<Card> newCards, int totalProcessed)> SyncCardsWithDatabase(
    ApplicationDbContext dbContext,
    LocalFileService fileService)
    {
        var apiCards = await FetchCardsFromAPI();
        var newCards = new List<Card>();
        var existingYgoIds = await dbContext.Card
            .Select(c => c.ID_YGOPRODECK)
            .ToListAsync();

        var missingCards = apiCards
            .Where(apiCard => !existingYgoIds.Contains(apiCard.ID_YGOPRODECK))
            .ToList();

        foreach (var card in missingCards)
        {
            try
            {
                var imageName = $"{card.ID_YGOPRODECK}.jpg";
                card.ImageURL = await fileService.UploadImageToLocal(card.ImageURL, imageName);

                dbContext.Card.Add(card);
                newCards.Add(card);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing card {card.ID_YGOPRODECK}: {ex.Message}");
            }
        }

        await dbContext.SaveChangesAsync();
        return (newCards, missingCards.Count);
    }



    public virtual async Task<List<Card>> SaveCardsToDatabase(
    ApplicationDbContext dbContext,
    LocalFileService fileService)
    {
        var cards = await FetchCardsFromAPI();
        var savedCards = new List<Card>();
        int i = 1;
        foreach (var card in cards)
        {
            string imageName = $"{card.ID_YGOPRODECK}.jpg";
            card.ImageURL = await fileService.UploadImageToLocal(card.ImageURL, imageName);

            dbContext.Card.Add(card);
            savedCards.Add(card);
            i++;
        }

        await dbContext.SaveChangesAsync();
        return savedCards;
    }

}
