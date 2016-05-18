export default function debounce(fn, delay, scope) {
    delay = delay || 250;

    let timer = null;
    return function() {
        let context = scope || this,
            args = arguments;

        clearTimeout(timer);

        timer = setTimeout(function() {
            fn.apply(context, args);
        }, delay);
    };
}