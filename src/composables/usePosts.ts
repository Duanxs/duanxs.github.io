export function getPosts() {
  const router = useRouter()
  const posts = router.getRoutes().filter((route) => {
    return route.path.startsWith('/posts')
        && !route.path.endsWith('.html')
        && route.meta.frontmatter.createdAt
        && route.name
  })
    .sort((a, b) => +new Date(b.meta.frontmatter.createdAt) - +new Date(a.meta.frontmatter.createdAt))
    .map(route => ({
      path: route.path,
      ...route.meta.frontmatter,
    }))

  return posts
}
