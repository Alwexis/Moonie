export interface ComponentInstance {
    mountedHooks: Function[];
    unmountedHooks: Function[];
    children: ComponentInstance[];
}
export declare let currentInstance: ComponentInstance | null;
export declare function createInstance(): ComponentInstance;
export declare function pushInstance(instance: ComponentInstance): void;
export declare function popInstance(): void;
