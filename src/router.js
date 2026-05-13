import { createRouter, createWebHashHistory } from 'vue-router';
import HomePage from './views/HomePage.vue';
import HelpPage from './views/HelpPage.vue';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/help', name: 'help', component: HelpPage },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});
