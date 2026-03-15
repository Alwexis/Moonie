export function ref<T extends HTMLElement = HTMLElement>() {
  return { el: null as T | null };
}
