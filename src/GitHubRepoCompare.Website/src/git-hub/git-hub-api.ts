import {autoinject, inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import 'fetch';

import {ObservableEvent} from '../observable-event';

@autoinject
export class GitHubApi {
    clientId: string;
    clientSecret: string;

    rateLimitChangeCore = new ObservableEvent<GitHubApiRateLimit>();
    rateLimitChangeSearch = new ObservableEvent<GitHubApiRateLimit>();

    constructor(private http: HttpClient) {
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

    getRepoPullRequests(fullName: string, state: string = undefined): Promise<any> {
        let stateQs = state ? `is:${state}` : '';
        let qs = [stateQs].join('&');

        return this.httpFetchRateSearchLimited(`search/issues?q=repo:${fullName}+is:pr+${qs}`)
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
        return this.httpFetchRateLimited(uri, this.rateLimitChangeCore);
    }

    private httpFetchRateSearchLimited(uri: string): Promise<any> {
        return this.httpFetchRateLimited(uri, this.rateLimitChangeSearch);
    }

    private httpFetchRateLimited(uri: string, observable: ObservableEvent<GitHubApiRateLimit>): Promise<any> {
        let fetchPromise = this.httpFetch(uri);

        fetchPromise.then(response => {
            let rateLimitLimit = response.headers.get('X-RateLimit-Limit') as string;
            let rateLimitRemaining = response.headers.get('X-RateLimit-Remaining') as string;
            let rateLimitReset = response.headers.get('X-RateLimit-Reset') as string;

            if (!rateLimitLimit || !rateLimitReset) {
                return;
            }

            let limit = GitHubApiRateLimit.fromJson(rateLimitLimit, rateLimitRemaining, rateLimitReset);

            observable.trigger(limit);
        });

        return fetchPromise;
    }

    private httpFetch(uri: string) {
        let httpFetchUri = this.getHttpFetchUri(uri);

        return this.http.fetch(httpFetchUri);
    }

    private getHttpFetchUri(uri: string) {
        let hasOAuthCredentials = !!this.clientId && !!this.clientSecret;
        if (!hasOAuthCredentials) {
            return uri;
        }

        let separator = (uri.indexOf('?') >= 0) ? '&' : '?';
        let oAuthCredentials = `client_id=${this.clientId}&client_secret=${this.clientSecret}`;

        let oAuthUri = `${uri}${separator}${oAuthCredentials}`;
        return oAuthUri;
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