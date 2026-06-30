<template>
  <div>
    <div class="page-header">
      <div>
        <h4 class="page-title">Eventos</h4>
        <p class="page-subtitle">{{ isAdmin ? 'Gerencie os eventos do campus' : 'Confira os eventos disponíveis e inscreva-se' }}</p>
      </div>
      <button v-if="isAdmin" class="btn-primary-action" @click="abrirModal()">
        <i class="fas fa-plus"></i> Novo Evento
      </button>
    </div>

    <Alerta :mensagem="alerta.msg" :tipo="alerta.tipo" @fechar="alerta.msg = null" />
    <Carregando v-if="carregando" />

    <div v-else class="events-grid">
      <div v-for="evento in eventos" :key="evento.id" class="event-card">
        <div class="event-card-header">
          <span :class="`event-status ${evento.status === 1 ? 'status-active' : 'status-inactive'}`">
            {{ evento.status === 1 ? 'Ativo' : 'Inativo' }}
          </span>
          <button v-if="isAdmin" class="event-edit-btn" @click="abrirModal(evento)" title="Editar">
            <i class="fas fa-pen"></i>
          </button>
        </div>
        <h6 class="event-title">{{ evento.descricao }}</h6>
        <div class="event-dates">
          <div class="event-date">
            <i class="fas fa-play-circle text-success"></i>
            <span>{{ formatarData(evento.inicio) }}</span>
          </div>
          <div class="event-date">
            <i class="fas fa-stop-circle text-danger"></i>
            <span>{{ formatarData(evento.fim) }}</span>
          </div>
        </div>
        <RouterLink :to="`/eventos/${evento.id}`" class="event-details-btn">
          Ver detalhes <i class="fas fa-arrow-right ms-1"></i>
        </RouterLink>
      </div>

      <div v-if="eventos.length === 0" class="empty-state">
        <i class="fas fa-calendar-times"></i>
        <p>Nenhum evento cadastrado</p>
        <button v-if="isAdmin" class="btn-primary-action" @click="abrirModal()">Criar primeiro evento</button>
      </div>
    </div>

    <div class="modal fade" id="modalEvento" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">{{ form.id ? 'Editar Evento' : 'Novo Evento' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-semibold">Descrição</label>
              <input v-model="form.descricao" type="text" class="form-control" placeholder="Nome do evento" />
            </div>
            <div class="row g-3">
              <div class="col-6">
                <label class="form-label fw-semibold">Início</label>
                <input v-model="form.inicio" type="datetime-local" class="form-control" />
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold">Fim</label>
                <input v-model="form.fim" type="datetime-local" class="form-control" />
              </div>
            </div>
            <div class="mt-3">
              <label class="form-label fw-semibold">Ingressos por inscrição</label>
              <input v-model.number="form.quantidade" type="number" class="form-control" min="1" max="100" />
            </div>
            <div class="mt-3">
              <label class="form-label fw-semibold">Status</label>
              <select v-model="form.status" class="form-select">
                <option :value="1">Ativo</option>
                <option :value="0">Inativo</option>
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
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import Alerta from '../components/Alerta.vue';
import Carregando from '../components/Carregando.vue';
import { listarEventos, criarEvento, atualizarEvento } from '../services/eventos.service.js';
import { getUsuario } from '../services/auth.service.js';

const isAdmin = computed(() => getUsuario()?.categoria === 1);
const eventos = ref([]);
const carregando = ref(false);
const salvando = ref(false);
const alerta = ref({ msg: null, tipo: 'success' });
const form = ref({ id: null, descricao: '', inicio: '', fim: '', status: 1, quantidade: 1 });
let modal = null;

const formatarData = (d) => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

onMounted(async () => {
  modal = new Modal(document.getElementById('modalEvento'));
  await carregar();
});

const carregar = async () => {
  carregando.value = true;
  try {
    const { data } = await listarEventos();
    eventos.value = data.dados;
  } catch {
    alerta.value = { msg: 'Erro ao carregar eventos', tipo: 'danger' };
  } finally {
    carregando.value = false;
  }
};

const abrirModal = (evento = null) => {
  form.value = evento
    ? { ...evento, inicio: evento.inicio?.slice(0, 16), fim: evento.fim?.slice(0, 16) }
    : { id: null, descricao: '', inicio: '', fim: '', status: 1, quantidade: 1 };
  modal.show();
};

const salvar = async () => {
  salvando.value = true;
  try {
    if (form.value.id) {
      await atualizarEvento(form.value.id, form.value);
    } else {
      await criarEvento(form.value);
    }
    modal.hide();
    alerta.value = { msg: 'Evento salvo com sucesso!', tipo: 'success' };
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
  text-decoration: none;
  transition: opacity 0.15s;
}

.btn-primary-action:hover { opacity: 0.9; color: white; }
.btn-primary-action:disabled { opacity: 0.6; cursor: not-allowed; }

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.event-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: box-shadow 0.2s;
}

.event-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.event-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

.status-active { background: #dcfce7; color: #16a34a; }
.status-inactive { background: #f1f5f9; color: #64748b; }

.event-edit-btn {
  background: #f8fafc;
  border: none;
  border-radius: 0.375rem;
  padding: 0.35rem 0.6rem;
  color: #64748b;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.15s;
}

.event-edit-btn:hover { background: #e2e8f0; color: #1e293b; }

.event-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
  margin: 0;
}

.event-dates {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.event-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #64748b;
}

.event-details-btn {
  display: inline-flex;
  align-items: center;
  color: #4f46e5;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  margin-top: 0.25rem;
  transition: gap 0.15s;
}

.event-details-btn:hover { color: #3730a3; }

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-state i { font-size: 3rem; }
.empty-state p { font-size: 1rem; margin: 0; }
</style>
