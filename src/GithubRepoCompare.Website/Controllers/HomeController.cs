using Microsoft.AspNet.Mvc;

namespace GithubRepoCompare.Website.Website.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return this.View();
        }

        public IActionResult Error()
        {
            return this.View();
        }
    }
}