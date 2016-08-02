export class ChartData {
    static getLineChartData(
        repos: Array<any>,
        yHeaderTitle: string,
        columnFactory: ((repo: any) => Array<any>),
        rowFactory: ((index: number, item: any) => any),
        sortFactory: ((a: any, b: any) => number) = undefined,
        filterFactory: ((e: any) => boolean) = undefined): Array<Array<any>> {
        let header = [yHeaderTitle];
        let data = [];
        let dataHash = {};

        for (let i = 0; i < repos.length; i++) {
            let repo = repos[i];

            if (!repo.full_name) {
                throw new Error('Repository needs a name.');
            }

            header.push(repo.full_name);

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
                    dataHash[key] = row = new Array(repos.length + 1);

                    data.push(row);
                }

                row[0] = title;

                let existingValue = row[i + 1];
                row[i + 1] = !isNaN(existingValue) ? (existingValue + value) : value;
            }
        }

        if (filterFactory) {
            data = data.filter(filterFactory);
        }

        if (sortFactory) {
            data.sort(sortFactory);
        }

        data.unshift(header);

        return data;
    }

    static getPieChartData(repos: Array<any>, headers: Array<string>, rowFactory: Function): Array<Array<any>> {
        let data = [headers];

        for (let repo of repos) {
            let row = rowFactory(repo);

            data.push(row);
        }

        return data;
    }
}