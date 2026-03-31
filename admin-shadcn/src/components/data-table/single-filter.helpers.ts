export function getNextSingleFilterValue(
  currentValue: string[] | undefined,
  selectedValue: string
) {
  if (currentValue?.[0] === selectedValue) return undefined
  return [selectedValue]
}
