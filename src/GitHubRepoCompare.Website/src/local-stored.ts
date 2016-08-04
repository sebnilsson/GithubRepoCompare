import {LocalStorage} from './local-storage';

export function localStored(nameOrConfigOrTarget?: string | Object, key?, descriptor?): any {
    let deco = function(target, propertyKey, propertyDescriptor) {
        let storageKey = typeof target === 'string'
            ? target
            : `${target.constructor.name}.${propertyKey}`;

        propertyDescriptor = (typeof propertyDescriptor !== 'undefined') ? propertyDescriptor : {};

        assignSetter(target, propertyKey, propertyDescriptor, storageKey);

        assignValue(target, propertyKey, propertyDescriptor, storageKey);
    }

    if (key) {
        let target = nameOrConfigOrTarget;
        nameOrConfigOrTarget = null;

        return deco(target, key, descriptor);
    }

    return deco;
}

function assignValue(target, propertyKey, descriptor, storageKey) {
    let existingCallback = target.created;
    existingCallback = (typeof existingCallback === 'function') ? existingCallback : undefined;

    let callbackFunc = function() {
        if (existingCallback) {
            existingCallback.apply(this, arguments);
        }

        let localStorageJson = LocalStorage.getJson(storageKey);

        if (typeof localStorageJson !== 'undefined') {
            descriptor.set.call(this, localStorageJson);
        }
    };

    target.created = callbackFunc;
}

function assignSetter(target, propertyKey, descriptor, storageKey) {
    let fieldName = `_${propertyKey}`;

    if (typeof descriptor.get !== 'function') {
        descriptor.get = function() {
            return this[fieldName];
        };
    }

    if (typeof descriptor.set !== 'function') {
        descriptor.set = function(value) {
            this[fieldName] = value;
        }
    }

    let originalSet = descriptor.set;

    descriptor.set = function(value) {
        originalSet.apply(this, arguments);

        LocalStorage.setJson(storageKey, value);
    }
}