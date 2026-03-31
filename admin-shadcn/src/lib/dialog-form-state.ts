type ResolveDialogFormStateOptions<T> = {
  open: boolean
  isEdit: boolean
  emptyValues: T
  detailValues?: T
  draftValues?: T
  createValues?: T
}

export function resolveDialogFormState<T>({
  open,
  isEdit,
  emptyValues,
  detailValues,
  draftValues,
  createValues,
}: ResolveDialogFormStateOptions<T>) {
  if (!open) {
    return emptyValues
  }

  if (isEdit) {
    return detailValues ?? draftValues ?? emptyValues
  }

  return createValues ?? emptyValues
}
