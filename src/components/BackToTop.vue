<script lang="ts" setup>
const props = defineProps<{
  el: string
  offsetX?: number
  offsetY?: number
  position: 'top' | 'right' | 'bottom' | 'left' | 'tr' | 'tl' | 'br' | 'bl'
  unit: 'rem'
}>()

const { width: clientWidth } = useWindowSize()
const el = ref<HTMLElement>()
onMounted(() => {
  el.value = document.querySelector(props.el) as HTMLElement
})
const { right, left } = useElementBounding(el)

/** x 出界则内收 */
const calcX = (x = 0, widthX: number, clientWidth: number) => {
  const x2px = x * 16
  if (
    x2px + widthX > clientWidth - 50 // 右边出界
    || (x2px < 0 && Math.abs(x2px) < left.value) // 左边出界
  ) {
    return -Math.abs(x + 1) // 出界则向内收
  }
  return x
}

const { y: scrollY } = useWindowScroll()
// x, y 为 rem
const x = computed(() => `${calcX(props.offsetX, right.value, clientWidth.value)}${props.unit}`)
const y = computed(() => `${props.offsetY || 0}${props.unit}`)

const style = computed(() => {
  switch (props.position) {
    case 'top':
      return {
        top: y.value,
        left: '50%',
        transform: 'translateX(-50%)',
      }
    case 'right':
      return {
        top: '50%',
        left: `calc(${right.value}px + ${x.value})`,
        transform: 'translateY(-50%)',
      }
    case 'bottom':
      return {
        bottom: y.value,
        left: '50%',
        transform: 'translateX(-50%)',
      }
    case 'left':
      return {
        top: '50%',
        left: `calc(${left.value}px + ${x.value})`,
        transform: 'translateY(-50%)',
      }
    case 'tr':
      return {
        top: y.value,
        left: `calc(${right.value}px + ${x.value})`,
      }
    case 'tl':
      return {
        top: y.value,
        left: `calc(${left.value}px + ${x.value})`,
      }
    case 'br':
      return {
        bottom: y.value,
        left: `calc(${right.value}px + ${x.value})`,
      }
    case 'bl':
      return {
        bottom: y.value,
        left: `calc(${left.value}px + ${x.value})`,
      }
  }
})

function backToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
</script>

<template>
  <Transition>
    <div v-show="scrollY !== 0" fixed p-2 cursor-pointer :style="style" @click="backToTop">
      <div text-4xl i-icon-park-outline-arrow-circle-up />
    </div>
  </Transition>
</template>

<style>
.v-enter-active,
.v-leave-active {
  transition: all 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
