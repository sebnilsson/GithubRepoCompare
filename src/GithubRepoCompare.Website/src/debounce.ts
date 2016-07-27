export default function debounce(fn, delay = undefined, scope = undefined) {
    delay = delay || 250;

    let timer = null;
    return function() {
        let context = scope || this,
            args = arguments;

        clearTimeout(timer);

        timer = setTimeout(() => {
            fn.apply(context, args);
        }, delay);
    };
}