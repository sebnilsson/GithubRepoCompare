import {BindingEngine} from 'aurelia-framework';
import {Errors} from 'app/errors';
import {GitHubRepos} from 'app/data/git-hub-repos';

export class App {
    repoSubscriptions = [];

    static inject() {
        return [BindingEngine, Errors, GitHubRepos];
    }
    constructor(bindingEngine, errors, gitHubRepos) {
        this.bindingEngine = bindingEngine;
        this.errors = errors;
        this.repos = gitHubRepos;

        this.reposSubscription = this.bindingEngine.collectionObserver(this.repos.items)
            .subscribe(() => {
                this.resetRepoSubscriptions();

                this.repos.setStoredItems();
            });

        this.resetRepoSubscriptions();

        //this.errors.addInfo('App constructor', 5000);
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