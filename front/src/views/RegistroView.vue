<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-icon">
        <i class="fas fa-user-plus"></i>
      </div>

      <h1 class="login-title">Criar conta</h1>
      <p class="login-subtitle">Acesso externo — Campus Coelho Neto</p>

      <div class="login-divider"></div>

      <div v-if="SUSPENSO" class="suspenso-box">
        <i class="fas fa-tools"></i>
        <p>Cadastro suspenso temporariamente</p>
        <p class="suspenso-sub">Estamos com o cadastro de egressos pausado no momento. Tente novamente mais tarde.</p>
        <RouterLink to="/login" class="btn-voltar">Voltar ao login</RouterLink>
      </div>

      <div v-else-if="sucesso" class="sucesso-box">
        <i class="fas fa-check-circle"></i>
        <p>Cadastro realizado com sucesso!</p>
        <p class="sucesso-sub">Você já pode fazer login com sua conta Google.</p>
        <RouterLink to="/login" class="btn-voltar">Voltar ao login</RouterLink>
      </div>

      <template v-else>
        <div v-if="erro" class="erro-box">
          <i class="fas fa-exclamation-circle me-1"></i> {{ erro }}
        </div>

        <div class="campo">
          <label>Nome completo</label>
          <input v-model="form.nome" type="text" placeholder="Seu nome" @keyup.enter="enviar" />
        </div>

        <div class="campo">
          <label>E-mail</label>
          <input v-model="form.email" type="email" placeholder="seu@gmail.com" @keyup.enter="enviar" />
        </div>

        <div class="campo">
          <label>CPF</label>
          <input v-model="form.matricula" type="text" placeholder="000.000.000-00" @keyup.enter="enviar" />
        </div>

        <button class="btn-submit" @click="enviar" :disabled="enviando">
          <span v-if="enviando" class="spinner-border spinner-border-sm me-1"></span>
          <span v-else><i class="fas fa-user-plus me-1"></i></span>
          Cadastrar
        </button>

        <RouterLink to="/login" class="link-login">Já tem conta? Entrar</RouterLink>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { registrar } from '../services/auth.service.js';

const SUSPENSO = true;

const form = ref({ nome: '', email: '', matricula: '' });
const enviando = ref(false);
const sucesso = ref(false);
const erro = ref(null);

const enviar = async () => {
  erro.value = null;
  if (!form.value.nome.trim() || !form.value.email.trim()) {
    erro.value = 'Preencha nome e e-mail.';
    return;
  }
  if (!form.value.matricula.trim()) {
    erro.value = 'O CPF é obrigatório.';
    return;
  }
  if (form.value.email.toLowerCase().endsWith('@acad.ifma.edu.br')) {
    erro.value = 'Egressos não podem se cadastrar com e-mail institucional (@acad.ifma.edu.br).';
    return;
  }
  if (!form.value.email.toLowerCase().endsWith('@gmail.com')) {
    erro.value = 'Utilize um e-mail do Google (@gmail.com).';
    return;
  }
  enviando.value = true;
  try {
    await registrar(form.value);
    sucesso.value = true;
  } catch (e) {
    erro.value = e.response?.data?.mensagem || 'Erro ao realizar cadastro.';
  } finally {
    enviando.value = false;
  }
};
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

.campo {
  width: 100%;
  margin-bottom: 1rem;
}

.campo label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.35rem;
}

.campo input {
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #1e293b;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.campo input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.btn-submit {
  width: 100%;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  padding: 0.7rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: opacity 0.15s;
  margin-top: 0.25rem;
}

.btn-submit:hover { opacity: 0.9; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.opcional {
  font-weight: 400;
  color: #94a3b8;
  font-size: 0.75rem;
}

.link-login {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #4f46e5;
  text-decoration: none;
}

.link-login:hover { text-decoration: underline; }

.erro-box {
  width: 100%;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 0.5rem;
  padding: 0.65rem 0.9rem;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.sucesso-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.sucesso-box i {
  font-size: 2.5rem;
  color: #16a34a;
}

.sucesso-box p {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.sucesso-sub {
  font-size: 0.82rem !important;
  font-weight: 400 !important;
  color: #64748b !important;
}

.btn-voltar {
  margin-top: 0.75rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.15s;
}

.btn-voltar:hover { opacity: 0.9; color: white; }

.suspenso-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.suspenso-box i {
  font-size: 2.5rem;
  color: #d97706;
}

.suspenso-box p {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.suspenso-sub {
  font-size: 0.85rem !important;
  font-weight: 400 !important;
  color: #64748b !important;
}
</style>
