import {autoinject} from 'aurelia-framework';

import {Alerts} from './alerts';

@autoinject
export class ErrorsList {
    constructor(public alerts: Alerts) {}

    bind() {
        this.alerts.addInfo('Test-info');
        this.alerts.addWarning('Test-warning', 10000);
    }
}