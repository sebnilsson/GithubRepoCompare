using System.Linq;

namespace GitHubRepoCompare
{
    public static class GitHubApiUrl
    {
        public static string GetRepoUrl(string owner, string repo)
        {
            string url = GetUrl("repos", owner, repo);
            return url;
        }

        public static string GetRepoStatsContributorsUrl(string owner, string repo)
        {
            string url = GetUrl("repos", owner, repo, "stats", "contributors");
            return url;
        }

        public static string GetRepoStatsCodeFrequencyUrl(string owner, string repo)
        {
            string url = GetUrl("repos", owner, repo, "stats", "code_frequency");
            return url;
        }

        public static string GetRepoStatsCommitActivityUrl(string owner, string repo)
        {
            string url = GetUrl("repos", owner, repo, "stats", "commit_activity");
            return url;
        }

        public static string GetRepoStatsParticipationUrl(string owner, string repo)
        {
            string url = GetUrl("repos", owner, repo, "stats", "participation");
            return url;
        }

        public static string GetUrl(params string[] urlParts)
        {
            string url = "https://api.github.com/"
                         + string.Join("/", urlParts.Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim()))
                               .Trim('/');
            return url;
        }
    }
}