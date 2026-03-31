import { type Column } from '@tanstack/react-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getNextSingleFilterValue } from './single-filter.helpers'

type DataTableSingleFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
}

export function DataTableSingleFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableSingleFilterProps<TData, TValue>) {
  const selectedValue = (column?.getFilterValue() as string[] | undefined)?.[0]

  return (
    <Select
      value={selectedValue ?? 'all'}
      onValueChange={(value) =>
        column?.setFilterValue(
          value === 'all'
            ? undefined
            : getNextSingleFilterValue(
                column?.getFilterValue() as string[] | undefined,
                value
              )
        )
      }
    >
      <SelectTrigger className='h-8 w-[140px]'>
        <SelectValue placeholder={title} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>{title}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
