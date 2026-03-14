// un stack para manejar instancias de componentes anidados y variable global para instancia actual
const instanceStack = [];
export let currentInstance = null;
// crea una nueva instancia vacía.
export function createInstance() {
    const instance = {
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
export function pushInstance(instance) {
    instanceStack.push(instance);
    currentInstance = instance;
}
// elimina la instancia actual del stack y actualiza la instancia actual a la anterior en el stack.
export function popInstance() {
    instanceStack.pop();
    currentInstance = instanceStack[instanceStack.length - 1] || null;
}
