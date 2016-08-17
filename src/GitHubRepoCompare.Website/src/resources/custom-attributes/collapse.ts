import {EventAggregator} from 'aurelia-event-aggregator';
import {autoinject, bindable, bindingMode, customAttribute} from 'aurelia-framework';
import * as bootstrap from "bootstrap";
import * as $ from 'jquery';

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

    constructor(private ea: EventAggregator,
        private element: Element) {
    }

    bind() {
        this.$element = $(this.element);
        this.$target = $(this.target);

        this.$element.on('click', () => this.onClick());

        this.$target
            .addClass('collapse')
            .toggleClass('in', this.show)
            .on(collapseShowEvents, () => this.onCollapseShow())
            .on(collapseHideEvents, () => this.onCollapseHide());

        if (this.group) {
            let groupEventName = CollapseGroupCustomAttribute.getGroupEventName(this.group);

            this.groupSubscription = this.ea.subscribe(groupEventName, command => this.$target.collapse(command));
        }
    }

    unbind() {
        this.$element.off('click', () => this.onClick());

        this.$target
            .off(collapseShowEvents, () => this.onCollapseShow())
            .off(collapseHideEvents, () => this.onCollapseHide());

        if (this.groupSubscription) {
            this.groupSubscription.dispose();
        }
    }

    private onClick() {
        this.$target.collapse(this.command);
    }

    private onCollapseHide() {
        this.show = false;
    }

    private onCollapseShow() {
        this.show = true;
    }
}