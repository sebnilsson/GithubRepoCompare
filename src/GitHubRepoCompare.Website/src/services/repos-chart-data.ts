import {autoinject} from 'aurelia-framework';

import {ChartDataUtility} from './chart-data-utility';
import {Repos} from './repos';

@autoinject
export class ReposChartData {
    private _codeFrequency;
    private _commitActivity;
    private _forks;
    private _openIssues;
    private _participation;
    private _pullRequests;
    private _sizes;
    private _subscribers;
    private _watchers;

    constructor(private repos: Repos) {}

    get codeFrequency() {
        return this._codeFrequency;
    }

    get commitActivity() {
        return this._commitActivity;
    }

    get forks() {
        return this._forks;
    }

    get openIssues() {
        return this._openIssues;
    }

    get participation() {
        return this._participation;
    }

    get pullRequests() {
        return this._pullRequests;
    }

    get sizes() {
        return this._sizes;
    }

    get subscribers() {
        return this._subscribers;
    }

    get watchers() {
        return this._watchers;
    }

    updateData() {
        this._codeFrequency = this.getCodeFrequency();
        this._commitActivity = this.getCommitActivity();
        this._forks = this.getForks();
        this._openIssues = this.getOpenIssues();
        this._participation = this.getParticipation();
        this._pullRequests = this.getPullRequests();
        this._sizes = this.getSizes();
        this._subscribers = this.getSubscribers();
        this._watchers = this.getWatchers();
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
        let data = ChartDataUtility.getLineChartData(this.repos.items,
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
        let data = ChartDataUtility.getLineChartData(this.repos.items,
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

    private getForks() {
        let headers = ['Name', 'Forks'];
        let rowFactory = (repo => [repo.full_name, repo.forks_count || 0]);

        let data = ChartDataUtility.getPieChartData(this.repos.items, headers, rowFactory);
        return data;
    }

    private getOpenIssues() {
        let headers = ['Name', 'Open Issues'];
        let rowFactory = (repo => [repo.full_name, repo.open_issues_count || 0]);

        let data = ChartDataUtility.getPieChartData(this.repos.items, headers, rowFactory);
        return data;
    }

    private getParticipation() {
        let data = ChartDataUtility.getLineChartData(this.repos.items,
            'Week',
            repo => ((repo.stats.participation || {}).all) || [],
            (i, item) => {
                let weekDate = new Date();
                weekDate.setDate(weekDate.getDate() - (i * 7));

                return { key: i, value: item, title: weekDate };
            });
        return data;
    }

    private getPullRequests() {
        let headers = ['Name', 'Pull Requests'];
        let rowFactory = (repo => [repo.full_name, repo.stats.pullRequestsCount || 0]);

        let data = ChartDataUtility.getPieChartData(this.repos.items, headers, rowFactory);
        return data;
    }

    private getSizes() {
        let headers = ['Name', 'Size'];
        let rowFactory = (repo => [repo.full_name, repo.size || 0]);

        let data = ChartDataUtility.getPieChartData(this.repos.items, headers, rowFactory);
        return data;
    }

    private getSubscribers() {
        let headers = ['Name', 'Subscribers'];
        let rowFactory = (repo => [repo.full_name, repo.subscribers_count || 0]);

        let data = ChartDataUtility.getPieChartData(this.repos.items, headers, rowFactory);
        return data;
    }

    private getWatchers() {
        let headers = ['Name', 'Watchers'];
        let rowFactory = (repo => [repo.full_name, repo.watchers_count || 0]);

        let data = ChartDataUtility.getPieChartData(this.repos.items, headers, rowFactory);
        return data;
    }
}