export class WindowEvents {
    private eventHandlers = [];

    add(type, eventHandler) {
        if (typeof(type) !== 'string' || !type) {
            throw new Error('Event-type must be a string.');
        }
        if (typeof(eventHandler) !== 'function') {
            throw new Error('Event-handler must be a function.');
        }

        this.eventHandlers.push({ type: type, eventHandler: eventHandler });

        window.addEventListener(type, eventHandler);

        console.log('WindowsEvents.add - this.eventHandlers.length:', this.eventHandlers.length);
    }

    remove(type, eventHandler) {
        if (typeof(type) !== 'string' || !type) {
            throw new Error('Event-type must be a string.');
        }
        if (typeof(eventHandler) !== 'function') {
            throw new Error('Event-handler must be a function.');
        }

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