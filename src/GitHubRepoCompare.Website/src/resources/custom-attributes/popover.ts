import {autoinject, bindable, bindingMode, customAttribute} from 'aurelia-framework';
import * as $ from 'jquery';
import * as bootstrap from 'bootstrap';

import {JqueryHelper} from '../../lib/jquery-helper';
import {WindowEvents} from '../../lib/window-events';

const template = `<div class="popover">
<div class="popover-arrow"></div>
<h3 class="popover-title"></h3>
<div class="popover-content"></div>
</div>`;

@autoinject
@customAttribute('popover')
export class PopoverCustomAttribute {
    @bindable({ defaultBindingMode: bindingMode.oneTime })
    content;
    @bindable({ defaultBindingMode: bindingMode.oneTime })
    title: string;
    @bindable({ defaultBindingMode: bindingMode.oneTime })
    command: string = 'toggle';
    @bindable({ defaultBindingMode: bindingMode.oneTime })
    placement: string = 'right';

    private $element;
    private $content;
    private onClickOff;
    private onHideOff;
    private onHideContentElementOff;
    private onShowOff;
    private onShowContentElementOff;
    private windowClickEventCancel;

    constructor(private element: Element,
        private windowEvents: WindowEvents) {
        this.$element = $(this.element);
    }

    attached() {
        let isContentString = (typeof this.content === 'string');

        this.$element.popover({
            content: isContentString ? this.content : '...',
            container: 'body',
            html: true,
            placement: this.placement,
            template: template,
            title: this.title,
            trigger: 'manual'
        });

        this.onShowOff = JqueryHelper.on(this.$element, 'show.bs.popover', () => this.onShow());
        this.onHideOff = JqueryHelper.on(this.$element, 'hide.bs.popover', () => this.onHide());

        if (!isContentString) {
            this.$content = $(this.content);

            this.onShowContentElementOff = JqueryHelper.on(this.$element,
                'shown.bs.popover',
                () => this.onShowContentElement());
            this.onHideContentElementOff = JqueryHelper.on(this.$element,
                'hide.bs.popover',
                () => this.onHideContentElement());
        }
    }

    bind() {
        this.onClickOff = JqueryHelper.on(this.$element, 'click', () => this.onClick());
    }

    detached() {
        this.$element.popover('dispose');

        this.onShowOff();
        this.onHideOff();

        if (this.onShowContentElementOff) {
            this.onShowContentElementOff();
        }
        if (this.onHideContentElementOff) {
            this.onHideContentElementOff();
        }
    }

    unbind() {
        this.onClickOff();
    }

    private onClick() {
        this.$element.popover(this.command);
    }

    private onCloseClick() {
        this.$element.popover('hide');
    }

    private onHide() {
        if (this.windowClickEventCancel) {
            this.windowClickEventCancel();
        }
    }

    private onHideContentElement() {
        this.$content.detach();
    }

    private onShow() {
        setTimeout(() => {
                this.windowClickEventCancel = this.windowEvents.addOnce('click', () => this.onCloseClick());
            },
            100);
    }

    private onShowContentElement() {
        this.$content.removeAttr('hidden').removeClass('hidden');

        let $popoverContent = $('.popover .popover-content');

        $popoverContent
            .removeAttr('hidden')
            .removeClass('hidden')
            .empty()
            .append(this.$content);
    }
}