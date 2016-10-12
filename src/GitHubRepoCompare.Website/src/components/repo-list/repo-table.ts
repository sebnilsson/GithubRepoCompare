import { EventAggregator } from 'aurelia-event-aggregator';
import { autoinject, computedFrom } from 'aurelia-framework';

import { GitHubRepos } from '../../services/git-hub-repos';
import { Presets } from './presets';

export const defaultGitHubImageUrl = 'https://avatars.githubusercontent.com/u/9919?v=3';

export const repoTableEvents = {
    removeAll: 'RepoTable.removeAllEvent',
    updateAll: 'RepoTable.updateAllEvent'
};

@autoinject
export class RepoTable {
    private loadingRepos = [];

    constructor(private ea: EventAggregator,
        private repos: GitHubRepos,
        private presets: Presets) {
    }

    @computedFrom('defaultGitHubImageUrl')
    get defaultGitHubImageUrl() {
        return defaultGitHubImageUrl;
    }

    @computedFrom('repos.items.length')
    get hasRepos(): boolean {
        return !!this.repos.items.length;
    }

    @computedFrom('repos.addingCount')
    get isRepoAdding(): boolean {
        return (this.repos.addingCount > 0);
    }

    addDefaultRepos() {
        this.presets.selectDefaultPreset();
    }

    removeAll() {
        let isConfirmed = confirm('Are you sure you want to remove all repos?');

        if (isConfirmed) {
            this.ea.publish(repoTableEvents.removeAll);
        }
    }

    updateAll() {
        let isConfirmed = confirm('Are you sure you want to update all repos?');

        if (isConfirmed) {
            this.ea.publish(repoTableEvents.updateAll);
        }
    }
}