<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatDuration, formatNumber, formatDate } from '../utils/parser.js';

const { t } = useI18n();

const props = defineProps({
  title: String,
  items: Array,
  limit: { type: Number, default: 10 },
  subtitleKey: { type: String, default: 'artist' },
  sortable: { type: Boolean, default: false },
});

const sortBy = ref('ms');

const sorted = computed(() => {
  const arr = [...props.items];
  if (sortBy.value === 'plays') {
    arr.sort((a, b) => (b.plays || 0) - (a.plays || 0));
  } else {
    arr.sort((a, b) => b.ms - a.ms);
  }
  return arr;
});

const list = computed(() => sorted.value.slice(0, props.limit));
const maxValue = computed(() => {
  const top = list.value[0];
  if (!top) return 1;
  return sortBy.value === 'plays' ? (top.plays || 1) : top.ms;
});
</script>

<template>
  <div class="panel">
    <div class="head">
      <h3>{{ title }}</h3>
      <div v-if="sortable" class="sort-wrap">
        <span class="sort-label">{{ t('filters.sortBy') }}</span>
        <div class="sort-toggle">
          <button :class="{ active: sortBy === 'ms' }" @click="sortBy = 'ms'" type="button">{{ t('filters.sortDuration') }}</button>
          <button :class="{ active: sortBy === 'plays' }" @click="sortBy = 'plays'" type="button">{{ t('filters.sortPlays') }}</button>
        </div>
      </div>
    </div>
    <ol class="list">
      <li v-for="(item, i) in list" :key="item.name + (item.artist || '')">
        <div class="rank">{{ i + 1 }}</div>
        <div class="info">
          <div class="row">
            <span class="name" :title="item.name">{{ item.name }}</span>
            <span class="time">
              {{ sortBy === 'plays' && item.plays != null
                ? t('lists.plays', { count: formatNumber(item.plays) })
                : formatDuration(item.ms) }}
            </span>
          </div>
          <div class="row sub">
            <span class="sub-text">
              <template v-if="subtitleKey && item[subtitleKey]">{{ item[subtitleKey] }}</template>
              <template v-if="item.plays != null">
                <template v-if="subtitleKey && item[subtitleKey]"> · </template>
                {{ sortBy === 'plays' ? formatDuration(item.ms) : t('lists.plays', { count: formatNumber(item.plays) }) }}
              </template>
            </span>
            <span
              v-if="item.firstTs"
              class="first-played"
              :title="t('lists.firstPlayedTitle', { date: formatDate(item.firstTs) })"
            >
              ↪ {{ formatDate(item.firstTs) }}
            </span>
          </div>
          <div class="bar">
            <div
              class="fill"
              :style="{ width: ((sortBy === 'plays' ? (item.plays || 0) : item.ms) / maxValue * 100) + '%' }"
            ></div>
          </div>
        </div>
      </li>
    </ol>
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
  margin: 0;
  font-size: 1.05rem;
  color: #fff;
  letter-spacing: 0.02em;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.sort-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.sort-label {
  color: #b3b3b3;
  font-size: 0.78rem;
  letter-spacing: 0.02em;
}
.sort-toggle {
  display: inline-flex;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 999px;
  padding: 2px;
  gap: 2px;
}
.sort-toggle button {
  background: transparent;
  border: none;
  color: #b3b3b3;
  padding: 4px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  transition: background 0.15s, color 0.15s;
}
.sort-toggle button:hover { color: #fff; }
.sort-toggle button.active {
  background: #1ed760;
  color: #000;
}
@media (max-width: 700px) {
  .panel { padding: 16px 14px; }
  .head { flex-wrap: wrap; }
  h3 { font-size: 0.95rem; }
  li { gap: 10px; }
  .rank { font-size: 0.95rem; width: 20px; }
  .name { font-size: 0.88rem; }
  .first-played { font-size: 0.68rem; }
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
li {
  display: flex;
  gap: 14px;
  align-items: center;
}
.rank {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1ed760;
  width: 26px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.info { flex: 1; min-width: 0; }
.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}
.name {
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.time {
  color: #b3b3b3;
  font-size: 0.82rem;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
.sub-text {
  color: #6e6e6e;
  font-size: 0.78rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.first-played {
  color: #6e6e6e;
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  white-space: nowrap;
}
.bar {
  margin-top: 6px;
  height: 3px;
  background: #232323;
  border-radius: 2px;
  overflow: hidden;
}
.fill {
  height: 100%;
  background: linear-gradient(90deg, #1ed760, #1db954);
  border-radius: 2px;
}
</style>
