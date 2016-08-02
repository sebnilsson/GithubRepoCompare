using System;
using System.Collections.Generic;

using Newtonsoft.Json;

namespace GitHubRepoCompare
{
    public class GitHubRepoContributors
    {
        [JsonProperty("total")]
        public long Total { get; set; }

        [JsonProperty("weeks")]
        public ICollection<Week> Weeks { get; set; }

        public class Week
        {
            public DateTimeOffset? Start
                =>
                    (this.StartTimestamp > 0)
                        ? DateTimeOffset.FromUnixTimeSeconds(this.StartTimestamp)
                        : (DateTimeOffset?)null;

            [JsonProperty("w")]
            protected long StartTimestamp { get; set; }

            [JsonProperty("a")]
            public int AdditionCount { get; set; }

            [JsonProperty("d")]
            public int DeletionCount { get; set; }

            [JsonProperty("c")]
            public int CommitCount { get; set; }
        }
    }
}