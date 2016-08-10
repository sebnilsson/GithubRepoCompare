import * as moment from 'moment';

export class DateFormatValueConverter {
    toView(value, format: string) {
        return moment(value).format(format);
    }
}