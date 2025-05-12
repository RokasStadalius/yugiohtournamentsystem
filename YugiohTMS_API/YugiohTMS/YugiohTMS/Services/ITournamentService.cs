using YugiohTMS.Models;

namespace YugiohTMS.Services
{
    public interface ITournamentService
    {
        Task<(int? winnerId, List<int> standings)> DetermineTournamentResults(Tournament tournament);
        Dictionary<int, int> CalculateRatingChanges(List<TournamentPlayer> participants, List<int> standings);
    }
}
