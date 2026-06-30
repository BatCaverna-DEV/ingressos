<template>
  <div>
    <div class="page-header">
      <div>
        <h4 class="page-title">Validar Ingresso</h4>
        <p class="page-subtitle">Digite o código ou escaneie o QR Code pela câmera</p>
      </div>
    </div>

    <div class="validator-wrapper">
      <!-- Card principal -->
      <div class="validator-card">
        <div class="validator-icon">
          <i class="fas fa-qrcode"></i>
        </div>
        <h5 class="validator-label">Código do Ingresso</h5>

        <div class="input-group-custom">
          <input
            v-model="codigo"
            type="text"
            class="code-input"
            placeholder="ING-XXXXXXXX"
            @keyup.enter="validar"
            :disabled="carregando"
          />
          <button class="validate-btn" @click="validar" :disabled="carregando || !codigo">
            <span v-if="carregando" class="spinner-border spinner-border-sm"></span>
            <span v-else><i class="fas fa-check"></i> Validar</span>
          </button>
        </div>

        <div class="divider"><span>ou</span></div>

        <button class="camera-btn" @click="alternarCamera" :class="{ 'camera-btn-active': scanAtivo }">
          <i :class="`fas fa-${scanAtivo ? 'stop-circle' : 'camera'} me-2`"></i>
          {{ scanAtivo ? 'Parar câmera' : 'Escanear com câmera' }}
        </button>
      </div>

      <!-- Leitor de câmera -->
      <div v-show="scanAtivo" class="camera-card">
        <div class="camera-header">
          <i class="fas fa-camera me-2"></i> Aponte a câmera para o QR Code
        </div>
        <div class="camera-viewport">
          <div id="qr-reader"></div>
          <div class="scan-overlay">
            <div class="scan-frame">
              <span class="corner tl"></span>
              <span class="corner tr"></span>
              <span class="corner bl"></span>
              <span class="corner br"></span>
            </div>
            <div class="scan-line"></div>
          </div>
        </div>
      </div>

      <!-- Resultado -->
      <transition name="fade">
        <div v-if="resultado" :class="`result-card result-${resultado.tipo}`">
          <div class="result-icon">
            <i :class="`fas fa-${resultado.icone}`"></i>
          </div>
          <div class="result-content">
            <h5 class="result-title">{{ resultado.titulo }}</h5>
            <p class="result-msg">{{ resultado.mensagem }}</p>
            <div v-if="resultado.ingresso" class="result-details">
              <div class="result-detail-item">
                <span class="detail-label">Evento</span>
                <span class="detail-value">{{ resultado.ingresso.evento?.descricao }}</span>
              </div>
              <div class="result-detail-item">
                <span class="detail-label">Categoria</span>
                <span class="detail-value">{{ resultado.ingresso.categoria?.descricao }}</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { Html5Qrcode } from 'html5-qrcode';
import { validarIngresso } from '../services/ingressos.service.js';

const codigo = ref('');
const carregando = ref(false);
const resultado = ref(null);
const scanAtivo = ref(false);
let scanner = null;

const validar = async (codigoParam) => {
  const cod = (typeof codigoParam === 'string' ? codigoParam : codigo.value).trim();
  if (!cod) return;
  carregando.value = true;
  resultado.value = null;
  try {
    const { data } = await validarIngresso(cod);
    resultado.value = {
      tipo: 'success',
      icone: 'check-circle',
      titulo: 'Ingresso válido!',
      mensagem: data.mensagem,
      ingresso: data.dados,
    };
    codigo.value = '';
  } catch (e) {
    resultado.value = {
      tipo: 'danger',
      icone: 'times-circle',
      titulo: 'Ingresso inválido',
      mensagem: e.response?.data?.mensagem || 'Erro ao validar ingresso',
      ingresso: null,
    };
  } finally {
    carregando.value = false;
  }
};

const alternarCamera = async () => {
  if (scanAtivo.value) {
    await pararCamera();
  } else {
    await iniciarCamera();
  }
};

const iniciarCamera = async () => {
  scanAtivo.value = true;
  await new Promise(r => setTimeout(r, 100)); // aguarda o elemento aparecer no DOM

  scanner = new Html5Qrcode('qr-reader');
  try {
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      async (decodedText) => {
        await pararCamera();
        await validar(decodedText);
      },
      () => {}
    );
  } catch {
    scanAtivo.value = false;
    resultado.value = {
      tipo: 'danger',
      icone: 'times-circle',
      titulo: 'Câmera indisponível',
      mensagem: 'Não foi possível acessar a câmera. Verifique as permissões do navegador.',
      ingresso: null,
    };
  }
};

const pararCamera = async () => {
  if (scanner) {
    try { await scanner.stop(); } catch {}
    try { scanner.clear(); } catch {}
    scanner = null;
  }
  scanAtivo.value = false;
};

onUnmounted(() => pararCamera());
</script>

<style scoped>
.page-header { margin-bottom: 2rem; }

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

.validator-wrapper {
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.validator-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  text-align: center;
}

.validator-icon {
  width: 64px;
  height: 64px;
  border-radius: 1rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin: 0 auto 1.25rem;
}

.validator-label {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.25rem;
}

.input-group-custom {
  display: flex;
  gap: 0.5rem;
}

.code-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.625rem;
  font-family: monospace;
  font-size: 1rem;
  letter-spacing: 0.05em;
  color: #1e293b;
  outline: none;
  transition: border-color 0.15s;
}

.code-input:focus { border-color: #4f46e5; }
.code-input::placeholder { color: #cbd5e1; letter-spacing: 0; }

.validate-btn {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.625rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  transition: opacity 0.15s;
}

.validate-btn:hover { opacity: 0.9; }
.validate-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.25rem 0;
  color: #cbd5e1;
  font-size: 0.8rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.camera-btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.625rem;
  border: 2px solid #e2e8f0;
  background: white;
  color: #4f46e5;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-btn:hover {
  border-color: #4f46e5;
  background: #f5f3ff;
}

.camera-btn-active {
  border-color: #dc2626;
  color: #dc2626;
  background: #fff1f2;
}

.camera-btn-active:hover {
  border-color: #dc2626;
  background: #fee2e2;
}

/* Câmera */
.camera-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
}

.camera-header {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.camera-viewport {
  position: relative;
}

#qr-reader {
  width: 100%;
}

/* Oculta UI padrão do html5-qrcode */
#qr-reader video { width: 100% !important; }
#qr-reader__scan_region { position: relative; }
#qr-reader__dashboard { display: none !important; }

.scan-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scan-frame {
  position: relative;
  width: 220px;
  height: 220px;
}

.corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border-color: #7c3aed;
  border-style: solid;
}

.corner.tl { top: 0; left: 0; border-width: 3px 0 0 3px; border-radius: 4px 0 0 0; }
.corner.tr { top: 0; right: 0; border-width: 3px 3px 0 0; border-radius: 0 4px 0 0; }
.corner.bl { bottom: 0; left: 0; border-width: 0 0 3px 3px; border-radius: 0 0 0 4px; }
.corner.br { bottom: 0; right: 0; border-width: 0 3px 3px 0; border-radius: 0 0 4px 0; }

.scan-line {
  position: absolute;
  width: 220px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #7c3aed, transparent);
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0%   { transform: translateY(-110px); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(110px); opacity: 0; }
}

/* Resultado */
.result-card {
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.result-success { background: #f0fdf4; border: 1.5px solid #bbf7d0; }
.result-danger  { background: #fff1f2; border: 1.5px solid #fecdd3; }

.result-icon { font-size: 1.75rem; flex-shrink: 0; margin-top: 0.1rem; }
.result-success .result-icon { color: #16a34a; }
.result-danger .result-icon  { color: #dc2626; }

.result-content { flex: 1; }

.result-title { font-weight: 700; font-size: 1rem; margin: 0 0 0.25rem; }
.result-success .result-title { color: #15803d; }
.result-danger .result-title  { color: #b91c1c; }

.result-msg { font-size: 0.875rem; margin: 0; color: #64748b; }

.result-details {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-detail-item { display: flex; justify-content: space-between; font-size: 0.85rem; }
.detail-label { color: #94a3b8; }
.detail-value { font-weight: 600; color: #1e293b; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
