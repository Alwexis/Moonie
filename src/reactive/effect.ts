/**
 * Effect contiene "fn" (funcion) que es la que se usa como callback cuando se instancia (el effect)
 * tambien tiene "deps" que es un Set de dependencias. Las que él depende de.
 */
export type Effect = { fn: Function; deps: any };
// activeEffect es importante para la reactividad. Lo necesitamos para ejecutar y eliminar dependencias.
export let activeEffect: Effect | null = null;

// necesario para exponerlo a modfiicaciones desde fuera del archivo
export function setActiveEffect(effect: any) {
  activeEffect = effect;
}

export function effect(eff: () => void): Effect {
  const deps = new Set(); // acá se guarda de quién depende el effect
  const self: Effect = {
    // aqui creamos una instancia de effect que encapsula eff en fn y hace todo lo que dije arriba.
    fn: () => {
      deps.forEach((d: any) => d.delete(self));
      deps.clear();
      run(eff, self);
    },
    deps,
  };

  self.fn(); // acá llamamos por primera vez fn
  return self; // retornamos
}

export function run<T>(fn: () => T, eff: Effect): T {
  const previous = activeEffect;
  setActiveEffect(eff);
  const result = fn();
  setActiveEffect(previous); // ← restaura el efecto anterior
  return result;
}
