let defaultTimeout = 5000;

export class Errors {
    private _items: Array<any> = [];

    get items(): Array<any> {
        return this._items;
    };

    add(text, level, timeout?) {
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

    addDanger(text, timeout?) {
        this.add(text, 'danger', timeout);
    }

    addInfo(text, timeout?) {
        this.add(text, 'info', timeout);
    }

    addWarning(text, timeout?) {
        this.add(text, 'warning', timeout);
    }

    remove(error) {
        let index = this.items.indexOf(error);

        this.items.splice(index, 1);
    }
}