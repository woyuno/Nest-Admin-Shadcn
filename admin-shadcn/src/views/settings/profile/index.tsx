import { ContentSection } from '../components/content-section'
import { ProfileForm } from './profile-form'

export function SettingsProfile() {
  return (
    <ContentSection
      title='个人资料'
      desc='这里展示当前登录用户的基础资料、角色和权限概况。'
    >
      <ProfileForm />
    </ContentSection>
  )
}
