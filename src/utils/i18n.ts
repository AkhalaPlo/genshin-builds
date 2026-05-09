import enWeapons from '../i18n/en/weapons.json';
import enArtifacts from '../i18n/en/artifact-sets.json';
import enCharacters from '../i18n/en/characters.json';
import enMisc from '../i18n/en/misc.json';
import enUi from '../i18n/en/ui.json';


import frWeapons from '../i18n/fr/weapons.json';
import frArtifacts from '../i18n/fr/artifact-sets.json';
import frCharacters from '../i18n/fr/characters.json';
import frMisc from '../i18n/fr/misc.json';
import frUi from '../i18n/fr/ui.json';

import deWeapons from '../i18n/de/weapons.json';
import deArtifacts from '../i18n/de/artifact-sets.json';
import deCharacters from '../i18n/de/characters.json';
import deMisc from '../i18n/de/misc.json';
import deUi from '../i18n/de/ui.json';

import esWeapons from '../i18n/es/weapons.json';
import esArtifacts from '../i18n/es/artifact-sets.json';
import esCharacters from '../i18n/es/characters.json';
import esMisc from '../i18n/es/misc.json';
import esUi from '../i18n/es/ui.json';

import itWeapons from '../i18n/it/weapons.json';
import itArtifacts from '../i18n/it/artifact-sets.json';
import itCharacters from '../i18n/it/characters.json';
import itMisc from '../i18n/it/misc.json';
import itUi from '../i18n/it/ui.json';

import ruWeapons from '../i18n/ru/weapons.json';
import ruArtifacts from '../i18n/ru/artifact-sets.json';
import ruCharacters from '../i18n/ru/characters.json';
import ruMisc from '../i18n/ru/misc.json';
import ruUi from '../i18n/ru/ui.json';

const locales = {
  en: {
    weapons: enWeapons,
    artifacts: enArtifacts,
    characters: enCharacters,
    misc: enMisc,
    ui: enUi,
  },

  fr: {
    weapons: frWeapons,
    artifacts: frArtifacts,
    characters: frCharacters,
    misc: frMisc,
    ui: frUi,
  },

  de: {
    weapons: deWeapons,
    artifacts: deArtifacts,
    characters: deCharacters,
    misc: deMisc,
    ui: deUi,
  },

  es: {
    weapons: esWeapons,
    artifacts: esArtifacts,
    characters: esCharacters,
    misc: esMisc,
    ui: esUi,
  },

  it: {
    weapons: itWeapons,
    artifacts: itArtifacts,
    characters: itCharacters,
    misc: itMisc,
    ui: itUi,
  },

  ru: {
    weapons: ruWeapons,
    artifacts: ruArtifacts,
    characters: ruCharacters,
    misc: ruMisc,
    ui: ruUi,
  },
};

export function getLocale(lang: string | undefined) {
  const localeKey = typeof lang === 'string' && lang in locales ? (lang as keyof typeof locales) : 'en';
  return locales[localeKey];
}

export function t(
  locale: any,
  category: string,
  id: string,
  sourceFile?: string,
  warn = true,
): string {
  const translation = locale?.[category]?.[id];

  if (translation !== undefined) {
    return translation;
  }

  if (warn) {
    console.warn(
      `[i18n] Missing translation for id '${id}' in category '${category}'` +
        (sourceFile ? ` (source: ${sourceFile})` : ''),
    );
  }

  return id;
}