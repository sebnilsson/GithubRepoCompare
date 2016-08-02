import {autoinject, computedFrom, Disposable} from 'aurelia-framework';

import {GitHubApi, GitHubApiRateLimit} from './git-hub/git-hub-api';

@autoinject
export class GitHubApiStatus {
    private _coreLimit: number;
    private _coreRemaining: number;
    private _coreReset: Date;
    private _searchLimit: number;
    private _searchRemaining: number;
    private _searchReset: Date;
    private cancelRateLimitCoreChangeSubscription: () => void;
    private cancelRateLimitSearchChangeSubscription: () => void;
    private isUpdating: boolean = false;

    constructor(private gitHubApi: GitHubApi) {
        this.update();
    }

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

    bind() {
        this.cancelRateLimitCoreChangeSubscription =
            this.gitHubApi.rateLimitChangeCore.subscribe(limit => this.onRateLimitCoreChange(limit));
        this.cancelRateLimitSearchChangeSubscription =
            this.gitHubApi.rateLimitChangeSearch.subscribe(limit => this.onRateLimitSearchChange(limit));
    }

    undbind() {
        this.cancelRateLimitCoreChangeSubscription();
        this.cancelRateLimitSearchChangeSubscription();
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

    private onRateLimitCoreChange(limit: GitHubApiRateLimit): void {
        this._coreLimit = limit.limit;
        this._coreRemaining = limit.remaining;
        this._coreReset = limit.reset;
    }

    private onRateLimitSearchChange(limit: GitHubApiRateLimit): void {
        this._searchLimit = limit.limit;
        this._searchRemaining = limit.remaining;
        this._searchReset = limit.reset;
    }
}