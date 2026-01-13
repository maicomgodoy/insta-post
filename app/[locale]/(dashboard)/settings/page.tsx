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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Personalize sua experiência no Insta Post.
        </p>
      </div>

      {/* Appearance settings */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Aparência
        </h2>
        
        <div className="space-y-6">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {t('theme')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Escolha entre modo claro ou escuro
              </p>
            </div>
            <ThemeToggle showLabel={false} />
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {t('language')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {t('account')}
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                E-mail
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                usuario@email.com
              </p>
            </div>
            <Button variant="outline" size="sm">
              Alterar
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Senha
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ••••••••
              </p>
            </div>
            <Button variant="outline" size="sm">
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
