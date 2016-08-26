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
    private onClickFunc;

    static getGroupEventName(group): string {
        let groupEventName = `CollapseGroupCustomAttribute_GroupEventName_${group}`;
        return groupEventName;
    }

    constructor(private ea: EventAggregator,
        private element: Element) {
        this.$element = $(this.element);

        this.onClickFunc = () => this.onClick();
    }

    bind() {
        if (!this.group) {
            return;
        }

        this.groupEventName = CollapseGroupCustomAttribute.getGroupEventName(this.group);

        this.$element.on('click', this.onClickFunc);
    }

    unbind() {
        this.$element.off('click', this.onClickFunc);
    }

    private onClick() {
        this.ea.publish(this.groupEventName, this.command);
    }
}