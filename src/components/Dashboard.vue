<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import StatCard from './StatCard.vue';
import TopList from './TopList.vue';
import BarChart from './BarChart.vue';
import { formatDuration, formatNumber, formatDate, computeTimeBreakdown } from '../utils/parser.js';
import { LOCALE_MAP } from '../i18n';

const { t, tm, locale } = useI18n();

const props = defineProps({
  stats: Object,
  showYearChart: { type: Boolean, default: true },
});
const emit = defineEmits(['reset']);

const regionNames = computed(() => {
  try {
    return new Intl.DisplayNames([LOCALE_MAP[locale.value] || 'en-US'], { type: 'region' });
  } catch {
    return null;
  }
});

const countryItems = computed(() =>
  props.stats.countries.map(c => ({
    ...c,
    name: (regionNames.value && c.name && c.name.length === 2 && regionNames.value.of(c.name)) || c.name,
  }))
);

const yearLabels = computed(() => props.stats.yearSeries.map(y => y.year));
const yearValues = computed(() => props.stats.yearSeries.map(y => y.ms));

const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}`);
const weekdayLabels = computed(() => tm('weekdays.short'));

function formatAvgMs(ms) {
  const h = t('duration.hour');
  const m = t('duration.minute');
  const s = t('duration.second');
  if (!ms || ms < 0) return `0${s}`;
  if (ms < 60000) {
    const seconds = Math.max(1, Math.round(ms / 1000));
    return `${seconds}${s}`;
  }
  const totalMin = ms / 60000;
  if (totalMin >= 60) {
    const hh = Math.floor(totalMin / 60);
    const mm = Math.round(totalMin % 60);
    return `${hh}${h} ${mm}${m}`;
  }
  return `${Math.round(totalMin)}${m}`;
}

const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const timeZone = ref(localTz);
const aggMode = ref('total'); // 'total' | 'avg'

const popularTzs = [
  'UTC',
  'Europe/Istanbul',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Dubai',
  'Australia/Sydney',
];
const tzOptions = computed(() => {
  const set = new Set([localTz, ...popularTzs]);
  return [...set];
});

const breakdown = computed(() => computeTimeBreakdown(props.stats.validRecords, timeZone.value));
const hourValues = computed(() => aggMode.value === 'avg' ? breakdown.value.avgByHour : breakdown.value.byHour);
const weekdayValues = computed(() => aggMode.value === 'avg' ? breakdown.value.avgByWeekday : breakdown.value.byWeekday);
const valueFormatter = computed(() => aggMode.value === 'avg' ? formatAvgMs : formatDuration);

const limit = ref(15);

const skipPct = computed(() =>
  props.stats.totalPlays
    ? ((props.stats.skipCount / props.stats.totalPlays) * 100).toFixed(1) + '%'
    : '0%'
);
const shufflePct = computed(() =>
  props.stats.totalPlays
    ? ((props.stats.shuffleCount / props.stats.totalPlays) * 100).toFixed(1) + '%'
    : '0%'
);
</script>

<template>
  <div class="dashboard">
    <header class="hero">
      <div>
        <h1>{{ t('dashboard.title') }}</h1>
        <p class="range">
          {{ t('dashboard.range', { from: formatDate(stats.firstTs), to: formatDate(stats.lastTs) }) }}
        </p>
      </div>
    </header>

    <section class="stats-grid">
      <StatCard
        :label="t('stats.totalListening')"
        :value="formatDuration(stats.totalMs)"
        :hint="t('stats.totalPlaysHint', { count: formatNumber(stats.totalPlays) })"
      />
      <StatCard :label="t('stats.uniqueArtists')" :value="formatNumber(stats.uniqueArtists)" />
      <StatCard :label="t('stats.uniqueTracks')" :value="formatNumber(stats.uniqueTracks)" />
      <StatCard :label="t('stats.uniqueAlbums')" :value="formatNumber(stats.uniqueAlbums)" />
      <StatCard
        :label="t('stats.skipRate')"
        :value="skipPct"
        :hint="t('stats.skipHint', { count: formatNumber(stats.skipCount) })"
      />
      <StatCard :label="t('stats.shuffleRate')" :value="shufflePct" />
    </section>

    <section v-if="showYearChart && yearLabels.length > 1" class="chart-row">
      <BarChart :title="t('charts.byYear')" :labels="yearLabels" :values="yearValues" />
    </section>

    <div class="time-controls">
      <div class="control">
        <label>{{ t('filters.timezone') }}</label>
        <select v-model="timeZone">
          <option v-for="tz in tzOptions" :key="tz" :value="tz">
            {{ tz === localTz ? `${t('filters.localPrefix')} (${tz})` : tz }}
          </option>
        </select>
      </div>
      <div class="toggle">
        <button :class="{ active: aggMode === 'total' }" @click="aggMode = 'total'" type="button">{{ t('filters.aggTotal') }}</button>
        <button :class="{ active: aggMode === 'avg' }" @click="aggMode = 'avg'" type="button">{{ t('filters.aggAvg') }}</button>
      </div>
    </div>

    <section class="chart-row two">
      <BarChart
        :title="t('charts.byHour')"
        :labels="hourLabels"
        :values="hourValues"
        :format-value="valueFormatter"
      />
      <BarChart
        :title="t('charts.byWeekday')"
        :labels="weekdayLabels"
        :values="weekdayValues"
        :format-value="valueFormatter"
      />
    </section>

    <div class="controls">
      <label>{{ t('filters.listSize') }}</label>
      <select v-model.number="limit">
        <option v-for="n in [10, 15, 25, 50, 100]" :key="n" :value="n">{{ t('filters.topN', { n }) }}</option>
      </select>
    </div>

    <section class="lists">
      <TopList :title="t('lists.topArtists')" :items="stats.topArtists" :limit="limit" :subtitle-key="null" sortable />
      <TopList :title="t('lists.topTracks')" :items="stats.topTracks" :limit="limit" subtitle-key="artist" sortable />
      <TopList :title="t('lists.topAlbums')" :items="stats.topAlbums" :limit="limit" subtitle-key="artist" sortable />
    </section>

    <section class="lists two">
      <TopList :title="t('lists.platforms')" :items="stats.platforms" :limit="10" :subtitle-key="null" />
      <TopList :title="t('lists.countries')" :items="countryItems" :limit="10" :subtitle-key="null" />
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
}
h1 {
  margin: 0;
  font-size: 2.4rem;
  color: #fff;
  letter-spacing: -0.02em;
  background: linear-gradient(90deg, #fff 0%, #1ed760 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.range {
  color: #b3b3b3;
  margin: 6px 0 0;
  font-size: 0.95rem;
}
.reset {
  background: transparent;
  border: 1px solid #2a2a2a;
  color: #b3b3b3;
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.15s;
}
.reset:hover {
  background: #1a1a1a;
  color: #fff;
  border-color: #1ed760;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}
.chart-row.two {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 18px;
}
.lists.two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.chart-row:not(.two) > * { width: 100%; }
.lists {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 18px;
}
.time-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px 16px;
  background: #121212;
  border: 1px solid #232323;
  border-radius: 12px;
  font-size: 0.88rem;
  color: #b3b3b3;
  margin-top: -8px;
}
.time-controls .control {
  display: flex;
  align-items: center;
  gap: 8px;
}
.time-controls select {
  background: #1a1a1a;
  color: #fff;
  border: 1px solid #2a2a2a;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
}
.time-controls .toggle {
  margin-left: auto;
  display: inline-flex;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 999px;
  padding: 3px;
  gap: 2px;
}
.time-controls .toggle button {
  background: transparent;
  border: none;
  color: #b3b3b3;
  padding: 6px 16px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  transition: background 0.15s, color 0.15s;
}
.time-controls .toggle button:hover { color: #fff; }
.time-controls .toggle button.active {
  background: #1ed760;
  color: #000;
}
.controls {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #b3b3b3;
  font-size: 0.9rem;
}
.controls select {
  background: #1a1a1a;
  color: #fff;
  border: 1px solid #2a2a2a;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}
.controls select:focus { outline: 1px solid #1ed760; }

@media (max-width: 900px) {
  .chart-row.two { grid-template-columns: 1fr; }
}
@media (max-width: 700px) {
  .dashboard { gap: 20px; }
  h1 { font-size: 1.6rem; }
  .range { font-size: 0.85rem; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .lists.two { grid-template-columns: 1fr; }
  .lists { grid-template-columns: 1fr; gap: 14px; }
  .time-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 12px;
  }
  .time-controls .control { flex-wrap: wrap; }
  .time-controls .control select { flex: 1; min-width: 0; }
  .time-controls .toggle {
    margin-left: 0;
    align-self: stretch;
    justify-content: center;
  }
  .time-controls .toggle button { flex: 1; }
  .controls select { flex: 1; }
}
@media (max-width: 420px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
