import '@unocss/reset/tailwind.css'
import 'uno.css'

import autoRoutes from 'pages-generated'
import { ViteSSG } from 'vite-ssg'
import App from './App.vue'

const routes = autoRoutes.map((route) => {
  return {
    ...route,
    alias: route.path.endsWith('/') ? `${route.path}index.html` : `${route.path}.html`,
  }
})

export const createApp = ViteSSG(
  App,
  { routes },
)
