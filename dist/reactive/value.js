import { activeEffect } from "./effect";
// Es importante dejarlo genérico para no depender de any y tmb sea type safe
export function value(initialValue) {
    let _value = initialValue;
    let _deps = new Set(); // este es el array de dependencias. De efectos o <cosas> qeu dependan de este valor.
    const self = {
        get() {
            if (activeEffect) {
                // si es que hay un efecto activo, se almacena en las dependencias del efecto y del valor. Es bi direccionañ
                activeEffect.deps.add(_deps); // esto antes era un add de la dependenciaS del effect, ahora es un add del set entero.
                _deps.add(activeEffect);
            }
            return _value; // retornamos valor
        },
        set(newValue) {
            _value = newValue;
            const depsToRun = new Set(_deps); // acá clonamos las dependencias para despues ejecutarlas y no caer en un bucle.
            _deps.clear();
            depsToRun.forEach((dep) => dep.fn()); // acá aplicamos la "reactividad"
        },
    };
    return self;
}
