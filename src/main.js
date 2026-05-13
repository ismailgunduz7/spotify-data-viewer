import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { i18n, RTL_LOCALES } from './i18n'
import { router } from './router'

const initial = i18n.global.locale.value;
document.documentElement.lang = initial;
document.documentElement.dir = RTL_LOCALES.includes(initial) ? 'rtl' : 'ltr';

createApp(App).use(i18n).use(router).mount('#app')
