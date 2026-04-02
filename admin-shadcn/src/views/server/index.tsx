import { AlertTriangle, HardDrive, MonitorSmartphone, ServerIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RefreshPageButton } from '@/components/refresh-page-button'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchServerOverview } from './api/server'

function MetricCard({
  title,
  description,
  value,
}: {
  title: string
  description: string
  value: string
}) {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm'>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-semibold'>{value}</div>
      </CardContent>
    </Card>
  )
}

export function ServerMonitor() {
  const serverQuery = useQuery({
    queryKey: ['server-monitor'],
    queryFn: fetchServerOverview,
  })

  const data = serverQuery.data

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <h2 className='text-2xl font-bold tracking-tight'>服务监控</h2>
          <RefreshPageButton />
        </div>

        {serverQuery.isLoading ? (
          <Alert>
            <AlertTriangle className='size-4' />
            <AlertTitle>正在加载</AlertTitle>
            <AlertDescription>正在获取服务监控数据，请稍候。</AlertDescription>
          </Alert>
        ) : null}

        {data ? (
          <>
            <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
              <MetricCard title='CPU 核心数' description='当前服务器可用核心' value={`${data.cpu.cpuNum}`} />
              <MetricCard title='CPU 用户使用率' description='用户态 CPU 占用' value={`${data.cpu.used}%`} />
              <MetricCard title='系统内存使用率' description='物理内存占用' value={`${data.mem.usage}%`} />
              <MetricCard title='JVM 使用率' description='Java 虚拟机堆内存占用' value={`${data.jvm.usage}%`} />
            </div>

            <div className='grid gap-4 xl:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <ServerIcon className='size-4' />
                    资源概览
                  </CardTitle>
                </CardHeader>
                <CardContent className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2 rounded-lg border p-4'>
                    <div className='text-sm font-medium'>CPU</div>
                    <div className='text-sm text-muted-foreground'>系统占用 {data.cpu.sys}%</div>
                    <div className='text-sm text-muted-foreground'>空闲率 {data.cpu.free}%</div>
                  </div>
                  <div className='space-y-2 rounded-lg border p-4'>
                    <div className='text-sm font-medium'>内存</div>
                    <div className='text-sm text-muted-foreground'>总内存 {data.mem.total}G</div>
                    <div className='text-sm text-muted-foreground'>已用 {data.mem.used}G，剩余 {data.mem.free}G</div>
                  </div>
                  <div className='space-y-2 rounded-lg border p-4 md:col-span-2'>
                    <div className='text-sm font-medium'>JVM</div>
                    <div className='text-sm text-muted-foreground'>版本 {data.jvm.version || '-'}</div>
                    <div className='text-sm text-muted-foreground'>运行时长 {data.jvm.runTime || '-'}</div>
                    <div className='text-sm text-muted-foreground'>启动时间 {data.jvm.startTime || '-'}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <MonitorSmartphone className='size-4' />
                    系统信息
                  </CardTitle>
                </CardHeader>
                <CardContent className='grid gap-3 sm:grid-cols-2'>
                  <div className='rounded-lg border p-4'>
                    <div className='text-xs text-muted-foreground'>服务器名称</div>
                    <div className='mt-1 font-medium'>{data.sys.computerName || '-'}</div>
                  </div>
                  <div className='rounded-lg border p-4'>
                    <div className='text-xs text-muted-foreground'>服务器 IP</div>
                    <div className='mt-1 font-medium'>{data.sys.computerIp || '-'}</div>
                  </div>
                  <div className='rounded-lg border p-4'>
                    <div className='text-xs text-muted-foreground'>操作系统</div>
                    <div className='mt-1 font-medium'>{data.sys.osName || '-'}</div>
                  </div>
                  <div className='rounded-lg border p-4'>
                    <div className='text-xs text-muted-foreground'>系统架构</div>
                    <div className='mt-1 font-medium'>{data.sys.osArch || '-'}</div>
                  </div>
                  <div className='rounded-lg border p-4 sm:col-span-2'>
                    <div className='text-xs text-muted-foreground'>项目路径</div>
                    <div className='mt-1 break-all font-medium'>{data.sys.userDir || '-'}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <HardDrive className='size-4' />
                  磁盘状态
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='overflow-hidden rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>盘符路径</TableHead>
                        <TableHead>文件系统</TableHead>
                        <TableHead>盘符类型</TableHead>
                        <TableHead>总大小</TableHead>
                        <TableHead>可用大小</TableHead>
                        <TableHead>已用大小</TableHead>
                        <TableHead>使用率</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.sysFiles.length ? (
                        data.sysFiles.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.dirName || '-'}</TableCell>
                            <TableCell>{item.sysTypeName || '-'}</TableCell>
                            <TableCell>{item.typeName || '-'}</TableCell>
                            <TableCell>{item.total || '-'}</TableCell>
                            <TableCell>{item.free || '-'}</TableCell>
                            <TableCell>{item.used || '-'}</TableCell>
                            <TableCell>{item.usage}%</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className='h-24 text-center'>
                            没有磁盘数据
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </Main>
    </>
  )
}
