import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale, type Locale } from './config'

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  // If locale is undefined or invalid, use defaultLocale
  const validLocale: Locale = locale && locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  }
})
