export const interpolationExample = `\
<script>
import { value, reactive } from "moonie";

const name = value("Luna");
const product = reactive({ price: 10, quantity: 2 });
</script>

<template>
  <p>Hola, {{ name.get() }}!</p>
  <p>Total: {{ product.price * product.quantity }}</p>
</template>
`;

export const bindingExample = `\
<template>
  <img :src="user.avatar" :alt="user.username" />
  <div :class="\`\${user.active ? 'active' : 'inactive'}\`">
    ...
  </div>
  <input :value="query.get()" :placeholder="hint.get()" />
</template>
`;

export const refExample = `\
<script>
  import { value, onMount } from 'moonie'

  const canvas = ref(null)

  onMount(() => {
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.fillRect(0, 0, 100, 100)
    }
  })
</script>

<template>
  <canvas :ref="canvas" width="200" height="200" />
</template>
`;

export const eventExample = `\
<template>
  <button @click="handleClick">Click me</button>
  <input @input="onInput" @keydown="submit" />
  <form @submit="handleSubmit">...</form>
</template>
`;

export const ifElseExample = `\
<template>
  @if (isLoggedIn.get()) {
    <p>Bienvenido, {{ user.name }}</p>
  } @else {
    <p>Por favor inicia sesión</p>
  }
</template>
`;

export const forEmptyExample = `\
<template>
  <ul>
    @for (item of items; key: item.id) {
      <li>{{ item.name }}</li>
    } @empty {
      <li>No hay elementos</li>
    }
  </ul>
</template>
`;

export const svgExample = `\
<template>
  <svg viewBox="0 0 100 100">
    <circle
      :cx="x.get()"
      :cy="y.get()"
      :r="radius.get()"
      :fill="color.get()"
    />
  </svg>
</template>
`;
