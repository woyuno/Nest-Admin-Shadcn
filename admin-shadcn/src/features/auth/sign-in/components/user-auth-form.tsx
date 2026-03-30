import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { fetchCaptcha, fetchCurrentUserInfo, loginByPassword } from '@/features/auth/api/auth'
import {
  getPostLoginRedirect,
  shouldEnableCaptcha,
} from '@/features/auth/lib/auth-contract'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  userName: z
    .string()
    .min(1, '请输入用户名')
    .max(20, '用户名长度不能超过 20 个字符'),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(5, '密码长度不能少于 5 位'),
  code: z.string().optional(),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [captchaEnabled, setCaptchaEnabled] = useState(false)
  const [captchaImage, setCaptchaImage] = useState('')
  const [captchaUuid, setCaptchaUuid] = useState('')
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: '',
      password: '',
      code: '',
    },
  })

  async function loadCaptcha() {
    const disableCaptchaLogin =
      import.meta.env.VITE_DISABLE_CAPTCHA_LOGIN === 'true'

    try {
      const result = await fetchCaptcha()
      setCaptchaEnabled(
        shouldEnableCaptcha({
          backendEnabled: result.captchaEnabled,
          disableCaptchaLogin,
        })
      )
      setCaptchaImage(result.image)
      setCaptchaUuid(result.uuid)
    } catch {
      if (!disableCaptchaLogin) {
        toast.error('验证码加载失败，请刷新重试')
      }
    }
  }

  useEffect(() => {
    loadCaptcha()
  }, [])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const loginResult = await loginByPassword({
        userName: data.userName,
        password: data.password,
        code: data.code,
        uuid: captchaUuid,
      })
      auth.setAccessToken(loginResult.token)

      const profile = await fetchCurrentUserInfo()
      auth.setUser(profile)

      const targetPath = getPostLoginRedirect(redirectTo)
      toast.success(`欢迎回来，${profile.displayName || profile.userName}`)
      navigate({ to: targetPath, replace: true })
    } catch (error) {
      auth.reset()
      form.setValue('code', '')
      await loadCaptcha()
      toast.error(error instanceof Error ? error.message : '登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='userName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input placeholder='请输入用户名' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <PasswordInput placeholder='请输入密码' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute end-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                忘记密码？
              </Link>
            </FormItem>
          )}
        />
        {captchaEnabled && (
          <div className='grid grid-cols-[1fr_112px] gap-3'>
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>验证码</FormLabel>
                  <FormControl>
                    <Input placeholder='请输入验证码' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex flex-col gap-2 pt-6'>
              <button
                type='button'
                onClick={() => void loadCaptcha()}
                className='overflow-hidden rounded-md border bg-white'
              >
                {captchaImage ? (
                  <img
                    src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(captchaImage)}`}
                    alt='验证码'
                    className='h-10 w-full object-cover'
                  />
                ) : (
                  <div className='flex h-10 items-center justify-center text-xs text-muted-foreground'>
                    加载中
                  </div>
                )}
              </button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => void loadCaptcha()}
              >
                <RefreshCw className='size-4' />
                刷新
              </Button>
            </div>
          </div>
        )}
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          登录
        </Button>
      </form>
    </Form>
  )
}
