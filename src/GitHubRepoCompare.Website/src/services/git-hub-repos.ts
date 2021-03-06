﻿import { EventAggregator } from 'aurelia-event-aggregator';
import { autoinject, BindingEngine, computedFrom, Disposable } from 'aurelia-framework';

import { Alerts } from '../lib/alerts';
import debounce from '../lib/debounce';
import { GitHubApi } from './git-hub-api';
import { GitHubApiRateLimits } from './git-hub-api-rate-limits';
import { LocationHashHelper } from '../lib/location-hash-helper';
import { localStorage, LocalStorageObserver } from '../lib/local-storage';

@autoinject
export class GitHubRepos {
    static gitHubReposItemsChangedEvent = 'GitHubReposItemsChanged';

    private _addingCount = 0;

    @localStorage
    private _items: Array<any> = [];

    constructor(private alerts: Alerts,
        private bindingEngine: BindingEngine,
        private ea: EventAggregator,
        private gitHubApi: GitHubApi,
        private rateLimits: GitHubApiRateLimits,
        private localStorageObserver: LocalStorageObserver) {
        this.localStorageObserver.subscribe(this);

        this.sortItems();

        let collectionObserver = this.bindingEngine.collectionObserver(this.items);

        let collectionObserverCallback =
            debounce(() => {
                    this.ea.publish(GitHubRepos.gitHubReposItemsChangedEvent, this.items);
                },
                250);

        collectionObserver.subscribe(collectionObserverCallback);

        this.handleLocationHashChange();

        LocationHashHelper.subscribeHashChange(() => this.handleLocationHashChange());
    }

    @computedFrom('_addingCount')
    get addingCount(): number {
        return this._addingCount;
    }

    @computedFrom('_items')
    get items(): Array<any> {
        return this._items;
    }

    add(fullName: string): Promise<any> {
        let loadPromise = this.loadRepo(fullName);

        this._addingCount++;

        loadPromise
            .then(
                data => {
                    this.items.push(data);

                    this.sortItems();
                },
                error => error)
            .then(() => {
                this._addingCount--;
            });

        return loadPromise;
    }

    remove(repo) {
        let repoIndex = this.items.indexOf(repo);
        if (repoIndex >= 0) {
            this.items.splice(repoIndex, 1);

            this.sortItems();
        }
    }

    setRepos(repoFullNames: Array<string>): Promise<any> {
        let removedRepos = this._items
            .map(x => {
                let index = this._items.indexOf(x);
                return { item: x, index: index };
            })
            .filter(x => repoFullNames.indexOf(x.item.full_name) < 0);

        removedRepos.sort((a, b) => {
            if (a.index < b.index) {
                return 1;
            }
            return (a.index > b.index) ? -1 : 0;
        });

        removedRepos.forEach(x => this._items.splice(x.index, 1));

        let addedRepoFullNames = repoFullNames.filter(x => !this._items.some(item => item.full_name === x));

        let addPromises = addedRepoFullNames.map(x => this.add(x));

        let allPromises = Promise.all(addPromises);

        allPromises.then(() => this.sortItems(), _ => {});

        return allPromises;
    }

    subscribe(callback: Function): Disposable {
        let subscription = this.ea.subscribe(GitHubRepos.gitHubReposItemsChangedEvent, callback);
        return subscription;
    }

    update(repo): Promise<any> {
        let fullName = repo.full_name;

        let loadPromise = this.loadRepo(fullName, repo);

        loadPromise.then(data => {
                let index = this.items.indexOf(repo);

                this.items.splice(index, 1, data);
            },
            () => {});

        return loadPromise;
    }

    private handleLocationHashChange() {
        let hashRepos = LocationHashHelper.getHashRepos();
        let hasHashRepos = !!(hashRepos && hashRepos.length);

        if (hasHashRepos) {
            this.setRepos(hashRepos)
                .then(() => LocationHashHelper.resetHash(),
                    error => {
                        let message = `Failed to load from location-hash: ${(error || {}).message || ''}`;

                        this.alerts.addDanger(message);
                    });
        }
    }

    private loadRepo(fullName: string, repo?: any): Promise<any> {
        repo = repo || {};

        return this.gitHubApi.getRepo(fullName)
            .then(
                data => {
                    repo.full_name = data.full_name;
                    repo.owner = {
                        avatar_url: data.owner.avatar_url
                    };
                    repo.html_url = data.html_url;
                    repo.description = data.description;
                    repo.created_at = data.created_at;
                    repo.updated_at = data.updated_at;
                    repo.size = data.size;
                    repo.watchers_count = data.watchers_count;
                    repo.language = data.language;
                    repo.forks_count = data.forks_count;
                    repo.open_issues_count = data.open_issues_count;
                    repo.subscribers_count = data.subscribers_count;

                    repo.stats = repo.stats ||
                    {
                        codeFrequency: [],
                        commitActivity: [],
                        participation: {
                            all: []
                        },
                        pullRequestsCount: 0
                    };

                    let commitActivityPromise = this.gitHubApi.getRepoStatsCommitActivity(fullName)
                        .then(data => repo.stats.commitActivity = data);

                    let codeFrequencyPromise = this.gitHubApi.getRepoStatsCodeFrequency(fullName)
                        .then(data => repo.stats.codeFrequency = data);

                    let participationPromise = this.gitHubApi.getRepoStatsParticipation(fullName)
                        .then(data => repo.stats.participation.all = data.all);

                    let pullRequestsPromise = this.gitHubApi.getRepoPullRequests(fullName)
                        .then(data => repo.stats.pullRequestsCount = data.total_count);

                    let allPromise = Promise.all([
                        commitActivityPromise,
                        codeFrequencyPromise,
                        participationPromise,
                        pullRequestsPromise
                    ]);

                    allPromise.then(() => repo.dataUpdated = new Date());

                    return allPromise.then(() => repo);
                },
                error => Promise.reject(error));
    }

    private sortItems() {
        this.items.sort((a, b) => {
            let itemA = a.full_name.toLowerCase();
            let itemB = b.full_name.toLowerCase();

            if (itemA < itemB) {
                return -1;
            }

            return (itemA > itemB) ? 1 : 0;
        });

        this.items.push({});
        this.items.pop();
    }
}