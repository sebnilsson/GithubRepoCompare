import {autoinject, computedFrom} from 'aurelia-framework';

import {GitHubRepos} from '../services/git-hub-repos';

@autoinject
export class RepoCompare {
    constructor(private repos: GitHubRepos) {
    }

    @computedFrom('repos.items.length')
    get hasReposToCompare() {
        let hasReposToCompare = this.repos && this.repos.items && (this.repos.items.length > 1);
        return hasReposToCompare;
    }
}