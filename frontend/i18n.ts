import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Can be imported from a shared config
const locales = ['en', 'am'];
const defaultLocale = 'en';

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const requested = locale ?? await requestLocale;
  const resolvedLocale = locales.includes(requested as any)
    ? (requested as string)
    : defaultLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(resolvedLocale as any)) notFound();

  return {
    locale: resolvedLocale,
    messages: (await import(`./messages/${resolvedLocale}.json`)).default
  };
});
