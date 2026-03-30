import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function ForbiddenError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>403</h1>
        <span className='font-medium'>抱歉，你没有访问权限</span>
        <p className='text-center text-muted-foreground'>
          当前账号没有访问此资源的权限，<br />
          请联系管理员开通后再试。
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            返回上一页
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>返回首页</Button>
        </div>
      </div>
    </div>
  )
}
