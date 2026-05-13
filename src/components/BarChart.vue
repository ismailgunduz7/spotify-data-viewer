<script setup>
import { computed } from 'vue';
import { formatDuration } from '../utils/parser.js';

const props = defineProps({
  title: String,
  labels: Array,
  values: Array,
  formatValue: { type: Function, default: formatDuration },
  hideTitle: { type: Boolean, default: false },
});

const max = computed(() => Math.max(...props.values, 1));
const bars = computed(() =>
  props.labels.map((label, i) => ({
    label,
    value: props.values[i],
    pct: (props.values[i] / max.value) * 100,
  }))
);
</script>

<template>
  <div class="panel">
    <h3 v-if="!hideTitle">{{ title }}</h3>
    <div class="chart">
      <div v-for="b in bars" :key="b.label" class="col">
        <div class="bar-wrap">
          <div class="value">{{ formatValue(b.value) }}</div>
          <div class="bar" :style="{ height: b.pct + '%' }"></div>
        </div>
        <div class="label">{{ b.label }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel {
  background: #121212;
  border: 1px solid #232323;
  border-radius: 14px;
  padding: 20px 22px;
}
h3 {
  margin: 0 0 18px;
  font-size: 1.05rem;
  color: #fff;
}
.chart {
  display: flex;
  align-items: stretch;
  gap: 6px;
  height: 220px;
  padding-top: 24px;
}
.col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  height: 100%;
}
.bar-wrap {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  position: relative;
}
.bar {
  width: 100%;
  background: linear-gradient(180deg, #1ed760, #14833b);
  border-radius: 6px 6px 0 0;
  min-height: 2px;
  transition: height 0.4s ease;
}
.bar:hover {
  background: linear-gradient(180deg, #2bea70, #1ed760);
}
.value {
  position: absolute;
  top: -20px;
  font-size: 0.7rem;
  color: #b3b3b3;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.15s;
}
.col:hover .value {
  opacity: 1;
}
.label {
  margin-top: 8px;
  font-size: 0.72rem;
  color: #b3b3b3;
  white-space: nowrap;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 700px) {
  .panel { padding: 16px 14px; }
  h3 { font-size: 0.95rem; }
  .chart { height: 180px; gap: 3px; padding-top: 18px; }
  .label { font-size: 0.62rem; margin-top: 5px; }
  /* The value tooltip is hover-only; on mobile keep it permanently */
  .col:active .value { opacity: 1; }
}
</style>
