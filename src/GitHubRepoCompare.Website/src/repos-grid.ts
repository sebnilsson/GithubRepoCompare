import {autoinject, computedFrom} from 'aurelia-framework';

import {Alerts} from './alerts';
import {Repos} from './repos';

@autoinject
export class ReposGrid {
    private isRepoLoading;
    private repoFullName;

    constructor(private alerts: Alerts, private repos: Repos) {}

    @computedFrom('repoFullName', 'repos.items.length')
    get isRepoFullNameValid(): boolean {
        if (!this.repoFullName) {
            return false;
        }

        let isValid = /.+\/.+/.test(this.repoFullName) && !this.repos.contains(this.repoFullName);
        return isValid;
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

    addRepo(fullName) {
        if (!this.isRepoFullNameValid) {
            return;
        }

        this.isRepoLoading = true;

        this.repos.add(fullName)
            .then(() => {
                this.repoFullName = '';
            }, response => {
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

    removeRepo(repo) {
        this.repos.remove(repo);
    }

    updateRepo(repo) {
        if (repo.isUpdating) {
            return;
        }
        
        repo.isUpdating = true;

        this.repos.update(repo).then(() => {},
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