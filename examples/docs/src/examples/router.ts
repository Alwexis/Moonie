export const routerInAppExample = `\
import { mount } from 'moonie'
import Home from './pages/Home.mn'
import About from './pages/About.mn'

mount('#app').router([
  { path: '/', component: Home },
  { path: '/about', component: About },
])
`;

export const withoutRouterExample = `\
import { mount } from 'moonie'
import App from './App.mn'

mount('#app', App)
`;

export const routerInSeparateFileExample = `\
import { type Route } from 'moonie/router'
import Home from './pages/Home.mn'
import About from './pages/About.mn'

export const routes: Route[] = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/about',
    component: About
  }
]
`;

export const dynamicRoutesExample = `\
mount('#app').router([
  { path: '/user/:id', component: UserProfile },
  { path: '/post/:slug', component: BlogPost },
])
`;

export const useParamsExample = `\
<script>
  import { effect } from 'moonie'
  import { useParams } from 'moonie/router'

  const params = useParams()

  effect(() => {
    fetchUser(params.id)
  })
</script>

<template>
  <h1>Usuario {{ params.id }}</h1>
</template>
`;

export const navigateExample = `\
import { navigate } from 'moonie/router'

// Navegar a una ruta
navigate('/about')

// Con parámetros de query
navigate('/search?q=moonie')
`;

export const linkExample = `\
<script>
  import { Link } from 'moonie/router'
</script>

<template>
  <nav>
    <Link to="/">Inicio</Link>
    <Link to="/about">Acerca de</Link>
    <Link to="/user/42">Perfil</Link>
  </nav>
</template>
`;
