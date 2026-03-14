import { effect } from "../reactive/effect.js";
import { value } from "../reactive/value.js";
import { h } from "./h.js";
import { createInstance, popInstance, pushInstance, } from "./instance.js";
import { onMount, unmountInstance } from "./lifecycle.js";
// aca guardamos como valor reactivo el current path para visar cuando cambia
export const currentPath = value(window.location.pathname);
// parámetros
export const currentParams = value({});
// funcion para navegar en la spa
export function navigate(to) {
    currentPath.set(to);
    window.history.pushState(null, "", to);
}
// eventlistener para saber cuando cambian de pagian con las flechitas
window.addEventListener("popstate", () => {
    currentPath.set(window.location.pathname);
});
export function RouterView({ routes, fallback, }) {
    const anchor = document.createComment("moonie-router-anchor");
    let currentElement;
    let currentChildInstance;
    function _mount(component) {
        const instance = createInstance();
        pushInstance(instance);
        currentElement = component();
        popInstance();
        currentChildInstance = instance;
        instance.mountedHooks.forEach((fn) => fn());
        anchor.parentNode?.insertBefore(currentElement, anchor);
    }
    function _mountRoute(route) {
        _mount(route.component);
    }
    effect(() => {
        // desmontar vista anterior
        if (currentElement) {
            currentElement.remove();
            currentElement = undefined;
        }
        if (currentChildInstance) {
            unmountInstance(currentChildInstance);
            currentChildInstance = undefined;
        }
        let matchedParams = {};
        const route = routes.find((r) => {
            const params = matchRoute(r.path, currentPath.get());
            if (params !== null) {
                matchedParams = params;
                return true;
            }
            return false;
        });
        if (route) {
            currentParams.set(matchedParams);
            _mountRoute(route);
        }
        else if (fallback) {
            currentParams.set({});
            _mount(fallback);
        }
    });
    onMount(() => {
        if (currentElement) {
            anchor.parentNode?.insertBefore(currentElement, anchor);
        }
    });
    return anchor;
}
// hace match de un path con una ruta y extre params
function matchRoute(routePath, actualPath) {
    const routeParts = routePath.split("/");
    const actualParts = actualPath.split("/");
    if (routeParts.length !== actualParts.length)
        return null;
    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(":")) {
            params[routeParts[i].slice(1)] = actualParts[i];
        }
        else if (routeParts[i] !== actualParts[i]) {
            return null;
        }
    }
    return params;
}
export function useParams() {
    return currentParams.get();
}
/**
 * Wraper de etiqueta anchor (la a) que previene la navegación nativa del elemento y la reemplaza por navigate.
 */
export function Link({ to, children, ...props }) {
    return h("a", {
        ...props,
        href: to,
        onClick: (e) => {
            e.preventDefault();
            navigate(to);
        },
    }, children);
}
