import { derived, writable, type Readable } from "svelte/store";

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

  static combined(...weightsAndProgresses: [number, Progress][]) {
    const weightsAndValues = weightsAndProgresses.map(([w, p]) => [w, p.value]);

    // infinite weights beat everything else
    const infiniteWeights = weightsAndValues.filter(([w, _]) => w === Infinity);
    if (infiniteWeights.length > 0) {
      const sum = infiniteWeights.reduce((s, [_, v]) => s + v, 0);
      return new Progress(sum / infiniteWeights.length);
    }

    const totalValue = weightsAndValues.reduce((s, [w, v]) => s + w * v, 0);
    const totalWeight = weightsAndValues.reduce((s, [w, _]) => s + w, 0);

    return new Progress(totalValue / totalWeight);
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
    const { tap, thenDo } = this;
    return Object.assign(promise, { subscribe, tap, thenDo });
  }

  tap(listener: (value: T) => void): this {
    this.then(listener);
    return this;
  }

  thenDo<S>(
    weight: number,
    onresolved: (value: T) => PromiseWithProgress<S>
  ): PromiseWithProgress<S> {
    throw new Error("Not implemented yet"); // TODO
  }

  static fromValue<T>(value: T): PromiseWithProgress<T> {
    return new PromiseWithProgress((res) => res(value));
  }

  static fromPromiseAndProgress<T>(
    promise: Promise<T>,
    progress: Readable<Progress>
  ): PromiseWithProgress<T> {
    return new PromiseWithProgress((res, { setRatio }, rej) => {
      progress.subscribe(({ ratio }) => setRatio(ratio));
      promise.then(res);
      promise.catch(rej);
    });
  }

  static all<T>(
    ...weightsAndPromises: readonly [number, PromiseWithProgress<T>][]
  ): PromiseWithProgress<T[]> {
    const ps = weightsAndPromises.map(([_, p]) => p);
    const ws = weightsAndPromises.map(([w, _]) => w);

    const recombine = (vs: Progress[]): [number, Progress][] =>
      vs.map((v, i) => [ws[i], v]);

    const combinedPromise = Promise.all(ps);
    const combinedProgress = derived(ps, (vs) =>
      Progress.combined(...recombine(vs))
    );

    return PromiseWithProgress.fromPromiseAndProgress(
      combinedPromise,
      combinedProgress
    );
  }
}
