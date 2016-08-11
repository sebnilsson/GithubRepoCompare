import {autoinject, computedFrom} from 'aurelia-framework';

@autoinject
export class GitHubApiRateLimits {
    private _core = new GitHubApiRateLimit();
    private _search = new GitHubApiRateLimit();

    @computedFrom('_core')
    get core(): GitHubApiRateLimit {
        return this._core;
    }

    @computedFrom('_search')
    get search(): GitHubApiRateLimit {
        return this._search;
    }
}

export class GitHubApiRateLimit {
    private _limit: number;
    private _remaining: number;
    private _reset: Date;
    
    @computedFrom('_limit')
    get limit(): number {
        return this._limit;
    }

    @computedFrom('_remaining')
    get remaining(): number {
        return this._remaining;
    }

    @computedFrom('_reset')
    get reset(): Date {
        return this._reset;
    }

    updateFromApi(apiData: any) {
        let limit = apiData ? apiData.limit : undefined;
        let remaining = apiData ? apiData.remaining : undefined;
        let reset = apiData ? apiData.reset : undefined;

        if (!limit || !remaining || !reset) {
            return;
        }

        let resetDate = this.getDate(reset);

        this.updateFields(limit, remaining, resetDate);
    }

    private updateFields(limit: number, remaining: number, reset: Date) {
        this._limit = limit;
        this._remaining = remaining;
        this._reset = reset;
    }
    
    private getDate(value: number) {
        let date = new Date(value * 1000);
        return date;
    }
}