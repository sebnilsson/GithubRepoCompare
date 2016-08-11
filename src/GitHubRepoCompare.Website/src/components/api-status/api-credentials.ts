import {autoinject, bindable, bindingMode, computedFrom} from 'aurelia-framework';

import {GitHubApiCredentials} from '../../services/git-hub-api-credentials';
import {localStorage, LocalStorageObserver} from '../../lib/local-storage';

@autoinject
export class ApiCredentials {
    constructor(private _credentials: GitHubApiCredentials,
        private localStorageObserver: LocalStorageObserver) {
        this.localStorageObserver.subscribe(this);
    }

    @localStorage
    collapseShow: boolean = false;

    @computedFrom('_credentials')
    get credentials(): GitHubApiCredentials {
        return this._credentials;
    }

    detached() {
        this.localStorageObserver.unsubscribe(this);
    }
}