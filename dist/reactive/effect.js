import { getCurrentInstance } from "../runtime/instance.js";
// activeEffect es importante para la reactividad. Lo necesitamos para ejecutar y eliminar dependencias.
export let activeEffect = null;
// necesario para exponerlo a modfiicaciones desde fuera del archivo
export function setActiveEffect(effect) {
    activeEffect = effect;
}
export function effect(eff) {
    const deps = new Set(); // acá se guarda de quién depende el effect
    const self = {
        // aqui creamos una instancia de effect que encapsula eff en fn y hace todo lo que dije arriba.
        fn: () => {
            deps.forEach((d) => d.delete(self));
            deps.clear();
            run(eff, self);
        },
        deps,
    };
    self.fn(); // acá llamamos por primera vez fn
    const instance = getCurrentInstance();
    if (instance) {
        instance.effects.push(self);
    }
    return self;
}
export function run(fn, eff) {
    const previous = activeEffect;
    setActiveEffect(eff);
    const result = fn();
    setActiveEffect(previous); // ← restaura el efecto anterior
    return result;
}
// untrack
export function untrack(fn) {
    const previous = activeEffect;
    activeEffect = null;
    const result = fn();
    activeEffect = previous;
    return result;
}
