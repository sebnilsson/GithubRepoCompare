import {autoinject, bindable, bindingMode, computedFrom} from 'aurelia-framework';

import {GitHubApi, GitHubApiCredentials} from '../../services/git-hub-api';
import {localStorage, LocalStorageObserver} from '../../lib/local-storage';

@autoinject
export class GitHubApiCredentialsForm {
    constructor(public credentials: GitHubApiCredentials,
        private localStorageObserver: LocalStorageObserver) {
        this.localStorageObserver.subscribe(this);
    }

    @localStorage
    collapseShow: boolean = false;

    detached() {
        this.localStorageObserver.unsubscribe(this);
    }
}