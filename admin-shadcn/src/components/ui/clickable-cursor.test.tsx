import { describe, expect, it } from 'vitest'
import { Checkbox } from './checkbox'
import {
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
} from './dropdown-menu'
import { Label } from './label'
import { RadioGroupItem } from './radio-group'
import { CommandItem } from './command'
import { SelectItem } from './select'

describe('clickable cursor styles', () => {
  it('uses pointer cursor for checkbox and radio controls', () => {
    const checkboxElement = Checkbox({ 'aria-label': '勾选项' })
    const radioElement = RadioGroupItem({ value: 'a', 'aria-label': '单选项' })

    expect(checkboxElement.props.className).toContain('cursor-pointer')
    expect(radioElement.props.className).toContain('cursor-pointer')
  })

  it('uses pointer cursor for dropdown checkbox and radio items', () => {
    const dropdownCheckboxElement = DropdownMenuCheckboxItem({
      checked: true,
      children: '显示列',
    })
    const dropdownRadioElement = DropdownMenuRadioItem({
      value: 'a',
      children: '默认模式',
    })

    expect(dropdownCheckboxElement.props.className).toContain('cursor-pointer')
    expect(dropdownRadioElement.props.className).toContain('cursor-pointer')
  })

  it('lets label text participate in pointer cursor affordance', () => {
    const labelElement = Label({ htmlFor: 'status-enabled', children: '启用' })

    expect(labelElement.props.className).toContain('cursor-pointer')
  })

  it('uses pointer cursor for select dropdown items', () => {
    const selectItemElement = SelectItem({ value: '0', children: '启用' })

    expect(selectItemElement.props.className).toContain('cursor-pointer')
  })

  it('uses pointer cursor for command palette items', () => {
    const commandItemElement = CommandItem({ children: '系统 system' })

    expect(commandItemElement.props.className).toContain('cursor-pointer')
  })
})
