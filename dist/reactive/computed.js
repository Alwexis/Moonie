import { activeEffect, run } from "./effect";
/**
 * Computed en si mismo se comporta igual que el effect para que se inyecte como dependencia.
 * pero nuestro "fn" acá no llama al callback que usamos como parámeetro, sino que cambia la flag a true para que se recalcule
 * ¿Cómo se llama al get() automáticamente si no se referencia a si mismo como el effect?
 * La primera vez que se llama computed, siempre se recalcula. Por ende en ese preciso momento se inyecta como dependencia
 * y entrega un valor. Desde ese momento es un observador de lo que sea que le hayamos pasado.
 */
export function computed(fn) {
    let _dirty = true;
    let _value;
    let _deps = new Set(); // suscriptores del computed
    const self = {
        fn: () => {
            if (!_dirty) {
                _dirty = true;
                // notificar a los suscriptores del computed
                const depsToRun = new Set(_deps);
                _deps.clear();
                depsToRun.forEach((dep) => dep.fn());
            }
        },
        deps: new Set(),
    };
    return {
        get() {
            // registrar al efecto activo como suscriptor del computed
            if (activeEffect) {
                activeEffect.deps.add(_deps);
                _deps.add(activeEffect);
            }
            if (_dirty) {
                _value = run(fn, self);
                _dirty = false;
            }
            return _value;
        },
    };
}
