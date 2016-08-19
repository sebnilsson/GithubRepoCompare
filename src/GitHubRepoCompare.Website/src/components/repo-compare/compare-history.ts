import {autoinject, computedFrom, Disposable} from 'aurelia-framework';

import {ChartDataUtility} from '../../lib/charts/chart-data-utility';
import {ChartOptionUtility} from '../../lib/charts/chart-option-utility';
import {GitHubRepos} from '../../services/git-hub-repos';

@autoinject
export class CompareHistory {
    private _codeFrequency;
    private _commitActivity;
    private _participation;

    private gitHubReposItemsChangedSubscription: Disposable;

    constructor(private repos: GitHubRepos) {
    }

    @computedFrom('_codeFrequency')
    get codeFrequencyData() {
        return this._codeFrequency;
    }

    get codeFrequencyOptions() {
        return ChartOptionUtility.getForLineChart();
    }

    @computedFrom('_commitActivity')
    get commitActivityData() {
        return this._commitActivity;
    }

    get commitActivityOptions() {
        return ChartOptionUtility.getForLineChart();
    }

    @computedFrom('_participation')
    get participationData() {
        return this._participation;
    }

    get participationOptions() {
        return ChartOptionUtility.getForLineChart();
    }

    bind() {
        this.updateData();

        this.gitHubReposItemsChangedSubscription = this.repos.subscribe(() => this.updateData());
    }

    unbind() {
        this.gitHubReposItemsChangedSubscription.dispose();
    }

    //private getContributors() {
    //    let data = ChartData.getLineChartData(this.repos.items,
    //        'Week',
    //        repo => {
    //            return repo.stats.contributors.reduce((a, b) => {
    //                let aWeeks = (a ? a.weeks : undefined) || [];
    //                let bWeeks = (b ? b.weeks : undefined) || [];

    //                return aWeeks.concat(bWeeks);
    //            });
    //        },
    //        (i, item) => {
    //            let week = item.w,
    //                weekDate = new Date(week * 1000),
    //                commits = item.c;

    //            return { key: week, value: commits, title: weekDate };
    //        },
    //        (a, b) => {
    //            let weekA = a[0],
    //                weekB = b[0];

    //            if (weekA < weekB) {
    //                return -1;
    //            }
    //            return (weekA > weekB) ? 1 : 0;
    //        },
    //        row => {
    //            let columns = row.slice(1),
    //                areValid = columns.some(x => !!x);

    //            return areValid;
    //        });
    //    return data;
    //}

    private getCodeFrequency() {
        let data = ChartDataUtility.getForLineChart(this.repos.items,
            'Week',
            repo => repo.stats.codeFrequency,
            (i, item) => {
                let week = item[0],
                    weekDate = new Date(week * 1000),
                    addCount = item[1],
                    deleteCount = item[2],
                    totalCount = addCount + (-deleteCount);

                return { key: week, value: totalCount, title: weekDate };
            },
            (a, b) => {
                let weekA = a[0],
                    weekB = b[0];

                if (weekA < weekB) {
                    return -1;
                }
                return (weekA > weekB) ? 1 : 0;
            });

        return data;
    }

    private getCommitActivity() {
        let data = ChartDataUtility.getForLineChart(this.repos.items,
            'Week',
            repo => repo.stats.commitActivity,
            (i, item) => {
                let week = item.week,
                    weekDate = new Date(week * 1000),
                    total = item.total;

                return { key: week, value: total, title: weekDate };
            },
            (a, b) => {
                let weekA = a[0],
                    weekB = b[0];

                if (weekA < weekB) {
                    return -1;
                }
                return (weekA > weekB) ? 1 : 0;
            });

        return data;
    }

    private getParticipation() {
        let data = ChartDataUtility.getForLineChart(this.repos.items,
            'Week',
            repo => ((repo.stats.participation || {}).all) || [],
            (i, item) => {
                let weekDate = new Date();
                weekDate.setDate(weekDate.getDate() - (i * 7));

                return { key: i, value: item, title: weekDate };
            });
        return data;
    }

    private updateData() {
        this._codeFrequency = this.getCodeFrequency();
        this._commitActivity = this.getCommitActivity();
        this._participation = this.getParticipation();
    }
}