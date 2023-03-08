import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    frontmatter: {
      title: string
      createdAt: string
      // updatedAt: string
      tags: string[]
      description: string
      // cover: string
    }
  }
}
