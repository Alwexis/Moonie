import { effect } from "../reactive/effect.js";
import { createInstance, currentInstance, popInstance, pushInstance, } from "./instance.js";
export function h(tag, props, children) {
    if (typeof tag === "function") {
        const instance = createInstance();
        pushInstance(instance);
        const resolvedProps = {};
        for (const [key, value] of Object.entries(props ?? {})) {
            if (typeof value === "function" && value.__reactive) {
                Object.defineProperty(resolvedProps, key, {
                    get: () => value(),
                    enumerable: true,
                });
            }
            else {
                resolvedProps[key] = value;
            }
        }
        const node = tag({ children, ...resolvedProps });
        popInstance();
        if (currentInstance) {
            instance.mountedHooks.forEach((fn) => currentInstance?.mountedHooks.push(fn));
        }
        else {
            instance.mountedHooks.forEach((fn) => fn());
        }
        return node;
    }
    const element = document.createElement(tag);
    if (props) {
        applyProps(element, props);
    }
    if (children) {
        mountChild(element, children);
    }
    return element;
}
function applyProps(element, props) {
    for (const [prop, value] of Object.entries(props)) {
        applyProp(element, prop, value);
    }
}
function applyProp(element, prop, value) {
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
            if (prop in HTMLElement) {
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
            if (prop in HTMLElement) {
                element[prop] = value;
            }
            else {
                element.setAttribute(prop, value);
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
