import {autoinject, bindable, bindingMode, customAttribute} from 'aurelia-framework';
import * as $ from 'jquery';
import * as bootstrap from 'bootstrap';

import {JqueryHelper} from '../../lib/jquery-helper';

@autoinject
@customAttribute('modal')
export class ModalCustomAttribute {
    @bindable({ defaultBindingMode: bindingMode.oneTime })
    target;
    @bindable({ defaultBindingMode: bindingMode.oneTime })
    command: string = 'toggle';

    private $element;
    private $target;
    private onClickOff;

    constructor(private element: Element) {
        this.$element = $(this.element);
    }

    bind() {
        this.$target = $(this.target);

        this.onClickOff = JqueryHelper.on(this.$element, 'click', () => this.onClick());
    }

    unbind() {
        this.onClickOff();
    }

    private onClick() {
        console.log('Modal.onClick');
        this.$target
            .modal(this.command)
            .removeAttr('hidden');
    }
}