<script lang="ts" setup>
const posts = getPosts()

const isFormatDate = ref(true)
const toggleDate = useToggle(isFormatDate)
</script>

<template>
  <div class="content" mt-8>
    <div class="posts-list">
      <article v-for="post in posts" :key="post.path" mt-6>
        <header>
          <div class="title" text-xl font-bold>
            <RouterLink :to="post.path" no-underline text-blue="hover: active:">
              {{ post.title }}
            </RouterLink>
          </div>
          <PostMeta :meta="post" />
        </header>
        <div mt-2>
          {{ post.description }}
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>

</style>
