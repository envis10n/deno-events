import { EventEmitter } from "../mod.ts";

interface IExampleEvents {
  event(arg: string): void;
  eventTwo(arg: number, arg2: string): void;
}

const emitter: EventEmitter<IExampleEvents> = new EventEmitter();

// Event name and function type will be inferred
emitter.on("event", (arg) => {
  // Do something here
});

emitter.on("eventTwo", (arg, arg2) => {
  // Do something here
});
