using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace YugiohTMS.DTO_Models
{
    public class JoinResponseDto
    {
        public string Message { get; set; }
    }

    public class TournamentResponseDto
    {
        public string Message { get; set; }
        public string TournamentType { get; set; }

    }
}
