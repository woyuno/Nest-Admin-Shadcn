import { useState } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import {
  getMenuIconLabel,
  menuIconOptions,
  renderMenuIcon,
} from '../lib/menu-icon-registry'

type MenuIconFieldProps = {
  value: string
  onChange: (value: string) => void
}

export function MenuIconField({ value, onChange }: MenuIconFieldProps) {
  const [open, setOpen] = useState(false)
  const currentIconKey = value.trim()
  const currentLabel = getMenuIconLabel(currentIconKey)

  return (
    <div className='space-y-3'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            className='w-full justify-between font-normal'
          >
            <span className='flex items-center gap-2 truncate'>
              {renderMenuIcon(currentIconKey, 'size-4 text-muted-foreground')}
              {currentIconKey ? `${currentLabel} (${currentIconKey})` : '请选择菜单图标'}
            </span>
            <span className='flex items-center gap-1'>
              {currentIconKey ? (
                <span
                  role='button'
                  tabIndex={0}
                  className='inline-flex size-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    onChange('')
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      event.stopPropagation()
                      onChange('')
                    }
                  }}
                  aria-label='清空菜单图标'
                >
                  <X className='size-3.5' />
                </span>
              ) : null}
              <ChevronsUpDown className='size-4 shrink-0 opacity-50' />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0' align='start'>
          <Command>
            <CommandInput placeholder='搜索图标名称' />
            <CommandList className='max-h-80'>
              <CommandEmpty>没有匹配的图标</CommandEmpty>
              <CommandGroup>
                {menuIconOptions.map((option) => {
                  const selected = option.key === currentIconKey

                  return (
                    <CommandItem
                      key={option.key}
                      value={`${option.label} ${option.key} ${option.keywords.join(' ')}`}
                      onSelect={() => {
                        onChange(option.key)
                        setOpen(false)
                      }}
                    >
                      {renderMenuIcon(option.key, 'size-4 text-muted-foreground')}
                      <span className='flex-1 truncate'>
                        {option.label}
                        <span className='ms-2 text-xs text-muted-foreground'>
                          {option.key}
                        </span>
                      </span>
                      <Check className={cn('size-4', selected ? 'opacity-100' : 'opacity-0')} />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className='text-xs text-muted-foreground'>
        当前提供 {menuIconOptions.length} 个常用图标，可按中文名称、英文 key 或关键词搜索。
      </p>
    </div>
  )
}
