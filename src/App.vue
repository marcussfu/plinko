<script setup lang="ts">
import Plinko from './components/Plinko/PlinkoGame.vue';
import Sidebar from './components/Sidebar.vue';
import Balance from './components/Balance.vue';
import logo from './assets/logo.svg';
</script>

<template>
  <div class="relative flex min-h-dvh w-full flex-col">
    <nav class="sticky top-0 z-10 w-full bg-gray-700 px-5 drop-shadow-lg">
      <div class="mx-auto flex h-14 max-w-7xl items-center justify-between">
        <img :src="logo" alt="logo" class="h-6 sm:h-7" />
        <div class="mx-auto">
          <Balance />
        </div>
      </div>
    </nav>

    <div class="flex-1 px-5">
      <div class="mx-auto mt-5 min-w-[300px] max-w-xl drop-shadow-xl md:mt-10 lg:max-w-7xl">
        <div class="flex flex-col-reverse overflow-hidden rounded-lg lg:w-full lg:flex-row">
          <Sidebar />
          <div class="flex-1">
            <Plinko />
          </div>
        </div>
      </div>
    </div>

    <!-- <SettingsWindow />
    <LiveStatsWindow /> -->

    <footer class="px-5 pb-4 pt-16">
      <div class="mx-auto max-w-[40rem]">
        <div aria-hidden="true" class="h-[1px] bg-slate-700" />
        <div class="flex items-center justify-center p-2">
          <p class="text-sm text-slate-500">
            © 2024
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
