import { createI18n } from 'vue-i18n';
import tr from './tr.js';
import en from './en.js';
import es from './es.js';
import fr from './fr.js';
import de from './de.js';
import pt from './pt.js';
import it from './it.js';
import ru from './ru.js';
import zh from './zh.js';
import ja from './ja.js';
import ar from './ar.js';
import hi from './hi.js';

const STORAGE_KEY = 'spotify-viewer-locale';

export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'pt', 'it', 'ru', 'zh', 'ja', 'ar', 'hi', 'tr'];

export const LOCALE_MAP = {
  tr: 'tr-TR',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-BR',
  it: 'it-IT',
  ru: 'ru-RU',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ar: 'ar-SA',
  hi: 'hi-IN',
};

export const RTL_LOCALES = ['ar'];

function detectLocale() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED_LOCALES.includes(saved)) return saved;
  const langs = navigator.languages || [navigator.language || 'en'];
  for (const l of langs) {
    const code = l.toLowerCase().split('-')[0];
    if (SUPPORTED_LOCALES.includes(code)) return code;
  }
  return 'en';
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: { tr, en, es, fr, de, pt, it, ru, zh, ja, ar, hi },
});

export function setLocale(locale) {
  i18n.global.locale.value = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
}

export function getLocale() {
  return i18n.global.locale.value;
}

// Native (endonym) name for each supported locale — what speakers call their own language.
export function getLocaleOptions() {
  return SUPPORTED_LOCALES.map(code => {
    let native = code.toUpperCase();
    try {
      const fmt = new Intl.DisplayNames([LOCALE_MAP[code] || code], { type: 'language' });
      const n = fmt.of(code);
      if (n) native = n.charAt(0).toLocaleUpperCase(LOCALE_MAP[code] || code) + n.slice(1);
    } catch {}
    return { code, native };
  }).sort((a, b) => a.native.localeCompare(b.native));
}
