import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient} from 'aurelia-fetch-client';
import {autoinject, computedFrom} from 'aurelia-framework';
import 'fetch';

import {localStorage, LocalStorageObserver} from '../lib/local-storage';
import {GitHubApiRateLimit, GitHubApiRateLimits} from './git-hub-api-rate-limits';

@autoinject
export class GitHubApiCredentials {
    static changeEvent = 'GitHubApiCredentials';

    private _clientId: string;
    private _clientSecret: string;

    constructor(private ea: EventAggregator,
        private localStorageObserver: LocalStorageObserver) {
        this.localStorageObserver.subscribe(this);
    }

    @computedFrom('_clientId')
    @localStorage
    get clientId(): string {
        return this._clientId;
    }

    set clientId(value: string) {
        this._clientId = value;

        this.ea.publish(GitHubApiCredentials.changeEvent);
    }

    @computedFrom('_clientSecret')
    @localStorage
    get clientSecret(): string {
        return this._clientSecret;
    }

    set clientSecret(value: string) {
        this._clientSecret = value;

        this.ea.publish(GitHubApiCredentials.changeEvent);
    }
}

@autoinject
export class GitHubApi {
    constructor(private credentials: GitHubApiCredentials,
        private rateLimits: GitHubApiRateLimits,
        private http: HttpClient) {
        this.http.configure(config => {
            config
                .useStandardConfiguration()
                .withBaseUrl('https://api.github.com/');
        });
    }

    getRepo(fullName: string): Promise<any> {
        return this.httpFetchRateLimitedCore(`repos/${fullName}`)
            .then(response => response.json());
    }

    getRepoPullRequests(fullName: string): Promise<any> {
        return this.httpFetchRateLimitedSearch(`search/issues?q=repo:${fullName}+type:pr`)
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

    updateRateLimit(): Promise<any> {
        let fetchPromise = this.httpFetch('rate_limit')
            .then(response => response.json());

        fetchPromise.then(data => {
            let core: GitHubApiRateLimit = data.resources.core;
            let search: GitHubApiRateLimit = data.resources.search;

            this.rateLimits.core.updateFromApi(core);
            this.rateLimits.search.updateFromApi(search);
        });

        return fetchPromise;
    }

    private getHttpFetchUri(uri: string): string {
        let hasOAuthCredentials = !!this.credentials.clientId && !!this.credentials.clientSecret;
        if (!hasOAuthCredentials) {
            return uri;
        }

        let separator = (uri.indexOf('?') >= 0) ? '&' : '?';
        let oAuthCredentials = `client_id=${this.credentials.clientId}&client_secret=${this.credentials.clientSecret}`;

        let oAuthUri = `${uri}${separator}${oAuthCredentials}`;
        return oAuthUri;
    }

    //private getQueryString(query: Object): string {
    //    let qsParams = [];

    //    if (query) {
    //        for (let key in query) {
    //            if (query.hasOwnProperty(key)) {
    //                let value = query[key];

    //                let qsParam = `${key}=${value}`;
    //                qsParams.push(qsParam);
    //            }
    //        }
    //    }

    //    let qs = qsParams.join('&');
    //    return qs;
    //}

    private getResponseHeaderNumber(response, key: string): number {
        let value = response.headers.get(key);
        let num = value ? parseInt(value, 10) : undefined;

        return num || 0;
    }

    private handleFetchResponse(response, rateLimit: GitHubApiRateLimit) {
        let rateLimitLimit = this.getResponseHeaderNumber(response, 'X-RateLimit-Limit');
        let rateLimitRemaining = this.getResponseHeaderNumber(response, 'X-RateLimit-Remaining');
        let rateLimitReset = this.getResponseHeaderNumber(response, 'X-RateLimit-Reset');

        let apiData = {
            limit: rateLimitLimit,
            remaining: rateLimitRemaining,
            reset: rateLimitReset
        };

        rateLimit.updateFromApi(apiData);
    }

    private httpFetchRateLimited(uri: string, rateLimit: GitHubApiRateLimit): Promise<any> {
        let fetchPromise = this.httpFetch(uri);

        fetchPromise.then(response => this.handleFetchResponse(response, rateLimit),
            response => this.handleFetchResponse(response, rateLimit));

        return fetchPromise;
    }

    private httpFetchRateLimitedCore(uri: string): Promise<any> {
        return this.httpFetchRateLimited(uri, this.rateLimits.core);
    }

    private httpFetchRateLimitedSearch(uri: string): Promise<any> {
        return this.httpFetchRateLimited(uri, this.rateLimits.search);
    }

    private httpFetch(uri: string) {
        let httpFetchUri = this.getHttpFetchUri(uri);

        return this.http.fetch(httpFetchUri);
    }
}