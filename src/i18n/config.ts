import rmgRuntime from '@railmapgen/rmg-runtime';
import { initReactI18next } from 'react-i18next';
import enTranslation from './translations/en.json';
import zhHansTranslation from './translations/zh-Hans.json';
import zhHantTranslation from './translations/zh-Hant.json';
import koTranslation from './translations/ko.json';

const i18n = new rmgRuntime.I18nBuilder()
    .use(initReactI18next)
    .withAppName('Seed Project')
    .withLng(rmgRuntime.getLanguage())
    .withResource('en', enTranslation)
    .withResource('zh-Hans', zhHansTranslation)
    .withResource('zh-Hant', zhHantTranslation)
    .withResource('ko', koTranslation)
    .build();

export default i18n;
