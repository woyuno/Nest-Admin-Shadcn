import { ContentSection } from '../components/content-section'
import { AccountForm } from './account-form'

export function SettingsAccount() {
  return (
    <ContentSection
      title='账户信息'
      desc='展示当前会话、接口环境和本地偏好设置。'
    >
      <AccountForm />
    </ContentSection>
  )
}
