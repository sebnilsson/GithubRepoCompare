using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;

namespace GitHubRepoCompare
{
    public static class GitHubApiService
    {
        private static readonly JsonSerializerSettings JsonSettings;

        static GitHubApiService()
        {
            var contractResolver = new CamelCasePropertyNamesContractResolver();
            var dateConverter = new IsoDateTimeConverter { DateTimeFormat = "yyyy'-'MM'-'dd'T'HH':'mm':'ss.fff" };

            JsonSettings = new JsonSerializerSettings { ContractResolver = contractResolver };
            JsonSettings.Converters.Add(dateConverter);
        }

        public static async Task<GitHubRepo> GetRepo(string owner, string repo)
        {
            string url = GitHubApiUrl.GetRepoUrl(owner, repo);

            var gitHubRepo = await GetHttpReponseContent<GitHubRepo>(url);
            return gitHubRepo;
        }

        public static async Task<IEnumerable<GitHubRepoContributors>> GetRepoContributors(string owner, string repo)
        {
            string url = GitHubApiUrl.GetRepoStatsContributorsUrl(owner, repo);

            var gitHubRepoContributors = await GetHttpReponseContent<IEnumerable<GitHubRepoContributors>>(url);
            return gitHubRepoContributors;
        }

        private static async Task<T> GetHttpReponseContent<T>(string url)
        {
            using (var http = new HttpClient())
            using (var request = GetHttpRequest(url))
            using (var response = await http.SendAsync(request, HttpCompletionOption.ResponseContentRead))
            {
                string content = await response.Content.ReadAsStringAsync();

                var responseContent = DeserializeJson<T>(content);
                return responseContent;
            }
        }

        private static HttpRequestMessage GetHttpRequest(string url)
        {
            var request = new HttpRequestMessage { RequestUri = new Uri(url) };
            request.Headers.UserAgent.Add(new ProductInfoHeaderValue("GitHubRepoCompare", "0.0.1"));

            return request;
        }

        private static T DeserializeJson<T>(string json)
        {
            var result = JsonConvert.DeserializeObject<T>(json, JsonSettings);
            return result;
        }
    }
}