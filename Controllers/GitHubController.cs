using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNet.Mvc;

namespace GithubRepoCompare.Controllers
{
    [Route("github/[action]/{owner}/{repo}")]
    public class GitHubController : Controller
    {
        [HttpGet]
        public async Task<GitHubRepo> Repo(string owner, string repo)
        {
            var result = await GitHubApiService.GetRepo(owner, repo);
            return result;
        }

        [HttpGet]
        public async Task<IEnumerable<GitHubRepoContributors>> RepoContributors(string owner, string repo)
        {
            var result = await GitHubApiService.GetRepoContributors(owner, repo);
            return result;
        }
    }
}