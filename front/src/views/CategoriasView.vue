<template>
  <div>
    <div class="page-header">
      <div>
        <h4 class="page-title">Categorias</h4>
        <p class="page-subtitle">Tipos de ingresso disponíveis</p>
      </div>
      <button class="btn-primary-action" @click="abrirModal()">
        <i class="fas fa-plus"></i> Nova Categoria
      </button>
    </div>

    <Alerta :mensagem="alerta.msg" :tipo="alerta.tipo" @fechar="alerta.msg = null" />
    <Carregando v-if="carregando" />

    <div v-else class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Status</th>
            <th class="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categorias" :key="cat.id">
            <td class="fw-semibold">{{ cat.descricao }}</td>
            <td>
              <span :class="`status-badge ${cat.status === 1 ? 'status-active' : 'status-inactive'}`">
                {{ cat.status === 1 ? 'Ativa' : 'Inativa' }}
              </span>
            </td>
            <td class="text-end">
              <button class="action-btn" @click="abrirModal(cat)">
                <i class="fas fa-pen"></i>
              </button>
            </td>
          </tr>
          <tr v-if="categorias.length === 0">
            <td colspan="3" class="empty-row">Nenhuma categoria cadastrada.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="modal fade" id="modalCategoria" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">{{ form.id ? 'Editar Categoria' : 'Nova Categoria' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-semibold">Descrição</label>
              <input v-model="form.descricao" type="text" class="form-control" placeholder="Ex: Inteira, Meia-entrada..." />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Status</label>
              <select v-model="form.status" class="form-select">
                <option :value="1">Ativa</option>
                <option :value="0">Inativa</option>
              </select>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn-primary-action" @click="salvar" :disabled="salvando">
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

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e1b4b;
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0.25rem 0 0;
}

.btn-primary-action {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.15s;
}

.btn-primary-action:hover { opacity: 0.9; }
.btn-primary-action:disabled { opacity: 0.6; cursor: not-allowed; }

.table-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th {
  text-align: left;
  padding: 0.875rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.data-table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f8fafc;
  color: #374151;
}

.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #fafafa; }

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

.status-active { background: #dcfce7; color: #16a34a; }
.status-inactive { background: #f1f5f9; color: #64748b; }

.action-btn {
  background: #f8fafc;
  border: none;
  border-radius: 0.375rem;
  padding: 0.4rem 0.65rem;
  color: #64748b;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.15s;
}

.action-btn:hover { background: #e2e8f0; color: #1e293b; }

.empty-row {
  text-align: center;
  color: #94a3b8;
  padding: 2.5rem !important;
}
</style>
