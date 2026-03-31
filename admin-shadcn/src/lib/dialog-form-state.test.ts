import { describe, expect, it } from 'vitest'
import { resolveDialogFormState } from './dialog-form-state'

describe('resolveDialogFormState', () => {
  it('resets to empty values when dialog closes', () => {
    expect(
      resolveDialogFormState({
        open: false,
        isEdit: true,
        emptyValues: { name: '' },
        draftValues: { name: '草稿' },
        detailValues: { name: '详情' },
      })
    ).toEqual({ name: '' })
  })

  it('prefers draft values before detail data arrives in edit mode', () => {
    expect(
      resolveDialogFormState({
        open: true,
        isEdit: true,
        emptyValues: { name: '' },
        draftValues: { name: '列表行' },
      })
    ).toEqual({ name: '列表行' })
  })

  it('uses detail values once they are loaded', () => {
    expect(
      resolveDialogFormState({
        open: true,
        isEdit: true,
        emptyValues: { name: '' },
        draftValues: { name: '列表行' },
        detailValues: { name: '详情' },
      })
    ).toEqual({ name: '详情' })
  })

  it('uses create values for add mode', () => {
    expect(
      resolveDialogFormState({
        open: true,
        isEdit: false,
        emptyValues: { parentId: '0' },
        createValues: { parentId: '100' },
      })
    ).toEqual({ parentId: '100' })
  })
})
