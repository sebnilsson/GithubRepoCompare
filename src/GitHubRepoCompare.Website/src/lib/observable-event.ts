//export class ObservableEvent<T> {
//    private listeners: Array<IListener<T>> = [];

//    subscribe(listener: IListener<T>): (() => void) {
//        this.listeners.push(listener);

//        let cancelListener = () => {
//            this.listeners = this.listeners.filter(x => x !== listener);
//        };

//        return cancelListener;
//    }

//    trigger(data?: T) {
//        this.listeners.slice(0).forEach(listener => listener(data));
//    }
//}

//export interface IListener<T> {
//    (data: T): void
//}