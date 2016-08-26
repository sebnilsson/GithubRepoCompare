import {autoinject, bindable, bindingMode, customAttribute} from 'aurelia-framework';

import {CollapseGroupCustomAttribute} from './collapse-group';

@autoinject
@customAttribute('toggle-class')
export class CollapseIconCustomAttribute {
    @bindable({ defaultBindingMode: bindingMode.twoWay })
    toggle: boolean;
    @bindable({ defaultBindingMode: bindingMode.oneTime })
    hide: string;
    @bindable({ defaultBindingMode: bindingMode.oneTime })
    show: string;

    constructor(private element: Element) {}

    bind() {
        this.toggle = !!this.toggle;

        this.toggleClass();
    }

    toggleChanged() {
        this.toggleClass();
    }

    private toggleClass() {
        this.element.classList.toggle(this.show, this.toggle);
        this.element.classList.toggle(this.hide, !this.toggle);
    }
}