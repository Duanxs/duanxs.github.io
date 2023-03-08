<script lang="ts" setup>
const router = useRouter()
const matter = computed(() => router.currentRoute.value.meta.frontmatter)

const isFormatDate = ref(true)
const toggleDate = useToggle(isFormatDate)
</script>

<template>
  <div class="prose prose-md m-auto text-left mt-8 mb-8">
    <div class="title" text-xl font-bold>
      {{ matter.title }}
    </div>
    <div class="meta" mt-2 flex text="dark/50 dark:light/50 xs" transition>
      <div class="date" cursor-pointer @click="toggleDate()">
        <i i-icon-park-outline-calendar-dot />
        <span ml-1>{{ isFormatDate ? formatDateAgo(matter.createdAt).value : formatDate(matter.createdAt).value }}</span>
      </div>
      <div class="tag" ml-4>
        <i i-icon-park-outline-tag />
        <span ml-1>
          <!-- <template v-if="matter.category">
            <span inline-block border px-2 mr-2 rounded>{{ matter.category }}</span>
          </template> -->
          <template v-for="tag in matter.tags" :key="tag">
            <span text="dark/50 dark:light/50" mr-2 px-2 py-.5 bg="gray-2 dark:black/60" rounded>{{ tag }}</span>
          </template>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
