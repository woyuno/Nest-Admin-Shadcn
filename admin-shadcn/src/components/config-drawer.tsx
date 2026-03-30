import { type SVGProps } from 'react'
import { Root as Radio, Item } from '@radix-ui/react-radio-group'
import { CircleCheck, RotateCcw, Settings } from 'lucide-react'
import { IconLayoutCompact } from '@/assets/custom/icon-layout-compact'
import { IconLayoutDefault } from '@/assets/custom/icon-layout-default'
import { IconLayoutFull } from '@/assets/custom/icon-layout-full'
import { IconSidebarFloating } from '@/assets/custom/icon-sidebar-floating'
import { IconSidebarInset } from '@/assets/custom/icon-sidebar-inset'
import { IconSidebarSidebar } from '@/assets/custom/icon-sidebar-sidebar'
import { IconThemeDark } from '@/assets/custom/icon-theme-dark'
import { IconThemeLight } from '@/assets/custom/icon-theme-light'
import { IconThemeSystem } from '@/assets/custom/icon-theme-system'
import { cn } from '@/lib/utils'
import { useColorTheme } from '@/context/color-theme-provider'
import { useDirection } from '@/context/direction-provider'
import { getLayoutMode, useLayout } from '@/context/layout-provider'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useSidebar } from './ui/sidebar'

export function ConfigDrawer() {
  const { setOpen } = useSidebar()
  const { resetColorTheme } = useColorTheme()
  const { resetDir } = useDirection()
  const { resetTheme } = useTheme()
  const { resetLayout } = useLayout()

  const handleReset = () => {
    setOpen(true)
    resetColorTheme()
    resetDir()
    resetTheme()
    resetLayout()
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          aria-label='打开主题设置'
          aria-describedby='config-drawer-description'
          className='rounded-full'
        >
          <Settings aria-hidden='true' />
        </Button>
      </SheetTrigger>
      <SheetContent className='flex flex-col'>
        <SheetHeader className='pb-0 text-start'>
          <SheetTitle>主题设置</SheetTitle>
          <SheetDescription id='config-drawer-description'>
            按你的使用习惯调整主题外观和布局方式。
          </SheetDescription>
        </SheetHeader>
        <div className='space-y-6 overflow-y-auto px-4'>
          <ThemeConfig />
          <ColorThemeConfig />
          <SidebarConfig />
          <LayoutConfig />
        </div>
        <SheetFooter className='gap-2'>
          <Button
            variant='destructive'
            onClick={handleReset}
            aria-label='恢复全部默认设置'
          >
            重置
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function SectionTitle({
  title,
  showReset = false,
  onReset,
  className,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground',
        className
      )}
    >
      {title}
      {showReset && onReset && (
        <Button
          size='icon'
          variant='secondary'
          className='size-4 rounded-full'
          onClick={onReset}
        >
          <RotateCcw className='size-3' />
        </Button>
      )}
    </div>
  )
}

function RadioGroupItem({
  item,
  isTheme = false,
  idPrefix = 'config',
}: {
  item: {
    value: string
    label: string
    icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  }
  isTheme?: boolean
  idPrefix?: string
}) {
  const descriptionId = `${idPrefix}-${item.value}-description`

  return (
    <Item
      value={item.value}
      className={cn('group outline-none', 'transition duration-200 ease-in')}
      aria-label={`选择${item.label}`}
      aria-describedby={descriptionId}
    >
      <div
        className={cn(
          'relative rounded-[6px] ring-[1px] ring-border',
          'group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary',
          'group-focus-visible:ring-2'
        )}
        role='img'
        aria-hidden='false'
        aria-label={`${item.label}选项预览`}
      >
        <CircleCheck
          className={cn(
            'size-6 fill-primary stroke-white',
            'group-data-[state=unchecked]:hidden',
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2'
          )}
          aria-hidden='true'
        />
        <item.icon
          className={cn(
            !isTheme &&
              'fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground'
          )}
          aria-hidden='true'
        />
      </div>
      <div
        className='mt-1 text-xs'
        id={descriptionId}
        aria-live='polite'
      >
        {item.label}
      </div>
    </Item>
  )
}

function ColorThemeSwatch({
  accentClassName,
  mutedClassName,
}: {
  accentClassName: string
  mutedClassName: string
}) {
  return (
    <svg
      viewBox='0 0 96 64'
      className='h-16 w-28 rounded-[6px] bg-background'
      aria-hidden='true'
    >
      <rect x='1' y='1' width='94' height='62' rx='8' className='fill-white stroke-slate-200' />
      <rect x='8' y='8' width='22' height='48' rx='6' className={mutedClassName} />
      <rect x='14' y='14' width='10' height='10' rx='3' className={accentClassName} />
      <rect x='36' y='12' width='28' height='6' rx='3' className={accentClassName} />
      <rect x='36' y='24' width='44' height='6' rx='3' className={mutedClassName} />
      <rect x='36' y='36' width='30' height='18' rx='4' className={mutedClassName} />
      <circle cx='78' cy='22' r='10' className={accentClassName} />
      <rect x='70' y='40' width='6' height='14' rx='2' className={accentClassName} />
      <rect x='78' y='34' width='6' height='20' rx='2' className={accentClassName} />
      <rect x='86' y='28' width='6' height='26' rx='2' className={accentClassName} />
    </svg>
  )
}

function ThemeConfig() {
  const { defaultTheme, theme, setTheme } = useTheme()
  return (
    <div>
      <SectionTitle
        title='主题'
        showReset={theme !== defaultTheme}
        onReset={() => setTheme(defaultTheme)}
      />
      <Radio
        value={theme}
        onValueChange={setTheme}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label='选择主题模式'
        aria-describedby='theme-description'
      >
        {[
          {
            value: 'system',
            label: '跟随系统',
            icon: IconThemeSystem,
          },
          {
            value: 'light',
            label: '浅色',
            icon: IconThemeLight,
          },
          {
            value: 'dark',
            label: '深色',
            icon: IconThemeDark,
          },
        ].map((item) => (
          <RadioGroupItem
            key={item.value}
            item={item}
            isTheme
            idPrefix='theme'
          />
        ))}
      </Radio>
      <div id='theme-description' className='sr-only'>
        可选择跟随系统、浅色模式或深色模式
      </div>
    </div>
  )
}

function ColorThemeConfig() {
  const { colorTheme, defaultColorTheme, setColorTheme } = useColorTheme()

  return (
    <div>
      <SectionTitle
        title='主题色'
        showReset={colorTheme !== defaultColorTheme}
        onReset={() => setColorTheme(defaultColorTheme)}
      />
      <Radio
        value={colorTheme}
        onValueChange={(value) =>
          setColorTheme(value as 'default' | 'enterprise-blue' | 'teal')
        }
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label='选择主题色'
        aria-describedby='color-theme-description'
      >
        {[
          {
            value: 'default',
            label: '默认蓝',
            icon: () => (
              <ColorThemeSwatch
                accentClassName='fill-slate-800'
                mutedClassName='fill-slate-200'
              />
            ),
          },
          {
            value: 'enterprise-blue',
            label: '企业蓝',
            icon: () => (
              <ColorThemeSwatch
                accentClassName='fill-blue-600'
                mutedClassName='fill-blue-100'
              />
            ),
          },
          {
            value: 'teal',
            label: '青绿色',
            icon: () => (
              <ColorThemeSwatch
                accentClassName='fill-teal-600'
                mutedClassName='fill-teal-100'
              />
            ),
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} idPrefix='color-theme' />
        ))}
      </Radio>
      <div id='color-theme-description' className='sr-only'>
        可选择默认蓝、企业蓝或青绿色主题色
      </div>
    </div>
  )
}

function SidebarConfig() {
  const { defaultVariant, variant, setVariant } = useLayout()
  return (
    <div className='max-md:hidden'>
      <SectionTitle
        title='侧边栏'
        showReset={defaultVariant !== variant}
        onReset={() => setVariant(defaultVariant)}
      />
      <Radio
        value={variant}
        onValueChange={setVariant}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label='选择侧边栏样式'
        aria-describedby='sidebar-description'
      >
        {[
          {
            value: 'inset',
            label: '内嵌',
            icon: IconSidebarInset,
          },
          {
            value: 'floating',
            label: '浮动',
            icon: IconSidebarFloating,
          },
          {
            value: 'sidebar',
            label: '标准',
            icon: IconSidebarSidebar,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} idPrefix='sidebar' />
        ))}
      </Radio>
      <div id='sidebar-description' className='sr-only'>
        可选择内嵌、浮动或标准侧边栏样式
      </div>
    </div>
  )
}

function LayoutConfig() {
  const { open, setOpen } = useSidebar()
  const {
    defaultCollapsible,
    collapsible,
    setCollapsible,
    defaultContentWidth,
    contentWidth,
    setContentWidth,
  } = useLayout()

  const radioState = getLayoutMode({
    open,
    collapsible,
    contentWidth,
  })

  return (
    <div className='max-md:hidden'>
      <SectionTitle
        title='布局'
        showReset={
          radioState !== 'default' ||
          contentWidth !== defaultContentWidth ||
          collapsible !== defaultCollapsible
        }
        onReset={() => {
          setOpen(true)
          setCollapsible(defaultCollapsible)
          setContentWidth(defaultContentWidth)
        }}
      />
      <Radio
        value={radioState}
        onValueChange={(v) => {
          if (v === 'default') {
            setOpen(true)
            setContentWidth('narrow')
            return
          }

          if (v === 'icon') {
            setOpen(false)
            setCollapsible('icon')
            setContentWidth('narrow')
            return
          }

          setOpen(true)
          setContentWidth('wide')
        }}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label='选择布局模式'
        aria-describedby='layout-description'
      >
        {[
          {
            value: 'default',
            label: '默认',
            icon: IconLayoutDefault,
          },
          {
            value: 'icon',
            label: '紧凑',
            icon: IconLayoutCompact,
          },
          {
            value: 'offcanvas',
            label: '全宽',
            icon: IconLayoutFull,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} idPrefix='layout' />
        ))}
      </Radio>
      <div id='layout-description' className='sr-only'>
        可选择默认展开、紧凑图标或全宽布局模式
      </div>
    </div>
  )
}

