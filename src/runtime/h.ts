import { effect } from "../reactive/effect.js";
import {
  createInstance,
  currentInstance,
  popInstance,
  pushInstance,
} from "./instance.js";

type Child = string | Node | (() => string | Node) | Child[];

// esto es porque los svg tienen propiedades distintas y son case sensitive (usan XML)
const SVG_TAGS = new Set(['svg','path','circle','rect','line','polyline','polygon','ellipse','g','defs','use','symbol','clipPath','mask','text','tspan','linearGradient','radialGradient','stop','filter','feBlend','pattern','marker','image','foreignObject']);

export function h(
  tag: string | Function,
  props?: Record<string, any>,
  children?: Child,
) {
  if (typeof tag === "function") {
    const instance = createInstance();
    pushInstance(instance);
    const resolvedProps: Record<string, any> = {};
    for (const [key, value] of Object.entries(props ?? {})) {
      if (typeof value === "function" && value.__reactive) {
        Object.defineProperty(resolvedProps, key, {
          get: () => value(),
          enumerable: true,
        });
      } else {
        resolvedProps[key] = value;
      }
    }
    const node = tag({ children, ...resolvedProps });
    popInstance();
    if (currentInstance) {
      instance.mountedHooks.forEach((fn) =>
        currentInstance?.mountedHooks.push(fn),
      );
    } else {
      instance.mountedHooks.forEach((fn) => fn());
    }
    return node;
  }

  const isSvg = SVG_TAGS.has(tag);
  const element = isSvg
  ? document.createElementNS('http://www.w3.org/2000/svg', tag) as unknown as HTMLElement
  : document.createElement(tag);

  if (props) {
    applyProps(element, props, isSvg);
  }
  if (children) {
    mountChild(element, children);
  }

  return element;
}

function applyProps(element: HTMLElement, props: Record<string, any>, isSvg = false) {
  for (const [prop, value] of Object.entries(props)) {
    applyProp(element, prop, value, isSvg);
  }
}

function applyProp(element: HTMLElement, prop: string, value: any, isSvg = false) {
  if (prop.startsWith("on")) {
    const eventName = prop.slice(2).toLowerCase();
    element.addEventListener(eventName, value);
  } else if (prop === "style") {
    if (typeof value === "string") {
      element.setAttribute("style", value);
    } else if (typeof value === "object") {
      Object.assign(element.style, value);
    } else if (typeof value === "function") {
      effect(() => {
        const v = value();
        if (typeof v === "string") {
          element.setAttribute("style", v);
        } else {
          Object.assign(element.style, v);
        }
      });
    }
  } else {
    if (typeof value === "function") {
      if (!isSvg && prop in element) {
        effect(() => { (element as any)[prop] = value(); });
      } else {
        effect(() => { element.setAttribute(prop, value()); });
      }
    } else {
      if (!isSvg && prop in element) {
        (element as any)[prop] = value;
      } else {
        element.setAttribute(prop, String(value));
      }
    }
  }
}

function mountChild(element: HTMLElement, child: Child) {
  if (typeof child === "string") {
    element.append(document.createTextNode(child));
  } else if (typeof child === "function") {
    const result = child();
    let resultElement: any;
    if (typeof result === "string" || typeof result === "number") {
      resultElement = document.createTextNode("");
      effect(() => {
        resultElement.textContent = String(child());
      });
    } else if (result instanceof Node) {
      resultElement = result;
    } else {
      return;
    }
    element.appendChild(resultElement);
  } else if (child instanceof Node) {
    element.appendChild(child);
  } else if (Array.isArray(child)) {
    (child as any[]).filter(Boolean).forEach((c) => mountChild(element, c));
  }
}
