import {EventAggregator} from 'aurelia-event-aggregator';
import {autoinject, bindable, computedFrom, containerless, Disposable} from 'aurelia-framework';
import {BindingSignaler} from 'aurelia-templating-resources';

import {Alerts} from '../../lib/alerts';
import {GitHubRepos} from '../../services/git-hub-repos';
import {defaultGitHubImageUrl, repoTableEvents} from './repo-table';
import {dateFormatRelativeSignalName} from '../../app';

let repoDataUpdateOutdatedMinutes = 1 * 60;
let repoDataUpdateOutdated = repoDataUpdateOutdatedMinutes * 60 * 1000; // ms

@containerless
export class RepoTableItem {
    @bindable
    repo: any;

    private _isLoading = false;
    private removeSubscription: Disposable;
    private updateSubscription: Disposable;

    constructor(private alerts: Alerts,
        private bindingSignaler: BindingSignaler,
        private ea: EventAggregator,
        private repos: GitHubRepos) {
    }

    collapseShow = false;

    @computedFrom('defaultGitHubImageUrl')
    get defaultGitHubImageUrl() {
        return defaultGitHubImageUrl;
    }

    @computedFrom('_isLoading')
    get isLoading() {
        return this._isLoading;
    }

    bind() {
        this.removeSubscription = this.ea.subscribe(repoTableEvents.removeAll, () => this.removeRepo());
        this.updateSubscription = this.ea.subscribe(repoTableEvents.updateAll, () => this.update());
    }

    unbind() {
        this.removeSubscription.dispose();
        this.updateSubscription.dispose();
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
            this.removeRepo();
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
            .then(() => {
                this._isLoading = false;

                this.bindingSignaler.signal(dateFormatRelativeSignalName);
            });
    }

    private removeRepo() {
        this.repos.remove(this.repo);
    }
}