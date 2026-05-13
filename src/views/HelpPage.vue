<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import { setLocale, getLocaleOptions } from '../i18n';

const { t, tm, locale } = useI18n();
const localeOptions = getLocaleOptions();

const steps = computed(() => tm('help.steps'));

function changeLocale(loc) {
  setLocale(loc);
}

const PRIVACY_URL = 'https://www.spotify.com/account/privacy/';
</script>

<template>
  <div class="help">
    <div class="head">
      <RouterLink to="/" class="back-link">← {{ t('help.back') }}</RouterLink>
      <div class="lang-control">
        <label>{{ t('filters.language') }}</label>
        <select :value="locale" @change="changeLocale($event.target.value)">
          <option v-for="l in localeOptions" :key="l.code" :value="l.code">{{ l.native }}</option>
        </select>
      </div>
    </div>

    <header class="hero">
      <h1>{{ t('help.title') }}</h1>
      <p class="lead">{{ t('help.intro') }}</p>
    </header>

    <ol class="steps">
      <li v-for="(s, i) in steps" :key="i">
        <div class="num">{{ i + 1 }}</div>
        <div class="body">
          <h3>{{ s.title }}</h3>
          <p>{{ s.description }}</p>
          <a v-if="i === 0" :href="PRIVACY_URL" target="_blank" rel="noopener noreferrer" class="ext-link">
            {{ t('help.openSpotify') }} ↗
          </a>
        </div>
      </li>
    </ol>

    <div class="note">
      <span class="icon">⏱</span>
      <p>{{ t('help.waitNote') }}</p>
    </div>
    <div class="note privacy">
      <span class="icon">🔒</span>
      <p>{{ t('help.privacyNote') }}</p>
    </div>

    <div class="cta-row">
      <RouterLink to="/" class="cta">{{ t('help.ctaBack') }}</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.help {
  max-width: 820px;
  margin: 0 auto;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #b3b3b3;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 6px 14px;
  border: 1px solid #2a2a2a;
  border-radius: 999px;
  transition: border-color 0.15s, color 0.15s;
}
.back-link:hover { color: #fff; border-color: #1ed760; }

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

.hero { margin-bottom: 32px; }
h1 {
  margin: 0 0 10px;
  font-size: 2.4rem;
  letter-spacing: -0.02em;
  background: linear-gradient(90deg, #fff 0%, #1ed760 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.lead {
  color: #b3b3b3;
  font-size: 1.05rem;
  margin: 0;
  line-height: 1.55;
}

.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.steps li {
  display: flex;
  gap: 18px;
  padding: 22px 24px;
  background: linear-gradient(160deg, #161616, #101010);
  border: 1px solid #232323;
  border-radius: 14px;
  transition: border-color 0.15s, transform 0.15s;
}
.steps li:hover {
  border-color: rgba(30, 215, 96, 0.4);
  transform: translateY(-1px);
}
.num {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1ed760;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.05rem;
}
.body { flex: 1; min-width: 0; }
.body h3 {
  margin: 6px 0 8px;
  color: #fff;
  font-size: 1.08rem;
}
.body p {
  margin: 0;
  color: #c8c8c8;
  line-height: 1.55;
  font-size: 0.96rem;
}
.ext-link {
  display: inline-block;
  margin-top: 12px;
  color: #1ed760;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
  padding: 6px 14px;
  border: 1px solid rgba(30, 215, 96, 0.4);
  border-radius: 999px;
  transition: background 0.15s, color 0.15s;
}
.ext-link:hover {
  background: #1ed760;
  color: #000;
}

.note {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-top: 24px;
  padding: 14px 18px;
  background: rgba(30, 215, 96, 0.06);
  border: 1px solid rgba(30, 215, 96, 0.2);
  border-radius: 12px;
  color: #c8c8c8;
  font-size: 0.92rem;
  line-height: 1.5;
}
.note p { margin: 0; }
.note .icon { font-size: 1.1rem; }
.note.privacy {
  background: rgba(180, 180, 180, 0.04);
  border-color: #2a2a2a;
}

.cta-row {
  margin-top: 36px;
  display: flex;
  justify-content: center;
}
.cta {
  display: inline-block;
  background: #1ed760;
  color: #000;
  text-decoration: none;
  padding: 12px 28px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.98rem;
  transition: background 0.15s, transform 0.1s;
}
.cta:hover {
  background: #1fdf64;
  transform: scale(1.03);
}

@media (max-width: 700px) {
  h1 { font-size: 1.7rem; }
  .lead { font-size: 0.95rem; }
  .steps li { padding: 16px 16px; gap: 12px; }
  .num { width: 30px; height: 30px; font-size: 0.95rem; }
  .body h3 { font-size: 1rem; }
}
</style>
