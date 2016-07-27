import {autoinject} from 'aurelia-framework';
import {bindable} from 'aurelia-framework';
import {GoogleCharts} from './charts/google-charts';
import {WindowEvents} from './window-events';
import debounce from './debounce';

@autoinject
export class GoogleChart {
    @bindable
    private chart;
    @bindable
    private data;
    @bindable
    private options;

    private googleChart = undefined;

    constructor(private element: Element,
        private googleCharts: GoogleCharts,
        private windowEvents: WindowEvents) {
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

        this.windowEvents.add('resize', debounce(() => {
            this.updateChart();
        }, 500));
    }

    dataChanged() {
        this.updateChart();
    }

    updateChart() {
        this.googleChart = this.googleChart || {};

        if (typeof (this.googleChart) !== 'undefined' && typeof (this.googleChart.clearChart) === 'function') {
            this.googleChart.clearChart();
        }

        this.googleCharts.load().then(visualization => {
            let chartFunc = this.googleCharts[this.chart] || visualization[this.chart];

            if (typeof (chartFunc) !== 'function') {
                throw new Error(`Could not find function in google.visualization named '${this.chart}'.`);
            }

            this.googleChart = new chartFunc(this.element);

            let dataTable = visualization.arrayToDataTable(this.data);

            this.googleChart.draw(dataTable, this.options);
        });
    }
}