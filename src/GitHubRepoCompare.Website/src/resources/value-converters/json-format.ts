export class JsonFormatValueConverter {
    toView(value, spaces: number = 4) {
        return JSON.stringify(value, null, spaces);
    }
}