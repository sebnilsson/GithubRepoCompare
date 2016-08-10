﻿import {EventAggregator} from 'aurelia-event-aggregator';
import {autoinject, bindable, BindingEngine, computedFrom} from 'aurelia-framework';

import {GitHubApi, GitHubApiCredentials, GitHubApiEvents, GitHubApiRateLimit} from '../services/git-hub-api';
import {localStorage, LocalStorageObserver} from '../lib/local-storage';
import debounce from '../lib/debounce';

@autoinject
export class GitHubApiStatus {
    private _coreLimit: GitHubApiRateLimit;
    private _searchLimit: GitHubApiRateLimit;

    private isUpdating: boolean = false;

    constructor(private bindingEngine: BindingEngine,
        private ea: EventAggregator,
        private gitHubApi: GitHubApi,
        private gitHubApiCredentials: GitHubApiCredentials,
        private localStorageObserver: LocalStorageObserver) {
        this.localStorageObserver.subscribe(this);

        let clientIdObserver = this.bindingEngine.propertyObserver(this.gitHubApiCredentials, 'clientId');
        let clientSecretObserver = this.bindingEngine.propertyObserver(this.gitHubApiCredentials, 'clientSecret');

        let debounceUpdate = debounce(() => this.update(), 1000);

        clientIdObserver.subscribe(debounceUpdate);
        clientSecretObserver.subscribe(debounceUpdate);
    }

    @localStorage
    collapseShow: boolean = true;

    @computedFrom('_coreLimit')
    get coreLimit(): GitHubApiRateLimit {
        return this._coreLimit;
    }

    @computedFrom('_searchLimit')
    get searchLimit(): GitHubApiRateLimit {
        return this._searchLimit;
    }

    attached() {
        this.update();

        this.ea.subscribe(GitHubApiEvents.coreLimitUpdated, limit => this.onRateLimitCoreChange(limit));
        this.ea.subscribe(GitHubApiEvents.searchLimitUpdated, limit => this.onRateLimitSearchChange(limit));
    }

    detached() {
        this.localStorageObserver.unsubscribe(this);
    }

    update() {
        this.isUpdating = true;

        this.gitHubApi.getRateLimit()
            .then(data => {
                let coreData = data.resources.core;
                let searchDate = data.resources.search;

                let coreLimit = GitHubApiRateLimit.fromJson(coreData.limit, coreData.remaining, coreData.reset);
                let searchLimit = GitHubApiRateLimit.fromJson(searchDate.limit, searchDate.remaining, searchDate.reset);

                this.onRateLimitSearchChange(searchLimit);
                this.onRateLimitCoreChange(coreLimit);
            })
            .then(() => { this.isUpdating = false; });
    }

    private onRateLimitCoreChange(limit: GitHubApiRateLimit) {
        this._coreLimit = limit;
    }

    private onRateLimitSearchChange(limit: GitHubApiRateLimit) {
        this._searchLimit = limit;
    }
}