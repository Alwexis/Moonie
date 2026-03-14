/**
 * Effect contiene "fn" (funcion) que es la que se usa como callback cuando se instancia (el effect)
 * tambien tiene "deps" que es un Set de dependencias. Las que él depende de.
 */
export type Effect = {
    fn: Function;
    deps: any;
};
export declare let activeEffect: Effect | null;
export declare function setActiveEffect(effect: any): void;
export declare function effect(eff: () => void): Effect;
export declare function run<T>(fn: () => T, eff: Effect): T;
