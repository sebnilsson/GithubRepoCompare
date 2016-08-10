import {autoinject, bindable, computedFrom} from 'aurelia-framework';

import {GitHubApiRateLimit} from '../../services/git-hub-api';

@autoinject
export class GitHubApiLimit {
    @bindable
    apiLimit: GitHubApiRateLimit;

    @bindable
    title: string;

    @computedFrom('apiLimit')
    get remaining(): number {
        return this.apiLimit.remaining;
    }

    @computedFrom('apiLimit')
    get limit(): number {
        return this.apiLimit.limit;
    }

    @computedFrom('apiLimit')
    get reset(): Date {
        return this.apiLimit.reset;
    }

    @computedFrom('limit', 'remaining')
    get remainingPercent(): number {
        let remaining = (this.remaining / this.limit) * 100;
        return Math.round(remaining);
    }
}