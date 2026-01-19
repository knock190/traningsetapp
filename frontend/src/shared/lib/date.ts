export function formatDateYmd(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function getWeekStart(date: Date) {
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const weekStart = new Date(date)
  weekStart.setDate(date.getDate() + diff)
  return weekStart
}

export function getWeekRange(date: Date) {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start, end }
}

export function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return { start, end }
}

export function formatMonthYm(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`
}
