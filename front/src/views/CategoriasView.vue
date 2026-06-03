<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold"><i class="fas fa-tags me-2 text-primary"></i>Categorias</h4>
      <button class="btn btn-primary" @click="abrirModal()">
        <i class="fas fa-plus me-1"></i>Nova Categoria
      </button>
    </div>

    <Alerta :mensagem="alerta.msg" :tipo="alerta.tipo" @fechar="alerta.msg = null" />
    <Carregando v-if="carregando" />

    <div v-else class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Descrição</th>
              <th>Status</th>
              <th class="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in categorias" :key="cat.id">
              <td>{{ cat.descricao }}</td>
              <td>
                <span :class="`badge ${cat.status === 1 ? 'bg-success' : 'bg-secondary'}`">
                  {{ cat.status === 1 ? 'Ativa' : 'Inativa' }}
                </span>
              </td>
              <td class="text-end">
                <button class="btn btn-outline-secondary btn-sm" @click="abrirModal(cat)">
                  <i class="fas fa-edit"></i>
                </button>
              </td>
            </tr>
            <tr v-if="categorias.length === 0">
              <td colspan="3" class="text-center text-muted py-4">Nenhuma categoria.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal fade" id="modalCategoria" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ form.id ? 'Editar' : 'Nova' }} Categoria</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Descrição</label>
              <input v-model="form.descricao" type="text" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Status</label>
              <select v-model="form.status" class="form-select">
                <option :value="1">Ativa</option>
                <option :value="0">Inativa</option>
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
import { listarCategorias, criarCategoria, atualizarCategoria } from '../services/categorias.service.js';

const categorias = ref([]);
const carregando = ref(false);
const salvando = ref(false);
const alerta = ref({ msg: null, tipo: 'success' });
const form = ref({ id: null, descricao: '', status: 1 });
let modal = null;

onMounted(async () => {
  modal = new Modal(document.getElementById('modalCategoria'));
  await carregar();
});

const carregar = async () => {
  carregando.value = true;
  try {
    const { data } = await listarCategorias();
    categorias.value = data.dados;
  } catch {
    alerta.value = { msg: 'Erro ao carregar categorias', tipo: 'danger' };
  } finally {
    carregando.value = false;
  }
};

const abrirModal = (cat = null) => {
  form.value = cat ? { ...cat } : { id: null, descricao: '', status: 1 };
  modal.show();
};

const salvar = async () => {
  salvando.value = true;
  try {
    if (form.value.id) {
      await atualizarCategoria(form.value.id, form.value);
    } else {
      await criarCategoria(form.value);
    }
    modal.hide();
    alerta.value = { msg: 'Categoria salva!', tipo: 'success' };
    await carregar();
  } catch (e) {
    alerta.value = { msg: e.response?.data?.mensagem || 'Erro ao salvar', tipo: 'danger' };
  } finally {
    salvando.value = false;
  }
};
</script>
