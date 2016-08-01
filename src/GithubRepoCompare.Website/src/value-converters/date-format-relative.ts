import * as moment from 'moment';

export class DateFormatRelativeValueConverter {
    toView(value) {
        return moment(value).fromNow();
    }
}