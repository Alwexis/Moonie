import { activeEffect, type Effect } from "./effect.js";

// el reactive tree es el graph que guarda dependencias entre objetos propiedades y efectos. Es un WeakMap porque no queremos que los objetos reactivos sean retenidos en memoria si ya no se usan.
type TReactiveTree = WeakMap<object, Map<PropertyKey, Set<Effect>>>;
const reactiveTree: TReactiveTree = new WeakMap();

export function reactive<T extends object>(
  obj: T,
): T & { set: (newValue: Partial<T>) => void } {
  // el proxy es un Objeto que nos permite hacerle una especie de override a los getter y setters de los objetos normales
  // y podemos modificar su comportamiento, como abajo.
  const proxy = new Proxy(obj, {
    get(target, key) {
      // metodo interno para reemplazar el objeto completo de una sola vez.
      // borra todas las keys actuales, asigna las nuevas y dispara todos los efectos.
      if (key === "set") {
        return (newValue: Partial<T>) => {
          // borra keys actuales del objeto raw
          Object.keys(target).forEach((k) => {
            delete (target as any)[k];
          });
          // asigna los nuevos valores y dispara todos los efectos registrados
          Object.assign(target, newValue);
          const depsMap = reactiveTree.get(target);
          if (depsMap) {
            depsMap.forEach((deps) => {
              const copy = new Set(deps);
              copy.forEach((dep) => dep.fn());
            });
          }
        };
      }

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
      } else {
        rawDeps = depsMap?.get(key);
      }

      if (!rawDeps) {
        Reflect.set(target, key, value, receiver);
        return true;
      }

      const oldValue = Reflect.get(target, key, receiver);
      if (oldValue === value) return true;
      const deps = new Set(rawDeps);
      Reflect.set(target, key, value, receiver);
      deps.forEach((dep) => dep.fn());
      return true;
    },
  });

  return proxy as T & { set: (newValue: Partial<T>) => void };
}