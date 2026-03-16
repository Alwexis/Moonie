export const anatomyExample = `\
<script>
  // Lógica reactiva, imports, estado
  import { value } from 'moonie'
  const message = value('Hola Moonie!')
</script>

<template>
  <!-- Tu markup -->
  <h1>{{ message.get() }}</h1>
</template>
`;

export const propsExample = `\
<script>
  const { nombre, color = 'violet' } = props
</script>

<template>
  <span :style="{ color }">Hola, {{ nombre }}!</span>
</template>
`;

export const propsUsageExample = `\
<Greeting nombre="Luna" color="blue" />
`;

export const eventsExample = `\
<script>
  import { value } from 'moonie'
  
  const { onSearch } = props
  const query = value('')

  function handleSubmit(e) {
    e.preventDefault()
    onSearch?.(query.get())
  }
</script>

<template>
  <form @submit="handleSubmit">
    <input :value="query.get()" @input="query.set($event.target.value)" />
    <button type="submit">Buscar</button>
  </form>
</template>
`;

export const eventsExampleUsage = `\
<SearchBox :onSearch="(searchTerm) => console.log('Búsqueda realizada: ', searchTerm)" />
`;

export const slotsExample = `\
<template>
  <div class="card">
    <slot />                <!-- slot default -->
    <slot name="footer" />  <!-- slot con nombre -->
  </div>
</template>
`;

export const slotsExampleUsage = `\
<Card>
  <button slot="footer">Aceptar</button> <!-- se renderiza en "footer" -->
  <p>Contenido principal</p>             <!-- se renderiza en slot default -->
</Card>
`;

export const compositionExample = `\
<script>
  import Header from './components/Header.mn'
  import Counter from './components/Counter.mn'
</script>

<template>
  <Header title="Mi App" />
  <main>
    <Counter />
  </main>
</template>
`;

export const lifecycleExample = `\
<script>
  import { onMount, onUnmount } from 'moonie'

  onMount(() => {
    console.log('Componente montado')
    const interval = setInterval(() => tick(), 1000)

    // Si retornas una función, se registra como cleanup automáticamente
    return () => clearInterval(interval)
  })

  // También puedes usar onUnmount directamente
  onUnmount(() => {
    console.log('Componente desmontado')
  })
</script>
`;
