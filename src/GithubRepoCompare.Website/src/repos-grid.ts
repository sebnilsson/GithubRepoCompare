import {autoinject, computedFrom} from 'aurelia-framework';

import {Repos} from './repos';

@autoinject
export class ReposGrid {
    private isRepoLoading;
    private repoFullName;

    constructor(private repos: Repos) {}

    @computedFrom('repoFullName', 'repos.items.length')
    get isRepoFullNameValid() : boolean {
        if (!this.repoFullName) {
            return false;
        }

        let isValid = /.+\/.+/.test(this.repoFullName) && !this.repos.contains(this.repoFullName);
        return isValid;
    }

    bind() {
        if (!this.repos.items.length) {
            this.addRepo('facebook/react');
            //this.addRepo('emberjs/ember.js');
            this.addRepo('aurelia/framework');
            this.addRepo('angular/angular');
        }

        let defaultRepoFullName = 'jquery/jquery';

        if (!this.repos.contains(defaultRepoFullName)) {
            this.repoFullName = defaultRepoFullName;
        }
    }

    addRepo(fullName) {
        if (!this.isRepoFullNameValid) {
            return;
        }

        this.repoFullName = '';

        this.isRepoLoading = true;

        this.repos.add(fullName).then(() => {
            this.isRepoLoading = false;
        });
    }

    removeRepo(repo) {
        this.repos.remove(repo);
    }

    updateRepo(repo) {
        if (repo.isUpdating) {
            return;
        }

        repo.isUpdating = true;

        this.repos.update(repo);

        repo.isUpdating = false;
    }
}