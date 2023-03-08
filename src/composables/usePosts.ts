import type { Post } from '~/types'

export function getPosts() {
  const router = useRouter()
  const posts: Post[] = router.getRoutes().filter((route) => {
    return route.path.startsWith('/posts')
        && !route.path.endsWith('.html')
        && route.meta.frontmatter.createdAt
        && route.name
  })
    .sort((a, b) => +new Date(b.meta.frontmatter.date) - +new Date(a.meta.frontmatter.date))
    .map(route => ({
      path: route.path,
      ...route.meta.frontmatter,
    }))

  return posts
}
