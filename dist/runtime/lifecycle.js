import { createInstance, currentInstance, popInstance, pushInstance, } from "./instance";
/**
 * se ejecuta cuando un componente se monta, se almacenan los efectos en el currentInstance para ejecutarse luego.
 */
export function onMount(fn) {
    currentInstance?.mountedHooks.push(fn);
}
/**
 * se ejecuta cuando un componente se desmonta, se almacenan los efectos en el currentInstance para ejecutarse luego.
 */
export function onUnmount(fn) {
    currentInstance?.unmountedHooks.push(fn);
}
/**
 * Monta el componente inicial en el DOM y ejecuta los hooks de montaje. Devuelve funcion para desmontar componente y ejecutar unmounts
 */
export function mount(selector, component) {
    const root = document.querySelector(selector);
    const instance = createInstance();
    pushInstance(instance);
    const node = component();
    popInstance();
    root?.appendChild(node);
    instance.mountedHooks.forEach((fn) => fn());
    return () => {
        node.remove();
        unmountInstance(instance);
    };
}
/**
 * desmonta un componente y ejecuta los hooks de desmontaje. Se llama recursivamente para desmontar componentes hijos.
 */
export function unmountInstance(instance) {
    instance.children?.forEach(unmountInstance);
    instance.unmountedHooks.forEach((fn) => fn());
}
