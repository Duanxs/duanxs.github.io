import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

import Markdown from 'vite-plugin-vue-markdown'
import LinkAttributes from 'markdown-it-link-attributes'
// @ts-expect-error types not found
import LineHighlight from 'markdown-it-highlight-lines'
import Shiki from 'markdown-it-shiki'

export default defineConfig({
  plugins: [
    Unocss(),
    Vue({
      include: [/\.vue$/, /\.md$/],
      reactivityTransform: true,
    }),
    Pages({
      extensions: ['vue', 'md'],
      dirs: 'pages',
      extendRoute(route) {
        // TODO: pages 待扩展
        return route
      },
    }),

    Layouts(),

    AutoImport({
      imports: ['vue', 'vue-router', '@vueuse/core'],
      dirs: [
        'src/composables',
      ],
      vueTemplate: true,
    }),

    Components({
      extensions: ['vue', 'md'],
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      // resolvers: [
      //   IconsResolver({
      //     componentPrefix: '',
      //   }),
      // ],
    }),

    Markdown({
      wrapperClasses: 'prose prose-sm m-auto text-left',
      // headEnabled: true,
      markdownItSetup(md) {
        md.use(Shiki, {
          // theme: {
          //   light: 'github-light',
          //   dark: 'github-dark',
          // },
          // theme: 'vitesse-dark',
          theme: 'material-theme-palenight',
        })
        md.use(LinkAttributes, {
          matcher: (link: string) => /^https?:\/\//.test(link),
          attrs: {
            target: '_blank',
            rel: 'noopener',
          },
        })

        md.use(LineHighlight)
      },
    }),
  ],
})
