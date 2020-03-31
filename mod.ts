/* EE-TS Types for mapping interface of functions */

type In<T> = T extends (...args: infer U) => any ? U : [];
type Out<T> = T extends (...args: any[]) => infer U ? U : never;

type Filter<T, Cond, U extends keyof T = keyof T> = {
  [K in U]: T[K] extends Cond ? K : never;
}[U];

type EventKey<T> = Filter<T, (...args: any[]) => any> & string;

type EventIn<T, K extends EventKey<T>> = In<T[K]>;
type EventOut<T, K extends EventKey<T>> = Out<T[K]> | void;

type Listener<T, K extends EventKey<T> = EventKey<T>> = (
  ...args: EventIn<T, K>
) => EventOut<T, K>;

interface IListener<T, K extends EventKey<T> = EventKey<T>> {
  fn: Listener<T, K>;
  once: boolean;
}

export class EventEmitter<T> {
  private listeners: { [K in EventKey<T>]?: IListener<T, K>[] } = {};
  public on<K extends EventKey<T>>(key: K, fn: Listener<T, K>): this;
  public on(arg: EventKey<T>, fn: Listener<T>): this {
    if (this.listeners[arg] === undefined) {
      this.listeners[arg] = [];
    }
    const listeners = this.listeners[arg];
    if (listeners !== undefined) {
      listeners.push({
        fn,
        once: false,
      });
    }
    return this;
  }
  public once<K extends EventKey<T>>(key: K, fn: Listener<T, K>): this;
  public once(arg: EventKey<T>, fn: Listener<T>): this {
    if (this.listeners[arg] === undefined) {
      this.listeners[arg] = [];
    }
    const listeners = this.listeners[arg];
    if (listeners !== undefined) {
      listeners.push({
        fn,
        once: true,
      });
    }
    return this;
  }
  public emit<K extends EventKey<T>>(
    key: K,
    ...args: EventIn<T, K>
  ): EventOut<T, K>;
  public emit<K extends EventKey<T>>(key: K, ...args: EventIn<T, K>): any {
    let result;
    let gen = this.getListeners(key);
    while (true) {
      let { value: listener, done } = gen.next();
      if (done) {
        return result;
      } else {
        let generated = listener(...args);
        if (generated !== undefined) {
          result = generated;
        }
      }
    }
  }
  public removeListener<K extends EventKey<T>>(
    key: K,
    listener: Listener<T, K>,
  ): boolean {
    const list = this.listeners[key];
    if (list === undefined) return false;
    let splice = -1;
    list.some((val, i) => {
      if (val.fn.toString() === listener.toString()) {
        splice = i;
        return true;
      }
    });
    if (splice === -1) return false;
    list.splice(splice, 1);
    return true;
  }
  public removeListeners<K extends EventKey<T>>(key: K): boolean {
    const list = this.listeners[key];
    if (list === undefined) return false;
    delete this.listeners[key];
    return true;
  }
  public removeAllListeners(): void {
    this.listeners = {};
  }
  *getListeners<K extends EventKey<T>>(
    key: K,
  ): IterableIterator<Listener<T, K>> {
    const list = this.listeners[key];
    if (list === undefined) return;
    for (let i = 0; i < list.length; i++) {
      const listener = list[i];
      yield listener.fn;
    }
    this.listeners[key] = list.filter((listener) => !listener.once);
  }
}

export default EventEmitter;
