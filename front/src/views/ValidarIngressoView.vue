<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <h4 class="fw-bold mb-4"><i class="fas fa-qrcode me-2 text-primary"></i>Validar Ingresso</h4>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <label class="form-label">Código do Ingresso</label>
          <div class="input-group">
            <input
              v-model="codigo"
              type="text"
              class="form-control form-control-lg font-monospace"
              placeholder="ING-XXXXXXXX"
              @keyup.enter="validar"
            />
            <button class="btn btn-primary" @click="validar" :disabled="carregando || !codigo">
              <span v-if="carregando" class="spinner-border spinner-border-sm"></span>
              <i v-else class="fas fa-check-circle"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-if="resultado" :class="`card border-0 shadow-sm border-start border-4 border-${resultado.tipo}`">
        <div class="card-body">
          <div class="d-flex align-items-center gap-3">
            <i :class="`fas fa-${resultado.icone} fa-2x text-${resultado.tipo}`"></i>
            <div>
              <h6 class="mb-1 fw-bold">{{ resultado.titulo }}</h6>
              <p class="mb-0 text-muted small">{{ resultado.mensagem }}</p>
            </div>
          </div>
          <div v-if="resultado.ingresso" class="mt-3 pt-3 border-top">
            <p class="mb-1"><strong>Evento:</strong> {{ resultado.ingresso.evento?.descricao }}</p>
            <p class="mb-0"><strong>Categoria:</strong> {{ resultado.ingresso.categoria?.descricao }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { validarIngresso } from '../services/ingressos.service.js';

const codigo = ref('');
const carregando = ref(false);
const resultado = ref(null);

const validar = async () => {
  if (!codigo.value) return;
  carregando.value = true;
  resultado.value = null;
  try {
    const { data } = await validarIngresso(codigo.value.trim());
    resultado.value = {
      tipo: 'success',
      icone: 'check-circle',
      titulo: 'Ingresso válido!',
      mensagem: data.mensagem,
      ingresso: data.dados,
    };
    codigo.value = '';
  } catch (e) {
    const msg = e.response?.data?.mensagem || 'Erro ao validar ingresso';
    resultado.value = {
      tipo: 'danger',
      icone: 'times-circle',
      titulo: 'Ingresso inválido',
      mensagem: msg,
      ingresso: null,
    };
  } finally {
    carregando.value = false;
  }
};
</script>
