import { Effect } from "../reactive/effect.js";
export interface ComponentInstance {
    mountedHooks: Function[];
    unmountedHooks: Function[];
    children: ComponentInstance[];
    effects: Effect[];
}
export declare let currentInstance: ComponentInstance | null;
export declare function createInstance(): ComponentInstance;
export declare function pushInstance(instance: ComponentInstance): void;
export declare function popInstance(): void;
export declare function getCurrentInstance(): ComponentInstance | null;
