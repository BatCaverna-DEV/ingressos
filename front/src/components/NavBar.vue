<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <RouterLink class="navbar-brand fw-bold" to="/eventos">
        <i class="fas fa-ticket-alt me-2"></i>Ingressos IFMA
      </RouterLink>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/eventos">
              <i class="fas fa-calendar-alt me-1"></i>Eventos
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/categorias">
              <i class="fas fa-tags me-1"></i>Categorias
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/validar">
              <i class="fas fa-qrcode me-1"></i>Validar
            </RouterLink>
          </li>
          <li class="nav-item" v-if="isAdmin">
            <RouterLink class="nav-link" to="/usuarios">
              <i class="fas fa-users me-1"></i>Usuários
            </RouterLink>
          </li>
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item">
            <span class="nav-link text-light">
              <i class="fas fa-user-circle me-1"></i>{{ usuario?.nome }}
            </span>
          </li>
          <li class="nav-item">
            <button class="btn btn-outline-light btn-sm ms-2" @click="sair">
              <i class="fas fa-sign-out-alt me-1"></i>Sair
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { logout, getUsuario } from '../services/auth.service.js';

const router = useRouter();
const usuario = computed(() => getUsuario());
const isAdmin = computed(() => usuario.value?.categoria === 1);

const sair = () => {
  logout();
  router.push('/login');
};
</script>
