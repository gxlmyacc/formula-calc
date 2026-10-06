import { createContext, useContext } from 'react';
import messages from './en.json';

export type Locale = 'zh' | 'en';
export const LocaleContext = createContext<Locale>('zh');

const english: Record<string, string> = messages;

export function translate(locale: Locale, text: string, values: Record<string, string | number> = {}): string {
  const template = locale === 'en' && Object.prototype.hasOwnProperty.call(english, text) ? english[text] : text;
  return template.replace(/\{(\w+)\}/g, (match, key) => (Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match));
}

export function preferredLocale(saved: string | null, browserLanguage: string): Locale {
  return saved === 'zh' || saved === 'en' ? saved : browserLanguage.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export function useI18n() {
  const locale = useContext(LocaleContext);
  return { locale, t: (text: string, values?: Record<string, string | number>) => translate(locale, text, values) };
}
