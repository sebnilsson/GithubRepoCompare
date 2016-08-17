import {EventAggregator} from 'aurelia-event-aggregator';
import {autoinject, bindable, computedFrom, Disposable} from 'aurelia-framework';

import debounce from '../lib/debounce';
import {GitHubApi} from '../services/git-hub-api';
import {GitHubApiCredentials} from '../services/git-hub-api-credentials';
import {GitHubApiRateLimits} from '../services/git-hub-api-rate-limits';
import {localStorage, LocalStorageObserver} from '../lib/local-storage';

@autoinject
export class ApiStatus {
    private gitHubCredentialsChangeSubscription: Disposable;
    private isUpdating: boolean = false;

    constructor(private _rateLimits: GitHubApiRateLimits,
        private ea: EventAggregator,
        private gitHubApi: GitHubApi,
        private localStorageObserver: LocalStorageObserver) {
        this.localStorageObserver.subscribe(this);
    }

    @localStorage
    collapseShow: boolean = true;

    @computedFrom('_rateLimits')
    get rateLimits() {
        return this._rateLimits;
    }

    bind() {
        this.update();

        let debounceUpdate = debounce(() => this.update(), 1000);

        this.gitHubCredentialsChangeSubscription = this.ea.subscribe(GitHubApiCredentials.changeEvent, debounceUpdate);
    }

    unbind() {
        this.localStorageObserver.unsubscribe(this);
        this.gitHubCredentialsChangeSubscription.dispose();
    }

    update() {
        this.isUpdating = true;

        this.gitHubApi.updateRateLimit()
            .then(() => {})
            .then(() => { this.isUpdating = false; });
    }
}