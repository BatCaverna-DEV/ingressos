<template>
  <div class="app-wrapper">
    <NavBar v-if="autenticado" />
    <main :class="autenticado ? 'app-content' : ''">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue';
import { autenticado } from './services/auth.service.js';
</script>

<style>
:root {
  --sidebar-width: 240px;
  --primary: #4f46e5;
  --primary-dark: #3730a3;
}

body {
  background-color: #f1f5f9;
  font-family: 'Inter', sans-serif;
}

.app-wrapper {
  display: flex;
  min-height: 100vh;
}

.app-content {
  margin-left: var(--sidebar-width);
  flex: 1;
  padding: 2rem;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .app-content {
    margin-left: 0;
    padding: 1rem 1rem calc(1rem + 65px);
  }
}
</style>
