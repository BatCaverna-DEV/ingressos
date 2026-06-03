<template>
  <div>
    <div class="d-flex align-items-center gap-3 mb-4">
      <RouterLink to="/eventos" class="btn btn-outline-secondary btn-sm">
        <i class="fas fa-arrow-left"></i>
      </RouterLink>
      <h4 class="fw-bold mb-0">
        <i class="fas fa-calendar-alt me-2 text-primary"></i>{{ evento?.descricao }}
      </h4>
    </div>

    <Alerta :mensagem="alerta.msg" :tipo="alerta.tipo" @fechar="alerta.msg = null" />
    <Carregando v-if="carregando" />

    <div v-else-if="evento" class="row g-4">
      <div class="col-md-4">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h6 class="text-muted text-uppercase small mb-3">Informações</h6>
            <p><strong>Início:</strong> {{ formatarData(evento.inicio) }}</p>
            <p><strong>Fim:</strong> {{ formatarData(evento.fim) }}</p>
            <p class="mb-0">
              <strong>Status:</strong>
              <span :class="`badge ms-1 ${evento.status === 1 ? 'bg-success' : 'bg-secondary'}`">
                {{ evento.status === 1 ? 'Ativo' : 'Inativo' }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <h6 class="mb-0"><i class="fas fa-ticket-alt me-2"></i>Ingressos ({{ ingressos.length }})</h6>
            <button class="btn btn-primary btn-sm" @click="abrirModalIngresso">
              <i class="fas fa-plus me-1"></i>Emitir
            </button>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Código</th>
                    <th>Categoria</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ing in ingressos" :key="ing.id">
                    <td class="font-monospace small">{{ ing.codigo }}</td>
                    <td>{{ ing.categoria?.descricao }}</td>
                    <td>
                      <span :class="`badge ${statusBadge(ing.status)}`">{{ statusLabel(ing.status) }}</span>
                    </td>
                  </tr>
                  <tr v-if="ingressos.length === 0">
                    <td colspan="3" class="text-center text-muted py-4">Nenhum ingresso emitido.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ingresso -->
    <div class="modal fade" id="modalIngresso" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Emitir Ingresso</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Categoria</label>
              <select v-model="formIngresso.categorias_id" class="form-select" required>
                <option value="">Selecione...</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.descricao }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Descrição (opcional)</label>
              <input v-model="formIngresso.descricao" type="text" class="form-control" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="emitirIngresso" :disabled="salvando">
              <span v-if="salvando" class="spinner-border spinner-border-sm me-1"></span>
              Emitir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Modal } from 'bootstrap';
import Alerta from '../components/Alerta.vue';
import Carregando from '../components/Carregando.vue';
import { buscarEvento } from '../services/eventos.service.js';
import { listarIngressos, criarIngresso } from '../services/ingressos.service.js';
import { listarCategorias } from '../services/categorias.service.js';

const route = useRoute();
const evento = ref(null);
const ingressos = ref([]);
const categorias = ref([]);
const carregando = ref(false);
const salvando = ref(false);
const alerta = ref({ msg: null, tipo: 'success' });
const formIngresso = ref({ categorias_id: '', descricao: '' });

let modal = null;

const formatarData = (d) => d ? new Date(d).toLocaleString('pt-BR') : '-';
const statusLabel = (s) => ({ 1: 'Disponível', 2: 'Usado', 0: 'Cancelado' }[s] || '-');
const statusBadge = (s) => ({ 1: 'bg-success', 2: 'bg-primary', 0: 'bg-secondary' }[s] || 'bg-secondary');

onMounted(async () => {
  modal = new Modal(document.getElementById('modalIngresso'));
  carregando.value = true;
  try {
    const [ev, ings, cats] = await Promise.all([
      buscarEvento(route.params.id),
      listarIngressos(route.params.id),
      listarCategorias(),
    ]);
    evento.value = ev.data.dados;
    ingressos.value = ings.data.dados;
    categorias.value = cats.data.dados;
  } catch {
    alerta.value = { msg: 'Erro ao carregar dados', tipo: 'danger' };
  } finally {
    carregando.value = false;
  }
});

const abrirModalIngresso = () => {
  formIngresso.value = { categorias_id: '', descricao: '' };
  modal.show();
};

const emitirIngresso = async () => {
  if (!formIngresso.value.categorias_id) return;
  salvando.value = true;
  try {
    await criarIngresso({ ...formIngresso.value, eventos_id: route.params.id });
    modal.hide();
    alerta.value = { msg: 'Ingresso emitido!', tipo: 'success' };
    const { data } = await listarIngressos(route.params.id);
    ingressos.value = data.dados;
  } catch (e) {
    alerta.value = { msg: e.response?.data?.mensagem || 'Erro ao emitir', tipo: 'danger' };
  } finally {
    salvando.value = false;
  }
};
</script>
