import { writable, derived } from 'svelte/store';
import en from './en.json';
import th from './th.json';

const dictionaries: Record<string, any> = { en, th };

export const locale = writable<string>('th'); // Use Thai as default since rule says Thai for implementation, let's keep it localized but switchable

export const t = derived(locale, ($locale) => {
    return (key: string, vars: Record<string, string | number> = {}) => {
        let text = dictionaries[$locale]?.[key] || dictionaries['en']?.[key] || key;
        
        for (const [k, v] of Object.entries(vars)) {
            text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
        }
        
        return text;
    };
});
