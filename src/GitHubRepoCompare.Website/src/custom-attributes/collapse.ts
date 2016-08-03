import {autoinject, bindable, customAttribute} from 'aurelia-framework';
import * as bootstrap from "bootstrap";
import * as $ from 'jquery';

@autoinject
@customAttribute('collapse')
export class CollapseCustomAttribute {
    private $element;
    private $target;
    private $icon;

    @bindable
    show: boolean = false;
    @bindable
    target;
    @bindable
    icon;
    @bindable
    iconHideClass: string = 'glyphicon-chevron-down';
    @bindable
    iconShowClass: string = 'glyphicon-chevron-up';

    constructor(private element: Element) {}

    bind() {
        this.$element = $(this.element);
        this.$target = $(this.target);
        this.$icon = $(this.icon || this.element);

        let defaultIconClass = this.show ? this.iconShowClass : this.iconHideClass;
        
        this.$icon.addClass(defaultIconClass);
        
        this.$element.on('click', () => this.onClick());
    }

    unbind() {
        this.$element.off('click', () => this.onClick());
    }

    private onClick() {
        this.$target.collapse('toggle');

        this.$icon.toggleClass(this.iconHideClass);
        this.$icon.toggleClass(this.iconShowClass);
    }
}