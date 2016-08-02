let defaultTimeout = 5000;

export class Alerts {
    private _items: Array<Alert> = [];

    get items(): Array<Alert> {
        return this._items;
    }

    constructor() {
        console.log('Alerts.constructor');
    }

    addDanger(text: string, timeout?: number) {
        this.add(text, 'danger', timeout);
    }

    addInfo(text: string, timeout?: number) {
        this.add(text, 'info', timeout);
    }

    addWarning(text: string, timeout?: number) {
        this.add(text, 'warning', timeout);
    }

    remove(error) {
        let index = this.items.indexOf(error);

        this.items.splice(index, 1);
    }

    private add(text: string, level: string, timeout?: number) {
        let error = {
            text: text,
            level: level
        };

        this.items.push(error);

        if (timeout <= 0) {
            return;
        }

        setTimeout(() => this.remove(error), (timeout || defaultTimeout));
    }
}

export class Alert {
    text: string;
    level: string;
}