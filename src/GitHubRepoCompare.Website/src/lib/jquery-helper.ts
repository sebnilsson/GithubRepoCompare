import * as $ from 'jquery';

export module JqueryHelper {
    export function on(element: JQuery,
        events: string,
        handler: (eventObject: JQueryEventObject, ...args: any[]) => any): () => JQuery {
        if (!element || !(element instanceof jQuery)) {
            throw new Error('Element is not valid jQuery-object.');
        }

        element.on(events, handler);

        let offFunc = () => {
            return element.off(events, handler);
        };
        return offFunc;
    }
}