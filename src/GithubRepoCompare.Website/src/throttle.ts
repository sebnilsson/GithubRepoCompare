export default function throttle(fn: Function, threshhold: number = 250, scope) {
    let last: number,
        timer: number;

    return function() {
        let context = scope || this,
            now = +new Date,
            args = arguments;

        if (last && now < last + threshhold) {
            clearTimeout(timer);

            timer = setTimeout(() => {
                last = now;
                fn.apply(context, args);
            }, threshhold);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
}