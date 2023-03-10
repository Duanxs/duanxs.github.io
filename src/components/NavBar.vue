<script lang="ts" setup>
</script>

<template>
  <header flex justify-between items-center h-14 lt-md="h-12" px="8 lt-md:4">
    <div class="logo" h-10 w-10 lt-md="h-8 w-8">
      <router-link to="/">
        <img src="/logo.jpg" alt="logo">
      </router-link>
    </div>
    <nav grid="~ gap-6 auto-flow-col lt-md:gap-4" opacity-60>
      <router-link to="/">
        <span lt-md:hidden>文章</span>
        <i md:hidden i-icon-park-outline-list-view />
      </router-link>
      <a href="https://github.com/duanxs" target="_blank" title="Github">
        <i i-icon-park-outline-github-one />
      </a>

      <a cursor-pointer @click="toggleDark()">
        <i i-icon-park-outline="sun-one dark:moon" />
      </a>
    </nav>
  </header>
</template>

<style scoped>

</style>
