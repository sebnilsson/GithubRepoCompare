//import 'bootstrap';
import {Aurelia} from 'aurelia-framework';

export function configure(aurelia: Aurelia) {
    aurelia.use
        .basicConfiguration()
        //.standardConfiguration()
        .feature('resources');

    let isEnvironmentDebug = (typeof (window['hostingEnvironment']) !== 'undefined' &&
        typeof (window['hostingEnvironment']['environmentName']) === 'string' &&
        window['hostingEnvironment']['environmentName'].toLowerCase() === 'development');

    if (isEnvironmentDebug) {
        aurelia.use.developmentLogging();
    }

    aurelia.start().then(() => aurelia.setRoot());
}