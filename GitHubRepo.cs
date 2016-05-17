using System;

using Newtonsoft.Json;

namespace GithubRepoCompare
{
    public class GitHubRepo
    {
        [JsonProperty("id")]
        public long Id { get; set; }

        [JsonProperty("created_at")]
        public DateTime? CreatedAt { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("forks_count")]
        public int ForksCount { get; set; }

        [JsonProperty("full_name")]
        public string FullName { get; set; }

        [JsonProperty("homepage")]
        public string Homepage { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("pushed_at")]
        public DateTime? PushedAt { get; set; }

        [JsonProperty("size")]
        public long Size { get; set; }

        [JsonProperty("stargazers_count")]
        public int StargazersCount { get; set; }

        [JsonProperty("subscribers_count")]
        public int SubscribersCount { get; set; }

        [JsonProperty("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [JsonProperty("url")]
        public string Url { get; set; }

        [JsonProperty("watchers_count")]
        public int WatchersCount { get; set; }
    }
}