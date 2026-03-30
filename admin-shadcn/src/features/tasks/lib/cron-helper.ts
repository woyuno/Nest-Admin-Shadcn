type CronPresetInput =
  | {
      type: 'every-n-minutes'
      interval: number
    }
  | {
      type: 'daily'
      hour: number
      minute: number
    }
  | {
      type: 'weekly'
      hour: number
      minute: number
      weekDay: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'
    }

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.floor(value)))
}

export function buildCronExpressionFromPreset(input: CronPresetInput) {
  if (input.type === 'every-n-minutes') {
    const interval = clamp(input.interval, 1, 59)
    return `0 */${interval} * * * ?`
  }

  const minute = clamp(input.minute, 0, 59)
  const hour = clamp(input.hour, 0, 23)

  if (input.type === 'daily') {
    return `0 ${minute} ${hour} * * ?`
  }

  return `0 ${minute} ${hour} ? * ${input.weekDay}`
}

export const weekDayOptions = [
  { label: '周一', value: 'MON' },
  { label: '周二', value: 'TUE' },
  { label: '周三', value: 'WED' },
  { label: '周四', value: 'THU' },
  { label: '周五', value: 'FRI' },
  { label: '周六', value: 'SAT' },
  { label: '周日', value: 'SUN' },
] as const
