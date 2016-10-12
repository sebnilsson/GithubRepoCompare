import { autoinject } from 'aurelia-framework';

import { LocationHashHelper } from '../../lib/location-hash-helper';
import { localStorage, LocalStorageObserver } from '../../lib/local-storage';
import { GitHubRepos } from '../../services/git-hub-repos';

@autoinject
export class ShareLink {
    private cancelRepoSubscription;

    constructor(private localStorageObserver: LocalStorageObserver,
        private repos: GitHubRepos) {
        this.localStorageObserver.subscribe(this);
    }

    @localStorage
    collapseShow: boolean = true;

    shareUrl: string;

    attached() {
        this.cancelRepoSubscription = this.repos.subscribe(() => this.handleReposChange());
    }

    detached() {
        this.cancelRepoSubscription();
    }

    private handleReposChange() {
        let hash = LocationHashHelper.createHash(this.repos.items);

        if (hash) {
            let hashIndex = location.href.indexOf('#');
            let currentHref = (hashIndex > 0) ? location.href.substr(0, hashIndex) : location.href;

            this.shareUrl = `${currentHref}#${hash}`;
        } else {
            this.shareUrl = '';
        }
    }
}