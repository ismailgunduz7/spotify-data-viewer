<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  open: Boolean,
  title: String,
  message: String,
  confirmLabel: String,
  cancelLabel: String,
  variant: { type: String, default: 'default' }, // 'default' | 'danger'
});
const emit = defineEmits(['confirm', 'cancel']);

function onKey(e) {
  if (!props.open) return;
  if (e.key === 'Escape') emit('cancel');
  else if (e.key === 'Enter') emit('confirm');
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

watch(() => props.open, (open) => {
  document.body.style.overflow = open ? 'hidden' : '';
});
</script>

<template>
  <Transition name="fade">
    <div v-if="open" class="overlay" @click.self="emit('cancel')">
      <div class="dialog" role="dialog" aria-modal="true">
        <h3 v-if="title">{{ title }}</h3>
        <p class="message">{{ message }}</p>
        <div class="actions">
          <button type="button" class="btn ghost" @click="emit('cancel')">
            {{ cancelLabel || t('dialog.cancel') }}
          </button>
          <button
            type="button"
            class="btn"
            :class="variant === 'danger' ? 'danger' : 'primary'"
            @click="emit('confirm')"
            autofocus
          >
            {{ confirmLabel || t('dialog.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.dialog {
  background: linear-gradient(180deg, #1a1a1a, #121212);
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 24px 26px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(30, 215, 96, 0.08);
}
h3 {
  margin: 0 0 10px;
  font-size: 1.05rem;
  color: #fff;
  letter-spacing: 0.01em;
}
.message {
  color: #d2d2d2;
  font-size: 0.95rem;
  line-height: 1.45;
  margin: 0 0 22px;
  word-break: break-word;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btn {
  border: 1px solid #2a2a2a;
  background: transparent;
  color: #e9e9e9;
  padding: 9px 18px;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.08s;
}
.btn:hover { transform: translateY(-1px); }
.btn.ghost { color: #b3b3b3; }
.btn.ghost:hover { color: #fff; border-color: #4a4a4a; }
.btn.primary {
  background: #1ed760;
  color: #000;
  border-color: #1ed760;
}
.btn.primary:hover { background: #1fdf64; border-color: #1fdf64; }
.btn.danger {
  background: #ff5252;
  color: #000;
  border-color: #ff5252;
}
.btn.danger:hover { background: #ff6464; border-color: #ff6464; }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-active .dialog,
.fade-leave-active .dialog {
  transition: transform 0.18s ease;
}
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-from .dialog,
.fade-leave-to .dialog { transform: scale(0.96); }
</style>
