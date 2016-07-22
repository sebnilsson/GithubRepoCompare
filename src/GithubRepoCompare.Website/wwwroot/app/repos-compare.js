import {bindable} from 'aurelia-framework';
import {BindingEngine} from 'aurelia-framework';
import {GoogleChartsFramework} from 'app/data/google-charts-framework';

export class ReposCompare {
    @bindable repos;
    static inject() {
        return [BindingEngine, GoogleChartsFramework];
    }
    constructor(bindingEngine, googleChartsFramework) {
        this.bindingEngine = bindingEngine;
        this.googleChartsFramework = googleChartsFramework;
    }
    bind() {
        this.updateDatas();
        
        this.reposSubscription = this.bindingEngine.collectionObserver(this.repos.items)
            .subscribe(() => this.updateDatas());
    }
    getLineChartData(yHeaderTitle, columnFactory, rowFactory, sortFactory, filterFactory) {
        if (typeof(yHeaderTitle) !== 'string') {
            throw new Error('Argument \'yHeaderTitle\' must be a string.');
        }
        if (typeof(columnFactory) !== 'function') {
            throw new Error('Argument \'columnFactory\' must be a function.');
        }
        if (typeof(rowFactory) !== 'function') {
            throw new Error('Argument \'rowFactory\' must be a function.');
        }

        let header = [yHeaderTitle];
        let data = [];
        let dataHash = {};

        for (let i = 0; i < this.repos.items.length; i++) {
            let repo = this.repos.items[i];
            if (!repo.name) {
                throw new Error('Repository needs a name.');
            }

            header.push(repo.name);

            let items = columnFactory(repo) || [];
            
            for (let j = 0; j < items.length; j++) {
                let item = items[j],
                    rowData = rowFactory(j, item);
                if (!rowData) {
                    continue;
                }

                let key = rowData.key,
                    title = rowData.title || key,
                    value = rowData.value;
                
                let row = dataHash[key];

                if (!row) {
                    dataHash[key] = row = new Array(this.repos.items.length + 1);

                    data.push(row);
                }
                
                row[0] = title;
                
                let existingValue = row[i + 1];
                row[i + 1] = !isNaN(existingValue) ? (existingValue + value) : value;
            }
        }

        if (typeof(filterFactory) === 'function') {
            data = data.filter(filterFactory);
        }

        if (typeof(sortFactory) === 'function') {
            data.sort(sortFactory);
        }

        data.unshift(header);

        return data;
    }
    getPieChartData(headers, rowFactory) {
        if (!headers || !headers.indexOf) {
            throw new Error('Argument \'headers\' must be an array.');
        }
        if (typeof(rowFactory) !== 'function') {
            throw new Error('Argument \'rowFactory\' must be a function.');
        }

        let data = [ headers ];

        for (let repo of this.repos.items) {
            let row = rowFactory(repo);

            data.push(row);
        }

        return data;
    }
    getReposContributorsCommitsData() {
        let data = this.getLineChartData('Week',
            repo => {
                return repo.stats.contributors.reduce((a, b) => {
                    let aWeeks = (a ? a.weeks : undefined) || [];
                    let bWeeks = (b ? b.weeks : undefined) || [];

                    return aWeeks.concat(bWeeks);
                });
            },
            (i, item) => {
                let week = item.w,
                    weekDate = new Date(week * 1000),
                    commits = item.c;

                return { key: week, value: commits, title: weekDate };
            },
            (a, b) => {
                let weekA = a[0],
                    weekB = b[0];

                if (weekA < weekB) {
                    return -1;
                }
                return (weekA > weekB) ? 1 : 0;
            },
            row => {
                let columns = row.slice(1),
                    areValid = columns.some(x => !!x);
                
                return areValid;
            });
        return data;
    }
    getReposCodeFrequencyData() {
        let data = this.getLineChartData('Week',
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
    getReposCommitActivityData() {
        let data = this.getLineChartData('Week',
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
    getReposParticipationData() {
        let data = this.getLineChartData('Week',
            repo => ((repo.stats.participation || {}).all) || [],
            (i, item) => {
                let weekDate = new Date();
                weekDate.setDate(weekDate.getDate() - (i * 7));

                return { key: i, value: item, title: weekDate };
            });
        return data;
    }
    getReposForksData() {
        let headers = ['Name', 'Forks'];
        let rowFactory = (repo => [repo.name, repo.forks_count || 0]);
        
        let data = this.getPieChartData(headers, rowFactory);
        return data;
    }
    getReposOpenIssuesData() {
        let headers = ['Name', 'Open Issues'];
        let rowFactory = (repo => [repo.name, repo.open_issues_count || 0]);
        
        let data = this.getPieChartData(headers, rowFactory);
        return data;
    }
    getReposPullRequestsData() {
        let headers = ['Name', 'Pull Requests'];
        let rowFactory = (repo => [repo.name, repo.stats.pullRequestsCount || 0]);
        
        let data = this.getPieChartData(headers, rowFactory);
        return data;
    }
    getReposSizesData() {
        let headers = ['Name', 'Size'];
        let rowFactory = (repo => [repo.name, repo.size || 0]);
        
        let data = this.getPieChartData(headers, rowFactory);
        return data;
    }
    getReposSubscribersData() {
        let headers = ['Name', 'Subscribers'];
        let rowFactory = (repo => [repo.name, repo.subscribers_count || 0]);
        
        let data = this.getPieChartData(headers, rowFactory);
        return data;
    }
    getReposWatchersData() {
        let headers = ['Name', 'Watchers'];
        let rowFactory = (repo => [repo.name, repo.watchers_count || 0]);
        
        let data = this.getPieChartData(headers, rowFactory);
        return data;
    }
    get hasReposToCompare() {
        let hasReposToCompare = this.repos && this.repos.items && (this.repos.items.length > 1);
        return hasReposToCompare;
    }
    updateDatas() {
        this.reposCodeFrequency = this.getReposCodeFrequencyData();
        this.reposCommitActivity = this.getReposCommitActivityData();
        //this.reposContributorsCommits = this.getReposContributorsCommitsData();
        this.reposParticipation = this.getReposParticipationData();
        //this.reposPullRequests = this.getReposPullRequestsData();
        
        this.reposForks = this.getReposForksData();
        this.reposOpenIssues = this.getReposOpenIssuesData();
        this.reposPullRequests = this.getReposPullRequestsData();
        this.reposSizes = this.getReposSizesData();
        this.reposSubscribers = this.getReposSubscribersData();
        this.reposWatchers = this.getReposWatchersData();
    }
}