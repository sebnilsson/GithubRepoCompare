import {EventAggregator} from 'aurelia-event-aggregator';
import {autoinject, bindable, bindingMode, customAttribute} from 'aurelia-framework';
import * as $ from 'jquery';
import * as bootstrap from 'bootstrap';

import {CollapseGroupCustomAttribute} from './collapse-group';

const collapseHideEvents = 'hide.bs.collapse';
const collapseShowEvents = 'show.bs.collapse';

@autoinject
@customAttribute('collapse')
export class CollapseCustomAttribute {
    @bindable({ defaultBindingMode: bindingMode.twoWay, defaultValue: false })
    show: boolean;
    @bindable({ defaultBindingMode: bindingMode.oneTime })
    target;
    @bindable({ defaultBindingMode: bindingMode.oneTime })
    group: string;
    @bindable({ defaultBindingMode: bindingMode.oneTime })
    command: string = 'toggle';

    private $element;
    private $target;
    private groupSubscription;
    private onClickFunc;
    private onCollapseHideFunc;
    private onCollapseShowFunc;

    constructor(private ea: EventAggregator,
        private element: Element) {
        this.$element = $(this.element);

        this.onClickFunc = () => this.onClick;
        this.onCollapseHideFunc = () => this.onCollapseHide;
        this.onCollapseShowFunc = () => this.onCollapseShow;
    }

    bind() {
        this.show = !!this.show;

        this.$target = $(this.target);

        this.$element.on('click', this.onClickFunc);

        this.$target
            .addClass('collapse')
            .toggleClass('in', this.show)
            .on(collapseShowEvents, this.onCollapseShowFunc)
            .on(collapseHideEvents, this.onCollapseHideFunc);

        if (this.group) {
            let groupEventName = CollapseGroupCustomAttribute.getGroupEventName(this.group);

            this.groupSubscription = this.ea.subscribe(groupEventName, command => this.$target.collapse(command));
        }
    }

    unbind() {
        this.$element.off('click', this.onClickFunc);

        this.$target
            .off(collapseShowEvents, this.onCollapseShowFunc)
            .off(collapseHideEvents, this.onCollapseHideFunc);

        if (this.groupSubscription) {
            this.groupSubscription.dispose();
        }
    }

    private onClick() {
        this.$target
            .collapse(this.command)
            .removeAttr('hidden');
    }

    private onCollapseHide() {
        this.show = false;
    }

    private onCollapseShow() {
        this.show = true;
    }
}