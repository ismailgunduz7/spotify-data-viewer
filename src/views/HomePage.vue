<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import FileDrop from '../components/FileDrop.vue';
import Dashboard from '../components/Dashboard.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import { parseFiles } from '../utils/parser.js';
import { setLocale, getLocaleOptions } from '../i18n';

const localeOptions = getLocaleOptions();
const { t, locale } = useI18n();

function changeLocale(loc) {
  setLocale(loc);
}

const loading = ref(false);
const error = ref('');
const stats = ref(null);
const yearFilter = ref('all');
const files = ref([]);
const showFilePanel = ref(false);
const addInput = ref(null);

const confirmState = ref({
  open: false, title: '', message: '', confirmLabel: '', variant: 'default', resolve: null,
});

function askConfirm({ title, message, confirmLabel, variant } = {}) {
  return new Promise((resolve) => {
    confirmState.value = {
      open: true,
      title: title || '',
      message: message || '',
      confirmLabel: confirmLabel || '',
      variant: variant || 'default',
      resolve,
    };
  });
}

function resolveConfirm(value) {
  const r = confirmState.value.resolve;
  confirmState.value.open = false;
  confirmState.value.resolve = null;
  if (r) r(value);
}

async function ingestFile(f) {
  const text = await f.text();
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data)) return { name: f.name, records: data, enabled: true };
    return { name: f.name, records: [], enabled: false, errorKey: 'errorNotArray' };
  } catch {
    return { name: f.name, records: [], enabled: false, errorKey: 'errorInvalid' };
  }
}

async function handleFiles(rawFiles) {
  loading.value = true;
  error.value = '';
  try {
    const result = [];
    for (const f of rawFiles) result.push(await ingestFile(f));
    const totalCount = result.reduce((s, f) => s + f.records.length, 0);
    if (totalCount === 0) {
      error.value = t('app.errorParse');
      loading.value = false;
      return;
    }
    files.value = result;
    recompute();
  } catch (e) {
    error.value = t('app.errorGeneric', { message: e.message });
  }
  loading.value = false;
}

async function addMoreFiles(rawFiles) {
  loading.value = true;
  error.value = '';
  try {
    const accepted = [];
    for (const f of rawFiles) {
      const existingIdx = files.value.findIndex(x => x.name === f.name);
      if (existingIdx !== -1) {
        const ok = await askConfirm({
          title: t('files.duplicateTitle'),
          message: t('files.duplicateConfirm', { name: f.name }),
          confirmLabel: t('dialog.replace'),
          variant: 'danger',
        });
        if (!ok) continue;
        const parsed = await ingestFile(f);
        files.value.splice(existingIdx, 1, parsed);
        accepted.push(parsed);
      } else {
        const parsed = await ingestFile(f);
        files.value.push(parsed);
        accepted.push(parsed);
      }
    }
    if (accepted.length) recompute();
  } catch (e) {
    error.value = t('app.errorGeneric', { message: e.message });
  }
  loading.value = false;
}

function openAddPicker() { addInput.value?.click(); }
function onAddSelected(e) {
  const list = [...e.target.files].filter(f => f.name.endsWith('.json'));
  e.target.value = '';
  if (list.length) addMoreFiles(list);
}

const enabledRecords = computed(() => {
  const out = [];
  for (const f of files.value) if (f.enabled) out.push(...f.records);
  return out;
});
const enabledCount = computed(() => files.value.filter(f => f.enabled).length);
const availableYears = computed(() => {
  const set = new Set();
  for (const r of enabledRecords.value) if (r && r.ts) set.add(new Date(r.ts).getUTCFullYear());
  return [...set].sort((a, b) => a - b);
});

function recompute() {
  let recs = enabledRecords.value;
  if (yearFilter.value !== 'all') {
    const y = Number(yearFilter.value);
    recs = recs.filter(r => r && r.ts && new Date(r.ts).getUTCFullYear() === y);
  }
  if (recs.length === 0) { stats.value = null; return; }
  stats.value = parseFiles(recs);
}

function toggleFile(file) {
  file.enabled = !file.enabled;
  if (!availableYears.value.includes(Number(yearFilter.value))) yearFilter.value = 'all';
  recompute();
}
function setAll(enabled) {
  for (const f of files.value) if (!f.errorKey) f.enabled = enabled;
  if (!availableYears.value.includes(Number(yearFilter.value))) yearFilter.value = 'all';
  recompute();
}
function reset() {
  stats.value = null;
  files.value = [];
  yearFilter.value = 'all';
  error.value = '';
  showFilePanel.value = false;
}
</script>

<template>
  <div>
    <template v-if="!files.length">
      <div class="hero-row">
        <div class="brand">
          <span class="dot"></span>
          <span>{{ t('app.brand') }}</span>
        </div>
        <div class="hero-actions">
          <RouterLink to="/help" class="help-link">
            <span class="help-icon">?</span>
            {{ t('app.helpLink') }}
          </RouterLink>
          <div class="lang-control">
            <label>{{ t('filters.language') }}</label>
            <select :value="locale" @change="changeLocale($event.target.value)">
              <option v-for="l in localeOptions" :key="l.code" :value="l.code">{{ l.native }}</option>
            </select>
          </div>
        </div>
      </div>
      <FileDrop @files="handleFiles" />
      <div v-if="loading" class="loading">{{ t('app.loading') }}</div>
      <div v-if="error" class="error">{{ error }}</div>
    </template>

    <template v-else>
      <div class="sticky-head">
        <div class="filter-bar">
          <button class="file-pill" @click="showFilePanel = !showFilePanel" type="button">
            <span class="dot-mini"></span>
            <i18n-t keypath="files.pill" tag="span">
              <template #enabled><strong>{{ enabledCount }}</strong></template>
              <template #total>{{ files.length }}</template>
            </i18n-t>
            <span class="chev" :class="{ open: showFilePanel }">▾</span>
          </button>
          <div class="bar-right">
            <div class="year-filter">
              <label>{{ t('filters.year') }}</label>
              <select v-model="yearFilter" @change="recompute">
                <option value="all">{{ t('filters.all') }}</option>
                <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
            <div class="year-filter">
              <label>{{ t('filters.language') }}</label>
              <select :value="locale" @change="changeLocale($event.target.value)">
                <option v-for="l in localeOptions" :key="l.code" :value="l.code">{{ l.native }}</option>
              </select>
            </div>
            <RouterLink to="/help" class="help-pill" :title="t('app.helpLink')">?</RouterLink>
          </div>
        </div>

        <div v-if="showFilePanel" class="file-panel">
          <div class="file-panel-head">
            <span>{{ t('files.title') }}</span>
            <div class="file-panel-actions">
              <button @click="openAddPicker" type="button" class="primary">{{ t('files.addFiles') }}</button>
              <button @click="setAll(true)" type="button">{{ t('files.selectAll') }}</button>
              <button @click="setAll(false)" type="button">{{ t('files.selectNone') }}</button>
              <button @click="reset" type="button" class="danger">{{ t('files.reset') }}</button>
            </div>
            <input ref="addInput" type="file" multiple accept="application/json,.json" hidden @change="onAddSelected" />
          </div>
          <ul class="file-list">
            <li v-for="f in files" :key="f.name" :class="{ disabled: f.errorKey }">
              <label>
                <input type="checkbox" :checked="f.enabled" :disabled="!!f.errorKey" @change="toggleFile(f)" />
                <span class="fname" :title="f.name">{{ f.name }}</span>
                <span v-if="f.errorKey" class="ferror">{{ t('files.' + f.errorKey) }}</span>
                <span v-else class="fcount">{{ t('files.records', { count: f.records.length.toLocaleString() }) }}</span>
              </label>
            </li>
          </ul>
        </div>
      </div>

      <Dashboard v-if="stats" :stats="stats" :show-year-chart="yearFilter === 'all'" @reset="reset" />
      <div v-else class="empty">{{ t('app.noData') }}</div>
    </template>

    <ConfirmDialog
      :open="confirmState.open"
      :title="confirmState.title"
      :message="confirmState.message"
      :confirm-label="confirmState.confirmLabel"
      :variant="confirmState.variant"
      @confirm="resolveConfirm(true)"
      @cancel="resolveConfirm(false)"
    />
  </div>
</template>

<style scoped>
.hero-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.hero-row .brand { margin-bottom: 0; }
.hero-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.help-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #b3b3b3;
  text-decoration: none;
  font-size: 0.85rem;
  padding: 6px 14px;
  border: 1px solid #2a2a2a;
  border-radius: 999px;
  transition: border-color 0.15s, color 0.15s;
}
.help-link:hover { color: #fff; border-color: #1ed760; }
.help-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #1ed760;
  color: #000;
  font-weight: 800;
  font-size: 0.75rem;
}
.help-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px; height: 30px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  color: #e9e9e9;
  border-radius: 50%;
  text-decoration: none;
  font-weight: 700;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.help-pill:hover { color: #000; background: #1ed760; border-color: #1ed760; }

.lang-control {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #b3b3b3;
  font-size: 0.85rem;
}
.lang-control select {
  background: #1a1a1a;
  color: #fff;
  border: 1px solid #2a2a2a;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #b3b3b3;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
}
.dot {
  width: 10px;
  height: 10px;
  background: #1ed760;
  border-radius: 50%;
  box-shadow: 0 0 12px #1ed760;
}
.loading { margin-top: 24px; text-align: center; color: #b3b3b3; }
.error {
  margin-top: 24px;
  padding: 14px 18px;
  background: rgba(255, 70, 70, 0.1);
  border: 1px solid rgba(255, 70, 70, 0.4);
  color: #ff9b9b;
  border-radius: 10px;
}
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 14px;
  background: #121212;
  border: 1px solid #232323;
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 0.88rem;
  color: #b3b3b3;
}
.sticky-head {
  position: sticky;
  top: 12px;
  z-index: 50;
  margin-bottom: 16px;
  max-height: calc(100vh - 24px);
  display: flex;
  flex-direction: column;
  pointer-events: none;
}
.sticky-head > * { pointer-events: auto; }
.sticky-head .filter-bar {
  margin-bottom: 0;
  background: rgba(18, 18, 18, 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}
.sticky-head .file-panel {
  margin: 8px 0 0;
  background: rgba(18, 18, 18, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
  overflow: auto;
  min-height: 0;
  flex: 0 1 auto;
}
.bar-right {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
@media (max-width: 720px) {
  .filter-bar { padding: 10px 12px; gap: 10px; }
  .file-pill { width: 100%; justify-content: center; }
  .bar-right { width: 100%; justify-content: space-between; gap: 10px; }
  .bar-right .year-filter { flex: 1; }
  .bar-right .year-filter select { width: 100%; }
  .bar-right .year-filter label { font-size: 0.75rem; color: #8a8a8a; }
  .help-pill { flex-shrink: 0; }
  .sticky-head { top: 8px; }
}
.file-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  color: #e9e9e9;
  padding: 7px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: border-color 0.15s, background 0.15s;
}
.file-pill:hover { border-color: #1ed760; }
.file-pill strong { color: #1ed760; font-size: 0.92rem; }
.dot-mini {
  width: 7px; height: 7px;
  background: #1ed760;
  border-radius: 50%;
  box-shadow: 0 0 8px #1ed760;
}
.chev { font-size: 0.75rem; color: #6e6e6e; transition: transform 0.2s; }
.chev.open { transform: rotate(180deg); }

.year-filter { display: flex; align-items: center; gap: 8px; }
.year-filter select {
  background: #1a1a1a;
  color: #fff;
  border: 1px solid #2a2a2a;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.file-panel {
  background: #121212;
  border: 1px solid #232323;
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 24px;
}
.file-panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: #b3b3b3;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex-wrap: wrap;
  gap: 10px;
}
.file-panel-actions { display: flex; gap: 8px; }
.file-panel-actions button {
  background: transparent;
  color: #b3b3b3;
  border: 1px solid #2a2a2a;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  cursor: pointer;
  text-transform: none;
  letter-spacing: 0;
}
.file-panel-actions button:hover { color: #fff; border-color: #1ed760; }
.file-panel-actions button.danger:hover { color: #ff9b9b; border-color: #ff6464; }
.file-panel-actions button.primary {
  background: #1ed760;
  color: #000;
  border-color: #1ed760;
  font-weight: 700;
}
.file-panel-actions button.primary:hover {
  background: #1fdf64;
  color: #000;
  border-color: #1fdf64;
}
.file-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 6px;
}
@media (max-width: 720px) {
  .file-list { grid-template-columns: 1fr; }
  .file-panel { padding: 14px 14px; }
  .file-panel-head { flex-direction: column; align-items: flex-start; gap: 8px; }
  .file-panel-actions { width: 100%; flex-wrap: wrap; }
  .file-panel-actions button { flex: 1 1 auto; }
}
.file-list li label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s;
  font-size: 0.86rem;
  color: #e9e9e9;
}
.file-list li label:hover { background: #1a1a1a; }
.file-list li.disabled label { cursor: not-allowed; opacity: 0.5; }
.file-list input[type=checkbox] {
  accent-color: #1ed760;
  width: 16px;
  height: 16px;
  cursor: pointer;
}
.fname {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  direction: rtl;
  text-align: left;
  unicode-bidi: plaintext;
}
.fcount {
  color: #6e6e6e;
  font-size: 0.76rem;
  font-variant-numeric: tabular-nums;
}
.ferror { color: #ff9b9b; font-size: 0.76rem; }

.empty { text-align: center; padding: 60px; color: #6e6e6e; }
</style>
