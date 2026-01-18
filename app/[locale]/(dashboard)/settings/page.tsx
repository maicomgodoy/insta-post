'use client'

import { useTranslations } from 'next-intl'
import { Card, Select, Button } from '@/components/ui'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SubscriptionSection, ConnectedAccountsSection } from '@/components/settings'
import { useState } from 'react'
import { locales, localeNames, type Locale } from '@/i18n/config'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function SettingsPage() {
  const t = useTranslations('settings')
  const params = useParams()
  const router = useRouter()
  const { logout } = useAuth()
  const currentLocale = params.locale as string

  const [selectedLanguage, setSelectedLanguage] = useState(currentLocale)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const languageOptions = locales.map((locale) => ({
    value: locale,
    label: localeNames[locale as Locale],
  }))

  const handleLanguageChange = (newLocale: string) => {
    setSelectedLanguage(newLocale)
    // Navigate to the same page with new locale
    router.push(`/${newLocale}/settings`)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      router.push(`/${currentLocale}/auth`)
    } catch (error) {
      console.error('Logout error:', error)
      // Even if there's an error, try to redirect
      router.push(`/${currentLocale}/auth`)
    } finally {
      setIsLoggingOut(false)
    }
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

      {/* Session */}
      <Card padding="lg">
        <h2 className="text-h3 font-semibold text-gray-900 dark:text-gray-50 mb-6">
          Sessão
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-body font-medium text-gray-900 dark:text-gray-50 mb-1">
                Sair da conta
              </p>
              <p className="text-body-sm text-gray-500 dark:text-gray-400">
                Encerre sua sessão atual
              </p>
            </div>
            <Button 
              variant="outline" 
              size="md"
              onClick={handleLogout}
              disabled={isLoggingOut}
              loading={isLoggingOut}
            >
              {isLoggingOut ? 'Saindo...' : 'Sair'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
