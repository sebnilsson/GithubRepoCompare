import {autoinject, bindable, bindingMode, customAttribute} from 'aurelia-framework';
import * as bootstrap from "bootstrap";
import * as $ from 'jquery';

@autoinject
@customAttribute('modal')
export class ModalCustomAttribute {
    private $element;
    private $target;

    @bindable({ defaultBindingMode: bindingMode.oneTime })
    target;

    constructor(private element: Element) {}

    bind() {
        this.$element = $(this.element);
        this.$target = $(this.target);

        this.$element.on('click', () => this.onClick());
    }
    
    unbind() {
        this.$element.off('click', () => this.onClick());
    }

    private onClick() {
        this.$target.modal('toggle');
    }
}