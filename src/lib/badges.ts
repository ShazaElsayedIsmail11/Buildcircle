export type Badge = { emoji: string; label: string }

export function calculateBadges(
  completedProjectsCount: number,
  averageRating: number | null
): Badge[] {
  const badges: Badge[] = []

  if (completedProjectsCount >= 10) {
    badges.push({ emoji: '🏆', label: 'Veteran builder' })
  } else if (completedProjectsCount >= 3) {
    badges.push({ emoji: '🔨', label: 'Active builder' })
  } else {
    badges.push({ emoji: '🌱', label: 'New builder' })
  }

  if (averageRating !== null && averageRating >= 4.5) {
    badges.push({ emoji: '⭐', label: 'Top rated' })
  }

  return badges
}