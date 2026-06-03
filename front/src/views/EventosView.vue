<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold"><i class="fas fa-calendar-alt me-2 text-primary"></i>Eventos</h4>
      <button class="btn btn-primary" @click="abrirModal()">
        <i class="fas fa-plus me-1"></i>Novo Evento
      </button>
    </div>

    <Alerta :mensagem="alerta.msg" :tipo="alerta.tipo" @fechar="alerta.msg = null" />
    <Carregando v-if="carregando" />

    <div v-else class="row g-3">
      <div v-for="evento in eventos" :key="evento.id" class="col-md-6 col-lg-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="card-title fw-bold mb-0">{{ evento.descricao }}</h6>
              <span :class="`badge ${evento.status === 1 ? 'bg-success' : 'bg-secondary'}`">
                {{ evento.status === 1 ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
            <p class="text-muted small mb-1">
              <i class="fas fa-play me-1"></i>{{ formatarData(evento.inicio) }}
            </p>
            <p class="text-muted small mb-3">
              <i class="fas fa-stop me-1"></i>{{ formatarData(evento.fim) }}
            </p>
            <div class="d-flex gap-2">
              <RouterLink :to="`/eventos/${evento.id}`" class="btn btn-outline-primary btn-sm flex-fill">
                <i class="fas fa-eye me-1"></i>Detalhes
              </RouterLink>
              <button class="btn btn-outline-secondary btn-sm" @click="abrirModal(evento)">
                <i class="fas fa-edit"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="eventos.length === 0" class="col-12 text-center text-muted py-5">
        <i class="fas fa-calendar-times fa-3x mb-3 d-block"></i>
        Nenhum evento cadastrado.
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="modalEvento" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ form.id ? 'Editar' : 'Novo' }} Evento</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Descrição</label>
              <input v-model="form.descricao" type="text" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Início</label>
              <input v-model="form.inicio" type="datetime-local" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Fim</label>
              <input v-model="form.fim" type="datetime-local" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Status</label>
              <select v-model="form.status" class="form-select">
                <option :value="1">Ativo</option>
                <option :value="0">Inativo</option>
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
import { listarEventos, criarEvento, atualizarEvento } from '../services/eventos.service.js';

const eventos = ref([]);
const carregando = ref(false);
const salvando = ref(false);
const alerta = ref({ msg: null, tipo: 'success' });
const form = ref({ id: null, descricao: '', inicio: '', fim: '', status: 1 });

let modal = null;

const formatarData = (d) => d ? new Date(d).toLocaleString('pt-BR') : '-';

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
    : { id: null, descricao: '', inicio: '', fim: '', status: 1 };
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
