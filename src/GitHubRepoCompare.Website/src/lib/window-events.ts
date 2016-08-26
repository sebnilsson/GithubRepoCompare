export class WindowEvents {
    private eventHandlers = [];

    add(type: string, eventHandler: EventListener): () => void {
        let func = function() {
            eventHandler.call(this, arguments);
        };

        this.eventHandlers.push({ type: type, eventHandler: func });

        window.addEventListener(type, func);

        let cancel = () => this.remove(type, func);;
        return cancel;
    }

    addOnce(type: string, eventHandler: EventListener): () => void {
        let removeFunc = () => {};

        let func = function() {
            eventHandler.call(this, arguments);

            removeFunc();
        };

        removeFunc = this.add(type, func);
        return removeFunc;
    }

    remove(type: string, eventHandler: EventListener) {
        let index = this.eventHandlers.indexOf(eventHandler);

        if (index >= 0) {
            this.eventHandlers.splice(index, 1);
        }

        window.removeEventListener(type, eventHandler);
    }

    detached() {
        for (let item of this.eventHandlers) {
            let type = item.type,
                eventHandler = item.eventHandler;

            this.remove(type, eventHandler);
        }
    }
}