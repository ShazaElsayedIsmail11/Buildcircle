'use client'

import { useEffect, useRef, useState } from 'react'

export default function HowItWorks() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([])
  const refs = useRef<(HTMLDivElement | null)[]>([])

  const steps = [
    {
      title: 'Post a mission',
      desc: 'Startups describe the task, required skills, and timeline.',
    },
    {
      title: 'Builders apply',
      desc: 'Developers, designers, and marketers submit applications.',
    },
    {
      title: 'A squad forms',
      desc: 'The hunter reviews applicants and assembles the right team.',
    },
    {
      title: 'Work gets done',
      desc: 'Tasks, milestones, chat, and deliverables — all in one room.',
    },
    {
      title: 'Proof of work',
      desc: 'Completed work is reviewed and permanently added to the builder profile.',
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'))

            setVisibleSteps((prev) =>
              prev.includes(index) ? prev : [...prev, index]
            )

            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.3 }
    )

    refs.current.forEach((element) => {
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <section className="max-w-4xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-semibold text-center mb-12">
        How it works
      </h2>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.title}
            ref={(element) => {
              refs.current[index] = element
            }}
            data-index={index}
            className={`bg-bg-surface border border-border rounded-xl p-5 flex items-start gap-4 hover:border-accent hover:-translate-y-0.5 transition-all duration-700 ${
              visibleSteps.includes(index)
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="bg-accent-bg text-accent-text w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0">
              {index + 1}
            </div>

            <div>
              <h3 className="text-sm font-medium mb-1">{step.title}</h3>
              <p className="text-text-muted text-sm">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}