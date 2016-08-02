export class JsonFormatValueConverter {
    toView(value, space: number = 4) {
        return JSON.stringify(value, null, space);
    }
}