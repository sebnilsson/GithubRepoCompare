import {autoinject, computedFrom} from 'aurelia-framework';
import {BindingSignaler} from 'aurelia-templating-resources';
import * as $ from 'jquery';

import {Alerts} from './alerts';
import {Repos} from './repos';

let repoDataUpdateOutdatedMinutes = 1 * 60;
let repoDataUpdateOutdated = repoDataUpdateOutdatedMinutes * 60 * 1000; // ms

@autoinject
export class ReposGrid {
    private isRepoLoading: boolean;
    private repoFullName: string;
    private outdatedSignalIntervalId: number;

    constructor(private alerts: Alerts, private bindingSignaler: BindingSignaler, private repos: Repos) {}

    @computedFrom('repoFullName', 'repos.items.length')
    get isRepoFullNameValid(): boolean {
        if (!this.repoFullName) {
            return false;
        }

        let isValid = /.+\/.+/.test(this.repoFullName) && !this.repos.contains(this.repoFullName);
        return isValid;
    }

    attached() {
        this.outdatedSignalIntervalId =
            setInterval(() => this.bindingSignaler.signal('outdated-signal'), 10000);
    }

    bind() {
        if (!this.repos.items.length) {
            this.addRepo('facebook/react');
            //this.addRepo('jquery/jquery');
            this.addRepo('aurelia/framework');
            this.addRepo('angular/angular');
        }

        let defaultRepoFullName = 'emberjs/ember.js';

        if (!this.repos.contains(defaultRepoFullName)) {
            this.repoFullName = defaultRepoFullName;
        }
    }

    detached() {
        clearInterval(this.outdatedSignalIntervalId);
    }

    addRepo(fullName) {
        if (!this.isRepoFullNameValid) {
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

    toogleCollapse(collapsible) {
        collapsible.isShown = !collapsible.isShown;

        let $collapsible = $(collapsible);

        // TODO: Import Bootstrap
        $collapsible['collapse']('toggle');
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
                });

        repo.isUpdating = false;
    }
}