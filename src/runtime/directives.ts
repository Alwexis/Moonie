import { effect } from "../reactive/effect";
import {
  createInstance,
  currentInstance,
  popInstance,
  pushInstance,
  type ComponentInstance,
} from "./instance";
import { unmountInstance, onMount } from "./lifecycle";

export function If({
  when,
  then,
  otherwise,
}: {
  when: () => boolean;
  then: () => HTMLElement;
  otherwise?: () => HTMLElement;
}) {
  const anchor = document.createComment("moonie-if-anchor");
  let currentElement: HTMLElement | undefined;
  let currentChildInstance: ComponentInstance | undefined;

  function _mountBranch(branch: () => HTMLElement) {
    const instance = createInstance();
    pushInstance(instance);
    currentElement = branch();
    popInstance();
    currentChildInstance = instance;
    instance.mountedHooks.forEach((fn) => fn());
    anchor.parentNode?.insertBefore(currentElement, anchor);
  }

  effect(() => {
    currentElement?.remove(); // matamos el elemento renderizado actualmente
    if (currentChildInstance) unmountInstance(currentChildInstance); // si tiene instancia la desmontamos
    currentElement = undefined;
    currentChildInstance = undefined;

    if (when()) {
      _mountBranch(then);
    } else if (otherwise) {
      _mountBranch(otherwise);
    }
  });

  onMount(() => {
    if (currentElement) {
      anchor.parentNode?.insertBefore(currentElement, anchor);
    }
  });

  return anchor;
}

export function For<T>({
  each,
  render,
  key,
  empty,
}: {
  each: T[] | (() => T[]);
  render: (item: T) => HTMLElement;
  key: (item: T, index: number) => string | number;
  empty?: () => HTMLElement;
}) {
  const anchor = document.createComment("moonie-for-anchor");
  let emptyNode: HTMLElement | undefined; // para poder eliminar el empty
  let emptyInstance: ComponentInstance | undefined; // para poder desmontar empty
  // componentes que están siendo renderizados actualmente
  const _renderized: Map<
    string | number,
    { node: HTMLElement; instance: ComponentInstance }
  > = new Map();

  function _mountItem(item: T, index: number) {
    const k = key(item, index);
    const instance = createInstance();
    pushInstance(instance);
    const node = render(item);
    popInstance();
    anchor.parentNode?.insertBefore(node, anchor);
    _renderized.set(k, { node, instance });
    instance.mountedHooks.forEach((f) => f());
  }

  effect(() => {
    const list = typeof each === "function" ? each() : each;
    const _len = list.length; // fuerza tracking de length
    void _len;

    if (list.length === 0 && empty) {
      // aca montamos la instancia de empty, no sin antes desmontar la de las instancia anterior.
      const instance = createInstance();
      pushInstance(instance);
      emptyNode = empty();
      popInstance();
      emptyInstance = instance;
      anchor.parentNode?.insertBefore(emptyNode, anchor);
      if (currentInstance) {
        instance.mountedHooks.forEach((fn) =>
          currentInstance?.mountedHooks.push(fn),
        );
      } else {
        instance.mountedHooks.forEach((fn) => fn());
      }
    } else {
      // desmontamos la instancia y matamos el elemento empty si es que existen
      if (emptyInstance) {
        unmountInstance(emptyInstance);
        emptyInstance = undefined;
      }
      if (emptyNode) {
        emptyNode.remove();
        emptyNode = undefined;
      }

      // hacemos la reconciliacion de elementos
      const previousKeys = new Set(_renderized.keys());

      list.forEach((item, index) => {
        const k = key(item, index);
        if (_renderized.has(k)) {
          previousKeys.delete(k);
        } else {
          _mountItem(item, index);
        }
      });

      previousKeys.forEach((k) => {
        const old = _renderized.get(k);
        old?.node.remove();
        if (old?.instance) unmountInstance(old.instance);
        _renderized.delete(k);
      });
    }
  });

  onMount(() => {
    _renderized.forEach(({ node }) => {
      anchor.parentNode?.insertBefore(node, anchor);
    });
  });

  return anchor;
}
