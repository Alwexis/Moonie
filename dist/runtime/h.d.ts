type Child = string | Node | (() => string | Node) | Child[];
export declare function h(tag: string | Function, props?: Record<string, any>, children?: Child): any;
export {};
