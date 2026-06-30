<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-icon">
        <i class="fas fa-ticket-alt"></i>
      </div>

      <h1 class="login-title">Ingressos IFMA</h1>
      <p class="login-subtitle">Campus Coelho Neto</p>

      <div class="login-divider"></div>

      <Alerta :mensagem="erro" tipo="danger" @fechar="erro = null" />

      <p class="login-hint">Acesse com sua conta Google institucional</p>
      <div id="google-btn" class="google-btn-wrapper"></div>

      <RouterLink to="/registro" class="link-registro">
        Acesso externo? Cadastre-se aqui
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { loginGoogle, autenticado } from '../services/auth.service.js';
import Alerta from '../components/Alerta.vue';

const router = useRouter();
const erro = ref(sessionStorage.getItem('login_erro'));
sessionStorage.removeItem('login_erro');

onMounted(() => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId || !window.google) return;

  window.google.accounts.id.initialize({
    client_id: clientId,
    auto_select: false,
    callback: async ({ credential }) => {
      erro.value = null;
      try {
        const { data } = await loginGoogle(credential);
        localStorage.setItem('token', data.dados.token);
        localStorage.setItem('usuario', JSON.stringify(data.dados.usuario));
        autenticado.value = true;
        router.push('/eventos');
      } catch (e) {
        const mensagem = e.response?.data?.mensagem || 'Erro ao autenticar com Google';
        sessionStorage.setItem('login_erro', mensagem);
        window.location.reload();
      }
    },
  });

  window.google.accounts.id.renderButton(
    document.getElementById('google-btn'),
    { theme: 'outline', size: 'large', width: 310, locale: 'pt-BR' }
  );
});
</script>

<style scoped>
.login-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%);
}

.login-card {
  background: white;
  border-radius: 1.25rem;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-icon {
  width: 64px;
  height: 64px;
  border-radius: 1rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.login-icon i {
  font-size: 1.75rem;
  color: white;
}

.login-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e1b4b;
  margin: 0;
}

.login-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}

.login-divider {
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  border-radius: 999px;
  margin: 1.5rem 0;
}

.login-hint {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 1rem;
  text-align: center;
}

.google-btn-wrapper {
  display: flex;
  justify-content: center;
}

.link-registro {
  margin-top: 1.25rem;
  font-size: 0.8rem;
  color: #4f46e5;
  text-decoration: none;
}

.link-registro:hover { text-decoration: underline; }
</style>
