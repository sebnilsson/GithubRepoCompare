import {autoinject, computedFrom} from 'aurelia-framework';

import {GitHubApi} from '../../services/git-hub-api';
import {localStorage, LocalStorageObserver} from '../../lib/local-storage';

@autoinject
export class GitHubApiCredentials {
    private _oauthClientId: string;
    private _oauthClientSecret: string;

    constructor(private gitHubApi: GitHubApi, private localStorageObserver: LocalStorageObserver) {
        this.localStorageObserver.subscribe(this);
    }

    @localStorage
    collapseShow: boolean = false;

    @computedFrom('_oauthClientId')
    @localStorage()
    get oauthClientId(): string {
        return this._oauthClientId;
    }

    set oauthClientId(value) {
        this._oauthClientId = value;

        this.gitHubApi.clientId = value;
    }

    @computedFrom('_oauthClientSecret')
    @localStorage
    get oauthClientSecret() {
        return this._oauthClientSecret;
    }

    set oauthClientSecret(value) {
        this._oauthClientSecret = value;

        this.gitHubApi.clientSecret = value;
    }

    detached() {
        this.localStorageObserver.unsubscribe(this);
    }
}