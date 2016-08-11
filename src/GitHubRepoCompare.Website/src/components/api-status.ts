import {EventAggregator} from 'aurelia-event-aggregator';
import {autoinject, bindable, BindingEngine, computedFrom, Disposable} from 'aurelia-framework';

import {GitHubApi, GitHubApiCredentials} from '../services/git-hub-api';
import {GitHubApiRateLimits} from '../services/git-hub-api-rate-limits';
import {localStorage, LocalStorageObserver} from '../lib/local-storage';
import debounce from '../lib/debounce';

@autoinject
export class ApiStatus {
    private isUpdating: boolean = false;

    private gitHubCredentialsChangeSubscription: Disposable;

    constructor(public rateLimits: GitHubApiRateLimits,
        private bindingEngine: BindingEngine,
        private ea: EventAggregator,
        private gitHubApi: GitHubApi,
        private localStorageObserver: LocalStorageObserver) {
        this.localStorageObserver.subscribe(this);
    }

    @localStorage
    collapseShow: boolean = true;

    attached() {
        this.update();

        let debounceUpdate = debounce(() => this.update(), 1000);

        this.gitHubCredentialsChangeSubscription = this.ea.subscribe(GitHubApiCredentials.changeEvent, debounceUpdate);
    }

    detached() {
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