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

export class PromiseWithProgress<T> {
    promise: Promise<T>;
    progress: Readable<Progress>;

    constructor(
        executor: (
            resolve: (value: T) => void,
            updateProgress: (progress: Progress) => void,
            reject: (error: any) => void,
        ) => void
    ) {
        const progress = writable(Progress.fromRatio(0));
        const promise = new Promise<T>((res, rej) => executor(res, progress.set, rej));
        return { progress, promise };
    }
}
