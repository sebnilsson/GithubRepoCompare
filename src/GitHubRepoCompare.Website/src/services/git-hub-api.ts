import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient} from 'aurelia-fetch-client';
import {autoinject, inject} from 'aurelia-framework';
import 'fetch';

export class GitHubApiEvents {
    static coreLimitUpdated = 'GitHubApiEvents.coreLimitUpdated';
    static searchLimitUpdated = 'GitHubApiEvents.coreLimitUpdated';
}

@autoinject
export class GitHubApi {
    clientId: string;
    clientSecret: string;

    constructor(private http: HttpClient, private ea: EventAggregator) {
        this.http.configure(config => {
            config
                .useStandardConfiguration()
                .withBaseUrl('https://api.github.com/');
        });
    }

    getRateLimit(): Promise<any> {
        return this.httpFetch('rate_limit')
            .then(response => response.json());
    }

    getRepo(fullName: string): Promise<any> {
        return this.httpFetchRateLimitedCore(`repos/${fullName}`)
            .then(response => response.json());
    }

    getRepoPullRequests(fullName: string): Promise<any> {
        return this.httpFetchRateSearchLimited(`search/issues?q=repo:${fullName}+type:pr`)
            .then(response => response.json());
    }

    getRepoStatsContributors(fullName: string): Promise<any> {
        return this.httpFetchRateLimitedCore(`repos/${fullName}/stats/contributors`)
            .then(response => response.json());
    }

    getRepoStatsCommitActivity(fullName: string): Promise<any> {
        return this.httpFetchRateLimitedCore(`repos/${fullName}/stats/commit_activity`)
            .then(response => response.json());
    }

    getRepoStatsCodeFrequency(fullName: string): Promise<any> {
        return this.httpFetchRateLimitedCore(`repos/${fullName}/stats/code_frequency`)
            .then(response => response.json());
    }

    getRepoStatsParticipation(fullName: string): Promise<any> {
        return this.httpFetchRateLimitedCore(`repos/${fullName}/stats/participation`)
            .then(response => response.json());
    }

    private httpFetchRateLimitedCore(uri: string): Promise<any> {
        return this.httpFetchRateLimited(uri, GitHubApiEvents.coreLimitUpdated);
    }

    private httpFetchRateSearchLimited(uri: string): Promise<any> {
        return this.httpFetchRateLimited(uri, GitHubApiEvents.searchLimitUpdated);
    }

    private httpFetchRateLimited(uri: string, event: any): Promise<any> {
        let fetchPromise = this.httpFetch(uri);

        fetchPromise.then(response => {
            let rateLimitLimit = response.headers.get('X-RateLimit-Limit') as string;
            let rateLimitRemaining = response.headers.get('X-RateLimit-Remaining') as string;
            let rateLimitReset = response.headers.get('X-RateLimit-Reset') as string;

            if (!rateLimitLimit || !rateLimitReset) {
                return;
            }

            let limit = GitHubApiRateLimit.fromJson(rateLimitLimit, rateLimitRemaining, rateLimitReset);

            this.ea.publish(event, limit);
        });

        return fetchPromise;
    }

    private httpFetch(uri: string) {
        let httpFetchUri = this.getHttpFetchUri(uri);

        return this.http.fetch(httpFetchUri);
    }

    private getHttpFetchUri(uri: string): string {
        let hasOAuthCredentials = !!this.clientId && !!this.clientSecret;
        if (!hasOAuthCredentials) {
            return uri;
        }

        let separator = (uri.indexOf('?') >= 0) ? '&' : '?';
        let oAuthCredentials = `client_id=${this.clientId}&client_secret=${this.clientSecret}`;

        let oAuthUri = `${uri}${separator}${oAuthCredentials}`;
        return oAuthUri;
    }

    private getQueryString(query: Object): string {
        let qsParams = [];

        if (query) {
            for (let key in query) {
                if (query.hasOwnProperty(key)) {
                    let value = query[key];

                    let qsParam = `${key}=${value}`;
                    qsParams.push(qsParam);
                }
            }
        }

        let qs = qsParams.join('&');
        return qs;
    }
}

export class GitHubApiRateLimit {
    private _reset: Date;

    constructor(private _limit: number, private _remaining: number, private __reset: number) {
        this._reset = new Date(__reset * 1000);
    }

    get limit(): number {
        return this._limit;
    }

    get remaining(): number {
        return this._remaining;
    }

    get reset(): Date {
        return this._reset;
    }

    static fromJson(limit: any, remaining: any, reset: any): GitHubApiRateLimit {
        let rateLimitLimit = parseInt(limit, 10) || 0;
        let rateLimitRemaining = parseInt(remaining, 10) || 0;
        let rateLimitReset = parseInt(reset, 10) || 0;

        return new GitHubApiRateLimit(rateLimitLimit, rateLimitRemaining, rateLimitReset);
    }
}