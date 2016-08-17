import {EventAggregator} from 'aurelia-event-aggregator';
import {autoinject, bindable, bindingMode, customAttribute} from 'aurelia-framework';
import * as $ from 'jquery';

@autoinject
@customAttribute('collapse-group')
export class CollapseGroupCustomAttribute {
    @bindable({ defaultBindingMode: bindingMode.oneTime })
    group: string;
    @bindable({ defaultBindingMode: bindingMode.oneTime })
    command: string = 'toggle';

    private $element;

    private groupEventName: string;

    static getGroupEventName(group): string {
        let groupEventName = `CollapseGroupCustomAttribute_GroupEventName_${group}`;
        return groupEventName;
    }

    constructor(private ea: EventAggregator,
        private element: Element) {
    }

    bind() {
        if (!this.group) {
            return;
        }

        this.$element = $(this.element);

        this.groupEventName = CollapseGroupCustomAttribute.getGroupEventName(this.group);

        this.$element.on('click', () => this.onClick());
    }

    unbind() {
        this.$element.off('click', () => this.onClick());
    }

    private onClick() {
        this.ea.publish(this.groupEventName, this.command);
    }
}