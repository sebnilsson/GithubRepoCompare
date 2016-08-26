//import 'bootstrap';
import {Aurelia} from 'aurelia-framework';

export function configure(aurelia: Aurelia) {
    aurelia.use
        .basicConfiguration()
        //.standardConfiguration()
        .feature('resources')
        .developmentLogging();

    aurelia.start().then(() => aurelia.setRoot());
}