<script lang="ts" setup>
const router = useRouter()
const matter = computed(() => router.currentRoute.value.meta.frontmatter)
</script>

<template>
  <div class="prose prose-md m-auto text-left mt-8 mb-8">
    <div class="title" text-3xl font-bold>
      {{ matter.title }}
    </div>
    <PostMeta :meta="matter" />
  </div>
</template>

<style scoped>

</style>
