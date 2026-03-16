import { effect } from "../reactive/effect.js";
import { createInstance, currentInstance, popInstance, pushInstance, } from "./instance.js";
// esto es porque los svg tienen propiedades distintas y son case sensitive (usan XML)
const SVG_TAGS = new Set(['svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'g', 'defs', 'use', 'symbol', 'clipPath', 'mask', 'text', 'tspan', 'linearGradient', 'radialGradient', 'stop', 'filter', 'feBlend', 'pattern', 'marker', 'image', 'foreignObject']);
export function h(tag, props, children) {
    if (typeof tag === "function") {
        const instance = createInstance();
        pushInstance(instance);
        const node = tag({ children, ...(props ?? {}) });
        popInstance();
        if (currentInstance) {
            instance.mountedHooks.forEach((fn) => currentInstance?.mountedHooks.push(fn));
        }
        else {
            instance.mountedHooks.forEach((fn) => fn());
        }
        return node;
    }
    // extraemos el ref antes de aplicar props para no pasarlo al DOM
    const refObject = props?.ref ?? null;
    const cleanProps = props
        ? Object.fromEntries(Object.entries(props).filter(([key]) => key !== "ref"))
        : {};
    const isSvg = SVG_TAGS.has(tag);
    const element = isSvg
        ? document.createElementNS("http://www.w3.org/2000/svg", tag)
        : document.createElement(tag);
    if (Object.keys(cleanProps).length > 0) {
        applyProps(element, cleanProps, isSvg);
    }
    if (children) {
        mountChild(element, children);
    }
    // asignamos el elemento al ref dps de crearlo
    if (refObject) {
        refObject.el = element;
    }
    return element;
}
function applyProps(element, props, isSvg = false) {
    for (const [prop, value] of Object.entries(props)) {
        applyProp(element, prop, value, isSvg);
    }
}
function applyProp(element, prop, value, isSvg = false) {
    if (prop.startsWith("on")) {
        const eventName = prop.slice(2).toLowerCase();
        element.addEventListener(eventName, value);
    }
    else if (prop === "style") {
        if (typeof value === "string") {
            element.setAttribute("style", value);
        }
        else if (typeof value === "object") {
            Object.assign(element.style, value);
        }
        else if (typeof value === "function") {
            effect(() => {
                const v = value();
                if (typeof v === "string") {
                    element.setAttribute("style", v);
                }
                else {
                    Object.assign(element.style, v);
                }
            });
        }
    }
    else {
        if (typeof value === "function") {
            if (!isSvg && prop in element) {
                effect(() => {
                    element[prop] = value();
                });
            }
            else {
                effect(() => {
                    element.setAttribute(prop, value());
                });
            }
        }
        else {
            if (!isSvg && prop in element) {
                element[prop] = value;
            }
            else {
                element.setAttribute(prop, String(value));
            }
        }
    }
}
function mountChild(element, child) {
    if (typeof child === "string") {
        element.append(document.createTextNode(child));
    }
    else if (typeof child === "function") {
        const result = child();
        let resultElement;
        if (typeof result === "string" || typeof result === "number") {
            resultElement = document.createTextNode("");
            effect(() => {
                resultElement.textContent = String(child());
            });
        }
        else if (result instanceof Node) {
            resultElement = result;
        }
        else {
            return;
        }
        element.appendChild(resultElement);
    }
    else if (child instanceof Node) {
        element.appendChild(child);
    }
    else if (Array.isArray(child)) {
        child.filter(Boolean).forEach((c) => mountChild(element, c));
    }
}
