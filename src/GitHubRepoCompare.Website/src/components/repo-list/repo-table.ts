import {autoinject, computedFrom} from 'aurelia-framework';

import {GitHubRepos} from '../../services/git-hub-repos';

@autoinject
export class RepoTable {
    private loadingRepos = [];

    constructor(private repos: GitHubRepos) {
    }

    @computedFrom('repos.addingCount')
    get isRepoAdding(): boolean {
        return (this.repos.addingCount > 0);
    }
}