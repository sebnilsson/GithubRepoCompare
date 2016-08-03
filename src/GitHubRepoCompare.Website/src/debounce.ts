export default function debounce(fn: Function, delay: number = 250, scope = undefined) {
    let timer: number;

    return function() {
        let context = scope || this,
            args = arguments;

        clearTimeout(timer);

        timer = setTimeout(() => {
                fn.apply(context, args);
            },
            delay);
    };
}