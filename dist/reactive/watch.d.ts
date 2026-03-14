import { type Effect } from "./effect.js";
export declare function watch<T>(source: () => T, callback: (newValue: T, oldValue: T) => void): Effect;
