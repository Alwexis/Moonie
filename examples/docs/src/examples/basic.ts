export const basicExample = `\
<script>
  import { value } from 'moonie'
  const count = value(0)
</script>

<template>
  <button @click="count.set(count.get() + 1)">
    Clicked {{ count.get() }} times
  </button>
</template>`;
