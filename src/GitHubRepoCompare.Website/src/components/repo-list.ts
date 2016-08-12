import {autoinject, computedFrom} from 'aurelia-framework';

import {Alerts} from '../services/alerts';
import {localStorage, LocalStorageObserver} from '../lib/local-storage';
import {GitHubRepos} from '../services/git-hub-repos';

@autoinject
export class RepoList {
    private _repoFullName: string;
    private isRepoLoading: boolean;

    constructor(private alerts: Alerts,
        private localStorageObserver: LocalStorageObserver,
        private repos: GitHubRepos) {
        this.localStorageObserver.subscribe(this);
    }

    @localStorage
    collapseShow: boolean = true;

    @computedFrom('_repoFullName')
    get repoFullName() {
        return this._repoFullName;
    }

    set repoFullName(value) {
        this._repoFullName = (value || '').trim().toLowerCase();
    }

    @computedFrom('_repoFullName', 'repos.items.length')
    get isRepoFullNameValid(): boolean {
        return this.getIsRepoFullNameValid(this.repoFullName);
    }

    detached() {
        this.localStorageObserver.unsubscribe(this);
    }

    addRepo(fullName: string) {
        if (!this.getIsRepoFullNameValid(fullName)) {
            return Promise.reject(new Error('Invalid repo full-name.'));
        }

        this.isRepoLoading = true;

        return this.repos.add(fullName)
            .then(() => {
                    this.repoFullName = '';
                },
                response => {
                    let json = response.json();

                    json.then(data => {
                        let message = `Failed loading repository '${fullName}': ${(data || {}).message || ''}`;

                        this.alerts.addDanger(message);
                    });
                })
            .then(() => {
                this.isRepoLoading = false;
            });
    }

    private getIsRepoFullNameValid(fullName: string): boolean {
        if (!fullName) {
            return false;
        }

        let isValid = /.+\/.+/.test(fullName) && !this.repos.contains(fullName);
        return isValid;
    }
}