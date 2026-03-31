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
  buildUsersToolbarDraft,
  buildUsersToolbarSearch,
  resetUsersToolbarDraft,
  type UsersSearch,
  type UsersToolbarDraft,
  resetUsersToolbarSearch,
} from './users-search-toolbar.helpers'

type UsersSearchToolbarProps = {
  search: UsersSearch
  navigate: NavigateFn
}

export function UsersSearchToolbar({
  search,
  navigate,
}: UsersSearchToolbarProps) {
  const [draft, setDraft] = useState(() => buildUsersToolbarDraft(search))
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
          <span className='text-sm font-medium whitespace-nowrap'>用户账号</span>
          <Input
            value={draft.username}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, username: event.target.value }))
            }
            placeholder='请输入用户账号'
            className='h-9 w-full sm:w-60'
          />
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium whitespace-nowrap'>手机号</span>
          <Input
            value={draft.phonenumber}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, phonenumber: event.target.value }))
            }
            placeholder='请输入手机号'
            className='h-9 w-full sm:w-60'
          />
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium whitespace-nowrap'>状态</span>
          <Select
            value={draft.status}
            onValueChange={(value: UsersToolbarDraft['status']) =>
              setDraft((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className='h-9 w-full sm:w-40'>
              <SelectValue placeholder='用户状态' />
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
                buildUsersToolbarSearch(prev as UsersSearch, draft),
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
            setDraft((prev) => resetUsersToolbarDraft(prev))
            navigate({
              search: (prev) => resetUsersToolbarSearch(prev as UsersSearch),
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
