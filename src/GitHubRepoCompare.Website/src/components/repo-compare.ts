import {EventAggregator} from 'aurelia-event-aggregator';
import {autoinject, BindingEngine, computedFrom, Disposable} from 'aurelia-framework';

import {GitHubRepos, reposItemsChangedEvent} from '../services/git-hub-repos';
import {GitHubReposChartData} from '../services/git-hub-repos-chart-data';

@autoinject
export class RepoCompare {
    constructor(private bindingEngine: BindingEngine,
        private ea: EventAggregator,
        private repos: GitHubRepos,
        private chartData: GitHubReposChartData) {
    }

    get codeFrequencyData() {
        return this.chartData.codeFrequency;
    }

    get codeFrequencyOptions() {
        return this.getLineChartOptions();
    }

    get commitActivityData() {
        return this.chartData.commitActivity;
    }

    get commitActivityOptions() {
        return this.getLineChartOptions();
    }

    get forksData() {
        return this.chartData.forks;
    }

    get forksOptions() {
        return this.getPieChartOptions('Forks');
    }

    get openIssuesData() {
        return this.chartData.openIssues;
    }

    get openIssuesOptions() {
        return this.getPieChartOptions('Open Issues');
    }

    get participationData() {
        return this.chartData.participation;
    }

    get participationOptions() {
        return this.getLineChartOptions();
    }

    get pullRequestsData() {
        return this.chartData.pullRequests;
    }

    get pullRequestsOptions() {
        return this.getPieChartOptions('Pull requests');
    }

    get sizesData() {
        return this.chartData.sizes;
    }

    get sizesOptions() {
        return this.getPieChartOptions('Size');
    }

    get subscribersData() {
        return this.chartData.subscribers;
    }

    get subscribersOptions() {
        return this.getPieChartOptions('Subscribers');
    }

    get watchersData() {
        return this.chartData.watchers;
    }

    get watchersOptions() {
        return this.getPieChartOptions('Watchers');
    }

    bind() {
        this.ea.subscribe(reposItemsChangedEvent, () => this.updateData());

        this.updateData();
    }

    private getPieChartOptions(title: string) {
        return {
            title: title,
            pieHole: 0.25,
            height: 200,
            chartArea: {
                width: '90%',
                height: '85%'
            }
        };
    }

    private getLineChartOptions() {
        return {
            curveType: 'function',
            legend: {
                position: 'bottom'
            },
            height: 400,
            chartArea: {
                width: '85%',
                height: '70%'
            },
            vAxis: {
                viewWindow: {
                    min: 0
                }
            }
        };
    }

    @computedFrom('repos.items.length')
    get hasReposToCompare() {
        let hasReposToCompare = this.repos && this.repos.items && (this.repos.items.length > 1);
        return hasReposToCompare;
    }

    private updateData() {
        this.chartData.updateData();
    }
}