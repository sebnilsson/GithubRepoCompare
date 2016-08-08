import {autoinject, BindingEngine, Disposable, transient} from 'aurelia-framework';

let propertiesKey = '__LocalStorageObserverProperties';
let subscriptionsKey = '__LocalStorageObserverSubscriptions';

export interface ILocalStorageProperty {
    key: string,
    storageKey?: string,
    defaultValue?: any;
}

@autoinject
export class LocalStorageObserver {
    constructor(private bindingEngine: BindingEngine) {}

    subscribe(target: Object, ...properties: Array<any>) {
        if (typeof target === 'undefined') {
            throw new Error('Target cannot be undefined.');
        }

        let targetProperties = getTargetProperties(target);

        if (properties) {
            for (let property of properties) {
                if (typeof property === 'string') {
                    targetProperties.push({ key: property });
                } else if (typeof property !== 'undefined' && property && typeof (property.key !== 'undefined')) {
                    targetProperties.push(property);
                }
            }
        }

        this.ensureProperties(target, targetProperties);

        this.setTargetProperties(target, targetProperties);

        this.addObservers(target, targetProperties);

        target[propertiesKey] = undefined;
    }

    unsubscribe(target: Object) {
        if (typeof target === 'undefined') {
            throw new Error('Target cannot be undefined.');
        }

        this.disposeObservers(target);

        target[subscriptionsKey] = undefined;
    }

    private addObservers(target: Object, properties: Array<ILocalStorageProperty>) {
        let subscriptions = this.getTargetSubscriptions(target);

        for (let property of properties) {
            let propertyKey = property.key;
            let storageKey = property.storageKey;

            let isArray = Array.isArray(target[propertyKey]);

            if (isArray) {
                let observer = this.bindingEngine.collectionObserver(target[propertyKey]);

                let subscription = observer.subscribe((newValue) =>
                    this.onObserverItemChange(storageKey, newValue));

                subscriptions.push(subscription);
            } else {
                let observer = this.bindingEngine.propertyObserver(target, propertyKey);

                let subscription = observer.subscribe((newValue) =>
                    this.onObserverItemChange(storageKey, newValue));

                subscriptions.push(subscription);
            }
        }
    }

    private disposeObservers(target: Object) {
        let subscriptions = this.getTargetSubscriptions(target);

        for (let subscription of subscriptions) {
            if (typeof subscription.dispose === 'function') {
                subscription.dispose();
            }
        }
    }

    private ensureProperties(target: Object, properties: Array<ILocalStorageProperty>) {
        for (let targetProperty of properties) {
            targetProperty.storageKey = targetProperty.storageKey || getStorageKey(target, targetProperty.key);
        }
    }

    private getTargetSubscriptions(target: Object): Array<Disposable> {
        target[subscriptionsKey] = target[subscriptionsKey] || [];

        return target[subscriptionsKey];
    }

    private onObserverItemChange(storageKey: string, newValue: any) {
        LocalStorage.setJson(storageKey, newValue);
    }

    private setTargetProperties(target: Object, properties: Array<ILocalStorageProperty>) {
        for (let property of properties) {
            let localStorageValue = LocalStorage.getJson(property.storageKey);

            if (typeof localStorageValue !== 'undefined') {
                target[property.key] = localStorageValue;
            } else if (property.defaultValue !== 'undefined') {
                target[property.key] = property.defaultValue;
            }
        }
    }
}

export function localStorage(nameOrConfigOrTarget?: string | Object, key?, descriptor?): any {
    let deco = function(target, propertyKey, propertyDescriptor) {
        propertyKey = ((typeof nameOrConfigOrTarget === 'string')
                ? nameOrConfigOrTarget
                : tryGetConfigValue(nameOrConfigOrTarget, 'key')) ||
            propertyKey;

        let storageKey = tryGetConfigValue(nameOrConfigOrTarget, 'storageKey');

        let targetPropertyKeys = getTargetProperties(target);

        targetPropertyKeys.push({ key: propertyKey, storageKey: storageKey });
    };

    if (key) {
        let target = nameOrConfigOrTarget;
        nameOrConfigOrTarget = null;

        return deco(target, key, descriptor);
    }

    return deco;
}

function tryGetConfigValue(config: any, key: string) {
    let configValue = config ? config[key] : undefined;

    return (typeof configValue !== 'undefined') ? configValue : undefined;
}

function getStorageKey(target: any, propertyKey: string): string {
    let storageKey = `${target.constructor.name}.${propertyKey}`;
    return storageKey;
}

function getTargetProperties(target: Object): Array<ILocalStorageProperty> {
    target[propertiesKey] = target[propertiesKey] || [];

    return target[propertiesKey];
}

export module LocalStorage {
    export function getJson(key: string, fallbackValue: any = undefined, type: any = undefined) {
        if (typeof key === 'undefined') {
            throw new Error('Key cannot be undefined.');
        }

        let json = window.localStorage[key];
        let object = (typeof json === 'string') ? JSON.parse(json) : undefined;
        let isValidType = (typeof type === 'undefined' || object instanceof type);

        return isValidType ? object : fallbackValue;
    }

    export function setJson(key: string, object) {
        if (typeof key === 'undefined') {
            throw new Error('Key cannot be undefined.');
        }

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