<script setup lang="ts">
const elRef = ref<HTMLElement>()
</script>

<template>
  <NavBar />
  <main ref="elRef" px-4>
    <PostHeader />
    <RouterView id="post" />
  </main>
  <Footer px-4 />
  <BackToTop :offset-x="2" :offset-y="2" position="br" el="#post" unit="rem" />
</template>
