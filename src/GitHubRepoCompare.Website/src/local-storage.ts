export class LocalStorage {
    private localStorage;

    constructor() {
        this.localStorage = window.localStorage;

        if (typeof (window.localStorage) === 'undefined') {
            throw new Error('\'window.localStorage\' is undefined.');
        }
    }

    getJson(key: string, type = undefined) {
        let json = this.localStorage[key];
        let object = (typeof json === 'string') ? JSON.parse(json) : undefined;
        let isValidType = (typeof type === 'undefined' || object instanceof type);
        
        return isValidType ? object : undefined;
    }

    setJson(key: string, object) {
        let json = JSON.stringify(object);

        if (typeof json !== 'undefined') {
            this.localStorage[key] = json;
        }
    }
}