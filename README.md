<div align="center">
  <img src="https://github.com/user-attachments/assets/546d96ca-32c3-4f12-a92a-3ceda3babd53">
</div>

# Moonie 🌙

Un micro-framework reactivo para la web. Sin Virtual DOM, sin magia negra — solo JavaScript corriendo directo en el DOM.

> No se recomienda probar en proyectos serios en producción ni nada.

## Existencia de Moonie
Era una prueba de concepto que quise desarrollar con fines educativos e investigativos. Quería entender cómo funcionaba esa "caja" negra en muchos frameworks reactivos como **React**, **Vue** y **Angular**, que muchos de nosotros utilizamos y asumimos que lo que ocurre atrás es magia.

También es una carta de amor a mi gata Moonie :)

## ¿Por qué Moonie?

La mayoría de los frameworks modernos traen un compilador, un runtime de 40kb, un diffing algorithm y tres capas de abstracción para hacer lo que el browser ya sabe hacer solo. Moonie apuesta por lo contrario: reactividad granular que toca exactamente lo que cambió, nada más.

## Instalación
npm:
```bash
npm install github:Alwexis/Moonie
```
pnpm:
```bash
pnpm add github:Alwexis/Moonie
```

## Lo que incluye

### Reactividad

**`value()`** — el átomo básico. Un contenedor reactivo para cualquier valor primitivo.
```ts
const count = value(0)
count.get()        // 0
count.set(1)       // notifica a todos los efectos que dependen de count
```

**`reactive()`** — igual que value pero para objetos. Usa Proxy internamente, así que cualquier propiedad que leas dentro de un effect se trackea automáticamente.
```ts
const user = reactive({ name: 'Luna', age: 25 })
user.name = 'Sol'  // reactivo
```

**`computed()`** — valores derivados. Se recalcula solo cuando sus dependencias cambian, y solo si alguien lo necesita (lazy).
```ts
const double = computed(() => count.get() * 2)
double.get()  // siempre fresco, nunca recalcula de más
```

**`effect()`** — ejecuta una función y la re-ejecuta cada vez que alguna de sus dependencias cambia.
```ts
effect(() => {
  console.log('el count es:', count.get())
})
```

**`watch()`** — como effect pero solo dispara cuando el valor *cambia*, no en la ejecución inicial. Te da el valor anterior y el nuevo.
```ts
watch(count, (newVal, oldVal) => {
  console.log(`cambió de ${oldVal} a ${newVal}`)
})
```

### Lifecycle
```ts
onMount(() => {
  // el componente ya está en el DOM
})

onUnmount(() => {
  // el componente fue removido, limpia tus listeners
})
```

### Router

Rutas declarativas con soporte para parámetros dinámicos.
```ts
const routes: Route[] = [
  { path: '/', component: Home },
  { path: '/pokemon/:id', component: PokemonDetail },
]
```
Montaje del Router.
```ts
mount("#app").router(routes);
```
Parámetros de rutas.
```ts
// dentro del componente
const params = useParams()
params.id  // el valor del parámetro
```
Navegación.
```ts
navigate('/pokemon/25')  // programmatic navigation
```

### Templates `.mn`

Moonie compila archivos `.mn` a llamadas `h()` en build time. La sintaxis es HTML con esteroides.
```html
<script>
import { value } from '@moonie/reactive/value'
const count = value(0)
</script>

<template>
  <div>
    <p>{{ count.get() }}</p>
    <button @click="count.set(count.get() + 1)">+1</button>
  </div>
</template>
```

**Directivas:**
```html
@if (user.get()) {
  <p>Hola {{ user.get().name }}</p>
} @else {
  <p>No hay usuario</p>
}
```
```html
@for (item of items.get(); key: item.id) {
  <div>{{ item.name }}</div>
} @empty {
  <p>Lista vacía</p>
}
```

**Binding reactivo:**
```html
<input :value="search.get()" @input="search.set($event.target.value)" />
<div :class="active.get() ? 'bg-blue-500' : 'bg-gray-200'"></div>
```

## Tamaño

El runtime completo pesa menos de 5kb gzipped.

## Estado

Experimental. La API puede cambiar. Úsalo bajo tu propio riesgo y disfrútalo.
