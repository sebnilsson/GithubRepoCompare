import {autoinject, bindable} from 'aurelia-framework';
import * as $ from 'jquery';

@autoinject
export class GoogleChartData {
    @bindable
    private data;

    private $modalElement;
    private modalElement;
    
    debugChartData() {
        this.$modalElement = this.$modalElement || $(this.modalElement);

        this.$modalElement.modal('toggle');
    }
}