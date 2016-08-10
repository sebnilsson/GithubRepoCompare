import * as numeral from 'numeral';

export class NumberFormatValueConverter {
    toView(value: any, format: string) {
        return numeral(value).format(format);
    }
}