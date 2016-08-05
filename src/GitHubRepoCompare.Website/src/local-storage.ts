export module LocalStorage {
    export function getJson(key: string, fallbackValue: any = undefined, type: any = undefined) {
        let json = window.localStorage[key];
        let object = (typeof json === 'string') ? JSON.parse(json) : undefined;
        let isValidType = (typeof type === 'undefined' || object instanceof type);

        return isValidType ? object : fallbackValue;
    }

    export function setJson(key: string, object) {
        if (typeof object === 'undefined') {
            window.localStorage[key] = undefined;
            return;
        }

        let json = JSON.stringify(object);

        if (typeof json !== 'undefined') {
            window.localStorage[key] = json;
        }
    }
}