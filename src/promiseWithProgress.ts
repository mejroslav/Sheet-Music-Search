import { writable, type Readable } from "svelte/store";

const clamp = (lowerBound: number, n: number, upperBound: number) =>
  Math.max(lowerBound, Math.min(n, upperBound));

export class Progress {
  private constructor(private value: number) {
    this.value = clamp(0, value, 1);
  }

  static fromPercent(percent: number): Progress {
    return new Progress(percent / 100);
  }

  static fromRatio(ratio: number): Progress {
    return new Progress(ratio);
  }

  get ratio(): number {
    return this.value;
  }
  get percent(): number {
    return this.value * 100;
  }
}

interface ProgressUpdater {
  setRatio(r: number): void;
  setPercent(p: number): void;
}

export class PromiseWithProgress<T> implements Promise<T>, Readable<Progress> {
  then!: Promise<T>["then"];
  catch!: Promise<T>["catch"];
  finally!: Promise<T>["finally"];
  [Symbol.toStringTag]!: string;

  subscribe!: Readable<Progress>["subscribe"];

  constructor(
    executor: (
      resolve: (value: T) => void,
      updateProgress: ProgressUpdater,
      reject: (error: any) => void
    ) => void
  ) {
    let promiseFulfilled = false;

    // Progress
    const progress = writable(Progress.fromRatio(0));
    const updater: ProgressUpdater = {
      setRatio(r) {
        if (promiseFulfilled) return;
        progress.set(Progress.fromRatio(r));
      },
      setPercent(p) {
        if (promiseFulfilled) return;
        progress.set(Progress.fromPercent(p));
      },
    };

    // Promise
    const promise = new Promise<T>((res, rej) => {
      function resolve(v: T) {
        // set progress as 100% done
        updater.setRatio(1);
        res(v);
      }

      executor(resolve, updater, rej);
    });

    const { subscribe } = progress;
    return Object.assign(promise, { subscribe });
  }
}
