import { cn } from '@/lib/utils'
import { type ContentWidth, useLayout } from '@/context/layout-provider'

type MainProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  fluid?: boolean
  ref?: React.Ref<HTMLElement>
}

type MainClassNameInput = Pick<MainProps, 'fixed' | 'fluid' | 'className'> & {
  contentWidth?: ContentWidth
}

type MainWidthClassNameInput = Pick<MainProps, 'fluid'> & {
  contentWidth: ContentWidth
}

export function getMainWidthClasses({
  fluid,
  contentWidth,
}: MainWidthClassNameInput) {
  if (fluid) {
    return ''
  }

  if (contentWidth === 'wide') {
    return '@7xl/content:w-full'
  }

  return '@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl'
}

export function getMainClassName({
  fixed,
  fluid,
  className,
  contentWidth = 'narrow',
}: MainClassNameInput) {
  return cn(
    'w-full px-4 py-6',

    // If layout is fixed, make the main container flex and grow
    fixed && 'flex grow flex-col overflow-hidden',

    getMainWidthClasses({ fluid, contentWidth }),
    className
  )
}

export function Main({ fixed, className, fluid, ...props }: MainProps) {
  const { contentWidth } = useLayout()

  return (
    <main
      data-layout={fixed ? 'fixed' : 'auto'}
      className={getMainClassName({ fixed, fluid, className, contentWidth })}
      {...props}
    />
  )
}
