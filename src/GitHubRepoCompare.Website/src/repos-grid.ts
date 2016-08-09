import {autoinject, computedFrom} from 'aurelia-framework';
import {BindingSignaler} from 'aurelia-templating-resources';
import * as $ from 'jquery';

import {Alerts} from './alerts';
import {localStorage, LocalStorageObserver} from './local-storage';
import {Repos} from './repos';

let repoDataUpdateOutdatedMinutes = 1 * 60;
let repoDataUpdateOutdated = repoDataUpdateOutdatedMinutes * 60 * 1000; // ms

@autoinject
export class ReposGrid {
    private _repoFullName: string;
    private isRepoLoading: boolean;
    private outdatedSignalIntervalId: number;

    constructor(private alerts: Alerts,
        private bindingSignaler: BindingSignaler,
        private localStorageObserver: LocalStorageObserver,
        private repos: Repos) {
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

    attached() {
        this.outdatedSignalIntervalId =
            setInterval(() => this.bindingSignaler.signal('outdated-signal'), 10000);
    }

    bind() {
        this.addDefaultRepos();
    }

    detached() {
        clearInterval(this.outdatedSignalIntervalId);

        this.localStorageObserver.unsubscribe(this);
    }

    addRepo(fullName: string) {
        if (!this.getIsRepoFullNameValid(fullName)) {
            return;
        }

        this.isRepoLoading = true;

        this.repos.add(fullName)
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

    isRepoOutdated(repo) {
        let nowTime = (new Date()).getTime();

        let updated = repo.dataUpdated ? new Date(repo.dataUpdated) : new Date(0);
        let updatedTime = updated.getTime();
        let updatedDiff = nowTime - updatedTime;

        let isOutdated = updatedTime <= 0 || updatedDiff > repoDataUpdateOutdated;
        return isOutdated;
    }

    removeRepo(repo) {
        let isConfirmed = confirm(`Are you sure you want to remove '${repo.full_name}'?`);

        if (isConfirmed) {
            this.repos.remove(repo);
        }
    }

    updateRepo(repo) {
        if (repo.isUpdating) {
            return;
        }

        repo.isUpdating = true;

        this.repos.update(repo)
            .then(() => {},
                response => {
                    let json = response.json();

                    json.then(data => {
                        let message = `Failed updating repository '${repo.full_name}': ${(data || {}).message || ''}`;

                        this.alerts.addDanger(message);
                    });
                })
            .then(() => {
                repo.isUpdating = false;
            });
    }

    private addDefaultRepos() {
        let defaultRepoFullName = 'emberjs/ember.js';

        if (!this.repos.items.length) {
            Promise.all([
                    this.addRepo('facebook/react'),
                    //this.addRepo('jquery/jquery'),
                    this.addRepo('aurelia/framework'),
                    this.addRepo('angular/angular')
                ])
                .then(() => {
                    this.setDefaultRepoFullName(defaultRepoFullName);
                });
        } else {
            this.setDefaultRepoFullName(defaultRepoFullName);
        }
    }

    private setDefaultRepoFullName(defaultRepoFullName) {
        if (!this.repos.contains(defaultRepoFullName)) {
            this.repoFullName = defaultRepoFullName;
        }
    }

    private getIsRepoFullNameValid(fullName: string): boolean {
        if (!fullName) {
            return false;
        }

        let isValid = /.+\/.+/.test(fullName) && !this.repos.contains(fullName);
        return isValid;
    }
}