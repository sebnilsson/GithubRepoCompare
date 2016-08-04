import {EventAggregator} from 'aurelia-event-aggregator';
import {autoinject, computedFrom, Disposable} from 'aurelia-framework';

import {Repos, reposItemsChangedEvent} from './repos';
import {ReposChartData} from './charts/repos-chart-data';

@autoinject
export class ReposCompare {
    constructor(private ea: EventAggregator, private repos: Repos, private reposChartData: ReposChartData) {
    }

    get codeFrequencyData() {
        return this.reposChartData.codeFrequency;
    }

    get codeFrequencyOptions() {
        return this.getLineChartOptions();
    }

    get commitActivityData() {
        return this.reposChartData.commitActivity;
    }

    get commitActivityOptions() {
        return this.getLineChartOptions();
    }

    get forksData() {
        return this.reposChartData.forks;
    }

    get forksOptions() {
        return this.getPieChartOptions('Forks');
    }

    get openIssuesData() {
        return this.reposChartData.openIssues;
    }

    get openIssuesOptions() {
        return this.getPieChartOptions('Open Issues');
    }

    get participationData() {
        return this.reposChartData.participation;
    }

    get participationOptions() {
        return this.getLineChartOptions();
    }

    get pullRequestsData() {
        return this.reposChartData.pullRequests;
    }

    get pullRequestsOptions() {
        return this.getPieChartOptions('Pull requests');
    }

    get sizesData() {
        return this.reposChartData.sizes;
    }

    get sizesOptions() {
        return this.getPieChartOptions('Size');
    }

    get subscribersData() {
        return this.reposChartData.subscribers;
    }

    get subscribersOptions() {
        return this.getPieChartOptions('Subscribers');
    }

    get watchersData() {
        return this.reposChartData.watchers;
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
        this.reposChartData.updateData();
    }
}