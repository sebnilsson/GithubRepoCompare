import {autoinject, bindable} from 'aurelia-framework';

import debounce from '../../lib/debounce';
import {GoogleChartsBootstrapper} from '../../lib/google-charts-bootstrapper';
import {WindowEvents} from '../../lib/window-events';

@autoinject
export class GoogleChart {
    @bindable
    type;
    @bindable
    data;
    @bindable
    options;
    @bindable
    debugData: boolean;

    private chart = undefined;
    private chartElement : HTMLElement;

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
        if (typeof (this.type) === 'undefined' || !this.type) {
            throw new Error("Type is not defined.");
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
        this.chart = this.chart || {};

        if (typeof (this.chart) !== 'undefined' && typeof (this.chart.clearChart) === 'function') {
            this.chart.clearChart();
        }
        
        this.googleChartsBootstrapper.load()
            .then((resolve: any) => {
                let charts = resolve.charts;
                let visualization = resolve.visualization;

                let chartFunc = charts[this.type] || visualization[this.type];

                if (typeof (chartFunc) !== 'function') {
                    throw new Error(`Could not find function in google.visualization named '${this.type}'.`);
                }

                this.chart = new chartFunc(this.chartElement);

                let dataTable = visualization.arrayToDataTable(this.data);

                this.chart.draw(dataTable, this.options);
            });
    }
}