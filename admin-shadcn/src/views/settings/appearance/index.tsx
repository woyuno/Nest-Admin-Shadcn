import { ContentSection } from '../components/content-section'
import { appearanceContent } from './appearance-copy'
import { AppearanceForm } from './appearance-form'

export function SettingsAppearance() {
  return (
    <ContentSection
      title={appearanceContent.title}
      desc={appearanceContent.description}
    >
      <AppearanceForm />
    </ContentSection>
  )
}
