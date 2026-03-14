// es la interfaz de ubna instancia de componente. Tiene mountedHooks y unmounted hooks para almacenar efectos que se ejecutan en su lifecycle
export interface ComponentInstance {
  mountedHooks: Function[];
  unmountedHooks: Function[];
  children: ComponentInstance[];
}

// un stack para manejar instancias de componentes anidados y variable global para instancia actual
const instanceStack: ComponentInstance[] = [];
export let currentInstance: ComponentInstance | null = null;

// crea una nueva instancia vacía.
export function createInstance() {
  const instance: ComponentInstance = {
    mountedHooks: [],
    unmountedHooks: [],
    children: [],
  };
  if (currentInstance) {
    currentInstance.children?.push(instance);
  }
  return instance;
}

// agrega una instancia al stack y la agrega como instancia actual.
export function pushInstance(instance: ComponentInstance) {
  instanceStack.push(instance);
  currentInstance = instance;
}

// elimina la instancia actual del stack y actualiza la instancia actual a la anterior en el stack.
export function popInstance() {
  instanceStack.pop();
  currentInstance = instanceStack[instanceStack.length - 1] || null;
}
