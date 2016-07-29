import {autoinject, inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import 'fetch';

@autoinject
export class GitHubApi {
    constructor(private http: HttpClient) {
        this.http.configure(config => {
            config
                .useStandardConfiguration()
                .withBaseUrl('https://api.github.com/');
        });
    }

    getRepo(fullName: string): Promise<any> {
        return this.http.fetch(`repos/${fullName}`)
            .then(response => response.json());
    }

    getRepoPullRequests(fullName: string, state: string = undefined): Promise<any> {
        let stateQs = state ? `is:${state}` : '';
        let qs = [stateQs].join('&');

        return this.http.fetch(`search/issues?q=repo:${fullName}+is:pr+${qs}`)
            .then(response => response.json());
    }

    getRepoStatsContributors(fullName: string): Promise<any> {
        return this.http.fetch(`repos/${fullName}/stats/contributors`)
            .then(response => response.json());
    }

    getRepoStatsCommitActivity(fullName: string): Promise<any> {
        return this.http.fetch(`repos/${fullName}/stats/commit_activity`)
            .then(response => response.json());
    }

    getRepoStatsCodeFrequency(fullName: string): Promise<any> {
        return this.http.fetch(`repos/${fullName}/stats/code_frequency`)
            .then(response => response.json());
    }

    getRepoStatsParticipation(fullName: string): Promise<any> {
        return this.http.fetch(`repos/${fullName}/stats/participation`)
            .then(response => response.json());
    }
}