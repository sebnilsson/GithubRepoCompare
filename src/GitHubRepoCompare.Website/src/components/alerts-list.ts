import {autoinject, computedFrom} from 'aurelia-framework';

import {Alerts} from '../lib/alerts';

@autoinject
export class AlertsList {
    constructor(private alerts: Alerts) {}

    @computedFrom('alerts.items.length')
    get items() {
        return this.alerts.items;
    }

    //bind() {
    //    this.alerts.addInfo('Test-info');
    //    this.alerts.addWarning('Test-warning', 10000);
    //}
}