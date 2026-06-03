<template>
  <div class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Carregando...</span>
    </div>
    <p class="mt-2 text-muted">{{ texto }}</p>
  </div>
</template>

<script setup>
defineProps({ texto: { type: String, default: 'Carregando...' } });
</script>
