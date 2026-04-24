export default class Output {
    static println(...args: unknown[]) {
        console.log(...args);
    }

    static wprintln(...args: unknown[]) {
        console.warn(...args);
    }

    static eprintln(...args: unknown[]) {
        console.error(...args);
    }
}
