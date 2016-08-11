import {EventAggregator} from 'aurelia-event-aggregator';
import {autoinject, computedFrom} from 'aurelia-framework';

import {localStorage, LocalStorageObserver} from '../lib/local-storage';

@autoinject
export class GitHubApiCredentials {
    static changeEvent = 'GitHubApiCredentials';

    private _clientId: string;
    private _clientSecret: string;

    constructor(private ea: EventAggregator,
        private localStorageObserver: LocalStorageObserver) {
        this.localStorageObserver.subscribe(this);
    }

    @computedFrom('_clientId')
    @localStorage
    get clientId(): string {
        return this._clientId;
    }

    set clientId(value: string) {
        this._clientId = value;

        this.ea.publish(GitHubApiCredentials.changeEvent);
    }

    @computedFrom('_clientSecret')
    @localStorage
    get clientSecret(): string {
        return this._clientSecret;
    }

    set clientSecret(value: string) {
        this._clientSecret = value;

        this.ea.publish(GitHubApiCredentials.changeEvent);
    }
}