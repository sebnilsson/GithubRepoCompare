import {EventAggregator} from 'aurelia-event-aggregator';
import {autoinject, bindable, bindingMode, customAttribute} from 'aurelia-framework';
import * as $ from 'jquery';
import * as bootstrap from 'bootstrap';

import {CollapseGroupCustomAttribute} from './collapse-group';
import {JqueryHelper} from '../../lib/jquery-helper';

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
    private onClickOff;
    private onCollapseHideOff;
    private onCollapseShowOff;

    constructor(private ea: EventAggregator,
        private element: Element) {
        this.$element = $(this.element);

    }

    bind() {
        this.show = !!this.show;

        this.$target = $(this.target);

        this.onClickOff = JqueryHelper.on(this.$element, 'click', () => this.onClick());

        this.onCollapseHideOff = JqueryHelper.on(this.$target, collapseHideEvents, () => this.onCollapseHide());
        this.onCollapseShowOff = JqueryHelper.on(this.$target, collapseShowEvents, () => this.onCollapseShow());

        this.$target
            .addClass('collapse')
            .toggleClass('in', this.show);

        if (this.group) {
            let groupEventName = CollapseGroupCustomAttribute.getGroupEventName(this.group);

            this.groupSubscription = this.ea.subscribe(groupEventName, command => this.$target.collapse(command));
        }
    }

    unbind() {
        this.onClickOff();
        this.onCollapseHideOff();
        this.onCollapseShowOff();

        if (this.groupSubscription) {
            this.groupSubscription.dispose();
        }
    }

    onClick() {
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