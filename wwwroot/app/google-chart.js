import {bindable} from 'aurelia-framework';
import {GoogleChartsFramework} from 'app/data/google-charts-framework';

export class GoogleChart {
    @bindable chart;
    @bindable data;
    @bindable options;

    googleChart = undefined;
    static inject() {
        return [GoogleChartsFramework];
    }
    constructor(googleChartsFramework) {
        this.googleChartsFramework = googleChartsFramework;
    }
    bind() {
        if (typeof (this.data) === 'undefined' || typeof (this.data.indexOf) === 'undefined') {
            throw new Error("Data is not valid array.");
        }
        if (typeof (this.chart) === 'undefined') {
            throw new Error("Chart is not defined.");
        }
        
        this.options = this.options || {};
        
        this.updateChart();
    }
    dataChanged() {
        this.updateChart();
    }
    updateChart() {
        this.googleChart = this.googleChart || {};

        if (typeof (this.googleChart) !== 'undefined' && typeof (this.googleChart.clearChart) === 'function') {
            this.googleChart.clearChart();
        }

        this.googleChartsFramework.load().then(() => {
            var chartFunc = google.visualization[this.chart || 'PieChart'];

            if (typeof (chartFunc) !== 'function') {
                throw new Error(`Could not find function in google.visualization named '${this.chart}'.`);
            }

            this.googleChart = new chartFunc(this.element);

            var dataTable = google.visualization.arrayToDataTable(this.data);

            this.googleChart.draw(dataTable, this.options);
        });
    }
}