export default function throttle(fn, threshhold, scope) {
    threshhold = threshhold || 250;

    let last,
        deferTimer;

    return function() {
        let context = scope || this,
            now = +new Date,
            args = arguments;

        if (last && now < last + threshhold) {
            clearTimeout(deferTimer);

            deferTimer = setTimeout(() => {
                last = now;
                fn.apply(context, args);
            }, threshhold);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
}