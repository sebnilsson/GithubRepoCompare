import {bindable, computedFrom, containerless} from 'aurelia-framework';

@containerless
export class Icon {
    @bindable
    icon: string;
    @bindable
    class: string;
    @bindable
    variableWidth: boolean;
    @bindable
    pulse: boolean;
    @bindable
    size: string;
    @bindable
    spin: boolean;

    @computedFrom('fixedWidth')
    get fixedWidthClass() {
        return this.getConditionalClass(this.variableWidth, '', 'fa-fw');
    }

    @computedFrom('pulse')
    get pulseClass() {
        return this.getConditionalClass(this.pulse, 'fa-pulse');
    }

    @computedFrom('size')
    get sizeClass() {
        return this.size ? `fa-${this.size}` : '';
    }

    @computedFrom('spin')
    get spinClass() {
        return this.getConditionalClass(this.spin, 'fa-spin');
    }

    private getConditionalClass(value: boolean, className: string, falseClassName: string = '') {
        return (typeof value !== 'undefined' && value !== false) ? className : falseClassName;
    }
}