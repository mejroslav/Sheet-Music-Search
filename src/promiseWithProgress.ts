import { writable, type Readable } from "svelte/store";

export class Progress {
    private constructor(private value: number) {};

    static fromPercent(percent: number): Progress {
        return new Progress(percent / 100);
    }

    static fromRatio(ratio: number): Progress {
        return new Progress(ratio);
    }

    get ratio(): number { return this.value; }
    get percent(): number { return this.value * 100; }
}

interface ProgressUpdater {
    setRatio(r: number);
    setPercent(p: number);
}

export class PromiseWithProgress<T> implements Promise<T>, Readable<Progress> {
    then: Promise<T>["then"];
    catch: Promise<T>["catch"];
    finally: Promise<T>["finally"];

    subscribe: Readable<Progress>["subscribe"];

    [Symbol.toStringTag] = "Promise With Progress";

    constructor(
        executor: (
            resolve: (value: T) => void,
            updateProgress: ProgressUpdater,
            reject: (error: any) => void,
        ) => void
    ) {
        const progress = writable(Progress.fromRatio(0));
        const { subscribe } = progress;
        const updater: ProgressUpdater = {
            setRatio(r) { progress.set(Progress.fromRatio(r)); },
            setPercent(p) { progress.set(Progress.fromPercent(p)); },
        };

        const promise = new Promise<T>((res, rej) => executor(res, updater, rej));
        
        return Object.assign(promise, { subscribe });
    }
}
