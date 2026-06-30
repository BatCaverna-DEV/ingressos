<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <i class="fas fa-ticket-alt"></i>
      <span>Ingressos IFMA</span>
    </div>

    <div class="sidebar-user">
      <div class="user-avatar">{{ iniciais }}</div>
      <div class="user-info">
        <span class="user-name">{{ usuario?.nome?.split(' ')[0] }}</span>
        <span class="user-role">{{ roleLabel }}</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <RouterLink to="/eventos" class="nav-item">
        <i class="fas fa-calendar-alt"></i>
        <span>Eventos</span>
      </RouterLink>
      <template v-if="isAdmin">
        <RouterLink to="/categorias" class="nav-item">
          <i class="fas fa-tags"></i>
          <span>Categorias</span>
        </RouterLink>
        <RouterLink to="/validar" class="nav-item">
          <i class="fas fa-qrcode"></i>
          <span>Validar Ingresso</span>
        </RouterLink>
        <RouterLink to="/usuarios" class="nav-item">
          <i class="fas fa-users"></i>
          <span>Usuários</span>
        </RouterLink>
      </template>
    </nav>

    <button class="sidebar-logout" @click="sair">
      <i class="fas fa-sign-out-alt"></i>
      <span>Sair</span>
    </button>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { logout, getUsuario } from '../services/auth.service.js';

const router = useRouter();
const usuario = computed(() => getUsuario());
const isAdmin = computed(() => usuario.value?.categoria === 1);
const roleLabel = computed(() => ({ 1: 'Administrador', 2: 'Estudante', 3: 'Externo' }[usuario.value?.categoria] || ''));
const iniciais = computed(() => {
  const nome = usuario.value?.nome || '';
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
});

const sair = () => {
  logout();
  router.push('/login');
};
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background: linear-gradient(180deg, #1e1b4b 0%, #312e81 100%);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  z-index: 100;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 0 0.5rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.sidebar-brand i {
  color: #a5b4fc;
  font-size: 1.3rem;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 0.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 1rem;
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #4f46e5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  color: #a5b4fc;
  font-size: 0.75rem;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.75rem;
  border-radius: 0.5rem;
  color: #c7d2fe;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.15s;
}

.nav-item i {
  width: 18px;
  text-align: center;
  font-size: 0.95rem;
}

.nav-item:hover {
  background: rgba(255,255,255,0.08);
  color: white;
}

.nav-item.router-link-active {
  background: rgba(99, 102, 241, 0.4);
  color: white;
  font-weight: 600;
}

.sidebar-logout {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.75rem;
  border-radius: 0.5rem;
  color: #fca5a5;
  background: none;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  width: 100%;
  transition: all 0.15s;
}

.sidebar-logout:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
