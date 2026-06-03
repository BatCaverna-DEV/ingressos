<template>
  <div v-if="mensagem" :class="`alert alert-${tipo} alert-dismissible fade show`" role="alert">
    <i :class="icone" class="me-2"></i>{{ mensagem }}
    <button type="button" class="btn-close" @click="$emit('fechar')"></button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  mensagem: String,
  tipo: { type: String, default: 'info' },
});

defineEmits(['fechar']);

const icone = computed(() => ({
  success: 'fas fa-check-circle',
  danger: 'fas fa-exclamation-circle',
  warning: 'fas fa-exclamation-triangle',
  info: 'fas fa-info-circle',
}[props.tipo] || 'fas fa-info-circle'));
</script>
