import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {autoinject, computedFrom, Disposable} from 'aurelia-framework';

import {ChartDataUtility} from '../../services/chart-data-utility';
import {ChartOptionUtility} from '../../services/chart-option-utility';
import {GitHubRepos, gitHubReposItemsChangedEvent} from '../../services/git-hub-repos';

@autoinject
export class CompareStats {
    private _forks;
    private _openIssues;
    private _pullRequests;
    private _sizes;
    private _subscribers;
    private _watchers;

    private gitHubReposItemsChangedSubscription: Subscription;

    constructor(private ea: EventAggregator,
        private repos: GitHubRepos) {
    }

    @computedFrom('_forks')
    get forksData() {
        return this._forks;
    }

    get forksOptions() {
        return ChartOptionUtility.getForPieChart('Forks');
    }

    @computedFrom('_openIssues')
    get openIssuesData() {
        return this._openIssues;
    }

    get openIssuesOptions() {
        return ChartOptionUtility.getForPieChart('Open Issues');
    }

    @computedFrom('_pullRequests')
    get pullRequestsData() {
        return this._pullRequests;
    }

    get pullRequestsOptions() {
        return ChartOptionUtility.getForPieChart('Pull requests');
    }

    @computedFrom('_sizes')
    get sizesData() {
        return this._sizes;
    }

    get sizesOptions() {
        return ChartOptionUtility.getForPieChart('Size');
    }

    @computedFrom('_subscribers')
    get subscribersData() {
        return this._subscribers;
    }

    get subscribersOptions() {
        return ChartOptionUtility.getForPieChart('Subscribers');
    }

    @computedFrom('_watchers')
    get watchersData() {
        return this._watchers;
    }

    get watchersOptions() {
        return ChartOptionUtility.getForPieChart('Watchers');
    }

    bind() {
        this.updateData();

        this.gitHubReposItemsChangedSubscription =
            this.ea.subscribe(gitHubReposItemsChangedEvent, () => this.updateData());
    }

    unbind() {
        this.gitHubReposItemsChangedSubscription.dispose();
    }

    private getForks() {
        let headers = ['Name', 'Forks'];
        let rowFactory = (repo => [repo.full_name, repo.forks_count || 0]);

        let data = ChartDataUtility.getForPieChart(this.repos.items, headers, rowFactory);
        return data;
    }

    private getOpenIssues() {
        let headers = ['Name', 'Open Issues'];
        let rowFactory = (repo => [repo.full_name, repo.open_issues_count || 0]);

        let data = ChartDataUtility.getForPieChart(this.repos.items, headers, rowFactory);
        return data;
    }

    private getPullRequests() {
        let headers = ['Name', 'Pull Requests'];
        let rowFactory = (repo => [repo.full_name, repo.stats.pullRequestsCount || 0]);

        let data = ChartDataUtility.getForPieChart(this.repos.items, headers, rowFactory);
        return data;
    }

    private getSizes() {
        let headers = ['Name', 'Size'];
        let rowFactory = (repo => [repo.full_name, repo.size || 0]);

        let data = ChartDataUtility.getForPieChart(this.repos.items, headers, rowFactory);
        return data;
    }

    private getSubscribers() {
        let headers = ['Name', 'Subscribers'];
        let rowFactory = (repo => [repo.full_name, repo.subscribers_count || 0]);

        let data = ChartDataUtility.getForPieChart(this.repos.items, headers, rowFactory);
        return data;
    }

    private getWatchers() {
        let headers = ['Name', 'Watchers'];
        let rowFactory = (repo => [repo.full_name, repo.watchers_count || 0]);

        let data = ChartDataUtility.getForPieChart(this.repos.items, headers, rowFactory);
        return data;
    }

    private updateData() {
        this._forks = this.getForks();
        this._openIssues = this.getOpenIssues();
        this._pullRequests = this.getPullRequests();
        this._sizes = this.getSizes();
        this._subscribers = this.getSubscribers();
        this._watchers = this.getWatchers();
    }
}