declare const google: any;

export class GoogleCharts {
    private loadPromise: Promise<any>;

    constructor() {
        let charts = google ? google.charts : undefined;

        if (typeof (charts) === 'undefined') {
            throw new Error('Google Charts not loaded. \'google.charts\' is not defined.');
        }

        this.loadPromise = new Promise(resolve => {
            charts.setOnLoadCallback(() => {
                let visualization = google ? google.visualization : undefined;

                if (typeof (visualization) === 'undefined') {
                    throw new Error('Google Visualization not loaded. \'google.visualization\' is not defined.');
                }

                resolve(visualization);
            });
        });

        charts.load('current', { packages: ['corechart'] });
    }

    load(): Promise<any> {
        return this.loadPromise;
    }
}