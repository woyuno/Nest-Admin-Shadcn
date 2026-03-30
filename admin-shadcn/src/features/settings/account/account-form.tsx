import { useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const languageOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
] as const

const timezoneOptions = [
  { label: '中国标准时间 (UTC+08:00)', value: 'Asia/Shanghai' },
  { label: '协调世界时 (UTC+00:00)', value: 'UTC' },
] as const

export function AccountForm() {
  const user = useAuthStore((state) => state.auth.user)
  const accessToken = useAuthStore((state) => state.auth.accessToken)
  const [language, setLanguage] = useState('zh-CN')
  const [timezone, setTimezone] = useState('Asia/Shanghai')

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='account-login-id'>登录标识</Label>
          <Input
            id='account-login-id'
            value={user?.userName || '未登录'}
            readOnly
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='account-session'>当前会话</Label>
          <Input
            id='account-session'
            value={accessToken ? '已建立有效会话' : '未建立会话'}
            readOnly
          />
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>界面语言</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue placeholder='请选择界面语言' />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label>时区偏好</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger>
              <SelectValue placeholder='请选择时区' />
            </SelectTrigger>
            <SelectContent>
              {timezoneOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='rounded-md border p-4 text-sm text-muted-foreground'>
        当前接口地址：
        <span className='ml-2 font-medium text-foreground'>
          {import.meta.env.VITE_API_BASE_URL || '/'}
        </span>
      </div>

      <Button
        type='button'
        onClick={() =>
          toast.success(`已保存本地偏好：${language} / ${timezone}`)
        }
      >
        保存本地偏好
      </Button>
    </div>
  )
}
