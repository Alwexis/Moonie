import { effect } from "../reactive/effect.js";
import {
  createInstance,
  currentInstance,
  popInstance,
  pushInstance,
  type ComponentInstance,
} from "./instance.js";
import { unmountInstance, onMount } from "./lifecycle.js";

type MaybeArray = HTMLElement | HTMLElement[];

function toArray(result: MaybeArray): HTMLElement[] {
  return Array.isArray(result) ? result : [result];
}

export function If({
  when,
  then,
  otherwise,
}: {
  when: () => boolean;
  then: () => MaybeArray;
  otherwise?: () => MaybeArray;
}) {
  const anchor = document.createComment("moonie-if-anchor");
  let currentNodes: HTMLElement[] = [];
  let currentChildInstance: ComponentInstance | undefined;

  function _mountBranch(branch: () => MaybeArray) {
    const instance = createInstance();
    pushInstance(instance);
    const result = branch();
    popInstance();
    currentChildInstance = instance;
    instance.mountedHooks.forEach((fn) => fn());
    currentNodes = toArray(result);
    currentNodes.forEach((node) =>
      anchor.parentNode?.insertBefore(node, anchor),
    );
  }

  effect(() => {
    currentNodes.forEach((n) => n.remove());
    if (currentChildInstance) unmountInstance(currentChildInstance);
    currentNodes = [];
    currentChildInstance = undefined;

    if (when()) {
      _mountBranch(then);
    } else if (otherwise) {
      _mountBranch(otherwise);
    }
  });

  onMount(() => {
    currentNodes.forEach((node) =>
      anchor.parentNode?.insertBefore(node, anchor),
    );
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
  render: (item: T) => MaybeArray;
  key: (item: T, index: number) => string | number;
  empty?: () => MaybeArray;
}) {
  const anchor = document.createComment("moonie-for-anchor");
  let emptyNodes: HTMLElement[] = [];
  let emptyInstance: ComponentInstance | undefined;
  const _renderized: Map<
    string | number,
    { nodes: HTMLElement[]; instance: ComponentInstance }
  > = new Map();

  function _mountItem(item: T, index: number) {
    const k = key(item, index);
    const instance = createInstance();
    pushInstance(instance);
    const result = render(item);
    popInstance();
    const nodes = toArray(result);
    nodes.forEach((node) => anchor.parentNode?.insertBefore(node, anchor));
    _renderized.set(k, { nodes, instance });
    instance.mountedHooks.forEach((f) => f());
  }

  effect(() => {
    const list = typeof each === "function" ? each() : each;
    const _len = list.length;
    void _len;

    if (list.length === 0 && empty) {
      const instance = createInstance();
      pushInstance(instance);
      const result = empty();
      popInstance();
      emptyInstance = instance;
      emptyNodes = toArray(result);
      emptyNodes.forEach((node) =>
        anchor.parentNode?.insertBefore(node, anchor),
      );
      if (currentInstance) {
        instance.mountedHooks.forEach((fn) =>
          currentInstance?.mountedHooks.push(fn),
        );
      } else {
        instance.mountedHooks.forEach((fn) => fn());
      }
    } else {
      if (emptyInstance) {
        unmountInstance(emptyInstance);
        emptyInstance = undefined;
      }
      emptyNodes.forEach((n) => n.remove());
      emptyNodes = [];

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
        old?.nodes.forEach((n) => n.remove());
        if (old?.instance) unmountInstance(old.instance);
        _renderized.delete(k);
      });
    }
  });

  onMount(() => {
    _renderized.forEach(({ nodes }) => {
      nodes.forEach((node) => anchor.parentNode?.insertBefore(node, anchor));
    });
  });

  return anchor;
}