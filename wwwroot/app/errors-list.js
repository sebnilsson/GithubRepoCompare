import {bindable} from 'aurelia-framework';
import {Errors} from 'app/errors';

export class ErrorsList {
    static inject() {
        return [Errors];
    }
    constructor(errors) {
        console.log('ErrorsList.constructor');

        this.errors = errors;
        this.errorItems = this.errors.items;
    }
    remove(error) {
        this.errors.remove(error);
    }
}