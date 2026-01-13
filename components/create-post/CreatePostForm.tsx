'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, Select, Textarea, Button, FormField } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'

export function CreatePostForm() {
  const t = useTranslations('createPost')
  const { addToast } = useToast()

  // Form state
  const [niche, setNiche] = useState('')
  const [postType, setPostType] = useState('')
  const [tone, setTone] = useState('')
  const [themeOrIdea, setThemeOrIdea] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Options for selects - using translations
  const nicheOptions = [
    { value: 'fitness', label: t('niches.fitness') },
    { value: 'food', label: t('niches.food') },
    { value: 'travel', label: t('niches.travel') },
    { value: 'fashion', label: t('niches.fashion') },
    { value: 'technology', label: t('niches.technology') },
    { value: 'business', label: t('niches.business') },
    { value: 'lifestyle', label: t('niches.lifestyle') },
    { value: 'education', label: t('niches.education') },
  ]

  const postTypeOptions = [
    { value: 'carousel', label: t('postTypes.carousel') },
    { value: 'single', label: t('postTypes.single') },
    { value: 'quote', label: t('postTypes.quote') },
    { value: 'tips', label: t('postTypes.tips') },
    { value: 'before_after', label: t('postTypes.before_after') },
    { value: 'tutorial', label: t('postTypes.tutorial') },
  ]

  const toneOptions = [
    { value: 'professional', label: t('tones.professional') },
    { value: 'casual', label: t('tones.casual') },
    { value: 'humorous', label: t('tones.humorous') },
    { value: 'inspirational', label: t('tones.inspirational') },
    { value: 'educational', label: t('tones.educational') },
    { value: 'promotional', label: t('tones.promotional') },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!niche || !postType || !tone || !themeOrIdea.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all fields',
      })
      return
    }

    setIsLoading(true)

    try {
      // TODO: Implement API call to generate post
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulated delay
      
      addToast({
        type: 'success',
        title: 'Post Generated!',
        message: 'Your post has been created successfully.',
      })
      
      // Reset form
      setNiche('')
      setPostType('')
      setTone('')
      setThemeOrIdea('')
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to generate post. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit}>
        {/* Niche Select */}
        <FormField>
          <Select
            label={t('niche')}
            placeholder={t('selectNiche')}
            options={nicheOptions}
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            disabled={isLoading}
          />
        </FormField>

        {/* Post Type Select */}
        <FormField>
          <Select
            label={t('postType')}
            placeholder={t('selectPostType')}
            options={postTypeOptions}
            value={postType}
            onChange={(e) => setPostType(e.target.value)}
            disabled={isLoading}
          />
        </FormField>

        {/* Tone of Voice Select */}
        <FormField>
          <Select
            label={t('toneOfVoice')}
            placeholder={t('selectTone')}
            options={toneOptions}
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            disabled={isLoading}
          />
        </FormField>

        {/* Theme or Idea Textarea */}
        <FormField>
          <Textarea
            label={t('themeOrIdea')}
            placeholder={t('themeOrIdeaPlaceholder')}
            value={themeOrIdea}
            onChange={(e) => setThemeOrIdea(e.target.value)}
            rows={4}
            disabled={isLoading}
          />
        </FormField>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
        >
          {isLoading ? t('generating') : t('generatePost')}
        </Button>
      </form>
    </Card>
  )
}
