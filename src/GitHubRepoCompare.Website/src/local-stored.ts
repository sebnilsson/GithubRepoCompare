import {autoinject, BindingEngine, Disposable} from 'aurelia-framework';
import {BindableProperty, HtmlBehaviorResource} from 'aurelia-templating';

import {LocalStorage} from './local-storage';

export class LocalStorePropertyPopulator {
    populate(obj: any) {
        for (let key in obj) {
            let prop = obj[key];
            let localStorageKey = (typeof prop !== 'undefined' && prop) ? prop.localStorageKey : undefined;

            if (localStorageKey) {
                let localStorageValue = LocalStorage.getJson(localStorageKey);

                if (typeof localStorageValue !== 'undefined') {
                    Reflect.set(obj, key, localStorageValue, obj);
                }
            }

            // TODO: Add observers
            // TODO: How to unsubscribe observers?
        }
    }
}

@autoinject
export class LocalStored {
    constructor(private bindingEngine: BindingEngine) {
        console.log('LocalStored.constructor');
    }

    observe(obj: any, propertyName: string, defaultValue?: any, storageKey?: string): Disposable {
        console.log('LocalStored.handle');

        storageKey = storageKey
            ? storageKey
            : (obj && obj.constructor ? `${obj.constructor.name}.${propertyName}` : propertyName);

        let localStorageJson = LocalStorage.getJson(storageKey);

        if (typeof localStorageJson !== 'undefined') {
            Reflect.set(obj, propertyName, localStorageJson, obj);
        } else {
            Reflect.set(obj, propertyName, defaultValue, obj);
        }

        let observer = this.bindingEngine.propertyObserver(obj, propertyName);

        let subscription = observer.subscribe(value => {
            LocalStorage.setJson(storageKey, value);
        });

        return subscription;
    }

    attached() {
        console.log('LocalStored.attached');
    }

    detached() {
        console.log('LocalStored.detached');
    }
}

export function localStored(nameOrConfigOrTarget?: string | Object, key?, descriptor?): any {
    let deco = function(target, propertyKey, propertyDescriptor) {
        let storageKey = typeof target === 'string'
            ? target
            : `${target.constructor.name}.${propertyKey}`;

        propertyDescriptor = ensureDescriptor(target, propertyKey, propertyDescriptor);

        assignGetAndSet(target, propertyKey, propertyDescriptor, storageKey);
    }

    if (key) {
        let target = nameOrConfigOrTarget;
        nameOrConfigOrTarget = null;

        return deco(target, key, descriptor);
    }

    return deco;
}

function assignGetAndSet(target, propertyKey, descriptor, storageKey) {
    let originalGet = descriptor.get;
    let originalSet = descriptor.set;

    descriptor.get = function() {
        let localStorageJson = LocalStorage.getJson(storageKey);

        if (typeof localStorageJson !== 'undefined') {
            originalSet.call(this, localStorageJson);
        }

        copyAllProperties(descriptor.get, originalGet);

        descriptor.get = originalGet;

        Reflect.defineProperty(this, propertyKey, descriptor);

        return originalGet.apply(this, arguments);
    };

    descriptor.set = function(value) {
        originalSet.apply(this, arguments);

        LocalStorage.setJson(storageKey, value);
    };

    copyAllProperties(originalGet, descriptor.get);
    copyAllProperties(originalSet, descriptor.set);

    Reflect.defineProperty(target, propertyKey, descriptor);
}

function copyAllProperties(src, target) {
    for (let property in src) {
        target[property] = src[property];
    }
}

function ensureDescriptor(target, propertyKey, propertyDescriptor) {
    let descriptor = (typeof propertyDescriptor !== 'undefined')
        ? propertyDescriptor
        : { descriptor: true, enumerable: true };
    
    let fieldName = `_${propertyKey}`;

    if (typeof descriptor.get !== 'function') {
        descriptor.get = function() {
            return this[fieldName];
        }
    }

    if (typeof descriptor.set !== 'function') {
        descriptor.set = function(value) {
            this[fieldName] = value;
        }
    }

    Reflect.defineProperty(target, propertyKey, descriptor);

    return descriptor;
}