import {autoinject, bindable, bindingMode, customAttribute} from 'aurelia-framework';
import * as $ from 'jquery';
import * as bootstrap from 'bootstrap';

@autoinject
@customAttribute('modal')
export class ModalCustomAttribute {
    @bindable({ defaultBindingMode: bindingMode.oneTime })
    target;
    @bindable({ defaultBindingMode: bindingMode.oneTime })
    command: string = 'toggle';

    private $element;
    private $target;
    private onClickFunc; // TODO: Replicate in other .on/.off-functionality

    constructor(private element: Element) {
        this.$element = $(this.element);

        let that = this;
        let onClick = this.onClick;

        this.onClickFunc = function() {
            onClick.call(that, arguments);
        };
    }

    bind() {
        this.$target = $(this.target);

        this.$element.on('click', this.onClickFunc);
    }

    unbind() {
        this.$element.off('click', this.onClickFunc);
    }

    private onClick() {
        console.log('ModalCustomAttribute.onClick -- this: ', this);

        this.$target
            .modal(this.command)
            .removeAttr('hidden');
    }
}