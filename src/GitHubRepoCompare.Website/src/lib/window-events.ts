export class WindowEvents {
    private eventHandlers = [];

    add(type: string, eventHandler: EventListener) {
        this.eventHandlers.push({ type: type, eventHandler: eventHandler });

        window.addEventListener(type, eventHandler);
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