export const valueExample = `\
import { value } from 'moonie'

const name = value('Moonie')

// Leer
console.log(name.get()) // 'Moonie'

// Escribir
name.set('Luna')
console.log(name.get()) // 'Luna'
`;

export const reactiveExample = `\
import { reactive } from 'moonie'

const state = reactive({
  count: 0,
  user: { name: 'Ana' }
})

// Mutación directa — se trackea automáticamente
state.count++
state.user.name = 'Luis'

// Reemplazar el objeto completo
state.set({ count: 10, user: { name: 'Carlos' } })

// Inicializar vacío
const data = reactive(null)
`;

export const computedExample = `\
import { value, computed } from 'moonie'

const price = value(100)
const tax = value(0.16)

const total = computed(() => price.get() * (1 + tax.get()))

console.log(total.get()) // 116
`;

export const effectExample = `\
import { value, effect } from 'moonie'

const count = value(0)

effect(() => {
  console.log('Count changed:', count.get())
})

count.set(1) // logs: 'Count changed: 1'
count.set(2) // logs: 'Count changed: 2'
`;

export const watchExample = `\
import { value, watch } from 'moonie'

const query = value('')

watch(query, (newVal, oldVal) => {
  console.log(\`Query: "\${oldVal}" → "\${newVal}"\`)
  fetchResults(newVal)
})

query.set('moonie docs')
`;
