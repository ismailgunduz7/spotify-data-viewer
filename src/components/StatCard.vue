<script setup>
defineProps({
  label: String,
  value: [String, Number],
  hint: String,
});
</script>

<template>
  <div class="card">
    <div class="label">{{ label }}</div>
    <div class="value">{{ value }}</div>
    <div v-if="hint" class="hint">{{ hint }}</div>
  </div>
</template>

<style scoped>
.card {
  background: linear-gradient(160deg, #181818, #121212);
  border: 1px solid #232323;
  border-radius: 14px;
  padding: 20px;
  transition: transform 0.15s, border-color 0.2s;
}
.card:hover {
  border-color: #1ed760;
  transform: translateY(-2px);
}
.label {
  color: #b3b3b3;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.value {
  font-size: 1.7rem;
  font-weight: 700;
  color: #fff;
  margin-top: 6px;
  line-height: 1.2;
  word-break: break-word;
}
@media (max-width: 700px) {
  .card { padding: 14px; }
  .value { font-size: 1.3rem; }
  .label { font-size: 0.7rem; }
}
.hint {
  color: #6e6e6e;
  font-size: 0.8rem;
  margin-top: 4px;
}
</style>
