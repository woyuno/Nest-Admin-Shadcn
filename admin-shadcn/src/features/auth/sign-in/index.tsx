import { useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>账号登录</CardTitle>
          <CardDescription>
            请输入用户名和密码
            <br />
            如当前环境启用了验证码，页面会自动展示验证码输入区域
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
        <CardFooter>
          <p className='px-8 text-center text-sm text-muted-foreground'>
            新前端正在并行迁移中，当前登录能力直接复用现有
            Nest-Admin-Shadcn 后端接口。
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
