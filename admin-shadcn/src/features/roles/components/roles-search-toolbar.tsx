import { format } from 'date-fns'
import { SearchIcon, RotateCcwIcon } from 'lucide-react'
import { useState } from 'react'
import { type DateRange } from 'react-day-picker'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { DateRangePicker } from '@/components/date-range-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  buildRolesToolbarDraft,
  buildRolesToolbarSearch,
  resetRolesToolbarDraft,
  type RolesSearch,
  type RolesToolbarDraft,
  resetRolesToolbarSearch,
} from './roles-search-toolbar.helpers'

type RolesSearchToolbarProps = {
  search: RolesSearch
  navigate: NavigateFn
}

export function RolesSearchToolbar({
  search,
  navigate,
}: RolesSearchToolbarProps) {
  const [draft, setDraft] = useState(() => buildRolesToolbarDraft(search))
  const selectedRange: DateRange | undefined =
    draft.beginTime && draft.endTime
      ? {
          from: new Date(`${draft.beginTime}T00:00:00`),
          to: new Date(`${draft.endTime}T00:00:00`),
        }
      : undefined

  return (
    <div className='rounded-lg border bg-card p-4'>
      <div className='flex flex-wrap items-center gap-3'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium whitespace-nowrap'>角色名称</span>
          <Input
            value={draft.roleName}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, roleName: event.target.value }))
            }
            placeholder='请输入角色名称'
            className='h-9 w-full sm:w-60'
          />
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium whitespace-nowrap'>权限字符</span>
          <Input
            value={draft.roleKey}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, roleKey: event.target.value }))
            }
            placeholder='请输入权限字符'
            className='h-9 w-full sm:w-60'
          />
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium whitespace-nowrap'>状态</span>
          <Select
            value={draft.status}
            onValueChange={(value: RolesToolbarDraft['status']) =>
              setDraft((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className='h-9 w-full sm:w-40'>
              <SelectValue placeholder='角色状态' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部状态</SelectItem>
              <SelectItem value='active'>启用</SelectItem>
              <SelectItem value='inactive'>停用</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium whitespace-nowrap'>创建时间</span>
          <DateRangePicker
            value={selectedRange}
            onChange={(range) =>
              setDraft((prev) => ({
                ...prev,
                beginTime: range?.from
                  ? formatDateValue(range.from)
                  : '',
                endTime: range?.to ? formatDateValue(range.to) : '',
              }))
            }
            className='sm:w-64'
          />
        </div>

        <Button
          className='h-9'
          onClick={() =>
            navigate({
              search: (prev) =>
                buildRolesToolbarSearch(prev as RolesSearch, draft),
            })
          }
        >
          <SearchIcon className='size-4' />
          搜索
        </Button>

        <Button
          variant='outline'
          className='h-9'
          onClick={() => {
            setDraft((prev) => resetRolesToolbarDraft(prev))
            navigate({
              search: (prev) => resetRolesToolbarSearch(prev as RolesSearch),
            })
          }}
        >
          <RotateCcwIcon className='size-4' />
          重置
        </Button>
      </div>
    </div>
  )
}

function formatDateValue(date: Date) {
  return format(date, 'yyyy-MM-dd')
}
