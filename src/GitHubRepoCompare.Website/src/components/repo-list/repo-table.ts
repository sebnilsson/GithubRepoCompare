import {autoinject} from 'aurelia-framework';

import {Alerts} from '../../services/alerts';
import {GitHubRepos} from '../../services/git-hub-repos';

let repoDataUpdateOutdatedMinutes = 1 * 60;
let repoDataUpdateOutdated = repoDataUpdateOutdatedMinutes * 60 * 1000; // ms

@autoinject
export class RepoTable {
    constructor(private alerts: Alerts,
        private repos: GitHubRepos) {
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
}