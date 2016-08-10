import {Aurelia} from 'aurelia-framework';

const customAttributesFolder = './custom-attributes';
const customElementsFolder = './custom-elements';
const valueConvertersFolder = './value-converters';

export function configure(aurelia) {
    configureGlobalResources(aurelia,
        customAttributesFolder,
        [
            'collapse',
            'modal'
        ]);

    configureGlobalResources(aurelia,
        valueConvertersFolder,
        [
            'date-format',
            'date-format-relative',
            'json-format',
            'number-format'
        ]);
}

function configureGlobalResources(aurelia, folder: string, components: Array<string>) {
    let resources = components.map(x => `${folder}/${x}`);

    aurelia.globalResources(resources);
}