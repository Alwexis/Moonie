import { run, type Effect } from "./effect";

export function watch<T>(
  source: () => T,
  callback: (newValue: T, oldValue: T) => void,
) {
  let _value: T;
  const self: Effect = {
    fn: () => {
      const oldValue = _value;
      _value = run(source, self); // llamamos al source nuevamente para obtener el valor y seguir suscritos como dependencia
      if (!Object.is(oldValue, _value)) {
        // comparamos y si son distintos llamamos al callback.
        callback(_value, oldValue!);
      }
    },
    deps: new Set(),
  };
  _value = run(source, self); // Registramos dependencias y guardamos el valor por primera vez. No existe oldValue aún.

  return self;
}
