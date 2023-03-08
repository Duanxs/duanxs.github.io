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
          <div class="meta" mt-2 flex text="dark/50 dark:light/50" transition>
            <div class="date" cursor-pointer>
              <i i-icon-park-outline-calendar-dot />
              <span v-if="isFormatDate" ml-1 @click="toggleDate()">{{ formatDateAgo(post.createdAt).value }}</span>
              <span v-else ml-1 @click="toggleDate()">{{ formatDate(post.createdAt).value }}</span>
            </div>
            <div class="tag" ml-4>
              <i i-icon-park-outline-tag />
              <span ml-1>
                <template v-if="post.category">
                  <span inline-block border px-2 mr-2 rounded>{{ post.category }}</span>
                </template>
                <template v-for="tag in post.tags" :key="tag">
                  <span text="dark/50 dark:light/50" mr-2 px-2 py-.5 bg="gray-2 dark:black/60" rounded>{{ tag }}</span>
                </template>
              </span>
            </div>
          </div>
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
