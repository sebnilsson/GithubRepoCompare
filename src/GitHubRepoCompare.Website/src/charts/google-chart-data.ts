import {autoinject, bindable, computedFrom} from 'aurelia-framework';
import * as $ from 'jquery';

@autoinject
export class GoogleChartData {
    @bindable
    data: Array<any>;

    @computedFrom('data')
    get dataDiscrepancy() : Array<any> {
        let dataHeaders = this.data[0];
        let dataHeadersLength = dataHeaders ? dataHeaders.length : 0;

        let dataRows = this.data.slice(1);
        let dataRowsLength = dataRows ? dataRows.length : 0;

        if (!dataHeaders || !dataHeadersLength || !dataRows || !dataRowsLength) {
            return [];
        }

        let dataTypes = new Array(dataHeadersLength);

        for (let i = 0; i < dataHeadersLength; i++) {
            for (let j = 0; j < dataRowsLength; j++) {
                let dataRow = dataRows[j];
                let dataItem = dataRow ? dataRow[i] : undefined;

                let dataType = (dataItem !== null) ? (typeof dataItem) : undefined;
                if (dataType && dataType !== 'undefined') {
                    dataTypes[i] = dataType;
                    break;
                }

                dataTypes[i] = undefined;
            }
        }

        let everyDataTypeHasValue = dataTypes.every(x => (typeof x !== 'undefined') && x !== null);
        if (!everyDataTypeHasValue) {
            return [];
        }

        let discrepancy = dataRows.filter(dataRow => {
            if (dataRow.length !== dataHeadersLength) {
                return true;
            }

            for (let i = 0; i < dataHeadersLength; i++) {
                let dataItem = dataRow[i];
                let dataType = dataTypes[i];

                let isDiscrepancy = (dataItem !== null) && (typeof dataItem !== dataType);
                if (isDiscrepancy) {
                    return true;
                }
            }

            return false;
        });

        if (!discrepancy.length) {
            return [];
        }

        discrepancy.unshift(dataHeaders);

        return discrepancy;
    }

    private $modalElement;
    private modalElement;

    debugChartData() {
        this.$modalElement = this.$modalElement || $(this.modalElement);

        this.$modalElement.modal('toggle');
    }
}