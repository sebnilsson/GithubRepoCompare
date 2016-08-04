import {EventAggregator} from 'aurelia-event-aggregator';
import {autoinject, BindingEngine} from 'aurelia-framework';

import {Alerts} from './alerts';
import debounce from './debounce';
import {GitHubApi} from './git-hub/git-hub-api';
import {LocalStorage} from "./local-storage";

let localStorageItemsKey = 'Repos.items';

export const reposItemsChangedEvent = 'ReposItemsChanged';

@autoinject
export class Repos {
    private _items: Array<any>;

    get items(): Array<any> {
        return this._items;
    }

    constructor(private alerts: Alerts,
        private bindingEngine: BindingEngine,
        private ea: EventAggregator,
        private gitHubApi: GitHubApi) {
        console.log('Repos.constructor');

        this._items = LocalStorage.getJson(localStorageItemsKey, [], Array);

        this.sortItems();

        let collectionObserver = this.bindingEngine.collectionObserver(this.items);

        let debouncedLocalStorageSet = debounce(this.onItemsChange, 500, this);

        collectionObserver.subscribe(debouncedLocalStorageSet);
    }

    private onItemsChange() {
        console.log('Repos.onItemsChange -- this.items:', this.items);

        LocalStorage.setJson(localStorageItemsKey, this.items);

        this.ea.publish(reposItemsChangedEvent, this.items);
    }

    add(fullName: string): Promise<any> {
        let loadPromise = this.loadRepo(fullName);

        loadPromise
            .then(
                data => {
                    this.items.push(data);

                    this.sortItems();
                });

        return loadPromise;
    }

    contains(fullName: string): boolean {
        let itemsContains = this.items.some(x => (x.full_name || '').toLowerCase() === fullName.toLowerCase());
        return itemsContains;
    }

    remove(repo) {
        let repoIndex = this.items.indexOf(repo);
        if (repoIndex >= 0) {
            this.items.splice(repoIndex, 1);

            this.sortItems();
        }
    }

    update(repo): Promise<any> {
        let fullName = repo.full_name;

        let loadPromise = this.loadRepo(fullName);

        loadPromise.then(data => {
            let index = this.items.indexOf(repo);

            this.items.splice(index, 1);
            this.items.splice(index, 0, data);
        });

        return loadPromise;
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
                        },
                        dataUpdated: new Date()
                    };

                    let commitActivityPromise = this.gitHubApi.getRepoStatsCommitActivity(fullName)
                        .then(data => repo.stats.commitActivity = data);

                    let codeFrequencyPromise = this.gitHubApi.getRepoStatsCodeFrequency(fullName)
                        .then(data => repo.stats.codeFrequency = data);

                    let participationPromise = this.gitHubApi.getRepoStatsParticipation(fullName)
                        .then(data => repo.stats.participation.all = data.all);

                    let pullRequestsPromise = this.gitHubApi.getRepoPullRequests(fullName)
                        .then(data => repo.stats.pullRequestsCount = data.total_count);

                    return Promise.all([
                            pullRequestsPromise,
                            commitActivityPromise,
                            codeFrequencyPromise,
                            participationPromise
                        ])
                        .then(() => repo);
                });
    }

    private sortItems() {
        this.items.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }

            return (a.name > b.name) ? 1 : 0;
        });
    }
}