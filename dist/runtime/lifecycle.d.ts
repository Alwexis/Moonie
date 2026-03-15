import { type ComponentInstance } from "./instance.js";
import { Route } from "./router.js";
/**
 * se ejecuta cuando un componente se monta, se almacenan los efectos en el currentInstance para ejecutarse luego.
 */
export declare function onMount(fn: Function): void;
/**
 * se ejecuta cuando un componente se desmonta, se almacenan los efectos en el currentInstance para ejecutarse luego.
 */
export declare function onUnmount(fn: Function): void;
/**
 * Monta el componente inicial en el DOM y ejecuta los hooks de montaje. Devuelve funcion para desmontar componente y ejecutar unmounts
 */
export declare function mount(selector: string, component?: () => HTMLElement): {
    router(routes: Route[]): void;
} | undefined;
/**
 * desmonta un componente y ejecuta los hooks de desmontaje. Se llama recursivamente para desmontar componentes hijos.
 */
export declare function unmountInstance(instance: ComponentInstance): void;
