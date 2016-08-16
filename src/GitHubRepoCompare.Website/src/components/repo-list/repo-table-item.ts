import {autoinject, bindable, computedFrom, containerless} from 'aurelia-framework';

import {Alerts} from '../../services/alerts';
import {GitHubRepos} from '../../services/git-hub-repos';

let repoDataUpdateOutdatedMinutes = 1 * 60;
let repoDataUpdateOutdated = repoDataUpdateOutdatedMinutes * 60 * 1000; // ms

@containerless
export class RepoTableItem {
    @bindable
    repo: any;

    private _isLoading = false;

    @computedFrom('_isLoading')
    get isLoading() {
        return this._isLoading;
    }

    constructor(private alerts: Alerts,
        private repos: GitHubRepos) {
    }

    isOutdated(): boolean {
        let nowTime = (new Date()).getTime();

        let updated = this.repo.dataUpdated ? new Date(this.repo.dataUpdated) : new Date(0);
        let updatedTime = updated.getTime();
        let updatedDiff = nowTime - updatedTime;

        let isOutdated = updatedTime <= 0 || updatedDiff > repoDataUpdateOutdated;
        return isOutdated;
    }

    remove() {
        let isConfirmed = confirm(`Are you sure you want to remove '${this.repo.full_name}'?`);

        if (isConfirmed) {
            this.repos.remove(this.repo);
        }
    }

    update() {
        if (this.isLoading) {
            return;
        }

        this._isLoading = true;

        this.repos.update(this.repo)
            .catch(data => {
                let message = `Failed to update repository '${this.repo.full_name}': ${(data || {}).message || ''}`;

                this.alerts.addDanger(message);
            })
            .then(() => this._isLoading = false);
    }
}