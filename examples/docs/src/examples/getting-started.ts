export const firstComponent = `\
<script>
  import { value } from 'moonie'

  const count = value(0)

  function increment() {
    count.set(count.get() + 1)
  }
</script>

<template>
  <div class="counter">
    <p>Count: {{ count.get() }}</p>
    <button @click="increment">+1</button>
  </div>
</template>
`;

export const vitePlugin = `\
import { defineConfig } from 'vite';
import { mooniePlugin } from "moonie/vite";

export default defineConfig({
  plugins: [mooniePlugin()]
})
`;

export const mountApp = `\
import { mount } from 'moonie'
import App from './App.mn'

mount('#app', App);
`;

export const mountAppWithRouter = `\
import { mount } from 'moonie'
import Home from './pages/Home.mn'
import About from './pages/About.mn'

mount('#app').router([
  { path: '/', component: Home },
  { path: '/about', component: About },
]);
`;

export const projectStructure = `\
my-app/
├── src/
│   ├── components/
│   │   ├── Header.mn
│   │   └── Counter.mn
│   ├── pages/
│   │   ├── Home.mn
│   │   └── About.mn
│   ├── App.mn
│   └── main.ts
├── vite.config.ts
└── package.json
`;
