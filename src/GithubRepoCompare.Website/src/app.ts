import {autoinject} from 'aurelia-framework';
import {BindingEngine} from 'aurelia-framework';
import {Errors} from './errors';
import {GitHubRepos} from './data/git-hub-repos';

@autoinject
export class App {
    private reposSubscription;
    repoSubscriptions = [];

    constructor(private bindingEngine: BindingEngine, private repos: GitHubRepos, private errors: Errors) {
        this.reposSubscription = this.bindingEngine.collectionObserver(this.repos.items)
            .subscribe(() => {
                this.resetRepoSubscriptions();

                this.repos.setStoredItems();
            });

        this.resetRepoSubscriptions();
    }

    detached() {
        this.reposSubscription.dispose();

        for (var subscription of this.repoSubscriptions) {
            subscription.dispose();
        }
    }

    resetRepoSubscriptions() {
        for (var repoSubscription of this.repoSubscriptions) {
            repoSubscription.dispose();
        }

        this.repoSubscriptions = [];

        for (var i = 0; i < this.repos.items.length; i++) {
            let subscription = this.bindingEngine
                .propertyObserver(this.repos.items[i], 'stats')
                .subscribe(() => {
                    this.resetRepoSubscriptions();

                    this.repos.setStoredItems();
                });

            this.repoSubscriptions.push(subscription);
        }
    }
}