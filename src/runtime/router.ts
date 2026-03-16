import { effect } from "../reactive/effect.js";
import { value } from "../reactive/value.js";
import { h } from "./h.js";
import {
  createInstance,
  popInstance,
  pushInstance,
  type ComponentInstance,
} from "./instance.js";
import { onMount, unmountInstance } from "./lifecycle.js";

// aca guardamos como valor reactivo el current path para visar cuando cambia
export const currentPath = value(
  typeof window !== "undefined" ? window.location.pathname : "/",
);

// guardamos valor reactivo de current hash
export const currentHash = value(
  typeof window !== "undefined" ? window.location.hash.slice(1) : ""
);

// parámetros
export const currentParams = value<Record<string, string>>({});

// funcion para navegar en la spa
export function navigate(to: string) {
  const [path, hash] = to.split("#");
  const currentCleanPath = currentPath.get().split("#")[0];

  if (path === currentCleanPath) {
    window.history.pushState(null, "", to);
    currentHash.set(hash ?? "");
    if (hash) {
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      });
    }
    return;
  }

  currentPath.set(path);
  currentHash.set(hash ?? "");
  window.history.pushState(null, "", to);
  if (hash) {
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    });
  }
}

// eventlistener para saber cuando cambian de pagina con las flechitas
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    const [path] = window.location.pathname.split("#");
    currentPath.set(path);
    currentHash.set(window.location.hash.slice(1));
  });
}

export interface Route {
  path: string;
  component: () => HTMLElement;
  fallback?: () => HTMLElement;
}

export function RouterView({
  routes,
  fallback,
}: {
  routes: Route[];
  fallback?: () => HTMLElement;
}) {
  const anchor = document.createComment("moonie-router-anchor");
  let currentElement: HTMLElement | undefined;
  let currentChildInstance: ComponentInstance | undefined;

  function _mount(component: () => HTMLElement) {
    console.log("_mount called", component);
    const instance = createInstance();
    pushInstance(instance);
    currentElement = component();
    popInstance();
    currentChildInstance = instance;
    if (anchor.parentNode) {
      anchor.parentNode.insertBefore(currentElement, anchor);
      instance.mountedHooks.forEach((fn) => fn());
    }
  }

  function _mountRoute(route: Route) {
    _mount(route.component);
  }

  effect(() => {
    console.log("RouterView effect, path:", currentPath.get());
    // desmontar vista anterior
    if (currentElement) {
      currentElement.remove();
      currentElement = undefined;
    }
    if (currentChildInstance) {
      unmountInstance(currentChildInstance);
      currentChildInstance = undefined;
    }

    // limpiamos el hash antes de hacer match
    const cleanPath = currentPath.get().split("#")[0];

    let matchedParams: Record<string, string> = {};
    const route = routes.find((r) => {
      const params = matchRoute(r.path, cleanPath);
      if (params !== null) {
        matchedParams = params;
        return true;
      }
      return false;
    });

    if (route) {
      currentParams.set(matchedParams);
      _mountRoute(route);
    } else if (fallback) {
      currentParams.set({});
      _mount(fallback);
    }
  });

  onMount(() => {
    if (currentElement) {
      anchor.parentNode?.insertBefore(currentElement, anchor);
      currentChildInstance?.mountedHooks.forEach((fn) => fn());
    }
  });

  return anchor;
}

// hace match de un path con una ruta y extrae params
function matchRoute(
  routePath: string,
  actualPath: string,
): Record<string, string> | null {
  const routeParts = routePath.split("/");
  const actualParts = actualPath.split("/");

  if (routeParts.length !== actualParts.length) return null;

  const params: Record<string, string> = {};

  for (let i = 0; i < routeParts.length; i++) {
    if (routeParts[i].startsWith(":")) {
      params[routeParts[i].slice(1)] = actualParts[i];
    } else if (routeParts[i] !== actualParts[i]) {
      return null;
    }
  }

  return params;
}

export function useParams(): Record<string, string> {
  return currentParams.get();
}

/**
 * Wrapper de etiqueta anchor que previene la navegación nativa y la reemplaza por navigate.
 */
export function Link({
  to,
  children,
  ...props
}: {
  to: string;
  children: string;
  [key: string]: any;
}) {
  return h(
    "a",
    {
      ...props,
      href: to,
      onClick: (e: MouseEvent) => {
        e.preventDefault();
        navigate(to);
      },
    },
    children,
  );
}