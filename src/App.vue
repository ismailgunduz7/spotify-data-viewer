<script setup>
import { useI18n } from 'vue-i18n';
import { RouterView } from 'vue-router';

const { t } = useI18n();
</script>

<template>
  <div class="page">
    <main class="container">
      <RouterView v-slot="{ Component }">
        <KeepAlive>
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </main>
    <footer>
      <span>{{ t('app.footer') }}</span>
    </footer>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.container {
  flex: 1;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px 28px 60px;
}
@media (max-width: 720px) {
  .container { padding: 16px 14px 60px; }
}
footer {
  text-align: center;
  color: #6e6e6e;
  font-size: 0.78rem;
  padding: 20px;
  border-top: 1px solid #181818;
}
</style>
