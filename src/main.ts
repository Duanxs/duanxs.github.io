import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles/main.css'

import autoRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:generated-layouts'
import { ViteSSG } from 'vite-ssg'
import App from './App.vue'

const routes = setupLayouts(autoRoutes.map((route) => {
  return {
    ...route,
    alias: route.path.endsWith('/') ? `${route.path}index.html` : `${route.path}.html`,
  }
}))

export const createApp = ViteSSG(
  App,
  { routes },
  // (ctx) => {
  //   console.log('ctx:', ctx)
  // },
)
