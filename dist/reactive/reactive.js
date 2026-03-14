import { activeEffect } from "./effect";
const reactiveTree = new WeakMap();
export function reactive(obj) {
    // el proxy es un Objeto que nos permite hacerle una especie de override a los getter y setters de los objetos normales
    // y podemos modificar su comportamiento, como abajo.
    return new Proxy(obj, {
        get(target, key) {
            /**
             * lo que se hace acá es primero revisar si existe la dependencia en el reactive tree. Si no existe, se crea.
             * Lo mismo con la dependencia del efecto.
             */
            let depsMap = reactiveTree.get(target);
            if (!depsMap) {
                depsMap = new Map();
                reactiveTree.set(target, depsMap);
            }
            let dep = depsMap.get(key);
            if (!dep) {
                dep = new Set();
                depsMap.set(key, dep);
            }
            /**
             * Misma logica que en value() si hay efecto activo, creamos la dependencia bi direccional
             */
            if (activeEffect) {
                activeEffect.deps.add(dep);
                dep.add(activeEffect);
            }
            // aca accedemos al value con Reflect para no matar el Proxy y en caso de que sea un object, lo envolemos en otro proxy para hacerlo reactivo.
            const value = Reflect.get(target, key);
            if (value !== null && typeof value === "object") {
                return reactive(value);
            }
            return value;
        },
        set(target, key, value, receiver) {
            let rawDeps;
            const depsMap = reactiveTree.get(target);
            if (Array.isArray(target) && (key === "length" || !isNaN(Number(key)))) {
                rawDeps = depsMap?.get("length");
            }
            else {
                rawDeps = depsMap?.get(key);
            }
            if (!rawDeps) {
                Reflect.set(target, key, value, receiver);
                return true;
            }
            const oldValue = Reflect.get(target, key, receiver);
            if (oldValue === value)
                return true;
            const deps = new Set(rawDeps);
            Reflect.set(target, key, value, receiver);
            deps.forEach((dep) => dep.fn());
            return true;
        },
    });
}
