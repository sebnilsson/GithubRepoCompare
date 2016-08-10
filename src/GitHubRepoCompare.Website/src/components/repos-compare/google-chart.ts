import {autoinject, bindable} from 'aurelia-framework';

import {GoogleChartsBootstrapper} from '../../lib/google-charts-bootstrapper';
import {WindowEvents} from '../../lib/window-events';
import debounce from '../../lib/debounce';

@autoinject
export class GoogleChart {
    @bindable
    chart;
    @bindable
    data;
    @bindable
    options;
    @bindable
    debugData: boolean;

    private googleChart = undefined;
    private googleChartsElement;

    private onWindowResize = debounce(() => {
            this.updateChart();
        },
        500);

    constructor(private googleChartsBootstrapper: GoogleChartsBootstrapper,
        private windowEvents: WindowEvents) {
    }

    bind() {
        if (typeof (this.data) === 'undefined' || !(this.data instanceof Array)) {
            throw new Error("Data is not valid array.");
        }
        if (typeof (this.chart) === 'undefined' || !this.chart) {
            throw new Error("Chart is not defined.");
        }
        
        this.options = this.options || {};

        this.windowEvents.add('resize', this.onWindowResize);

        this.updateChart();
    }

    dataChanged() {
        this.updateChart();
    }

    unbind() {
        this.windowEvents.remove('resize', this.onWindowResize);
    }

    private updateChart() {
        this.googleChart = this.googleChart || {};

        if (typeof (this.googleChart) !== 'undefined' && typeof (this.googleChart.clearChart) === 'function') {
            this.googleChart.clearChart();
        }

        this.googleChartsBootstrapper.load()
            .then((resolve: any) => {
                let charts = resolve.charts;
                let visualization = resolve.visualization;

                let chartFunc = charts[this.chart] || visualization[this.chart];

                if (typeof (chartFunc) !== 'function') {
                    throw new Error(`Could not find function in google.visualization named '${this.chart}'.`);
                }

                this.googleChart = new chartFunc(this.googleChartsElement);

                let dataTable = visualization.arrayToDataTable(this.data);

                this.googleChart.draw(dataTable, this.options);
            });
    }
}