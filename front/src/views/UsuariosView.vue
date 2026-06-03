<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold"><i class="fas fa-users me-2 text-primary"></i>Usuários</h4>
      <button class="btn btn-primary" @click="abrirModal()">
        <i class="fas fa-plus me-1"></i>Novo Usuário
      </button>
    </div>

    <Alerta :mensagem="alerta.msg" :tipo="alerta.tipo" @fechar="alerta.msg = null" />
    <Carregando v-if="carregando" />

    <div v-else class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Status</th>
              <th class="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuarios" :key="u.id">
              <td>{{ u.nome }}</td>
              <td>{{ u.email }}</td>
              <td>{{ categoriaLabel(u.categoria) }}</td>
              <td>
                <span :class="`badge ${u.status === 'ativo' ? 'bg-success' : 'bg-secondary'}`">{{ u.status }}</span>
              </td>
              <td class="text-end">
                <button class="btn btn-outline-secondary btn-sm" @click="abrirModal(u)">
                  <i class="fas fa-edit"></i>
                </button>
              </td>
            </tr>
            <tr v-if="usuarios.length === 0">
              <td colspan="5" class="text-center text-muted py-4">Nenhum usuário.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal fade" id="modalUsuario" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ form.id ? 'Editar' : 'Novo' }} Usuário</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nome</label>
              <input v-model="form.nome" type="text" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">E-mail</label>
              <input v-model="form.email" type="email" class="form-control" required />
            </div>
            <div class="mb-3" v-if="!form.id">
              <label class="form-label">Senha</label>
              <input v-model="form.senha" type="password" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Perfil</label>
              <select v-model="form.categoria" class="form-select">
                <option :value="1">Administrador</option>
                <option :value="2">Operador</option>
                <option :value="3">Visitante</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="salvar" :disabled="salvando">
              <span v-if="salvando" class="spinner-border spinner-border-sm me-1"></span>
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import Alerta from '../components/Alerta.vue';
import Carregando from '../components/Carregando.vue';
import api from '../services/api.js';

const usuarios = ref([]);
const carregando = ref(false);
const salvando = ref(false);
const alerta = ref({ msg: null, tipo: 'success' });
const form = ref({ id: null, nome: '', email: '', senha: '', categoria: 2, status: 'ativo' });
let modal = null;

const categoriaLabel = (c) => ({ 1: 'Administrador', 2: 'Operador', 3: 'Visitante' }[c] || '-');

onMounted(async () => {
  modal = new Modal(document.getElementById('modalUsuario'));
  await carregar();
});

const carregar = async () => {
  carregando.value = true;
  try {
    const { data } = await api.get('/usuarios');
    usuarios.value = data.dados;
  } catch {
    alerta.value = { msg: 'Erro ao carregar usuários', tipo: 'danger' };
  } finally {
    carregando.value = false;
  }
};

const abrirModal = (u = null) => {
  form.value = u ? { ...u, senha: '' } : { id: null, nome: '', email: '', senha: '', categoria: 2, status: 'ativo' };
  modal.show();
};

const salvar = async () => {
  salvando.value = true;
  try {
    if (form.value.id) {
      await api.put(`/usuarios/${form.value.id}`, form.value);
    } else {
      await api.post('/usuarios', form.value);
    }
    modal.hide();
    alerta.value = { msg: 'Usuário salvo!', tipo: 'success' };
    await carregar();
  } catch (e) {
    alerta.value = { msg: e.response?.data?.mensagem || 'Erro ao salvar', tipo: 'danger' };
  } finally {
    salvando.value = false;
  }
};
</script>
