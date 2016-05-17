import {Errors} from 'app/errors';
import {GitHubApi} from 'app/data/git-hub-api';

let localStorageItemsKey = 'gitHubRepos_items';

export class GitHubRepos {
    static inject() {
        return [Errors, GitHubApi];
    }
    constructor(errors, gitHubApi) {
        if (typeof(window.localStorage) === 'undefined') {
            throw new Error('\'window.localStorage\' is undefined.');
        }

        this.errors = errors;
        this.gitHubApi = gitHubApi;

        this.items = this.getStoredItems() || [];

        this.sort();
    }
    add(fullName) {
        return this.loadRepo(fullName)
            .then(
                data => {
                    this.items.push(data);

                    this.sort();
                },
                response => {
                    let json = response.json();

                    json.then(data => {
                        let message = `Failed loading repository '${fullName}': ${(data || {}).message || ''}`;

                        this.errors.addDanger(message);
                    });
                }
            );
    }
    contains(fullName) {
        var itemsContains = this.items.findIndex(x => (x.full_name || '').toLowerCase() === fullName.toLowerCase()) >= 0;
        return itemsContains;
    }
    getStoredItems() {
        var storedItems = window.localStorage[localStorageItemsKey];
        var localStorageRepo = storedItems ? JSON.parse(storedItems) : undefined;

        localStorageRepo = (localStorageRepo && typeof(localStorageRepo.indexOf) === 'function') ? localStorageRepo : undefined;

        console.log('GitHubRepos.getStoredItems - localStorageRepo:', localStorageRepo);
        return localStorageRepo;
    }
    loadRepo(fullName) {
        return this.gitHubApi.getRepo(fullName)
            .then(
                data => {
                    var repo = {
                        id: data.id,
                        name: data.name,
                        full_name: data.full_name,
                        owner: {
                            avatar_url: data.owner.avatar_url
                        },
                        html_url: data.html_url,
                        homepage: data.homepage,
                        created_at: data.created_at,
                        updated_at: data.updated_at,
                        size: data.size,
                        watchers_count: data.watchers_count,
                        language: data.language,
                        forks_count: data.forks_count,
                        open_issues_count: data.open_issues_count,
                        subscribers_count: data.subscribers_count,
                        stats: {
                            codeFrequency: [],
                            commitActivity: [],
                            participation: {
                                all: []
                            },
                            pullRequests: []
                        }
                    };

                    return Promise.all([
                            this.gitHubApi.getRepoPullRequests(fullName),
                            //this.gitHubApi.getRepoStatsContributors(fullName),
                            this.gitHubApi.getRepoStatsCommitActivity(fullName),
                            this.gitHubApi.getRepoStatsCodeFrequency(fullName),
                            this.gitHubApi.getRepoStatsParticipation(fullName)
                        ])
                        .then(values => {
                            //let pullRequests = values[0],
                            //    contributors = values[1],
                            //    commitActivity = values[2],
                            //    codeFrequency = values[3],
                            //    participation = values[4];
                            let pullRequests = values[0],
                                commitActivity = values[1],
                                codeFrequency = values[2],
                                participation = values[3];

                            repo.stats = {
                                pullRequestsCount: pullRequests.total_count,
                                //contributors: contributors.map(c => ({
                                //    total: c.total,
                                //    weeks: c.weeks.map(week => ({
                                //        w: week.w,
                                //        c: week.c
                                //    }))
                                //})),
                                commitActivity: commitActivity,
                                codeFrequency: codeFrequency,
                                participation: {
                                    all: participation.all
                                }
                            };

                            return repo;
                        });
                });
    }
    remove(repo) {
        var repoIndex = this.items.indexOf(repo);
        if (repoIndex >= 0) {
            this.items.splice(repoIndex, 1);

            this.sort();
        }
    }
    setStoredItems() {
        var repoJson = JSON.stringify(this.items);

        console.log('GitHubRepos.setStoredItems - repoJson.length:', repoJson.length);
        window.localStorage[localStorageItemsKey] = repoJson;
    }
    sort() {
        this.items.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            return (a.name > b.name) ? 1 : 0;
        });
    }
    update(repo) {
        let fullName = repo.full_name;

        return this.loadRepo(fullName).then(data => {
            var index = this.items.indexOf(repo);

            this.items.splice(index, 1);
            this.items.splice(index, 0, data);
        });
    }
}