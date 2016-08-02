﻿import {autoinject, computedFrom, Disposable} from 'aurelia-framework';
import {BindingSignaler} from 'aurelia-templating-resources';

import {GitHubApi, GitHubApiRateLimit} from './git-hub/git-hub-api';

@autoinject
export class GitHubApiStatus {
    private _coreLimit: number;
    private _coreRemaining: number;
    private _coreReset: Date;
    private _searchLimit: number;
    private _searchRemaining: number;
    private _searchReset: Date;
    private cancelCoreRateLimitChangeSubscription: () => void;
    private cancelSearchRateLimitChangeSubscription: () => void;
    private resetRelativeIntervalId: number;
    private isUpdating: boolean = false;

    constructor(private bindingSignaler: BindingSignaler, private gitHubApi: GitHubApi) {}

    @computedFrom('_coreLimit')
    get coreLimit(): number {
        return this._coreLimit;
    }

    @computedFrom('_coreRemaining')
    get coreRemaining(): number {
        return this._coreRemaining;
    }

    @computedFrom('coreLimit', 'coreRemaining')
    get coreRemainingPercent(): number {
        let remaining = (this.coreRemaining / this.coreLimit) * 100;
        return Math.round(remaining);
    }

    @computedFrom('_coreReset')
    get coreReset(): Date {
        return this._coreReset;
    }

    @computedFrom('_searchLimit')
    get searchLimit(): number {
        return this._searchLimit;
    }

    @computedFrom('_searchRemaining')
    get searchRemaining(): number {
        return this._searchRemaining;
    }

    @computedFrom('searchLimit', 'searchRemaining')
    get searchRemainingPercent(): number {
        let remaining = (this.searchRemaining / this.searchLimit) * 100;
        return Math.round(remaining);
    }

    @computedFrom('_searchReset')
    get searchReset(): Date {
        return this._searchReset;
    }

    attached() {
        this.resetRelativeIntervalId =
            setInterval(() => this.bindingSignaler.signal('reset-signal'), 5000);
    }

    bind() {
        this.update();

        this.cancelCoreRateLimitChangeSubscription =
            this.gitHubApi.rateLimitChangeCore.subscribe(limit => this.onRateLimitCoreChange(limit));
        this.cancelSearchRateLimitChangeSubscription =
            this.gitHubApi.rateLimitChangeSearch.subscribe(limit => this.onRateLimitSearchChange(limit));
    }

    detached() {
        clearInterval(this.resetRelativeIntervalId);
    }

    undbind() {
        this.cancelCoreRateLimitChangeSubscription();
        this.cancelSearchRateLimitChangeSubscription();
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
        this._coreLimit = limit.limit;
        this._coreRemaining = limit.remaining;
        this._coreReset = limit.reset;
    }

    private onRateLimitSearchChange(limit: GitHubApiRateLimit) {
        this._searchLimit = limit.limit;
        this._searchRemaining = limit.remaining;
        this._searchReset = limit.reset;
    }
}