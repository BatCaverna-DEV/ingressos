<template>
  <div>
    <div class="page-header">
      <div>
        <h4 class="page-title">Usuários</h4>
        <p class="page-subtitle">Controle de acesso ao sistema</p>
      </div>
      <button class="btn-primary-action" @click="abrirModal()">
        <i class="fas fa-plus"></i> Novo Usuário
      </button>
    </div>

    <Alerta :mensagem="alerta.msg" :tipo="alerta.tipo" @fechar="alerta.msg = null" />
    <Carregando v-if="carregando" />

    <div v-else class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Matrícula</th>
            <th>Perfil</th>
            <th>Status</th>
            <th class="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in usuarios" :key="u.id">
            <td>
              <div class="user-cell">
                <div class="user-avatar">{{ iniciais(u.nome) }}</div>
                <div>
                  <div class="user-name">{{ u.nome }}</div>
                  <div class="user-email">{{ u.email }}</div>
                </div>
              </div>
            </td>
            <td class="text-muted small">{{ u.matricula || '—' }}</td>
            <td>
              <span :class="`role-badge role-${u.categoria}`">{{ categoriaLabel(u.categoria) }}</span>
            </td>
            <td>
              <span :class="`status-badge ${u.status === 1 ? 'status-active' : 'status-inactive'}`">
                {{ u.status === 1 ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td class="text-end">
              <button class="action-btn" @click="abrirModal(u)">
                <i class="fas fa-pen"></i>
              </button>
              <button
                v-if="u.categoria >= 2"
                class="action-btn action-btn-danger"
                @click="excluirUsuario(u)"
                :disabled="excluindo === u.id"
              >
                <span v-if="excluindo === u.id" class="spinner-border spinner-border-sm"></span>
                <i v-else class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="usuarios.length === 0">
            <td colspan="4" class="empty-row">Nenhum usuário cadastrado.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="modal fade" id="modalUsuario" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">{{ form.id ? 'Editar Usuário' : 'Novo Usuário' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-semibold">Nome</label>
              <input v-model="form.nome" type="text" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">E-mail</label>
              <input v-model="form.email" type="email" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">
                {{ form.categoria === 3 ? 'CPF' : 'Matrícula' }}
                <span v-if="form.categoria !== 3" class="text-muted fw-normal" style="font-size:0.8rem">(opcional)</span>
              </label>
              <input
                v-model="form.matricula"
                type="text"
                class="form-control"
                :placeholder="form.categoria === 3 ? '000.000.000-00' : 'Ex: 2024001234'"
              />
            </div>
            <div class="row g-3">
              <div class="col-6">
                <label class="form-label fw-semibold">Perfil</label>
                <select v-model="form.categoria" class="form-select">
                  <option :value="1">Administrador</option>
                  <option :value="2">Estudante</option>
                  <option :value="3">Externo</option>
                </select>
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold">Status</label>
                <select v-model="form.status" class="form-select">
                  <option :value="1">Ativo</option>
                  <option :value="0">Inativo</option>
                </select>
              </div>
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
import api from '../services/api.js';

const usuarios = ref([]);
const carregando = ref(false);
const salvando = ref(false);
const excluindo = ref(null);
const alerta = ref({ msg: null, tipo: 'success' });
const form = ref({ id: null, nome: '', email: '', matricula: '', categoria: 2, status: 1 });
let modal = null;

const categoriaLabel = (c) => ({ 1: 'Administrador', 2: 'Estudante', 3: 'Externo' }[c] || '-');
const iniciais = (nome) => (nome || '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

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
  form.value = u ? { ...u } : { id: null, nome: '', email: '', matricula: '', categoria: 2, status: 1 };
  modal.show();
};

const salvar = async () => {
  if (form.value.categoria === 3 && !form.value.matricula?.trim()) {
    alerta.value = { msg: 'O CPF é obrigatório para usuários Externos.', tipo: 'danger' };
    return;
  }
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

const excluirUsuario = async (u) => {
  if (!confirm(`Tem certeza que deseja excluir "${u.nome}"? Esta ação não pode ser desfeita.`)) return;
  excluindo.value = u.id;
  try {
    await api.delete(`/usuarios/${u.id}/excluir`);
    alerta.value = { msg: 'Usuário excluído com sucesso!', tipo: 'success' };
    await carregar();
  } catch (e) {
    alerta.value = { msg: e.response?.data?.mensagem || 'Erro ao excluir usuário', tipo: 'danger' };
  } finally {
    excluindo.value = null;
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
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid #f8fafc;
}

.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #fafafa; }

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.user-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
}

.user-email {
  color: #94a3b8;
  font-size: 0.8rem;
}

.role-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

.role-1 { background: #ede9fe; color: #7c3aed; }
.role-2 { background: #dbeafe; color: #2563eb; }
.role-3 { background: #f1f5f9; color: #64748b; }

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

.status-active { background: #dcfce7; color: #16a34a; }
.status-inactive { background: #fee2e2; color: #dc2626; }

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
.action-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.action-btn-danger {
  margin-left: 0.4rem;
  color: #dc2626;
}

.action-btn-danger:hover { background: #fee2e2; color: #b91c1c; }

.empty-row {
  text-align: center;
  color: #94a3b8;
  padding: 2.5rem !important;
}
</style>
