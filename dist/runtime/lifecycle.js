import { h } from "./h.js";
import { createInstance, currentInstance, popInstance, pushInstance, } from "./instance.js";
import { RouterView } from "./router.js";
/**
 * se ejecuta cuando un componente se monta, se almacenan los efectos en el currentInstance para ejecutarse luego.
 */
export function onMount(fn) {
    if (!currentInstance)
        return;
    const instance = currentInstance;
    instance.mountedHooks.push(async () => {
        const cleanup = await fn();
        if (typeof cleanup === "function") {
            instance.unmountedHooks.push(cleanup);
        }
    });
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
    if (!root)
        throw new Error(`No se encontró el elemento con selector "${selector}"`);
    if (component) {
        const instance = createInstance();
        pushInstance(instance);
        const node = component();
        popInstance();
        root.appendChild(node);
        instance.mountedHooks.forEach((fn) => fn());
        return;
    }
    return {
        router(routes) {
            function App() {
                return h(RouterView, { routes });
            }
            const instance = createInstance();
            pushInstance(instance);
            const node = App();
            popInstance();
            root.appendChild(node);
            instance.mountedHooks.forEach((fn) => fn());
        },
    };
}
/**
 * desmonta un componente y ejecuta los hooks de desmontaje. Se llama recursivamente para desmontar componentes hijos.
 */
export function unmountInstance(instance) {
    instance.children?.forEach(unmountInstance);
    instance.unmountedHooks.forEach((fn) => fn());
}
