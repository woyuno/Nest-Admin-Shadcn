import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { DataTableSingleFilter } from './single-filter'

describe('DataTableSingleFilter', () => {
  it('renders with the same select-style trigger used by toolbar single selects', () => {
    const html = renderToStaticMarkup(
      <DataTableSingleFilter
        column={
          {
            getFacetedUniqueValues: () => new Map(),
            getFilterValue: () => ['active'],
            setFilterValue: vi.fn(),
          } as never
        }
        title='状态'
        options={[
          { label: '启用', value: 'active' },
          { label: '停用', value: 'inactive' },
        ]}
      />
    )

    expect(html).toContain('data-slot="select-trigger"')
    expect(html).not.toContain('border-dashed')
  })
})
