import {autoinject, BindingEngine, Disposable} from 'aurelia-framework';

import {Alerts} from './alerts';
import {GitHubApi} from './git-hub/git-hub-api';
import {JsonLocalStorage} from "./json-local-storage";

let localStorageItemsKey = 'gitHubRepos_items';

@autoinject
export class Repos {
    private _items: Array<any>;
    private itemsObserver;

    get items(): Array<any> {
        return this._items;
    }

    constructor(private alerts: Alerts,
        private bindingEngine: BindingEngine,
        private gitHubApi: GitHubApi,
        private jsonLocalStorage: JsonLocalStorage) {
        console.log('Repos.constructor');

        this._items = jsonLocalStorage.get(localStorageItemsKey, Array) || [];

        this.itemsObserver = this.bindingEngine.collectionObserver(this.items);

        this.sort();
    }

    add(fullName: string): Promise<any> {
        return this.loadRepo(fullName)
            .then(
                data => {
                    this.items.push(data);

                    this.sort();

                    this.setStoredItems();
                },
                response => {
                    let json = response.json();

                    json.then(data => {
                        let message = `Failed loading repository '${fullName}': ${(data || {}).message || ''}`;

                        this.alerts.addDanger(message);
                    });
                }
            );
    }

    contains(fullName: string): boolean {
        let itemsContains = this.items.findIndex(x => (x.full_name || '').toLowerCase() === fullName.toLowerCase()) >= 0;
        return itemsContains;
    }

    remove(repo): void {
        let repoIndex = this.items.indexOf(repo);
        if (repoIndex >= 0) {
            this.items.splice(repoIndex, 1);

            this.sort();

            this.setStoredItems();
        }
    }

    subscribe(callback: any): Disposable {
        let subscription = this.itemsObserver.subscribe(callback);
        return subscription;
    }

    update(repo): Promise<any> {
        let fullName = repo.full_name;

        return this.loadRepo(fullName).then(data => {
            let index = this.items.indexOf(repo);

            this.items.splice(index, 1);
            this.items.splice(index, 0, data);

            this.setStoredItems();
        });
    }

    private loadRepo(fullName: string): Promise<any> {
        return this.gitHubApi.getRepo(fullName)
            .then(
                data => {
                    let repo = {
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
                            pullRequests: [],
                            pullRequestsCount: 0
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

                            //repo.stats = {
                            //    pullRequestsCount: pullRequests.total_count,
                            //    commitActivity: commitActivity,
                            //    codeFrequency: codeFrequency,
                            //    participation: {
                            //        all: participation.all
                            //    }
                            //};

                            repo.stats.pullRequestsCount = pullRequests.total_count;
                            repo.stats.commitActivity = commitActivity;
                            repo.stats.codeFrequency = codeFrequency;
                            repo.stats.participation = {
                                all: participation.all
                            };

                            return repo;
                        });
                });
    }

    private setStoredItems(): void {
        this.jsonLocalStorage.set(localStorageItemsKey, this.items);
    }

    private sort(): void {
        this.items.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            return (a.name > b.name) ? 1 : 0;
        });
    }
}