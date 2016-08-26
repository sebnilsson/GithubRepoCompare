import {autoinject, bindable, computedFrom} from 'aurelia-framework';

import {GitHubApiRateLimit} from '../../services/git-hub-api-rate-limits';

@autoinject
export class ApiRateLimit {
    @bindable
    apiLimit: GitHubApiRateLimit;

    @bindable
    title: string;

    @computedFrom('apiLimit.limit')
    get limit(): number {
        return this.apiLimit.limit;
    }

    @computedFrom('apiLimit.remaining')
    get remaining(): number {
        return this.apiLimit.remaining;
    }

    @computedFrom('apiLimit.reset')
    get reset(): Date {
        return this.apiLimit.reset;
    }

    @computedFrom('limit', 'remaining')
    get remainingPercent(): number {
        let remaining = (this.remaining / this.limit) * 100;
        return Math.round(remaining);
    }

    @computedFrom('remainingPercent')
    get contextName(): string {
        if (!this.remainingPercent) {
            return 'default';
        }

        var contextName = (this.remainingPercent <= 25)
            ? 'danger'
            : (this.remainingPercent <= 50 ? 'warning' : 'success');
        return contextName;
    }
}