import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import generateSitemap from 'vite-ssg-sitemap'

import matter from 'gray-matter'
import Markdown from 'vite-plugin-vue-markdown'
import LinkAttributes from 'markdown-it-link-attributes'
import type { Options as ShikiOptions } from 'markdown-it-shiki'
import Shiki from 'markdown-it-shiki'
// @ts-expect-error types not found
import Sup from 'markdown-it-sup'
import { containerPlugin } from './plugins/markdown/container'

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
        const path = resolve(__dirname, route.component.slice(1))
        if (path.endsWith('.md')) {
          const md = readFileSync(path, 'utf-8')
          const { data } = matter(md)
          route.meta = { ...route.meta || {}, frontmatter: data, layout: data.layout }
        }
        return route
      },
    }),

    Layouts(),

    AutoImport({
      imports: ['vue', 'vue-router', '@vueuse/core', '@vueuse/head'],
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
      headEnabled: true,
      excerpt: true,
      markdownItOptions: {
        typographer: true,
        linkify: true,
      },
      markdownItSetup(md) {
        md.use(Shiki, {
          highlighte: true,
          theme: 'material-theme-palenight',
        } as ShikiOptions)
        md.use(LinkAttributes, {
          matcher: (link: string) => /^https?:\/\//.test(link),
          attrs: {
            target: '_blank',
            rel: 'noopener',
          },
        })
        md.use(Sup)
        containerPlugin(md)
      },
      // frontmatterOptions: {
      //   renderExcerpt: true,
      //   grayMatterOptions: {
      //     excerpt: true,
      //     excerpt_separator: '<!-- more -->',
      //   },
      // },
    }),
  ],

  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    onFinished() { generateSitemap() },
  },
})
