let defaultTimeout = 5000;

export class Alerts {
    private _items: Array<IAlert> = [];

    get items(): Array<IAlert> {
        return this._items;
    }

    addDanger(text: string, timeout?: number | boolean) {
        this.add(text, 'danger', timeout);
    }

    addInfo(text: string, timeout?: number | boolean) {
        this.add(text, 'info', timeout);
    }

    addWarning(text: string, timeout?: number | boolean) {
        this.add(text, 'warning', timeout);
    }

    remove(error) {
        let index = this.items.indexOf(error);

        this.items.splice(index, 1);
    }

    private add(text: string, level: string, timeout?: any) {
        let error = {
            text: text,
            level: level
        };

        this.items.push(error);

        if (timeout <= 0 || timeout === false) {
            return;
        }

        setTimeout(() => this.remove(error), (timeout || defaultTimeout));
    }
}

export interface IAlert {
    text: string;
    level: string;
}