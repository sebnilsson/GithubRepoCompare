export class ChartDataUtility {
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

        this.removeEmptyColumns(data);

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

    private static removeEmptyColumns(data: Array<any>) {
        let dataHeaders = data[0];
        let dataHeadersLength = dataHeaders ? dataHeaders.length : 0;

        let dataRows = data.slice(1);
        let dataRowsLength = dataRows ? dataRows.length : 0;

        if (!dataHeaders || !dataHeadersLength || !dataRows || !dataRowsLength) {
            return;
        }

        let emptyColumnIndexes = [];

        for (let i = 0; i < dataHeadersLength; i++) {
            let hasColumnData = false;

            for (let j = 0; j < dataRowsLength; j++) {
                let dataRow = dataRows[j];
                let dataItem = dataRow ? dataRow[i] : undefined;
                let dataType = (dataItem !== null) ? (typeof dataItem) : 'undefined';

                if (dataType !== 'undefined') {
                    hasColumnData = true;
                    break;
                }
            }

            if (!hasColumnData) {
                emptyColumnIndexes.push(i);
            }
        }

        let emptyColumnIndexesLength = emptyColumnIndexes.length;

        let dataLength = data.length;

        for (let i = (emptyColumnIndexesLength - 1); i >= 0; i--) {
            let emptyColumnIndex = emptyColumnIndexes[i];

            for (let j = 0; j < dataLength; j++) {
                let dataRow = data[j];
                dataRow.splice(emptyColumnIndex, 1);
            }
        }
    }
}