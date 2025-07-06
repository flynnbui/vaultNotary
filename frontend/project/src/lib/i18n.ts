import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import common from '../locales/vi/common.json';

const resources = {
  vi: {
    common
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'vi',
    fallbackLng: 'vi',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false
    },
    defaultNS: 'common'
  });

export default i18n;