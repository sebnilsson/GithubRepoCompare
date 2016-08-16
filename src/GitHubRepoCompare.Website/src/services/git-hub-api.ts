import {HttpClient} from 'aurelia-fetch-client';
import {autoinject} from 'aurelia-framework';

import {GitHubApiCredentials} from './git-hub-api-credentials';
import {GitHubApiRateLimit, GitHubApiRateLimits} from './git-hub-api-rate-limits';

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
        return this.httpFetchRateLimitedCore(`repos/${fullName}`);
    }

    getRepoPullRequests(fullName: string): Promise<any> {
        return this.httpFetchRateLimitedSearch(`search/issues?q=repo:${fullName}+type:pr`);
    }

    getRepoStatsContributors(fullName: string): Promise<any> {
        return this.httpFetchRateLimitedCore(`repos/${fullName}/stats/contributors`);
    }

    getRepoStatsCommitActivity(fullName: string): Promise<any> {
        return this.httpFetchRateLimitedCore(`repos/${fullName}/stats/commit_activity`);
    }

    getRepoStatsCodeFrequency(fullName: string): Promise<any> {
        return this.httpFetchRateLimitedCore(`repos/${fullName}/stats/code_frequency`);
    }

    getRepoStatsParticipation(fullName: string): Promise<any> {
        return this.httpFetchRateLimitedCore(`repos/${fullName}/stats/participation`);
    }

    updateRateLimit(): Promise<any> {
        let fetchPromise = this.httpFetch('rate_limit');

        let fetchJsonPromise = this.getJsonResponse(fetchPromise);

        fetchJsonPromise.then(data => {
            let core: GitHubApiRateLimit = data.resources.core;
            let search: GitHubApiRateLimit = data.resources.search;

            this.rateLimits.core.updateFromApi(core);
            this.rateLimits.search.updateFromApi(search);
        });

        return fetchJsonPromise;
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

        return this.getJsonResponse(fetchPromise);
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

    private getJsonResponse(fetchPromise) {
        return fetchPromise
            .then(response => response.json(),
                response => response.json().then(data => Promise.reject(data)));
    }
}