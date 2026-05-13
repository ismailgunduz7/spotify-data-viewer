<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const emit = defineEmits(['files']);
const isDragging = ref(false);
const fileInput = ref(null);

function handleDrop(e) {
  isDragging.value = false;
  const files = [...e.dataTransfer.files].filter(f => f.name.endsWith('.json'));
  if (files.length) emit('files', files);
}

function handleSelect(e) {
  const files = [...e.target.files].filter(f => f.name.endsWith('.json'));
  if (files.length) emit('files', files);
}

function openPicker() {
  fileInput.value?.click();
}
</script>

<template>
  <div
    class="dropzone"
    :class="{ dragging: isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
    @click="openPicker"
  >
    <div class="icon">♪</div>
    <h2>{{ t('drop.title') }}</h2>
    <p>
      <i18n-t keypath="drop.description" tag="span">
        <template #code><code>{{ t('drop.fileName') }}</code></template>
      </i18n-t>
    </p>
    <button type="button" class="btn" @click.stop="openPicker">{{ t('drop.button') }}</button>
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="application/json,.json"
      hidden
      @change="handleSelect"
    />
    <p class="hint">{{ t('drop.hint') }}</p>
  </div>
</template>

<style scoped>
.dropzone {
  border: 2px dashed #2a3a44;
  border-radius: 18px;
  padding: 64px 32px;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
  background: linear-gradient(180deg, rgba(30, 215, 96, 0.04), rgba(255, 255, 255, 0.01));
}
.dropzone:hover, .dragging {
  border-color: #1ed760;
  background: rgba(30, 215, 96, 0.08);
  transform: translateY(-2px);
}
.icon {
  font-size: 64px;
  color: #1ed760;
  line-height: 1;
  margin-bottom: 16px;
}
h2 {
  margin: 0 0 8px;
  font-size: 1.5rem;
  color: #fff;
}
p {
  color: #b3b3b3;
  margin: 4px 0;
}
.hint {
  font-size: 0.85rem;
  color: #6e6e6e;
  margin-top: 18px;
}
code {
  background: #1a1a1a;
  padding: 2px 6px;
  border-radius: 4px;
  color: #1ed760;
  font-size: 0.85em;
}
.btn {
  margin-top: 18px;
  background: #1ed760;
  color: #000;
  border: none;
  padding: 10px 28px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.95rem;
  transition: transform 0.1s, background 0.2s;
}
.btn:hover {
  background: #1fdf64;
  transform: scale(1.04);
}
@media (max-width: 700px) {
  .dropzone { padding: 40px 18px; }
  .icon { font-size: 48px; margin-bottom: 12px; }
  h2 { font-size: 1.15rem; }
  p { font-size: 0.9rem; }
}
</style>
