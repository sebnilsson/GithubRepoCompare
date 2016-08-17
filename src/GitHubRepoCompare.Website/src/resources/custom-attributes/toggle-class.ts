import {autoinject, bindable, bindingMode, customAttribute} from 'aurelia-framework';
import * as $ from 'jquery';

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

    private $element;

    constructor(private element: Element) {
    }

    bind() {
        this.$element = $(this.element);

        this.toggleClass();
    }

    toggleChanged() {
        this.toggleClass();
    }

    private toggleClass() {
        this.$element.toggleClass(this.show, this.toggle);
        this.$element.toggleClass(this.hide, !this.toggle);
    }
}