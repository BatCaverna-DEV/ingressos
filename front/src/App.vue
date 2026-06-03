<template>
  <div>
    <NavBar v-if="autenticado" />
    <div :class="autenticado ? 'container-fluid mt-4 px-4' : ''">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from './components/NavBar.vue';

const router = useRouter();
const autenticado = computed(() => !!localStorage.getItem('token'));
</script>
