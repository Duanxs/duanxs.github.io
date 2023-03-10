<script lang="ts" setup>
const props = defineProps<{
  meta: {
    title: string
    createdAt: string
    tags: string[]
  }
}>()

const isFormatDate = ref(true)
const toggleDate = useToggle(isFormatDate)
</script>

<template>
  <div
    class="meta" mt-2 relative md:flex lt-md:block
    text="dark/50 dark:light/50 xs"
  >
    <TransitionGroup name="fade">
      <div key="date" class="date" cursor-pointer relative @click="toggleDate()">
        <i i-icon-park-outline-calendar-dot />
        <span v-if="isFormatDate" ml-1 style="white-space: nowrap;">
          {{ formatDateAgo(props.meta.createdAt).value }}
        </span>
        <span v-else ml-1 style="white-space: nowrap;">
          {{ formatDate(props.meta.createdAt).value }}
        </span>
      <!-- </div> -->
      </div>
      <div key="tag" class="tag" md:ml-4 lt-md:mt-2>
        <i i-icon-park-outline-tag />
        <span ml-1>
          <!-- <template v-if="matter.category">
                <span inline-block border px-2 mr-2 rounded>{{ matter.category }}</span>
              </template> -->
          <template v-for="tag in props.meta.tags" :key="tag">
            <span text="dark/50 dark:light/50" mr-2 px-2 py-.5 bg="gray-2 dark:black/60" rounded>{{ tag }}</span>
          </template>
        </span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style>
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease-in-out;
}

.fade-enter-from {
  opacity: 0;
}
.fade-leave-to {
  opacity: 0;
}
</style>
