<script lang="ts" setup>
const router = useRouter()
console.log('router:', router.getRoutes().filter(i => i.meta.frontmatter))
</script>

<template>
  <div>
    123
  </div>
</template>

<style scoped>

</style>
