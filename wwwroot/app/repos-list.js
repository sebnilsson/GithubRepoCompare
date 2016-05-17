import {bindable} from 'aurelia-framework';

export class ReposList {
    @bindable repos;
    bind() {
        if (!this.repos.items.length) {
            //this.addRepo('jquery/jquery');
            this.addRepo('facebook/react');
            this.addRepo('emberjs/ember.js');
            this.addRepo('aurelia/framework');
            this.addRepo('angular/angular');

            this.repoFullName = 'twbs/bootstrap';
        }
    }
    addRepo(fullName) {
        if (!this.isRepoFullNameValid(fullName)) {
            return;
        }
        
        this.repoFullName = '';

        this.isRepoLoading = true;

        this.repos.add(fullName).then(() => {
            this.isRepoLoading = false;
        });
    }
    isRepoFullNameValid(fullName) {
        if (!fullName) {
            return;
        }

        var isValid = /.+\/.+/.test(fullName) && !this.repos.contains(fullName);
        return isValid;
    }
    removeRepo(repo) {
        this.repos.remove(repo);
    }
    updateRepo(repo) {
        if (repo.isUpdating) {
            return;
        }

        repo.isUpdating = true;

        this.repos.update(repo);
        
        repo.isUpdating = false;
    }
}