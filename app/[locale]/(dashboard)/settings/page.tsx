'use client'

import { useTranslations } from 'next-intl'
import { Card, Select, Button } from '@/components/ui'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SubscriptionSection, ConnectedAccountsSection } from '@/components/settings'
import { useState } from 'react'
import { locales, localeNames, type Locale } from '@/i18n/config'
import { useParams, useRouter } from 'next/navigation'

export default function SettingsPage() {
  const t = useTranslations('settings')
  const params = useParams()
  const router = useRouter()
  const currentLocale = params.locale as string

  const [selectedLanguage, setSelectedLanguage] = useState(currentLocale)

  const languageOptions = locales.map((locale) => ({
    value: locale,
    label: localeNames[locale as Locale],
  }))

  const handleLanguageChange = (newLocale: string) => {
    setSelectedLanguage(newLocale)
    // Navigate to the same page with new locale
    router.push(`/${newLocale}/settings`)
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-50">
          {t('title')}
        </h1>
        <p className="mt-2 text-body-lg text-gray-500 dark:text-gray-400">
          Personalize sua experiência no Insta Post.
        </p>
      </div>

      {/* Appearance settings */}
      <Card padding="lg">
        <h2 className="text-h3 font-semibold text-gray-900 dark:text-gray-50 mb-6">
          Aparência
        </h2>
        
        <div className="space-y-6">
          {/* Theme */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-body font-medium text-gray-900 dark:text-gray-50 mb-1">
                {t('theme')}
              </p>
              <p className="text-body-sm text-gray-500 dark:text-gray-400">
                Escolha entre modo claro ou escuro
              </p>
            </div>
            <ThemeToggle showLabel={false} />
          </div>

          {/* Language */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-body font-medium text-gray-900 dark:text-gray-50 mb-1">
                {t('language')}
              </p>
              <p className="text-body-sm text-gray-500 dark:text-gray-400">
                Selecione o idioma da interface
              </p>
            </div>
            <div className="w-48">
              <Select
                options={languageOptions}
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Account settings */}
      <Card padding="lg">
        <h2 className="text-h3 font-semibold text-gray-900 dark:text-gray-50 mb-6">
          {t('account')}
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-body font-medium text-gray-900 dark:text-gray-50 mb-1">
                E-mail
              </p>
              <p className="text-body-sm text-gray-500 dark:text-gray-400">
                usuario@email.com
              </p>
            </div>
            <Button variant="outline" size="md">
              Alterar
            </Button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-body font-medium text-gray-900 dark:text-gray-50 mb-1">
                Senha
              </p>
              <p className="text-body-sm text-gray-500 dark:text-gray-400">
                ••••••••
              </p>
            </div>
            <Button variant="outline" size="md">
              Alterar
            </Button>
          </div>
        </div>
      </Card>

      {/* Subscription */}
      <SubscriptionSection />

      {/* Connected accounts */}
      <ConnectedAccountsSection />
    </div>
  )
}
