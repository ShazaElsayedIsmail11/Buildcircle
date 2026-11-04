export function groupByDay(dates: string[], daysBack: number = 7) {
  const result: { date: string; count: number }[] = []

  for (let i = daysBack - 1; i >= 0; i--) {
    const day = new Date()
    day.setDate(day.getDate() - i)
    const dayLabel = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    const count = dates.filter((d) => {
      const itemDate = new Date(d)
      return (
        itemDate.getDate() === day.getDate() &&
        itemDate.getMonth() === day.getMonth() &&
        itemDate.getFullYear() === day.getFullYear()
      )
    }).length

    result.push({ date: dayLabel, count })
  }

  return result
}