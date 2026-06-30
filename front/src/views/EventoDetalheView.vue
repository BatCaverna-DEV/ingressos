<template>
  <div>
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <RouterLink to="/eventos" class="back-btn">
          <i class="fas fa-arrow-left"></i>
        </RouterLink>
        <div>
          <h4 class="page-title">{{ evento?.descricao || 'Carregando...' }}</h4>
          <p class="page-subtitle">Detalhes, inscrições e ingressos</p>
        </div>
      </div>
    </div>

    <Alerta :mensagem="alerta.msg" :tipo="alerta.tipo" @fechar="alerta.msg = null" />
    <Carregando v-if="carregando" />

    <div v-else-if="evento" class="detail-layout">
      <!-- Painel lateral -->
      <div class="side-panel">
        <div class="info-card">
          <h6 class="card-section-title">Informações</h6>
          <div class="info-item">
            <span class="info-label">Status</span>
            <span :class="`event-status ${evento.status === 1 ? 'status-active' : 'status-inactive'}`">
              {{ evento.status === 1 ? 'Ativo' : 'Inativo' }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Início</span>
            <span class="info-value">{{ formatarData(evento.inicio) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Fim</span>
            <span class="info-value">{{ formatarData(evento.fim) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Ingressos/inscrição</span>
            <span class="info-value fw-bold">{{ evento.quantidade }}</span>
          </div>
          <template v-if="isAdmin">
            <div class="info-item">
              <span class="info-label">Inscrições</span>
              <span class="info-value fw-bold">{{ inscricoes.length }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ingressos emitidos</span>
              <span class="info-value fw-bold">{{ ingressos.length }}</span>
            </div>
          </template>
        </div>

        <button v-if="isAdmin" class="btn-primary-action w-100 mt-3" @click="abrirModalInscricao">
          <i class="fas fa-user-plus"></i> Inscrever Usuário
        </button>

        <!-- Auto-inscrição para usuário Padrão -->
        <div v-else class="self-inscricao-card mt-3">
          <!-- Pendente -->
          <div v-if="minhaInscricao?.status === 0">
            <p class="self-status-label"><i class="fas fa-clock me-1" style="color:#f59e0b"></i> Inscrição pendente</p>
            <p class="self-status-sub">Aguardando validação do administrador.</p>
            <p class="self-status-sub">Categoria: <strong>{{ minhaInscricao.categoria?.descricao }}</strong></p>
            <button class="btn-cancel w-100 mt-2" @click="cancelarMinhaInscricao" :disabled="salvando">
              <span v-if="salvando" class="spinner-border spinner-border-sm me-1"></span>
              Cancelar inscrição
            </button>
          </div>
          <!-- Deferida -->
          <div v-else-if="minhaInscricao?.status === 1">
            <p class="self-status-label"><i class="fas fa-check-circle me-1" style="color:#16a34a"></i> Inscrição confirmada</p>
            <p class="self-status-sub">Categoria: <strong>{{ minhaInscricao.categoria?.descricao }}</strong></p>
            <p class="self-status-sub mt-2" style="font-size:0.75rem;color:#94a3b8">
              <i class="fas fa-lock me-1"></i> Cancelamento disponível apenas com o administrador.
            </p>
          </div>
          <!-- Indeferida -->
          <div v-else-if="minhaInscricao?.status === 2">
            <p class="self-status-label"><i class="fas fa-times-circle me-1" style="color:#dc2626"></i> Inscrição indeferida</p>
            <p class="self-status-sub">Sua inscrição foi recusada pelo administrador.</p>
          </div>
          <!-- Sem inscrição -->
          <div v-else>
            <p class="self-status-label">Inscreva-se neste evento</p>
            <p class="self-status-sub">Após validação pelo administrador, seus ingressos serão liberados.</p>
            <button class="btn-primary-action w-100 mt-3" @click="inscrever" :disabled="salvando">
              <span v-if="salvando" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="fas fa-ticket-alt me-1"></i> Inscrever-me
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs admin -->
      <div v-if="isAdmin" class="main-panel">
        <div class="tabs">
          <button :class="`tab ${aba === 'inscricoes' ? 'tab-active' : ''}`" @click="aba = 'inscricoes'">
            <i class="fas fa-users me-1"></i> Inscrições ({{ inscricoes.length }})
          </button>
          <button :class="`tab ${aba === 'ingressos' ? 'tab-active' : ''}`" @click="aba = 'ingressos'">
            <i class="fas fa-ticket-alt me-1"></i> Ingressos ({{ ingressos.length }})
          </button>
        </div>

        <!-- Inscrições -->
        <div v-if="aba === 'inscricoes'" class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Ingressos</th>
                <th>Data</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ins in inscricoes" :key="ins.id">
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">{{ iniciais(ins.usuario?.nome) }}</div>
                    <div>
                      <div class="user-name">{{ ins.usuario?.nome }}</div>
                      <div class="user-email">{{ ins.usuario?.email }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ ins.categoria?.descricao }}</td>
                <td>
                  <span :class="`ins-status ins-status-${ins.status}`">{{ inscricaoStatusLabel(ins.status) }}</span>
                </td>
                <td>
                  <span class="qtd-badge">{{ ins.ingressos?.length || 0 }} ingresso(s)</span>
                </td>
                <td class="text-muted small">{{ formatarData(ins.createdAt) }}</td>
                <td class="text-end">
                  <div class="action-group">
                    <button v-if="ins.status === 0" class="action-btn action-success" @click="deferirFn(ins)" title="Deferir">
                      <i class="fas fa-check"></i>
                    </button>
                    <button v-if="ins.status === 0" class="action-btn action-danger" @click="indeferirFn(ins)" title="Indeferir">
                      <i class="fas fa-times"></i>
                    </button>
                    <button v-if="ins.status !== 0" class="action-btn action-danger" @click="cancelarInscricaoFn(ins)" title="Cancelar inscrição">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="inscricoes.length === 0">
                <td colspan="6" class="empty-row">Nenhuma inscrição realizada.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Ingressos -->
        <div v-if="aba === 'ingressos'" class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>QR</th>
                <th>Código</th>
                <th>Usuário</th>
                <th>Categoria</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ing in ingressos" :key="ing.id">
                <td>
                  <img
                    v-if="ing.qrcode"
                    :src="ing.qrcode"
                    class="qr-thumb"
                    :alt="ing.codigo"
                    @click="qrSelecionado = ing"
                    title="Ver QR Code"
                  />
                </td>
                <td><code class="ticket-code">{{ ing.codigo }}</code></td>
                <td>
                  <div v-if="ing.usuario" class="user-cell">
                    <div class="user-avatar small-avatar">{{ iniciais(ing.usuario?.nome) }}</div>
                    <span class="small">{{ ing.usuario?.nome }}</span>
                  </div>
                  <span v-else class="text-muted small">—</span>
                </td>
                <td>{{ ing.categoria?.descricao }}</td>
                <td>
                  <span :class="`ticket-status ${statusClass(ing.status)}`">
                    {{ statusLabel(ing.status) }}
                  </span>
                </td>
              </tr>
              <tr v-if="ingressos.length === 0">
                <td colspan="5" class="empty-row">Nenhum ingresso emitido.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Ingressos do usuário Padrão -->
      <div v-else-if="minhaInscricao?.status === 1" class="main-panel">
        <div class="tabs">
          <button class="tab tab-active">
            <i class="fas fa-ticket-alt me-1"></i> Meus Ingressos ({{ minhaInscricao.ingressos?.length || 0 }})
          </button>
        </div>

        <div class="tickets-grid">
          <div
            v-for="(ing, idx) in minhaInscricao.ingressos"
            :key="ing.id"
            :class="`ticket-card ${ing.status === 2 ? 'ticket-used' : ing.status === 0 ? 'ticket-cancelled' : ''}`"
            :ref="el => { if (el) ticketRefs[ing.id] = el }"
          >
            <!-- Cabeçalho -->
            <div class="ticket-header">
              <div class="ticket-header-left">
                <i class="fas fa-ticket-alt ticket-icon"></i>
                <span class="ticket-label">INGRESSO</span>
              </div>
              <span :class="`ticket-status-badge ${statusClass(ing.status)}`">
                {{ statusLabel(ing.status) }}
              </span>
            </div>

            <!-- Corpo -->
            <div class="ticket-body">
              <div class="ticket-info">
                <p class="ticket-event">{{ evento?.descricao }}</p>
                <p class="ticket-meta"><i class="fas fa-calendar-alt me-1"></i>{{ formatarData(evento?.inicio) }}</p>
                <p class="ticket-meta"><i class="fas fa-map-marker-alt me-1"></i>IFMA Campus Coelho Neto</p>
                <p class="ticket-meta"><i class="fas fa-tags me-1"></i>{{ minhaInscricao.categoria?.descricao }}</p>
                <p class="ticket-num">#{{ String(idx + 1).padStart(2, '0') }}</p>
              </div>

              <!-- Perfuração -->
              <div class="ticket-perforation">
                <div class="perf-circle perf-top"></div>
                <div class="perf-line"></div>
                <div class="perf-circle perf-bottom"></div>
              </div>

              <!-- QR -->
              <div class="ticket-qr-side">
                <img
                  v-if="ing.qrcode"
                  :src="ing.qrcode"
                  class="ticket-qr-img"
                  :alt="ing.codigo"
                  @click="qrSelecionado = { ...ing }"
                  title="Clique para ampliar"
                />
                <code class="ticket-code-small">{{ ing.codigo }}</code>
              </div>
            </div>

            <!-- Rodapé -->
            <div class="ticket-footer">
              <span>Apresente o QR Code na entrada</span>
              <div class="ticket-actions">
                <a :href="ing.qrcode" :download="`${ing.codigo}.png`" class="ticket-download">
                  <i class="fas fa-qrcode"></i> QR Code
                </a>
                <button class="ticket-download" @click="baixarPDF(ing)">
                  <i class="fas fa-file-pdf"></i> PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Inscrição (admin) -->
    <div v-if="isAdmin" class="modal fade" id="modalInscricao" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">Inscrever Usuário</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted small mb-3">
              Serão emitidos automaticamente <strong>{{ evento?.quantidade }}</strong> ingresso(s) ao confirmar.
            </p>
            <div class="mb-3">
              <label class="form-label fw-semibold">Usuário</label>
              <select v-model="formInscricao.usuarios_id" class="form-select">
                <option value="">Selecione...</option>
                <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.nome }} — {{ u.email }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Categoria do ingresso</label>
              <select v-model="formInscricao.categorias_id" class="form-select">
                <option value="">Selecione...</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.descricao }}</option>
              </select>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn-primary-action" @click="inscrever" :disabled="salvando">
              <span v-if="salvando" class="spinner-border spinner-border-sm me-1"></span>
              Inscrever
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal QR Code -->
    <div v-if="qrSelecionado" class="qr-overlay" @click.self="qrSelecionado = null">
      <div class="qr-modal">
        <button class="qr-close" @click="qrSelecionado = null"><i class="fas fa-times"></i></button>
        <img :src="qrSelecionado.qrcode" :alt="qrSelecionado.codigo" class="qr-full" />
        <code class="qr-code-label">{{ qrSelecionado.codigo }}</code>
        <a :href="qrSelecionado.qrcode" :download="`${qrSelecionado.codigo}.png`" class="qr-download">
          <i class="fas fa-download me-1"></i> Baixar QR Code
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRoute } from 'vue-router';
import { Modal } from 'bootstrap';
import Alerta from '../components/Alerta.vue';
import Carregando from '../components/Carregando.vue';
import { buscarEvento } from '../services/eventos.service.js';
import { listarIngressos } from '../services/ingressos.service.js';
import { listarCategorias } from '../services/categorias.service.js';
import { listarInscricoes, criarInscricao, deferirInscricao, indeferirInscricao, cancelarInscricao } from '../services/inscricoes.service.js';
import { getUsuario } from '../services/auth.service.js';
import api from '../services/api.js';

const route = useRoute();
const usuarioAtual = getUsuario();
const isAdmin = computed(() => usuarioAtual?.categoria === 1);

const evento = ref(null);
const ingressos = ref([]);
const inscricoes = ref([]);
const categorias = ref([]);
const usuarios = ref([]);
const carregando = ref(false);
const salvando = ref(false);
const alerta = ref({ msg: null, tipo: 'success' });
const formInscricao = ref({ usuarios_id: '', categorias_id: '' });
const qrSelecionado = ref(null);
const aba = ref('inscricoes');
const ticketRefs = ref({});
let modal = null;

const minhaInscricao = computed(() =>
  inscricoes.value.find(i => i.usuarios_id === usuarioAtual?.id) || null
);

const formatarData = (d) => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
const statusLabel = (s) => ({ 1: 'Disponível', 2: 'Usado', 0: 'Cancelado' }[s] || '-');
const statusClass = (s) => ({ 1: 'status-available', 2: 'status-used', 0: 'status-cancelled' }[s] || '');
const inscricaoStatusLabel = (s) => ({ 0: 'Pendente', 1: 'Deferida', 2: 'Indeferida' }[s] ?? '-');
const iniciais = (nome) => (nome || '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

onMounted(async () => {
  await carregar();
  if (isAdmin.value) {
    modal = new Modal(document.getElementById('modalInscricao'));
  }
});

const carregar = async () => {
  carregando.value = true;
  try {
    const promises = [
      buscarEvento(route.params.id),
      listarInscricoes({ eventos_id: route.params.id }),
    ];
    if (isAdmin.value) {
      promises.push(listarCategorias());
      promises.push(listarIngressos(route.params.id));
      promises.push(api.get('/usuarios'));
    }
    const [ev, ins, cats, ings, usrs] = await Promise.all(promises);
    evento.value = ev.data.dados;
    inscricoes.value = ins.data.dados;
    if (isAdmin.value) {
      categorias.value = cats.data.dados;
      ingressos.value = ings.data.dados;
      usuarios.value = usrs.data.dados;
    }
  } catch {
    alerta.value = { msg: 'Erro ao carregar dados', tipo: 'danger' };
  } finally {
    carregando.value = false;
  }
};

const abrirModalInscricao = () => {
  formInscricao.value = { usuarios_id: '', categorias_id: '' };
  modal.show();
};

const inscrever = async () => {
  if (isAdmin.value && (!formInscricao.value.usuarios_id || !formInscricao.value.categorias_id)) return;
  if (!confirm(`Deseja realmente se inscrever no evento "${evento.value?.descricao}"?`)) return;
  salvando.value = true;
  try {
    await criarInscricao({ ...formInscricao.value, eventos_id: route.params.id });
    if (isAdmin.value) modal.hide();
    alerta.value = { msg: 'Inscrição realizada!', tipo: 'success' };
    formInscricao.value = { usuarios_id: '', categorias_id: '' };
    await carregar();
  } catch (e) {
    alerta.value = { msg: e.response?.data?.mensagem || 'Erro ao inscrever', tipo: 'danger' };
  } finally {
    salvando.value = false;
  }
};

const deferirFn = async (ins) => {
  try {
    await deferirInscricao(ins.id);
    alerta.value = { msg: `Inscrição de ${ins.usuario?.nome} deferida! Ingressos emitidos.`, tipo: 'success' };
    await carregar();
  } catch (e) {
    alerta.value = { msg: e.response?.data?.mensagem || 'Erro ao deferir', tipo: 'danger' };
  }
};

const indeferirFn = async (ins) => {
  if (!confirm(`Indeferir a inscrição de ${ins.usuario?.nome}?`)) return;
  try {
    await indeferirInscricao(ins.id);
    alerta.value = { msg: `Inscrição de ${ins.usuario?.nome} indeferida.`, tipo: 'warning' };
    await carregar();
  } catch (e) {
    alerta.value = { msg: e.response?.data?.mensagem || 'Erro ao indeferir', tipo: 'danger' };
  }
};

const cancelarInscricaoFn = async (ins) => {
  if (!confirm(`Cancelar inscrição de ${ins.usuario?.nome}? Os ingressos serão invalidados.`)) return;
  try {
    await cancelarInscricao(ins.id);
    alerta.value = { msg: 'Inscrição cancelada.', tipo: 'success' };
    await carregar();
  } catch (e) {
    alerta.value = { msg: e.response?.data?.mensagem || 'Erro ao cancelar', tipo: 'danger' };
  }
};

const baixarPDF = async (ing) => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Card dimensions (centered, 70% width)
  const cardW = pageW * 0.7;
  const cardX = (pageW - cardW) / 2;
  const cardY = (pageH - 130) / 2;

  // Fundo da página
  pdf.setFillColor(248, 250, 252);
  pdf.rect(0, 0, pageW, pageH, 'F');

  // Card background
  pdf.setFillColor(250, 245, 255);
  pdf.setDrawColor(233, 213, 255);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(cardX, cardY, cardW, 130, 4, 4, 'FD');

  // Header gradient (simulado com retângulo roxo)
  pdf.setFillColor(79, 70, 229);
  pdf.roundedRect(cardX, cardY, cardW, 14, 4, 4, 'F');
  pdf.setFillColor(79, 70, 229);
  pdf.rect(cardX, cardY + 8, cardW, 6, 'F');

  // Header text
  pdf.setTextColor(224, 231, 255);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INGRESSO', cardX + 5, cardY + 9);

  const statusTxt = { 1: 'DISPONÍVEL', 2: 'USADO', 0: 'CANCELADO' }[ing.status] || '';
  pdf.setFontSize(6.5);
  pdf.text(statusTxt, cardX + cardW - 5, cardY + 9, { align: 'right' });

  // Linha divisória pontilhada vertical
  const divX = cardX + cardW - 65;
  pdf.setDrawColor(196, 181, 253);
  pdf.setLineWidth(0.4);
  pdf.setLineDashPattern([1.5, 1.5], 0);
  pdf.line(divX, cardY + 14, divX, cardY + 130);
  pdf.setLineDashPattern([], 0);

  // Semicírculos na divisória
  pdf.setFillColor(248, 250, 252);
  pdf.circle(divX, cardY + 14, 3, 'F');
  pdf.circle(divX, cardY + 130, 3, 'F');

  // Informações (lado esquerdo)
  const infoX = cardX + 6;
  let infoY = cardY + 26;

  pdf.setTextColor(30, 27, 75);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  const titulo = pdf.splitTextToSize(evento.value?.descricao || '', divX - cardX - 12);
  pdf.text(titulo, infoX, infoY);
  infoY += titulo.length * 6 + 3;

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 116, 139);

  const linhas = [
    `Data: ${formatarData(evento.value?.inicio)}`,
    `Local: IFMA Campus Coelho Neto`,
    `Categoria: ${minhaInscricao.value?.categoria?.descricao || ''}`,
  ];
  for (const linha of linhas) {
    pdf.text(linha, infoX, infoY);
    infoY += 6;
  }

  pdf.setFontSize(7);
  pdf.setTextColor(196, 181, 253);
  pdf.setFont('helvetica', 'bold');
  pdf.text(ing.codigo, infoX, cardY + 122);

  // QR Code (lado direito, grande)
  if (ing.qrcode) {
    const qrSize = 52;
    const qrX = divX + (65 - qrSize) / 2;
    const qrY = cardY + 20;
    pdf.addImage(ing.qrcode, 'PNG', qrX, qrY, qrSize, qrSize);

    pdf.setFontSize(5.5);
    pdf.setTextColor(124, 58, 237);
    pdf.setFont('helvetica', 'normal');
    pdf.text(ing.codigo, divX + 32.5, cardY + 76, { align: 'center' });
  }

  // Rodapé do card
  pdf.setFillColor(237, 233, 254, 0.3);
  pdf.rect(cardX, cardY + 120, cardW, 10, 'F');
  pdf.setDrawColor(196, 181, 253);
  pdf.setLineWidth(0.3);
  pdf.setLineDashPattern([1.5, 1.5], 0);
  pdf.line(cardX, cardY + 120, cardX + cardW, cardY + 120);
  pdf.setLineDashPattern([], 0);

  pdf.setFontSize(6.5);
  pdf.setTextColor(148, 163, 184);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Apresente este QR Code na entrada do evento', cardX + cardW / 2, cardY + 126, { align: 'center' });

  pdf.save(`${ing.codigo}.pdf`);
};

const cancelarMinhaInscricao = async () => {
  if (!confirm('Cancelar sua inscrição? Seus ingressos serão invalidados.')) return;
  salvando.value = true;
  try {
    await cancelarInscricao(minhaInscricao.value.id);
    alerta.value = { msg: 'Inscrição cancelada.', tipo: 'success' };
    await carregar();
  } catch (e) {
    alerta.value = { msg: e.response?.data?.mensagem || 'Erro ao cancelar', tipo: 'danger' };
  } finally {
    salvando.value = false;
  }
};
</script>

<style scoped>
.page-header { margin-bottom: 2rem; }

.page-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e1b4b;
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0.15rem 0 0;
}

.back-btn {
  width: 38px;
  height: 38px;
  border-radius: 0.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  text-decoration: none;
  flex-shrink: 0;
  transition: all 0.15s;
}

.back-btn:hover { background: #f1f5f9; color: #1e293b; }

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
  justify-content: center;
  gap: 0.5rem;
  transition: opacity 0.15s;
}

.btn-primary-action:hover { opacity: 0.9; }
.btn-primary-action:disabled { opacity: 0.6; cursor: not-allowed; }
.w-100 { width: 100%; }

.detail-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.side-panel { display: flex; flex-direction: column; }

.info-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
}

.card-section-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-item:last-child { border-bottom: none; }
.info-label { font-size: 0.85rem; color: #64748b; }
.info-value { font-size: 0.85rem; color: #1e293b; }

.event-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
}

.status-active { background: #dcfce7; color: #16a34a; }
.status-inactive { background: #f1f5f9; color: #64748b; }

.main-panel { display: flex; flex-direction: column; gap: 0; }

.tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.tab {
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  background: white;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.tab:hover { color: #1e293b; }

.tab-active {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white !important;
  font-weight: 600;
}

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
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #f8fafc;
  color: #374151;
}

.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #fafafa; }

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.user-avatar {
  width: 34px;
  height: 34px;
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

.small-avatar { width: 26px; height: 26px; font-size: 0.65rem; }

.user-name { font-weight: 600; color: #1e293b; font-size: 0.875rem; }
.user-email { color: #94a3b8; font-size: 0.78rem; }

.qtd-badge {
  background: #ede9fe;
  color: #7c3aed;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
}

.ticket-code {
  font-family: monospace;
  font-size: 0.8rem;
  background: #f1f5f9;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  color: #4f46e5;
}

.ticket-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
}

.status-available { background: #dcfce7; color: #16a34a; }
.status-used { background: #dbeafe; color: #2563eb; }
.status-cancelled { background: #f1f5f9; color: #64748b; }

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

.action-danger:hover { background: #fee2e2; color: #dc2626; }
.action-success { color: #16a34a; }
.action-success:hover { background: #dcfce7; color: #15803d; }

.action-group {
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
}

.ins-status {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.ins-status-0 { background: #fef9c3; color: #a16207; }
.ins-status-1 { background: #dcfce7; color: #16a34a; }
.ins-status-2 { background: #fee2e2; color: #dc2626; }

/* ── Tickets ── */
.tickets-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.ticket-card {
  background: linear-gradient(135deg, #faf5ff 0%, #f0f9ff 100%);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(79, 70, 229, 0.18), 0 2px 8px rgba(0,0,0,0.06);
  overflow: visible;
  position: relative;
  border: 1px solid #e9d5ff;
}

.ticket-used { opacity: 0.6; }
.ticket-cancelled { opacity: 0.5; }

.ticket-header {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  padding: 0.75rem 1.25rem;
  border-radius: 1rem 1rem 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ticket-header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
}

.ticket-icon { font-size: 1rem; color: #c4b5fd; }

.ticket-label {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #e0e7ff;
}

.ticket-status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
}

.ticket-body {
  display: flex;
  align-items: stretch;
  min-height: 140px;
}

.ticket-info {
  flex: 1;
  padding: 1.1rem 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.3rem;
}

.ticket-event {
  font-size: 1rem;
  font-weight: 700;
  color: #1e1b4b;
  margin: 0 0 0.35rem;
  line-height: 1.3;
}

.ticket-meta {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0;
}

.ticket-meta i { color: #a5b4fc; width: 14px; }

.ticket-num {
  font-size: 0.72rem;
  font-weight: 700;
  color: #c4b5fd;
  margin: 0.4rem 0 0;
  letter-spacing: 0.05em;
}

.ticket-perforation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  position: relative;
  width: 20px;
  flex-shrink: 0;
}

.perf-circle {
  width: 20px;
  height: 20px;
  background: #f1f5f9;
  border-radius: 50%;
  flex-shrink: 0;
  z-index: 1;
}

.perf-line {
  flex: 1;
  border-left: 2px dashed #c4b5fd;
  margin: 0 auto;
}

.ticket-qr-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background: rgba(237, 233, 254, 0.5);
  min-width: 175px;
}

.ticket-qr-img {
  width: 140px;
  height: 140px;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  transition: transform 0.15s, box-shadow 0.15s;
}

.ticket-qr-img:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.ticket-code-small {
  font-family: monospace;
  font-size: 0.62rem;
  color: #7c3aed;
  background: #ede9fe;
  padding: 0.15rem 0.4rem;
  border-radius: 0.25rem;
  text-align: center;
  word-break: break-all;
  max-width: 110px;
}

.ticket-footer {
  background: rgba(237, 233, 254, 0.3);
  border-top: 1px dashed #c4b5fd;
  padding: 0.6rem 1.25rem;
  border-radius: 0 0 1rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #94a3b8;
}

.ticket-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.ticket-download {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  color: #7c3aed;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 600;
  background: #ede9fe;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  padding: 0.45rem 0.85rem;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}

.ticket-download:hover {
  background: #7c3aed;
  color: white;
}

.empty-row {
  text-align: center;
  color: #94a3b8;
  padding: 2rem !important;
}

.qr-thumb {
  width: 48px;
  height: 48px;
  border-radius: 0.375rem;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  transition: transform 0.15s;
}

.qr-thumb:hover { transform: scale(1.1); }

.qr-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.qr-modal {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
  max-width: 320px;
  width: 90%;
}

.qr-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: #f1f5f9;
  border: none;
  border-radius: 0.375rem;
  padding: 0.35rem 0.6rem;
  cursor: pointer;
  color: #64748b;
}

.qr-close:hover { background: #e2e8f0; }
.qr-full { width: 220px; height: 220px; }

.qr-code-label {
  font-family: monospace;
  font-size: 0.85rem;
  background: #f1f5f9;
  padding: 0.4rem 0.75rem;
  border-radius: 0.375rem;
  color: #4f46e5;
}

.qr-download {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: opacity 0.15s;
}

.qr-download:hover { opacity: 0.9; color: white; }

.self-inscricao-card {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
}

.self-status-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.self-status-sub {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}

.btn-cancel {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: opacity 0.15s;
}

.btn-cancel:hover { opacity: 0.85; }
.btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 768px) {
  .detail-layout { grid-template-columns: 1fr; }
}
</style>
