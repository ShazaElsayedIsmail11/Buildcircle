'use client'

import { useEffect, useRef, useState } from 'react'

function useCountUp(target: number, shouldStart: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!shouldStart) return

    let current = 0
    const increment = target / 40

    const interval = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(interval)
      } else {
        setCount(Math.floor(current))
      }
    }, 30)

    return () => clearInterval(interval)
  }, [shouldStart, target])

  return count
}
export default function StatsCounter() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const missions = useCountUp(247, isVisible)
  const builders = useCountUp(89, isVisible)

  return (
    <section ref={ref} className="max-w-4xl mx-auto px-6 py-16">
   <div className="grid grid-cols-3 gap-6 text-center mb-10">
        <div>
          <p className="text-4xl font-semibold mb-1">{missions}</p>
          <p className="text-text-muted text-sm">missions completed</p>
        </div>
        <div>
          <p className="text-4xl font-semibold mb-1">{builders}</p>
          <p className="text-text-muted text-sm">active builders</p>
        </div>
        <div>
          <p className="text-4xl font-semibold mb-1 text-accent-text">4.9</p>
          <p className="text-text-muted text-sm">average rating</p>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex -space-x-3">
          <div className="w-11 h-11 rounded-full bg-bg-surface border-2 border-bg-main" />
          <div className="w-11 h-11 rounded-full bg-accent-bg border-2 border-accent" />
          <div className="w-11 h-11 rounded-full bg-bg-surface border-2 border-bg-main" />
          <div className="w-11 h-11 rounded-full bg-bg-surface border-2 border-bg-main" />
          <div className="w-11 h-11 rounded-full bg-bg-main border-2 border-border flex items-center justify-center text-xs text-text-muted">
            +85
          </div>
        </div>
      </div>
    </section>
  )
}
