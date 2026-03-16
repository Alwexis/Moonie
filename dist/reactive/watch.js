import { run, untrack } from "./effect.js";
import { getCurrentInstance } from "../runtime/instance.js";
export function watch(source, callback) {
    let _value;
    const self = {
        fn: () => {
            const oldValue = _value;
            _value = run(source, self); // llamamos al source nuevamente para obtener el valor y seguir suscritos como dependencia
            if (!Object.is(oldValue, _value)) {
                // comparamos y si son distintos llamamos al callback.
                untrack(() => callback(_value, oldValue));
            }
        },
        deps: new Set(),
    };
    _value = run(source, self); // Registramos dependencias y guardamos el valor por primera vez. No existe oldValue aún.
    const instance = getCurrentInstance();
    if (instance) {
        instance.effects.push(self); // para limpiar efecto cuando el componente sed emsonte
    }
    return self;
}
