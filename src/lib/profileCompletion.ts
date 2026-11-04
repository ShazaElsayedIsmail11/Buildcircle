type ProfileData = {
  bio: string | null
  avatar_url: string | null
  skills: string[] | null
  github_url: string | null
  portfolio_links: string[] | null
}

export function calculateCompletion(profile: ProfileData): number {
  const checks = [
    !!profile.bio,
    !!profile.avatar_url,
    !!(profile.skills && profile.skills.length > 0),
    !!profile.github_url,
    !!(profile.portfolio_links && profile.portfolio_links.length > 0),
  ]

  const completed = checks.filter(Boolean).length
  return Math.round((completed / checks.length) * 100)
}