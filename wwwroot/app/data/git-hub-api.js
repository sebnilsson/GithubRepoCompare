import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

export class GitHubApi {
    static inject() {
        return [HttpClient];
    }
    constructor(http) {
        http.configure(config => {
            config
                .useStandardConfiguration()
                .withBaseUrl('https://api.github.com/');
        });

        this.http = http;
    }
    getRepo(fullName) {
        return this.http.fetch(`repos/${fullName}`)
            .then(response => response.json());
    }
    getRepoPullRequests(fullName, state) {
        let stateQs = state ? `is:${state}` : '';
        let qs = [stateQs].join('&');

        return this.http.fetch(`search/issues?q=repo:${fullName}+is:pr+${qs}`)
            .then(response => response.json());
    }
    getRepoStatsContributors(fullName) {
        return this.http.fetch(`repos/${fullName}/stats/contributors`)
            .then(response => response.json());
    }
    getRepoStatsCommitActivity(fullName) {
        return this.http.fetch(`repos/${fullName}/stats/commit_activity`)
            .then(response => response.json());
    }
    getRepoStatsCodeFrequency(fullName) {
        return this.http.fetch(`repos/${fullName}/stats/code_frequency`)
            .then(response => response.json());
    }
    getRepoStatsParticipation(fullName) {
        return this.http.fetch(`repos/${fullName}/stats/participation`)
            .then(response => response.json());
    }
}