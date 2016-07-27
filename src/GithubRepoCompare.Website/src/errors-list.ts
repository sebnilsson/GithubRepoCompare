import {autoinject} from 'aurelia-framework';
import {Errors} from './errors';

@autoinject
export class ErrorsList {
    private _errorItems;

    get errorItems(): Array<any> {
        return this._errorItems;
    };

    constructor(private errors: Errors) {
        this._errorItems = this.errors.items;
    }

    remove(error) {
        this.errors.remove(error);
    }
}