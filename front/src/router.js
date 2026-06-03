import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/eventos' },
  { path: '/login', component: () => import('./views/LoginView.vue'), meta: { publico: true } },
  { path: '/eventos', component: () => import('./views/EventosView.vue'), meta: { requerAuth: true } },
  { path: '/eventos/:id', component: () => import('./views/EventoDetalheView.vue'), meta: { requerAuth: true } },
  { path: '/categorias', component: () => import('./views/CategoriasView.vue'), meta: { requerAuth: true } },
  { path: '/usuarios', component: () => import('./views/UsuariosView.vue'), meta: { requerAuth: true } },
  { path: '/validar', component: () => import('./views/ValidarIngressoView.vue'), meta: { requerAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requerAuth && !token) return next('/login');
  if (to.path === '/login' && token) return next('/eventos');
  next();
});

export default router;
