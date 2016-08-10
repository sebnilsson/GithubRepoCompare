import {autoinject} from 'aurelia-framework';
import {BindingSignaler} from 'aurelia-templating-resources';

@autoinject
export class App {
    constructor(private bindingSignaler: BindingSignaler) {
        setInterval(() => this.bindingSignaler.signal('date-format-relative'), 5000);
    }
}