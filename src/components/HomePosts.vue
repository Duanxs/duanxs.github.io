<script lang="ts" setup>
const posts = getPosts()
</script>

<template>
  <div class="content">
    <div class="posts-list">
      <article v-for="post in posts" :key="post.path">
        <header>
          <div class="title">
            {{ post.title }}
          </div>
          <div class="meta">
            {{ formatDate(post.createdAt) }}
          </div>
        </header>
        <div>
          {{ post.description }}
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>

</style>
