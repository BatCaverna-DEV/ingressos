<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="card shadow" style="width: 100%; max-width: 380px;">
      <div class="card-body p-5">
        <div class="text-center mb-4">
          <i class="fas fa-ticket-alt fa-3x text-primary mb-3"></i>
          <h4 class="fw-bold">Ingressos IFMA</h4>
          <p class="text-muted small">Campus Coelho Neto</p>
        </div>

        <Alerta :mensagem="erro" tipo="danger" @fechar="erro = null" />

        <p class="text-center text-muted small mb-3">Acesse com sua conta Google</p>
        <div id="google-btn" class="d-flex justify-content-center"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { loginGoogle } from '../services/auth.service.js';
import Alerta from '../components/Alerta.vue';

const router = useRouter();
const erro = ref(null);

onMounted(() => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId || !window.google) return;

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: async ({ credential }) => {
      erro.value = null;
      try {
        const { data } = await loginGoogle(credential);
        localStorage.setItem('token', data.dados.token);
        localStorage.setItem('usuario', JSON.stringify(data.dados.usuario));
        router.push('/eventos');
      } catch (e) {
        erro.value = e.response?.data?.mensagem || 'Erro ao autenticar com Google';
      }
    },
  });

  window.google.accounts.id.renderButton(
    document.getElementById('google-btn'),
    { theme: 'outline', size: 'large', width: 310, locale: 'pt-BR' }
  );
});
</script>
