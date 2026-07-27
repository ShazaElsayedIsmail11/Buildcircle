import HeroVisual from './HeroVisual'
import Footer from './Footer'
import HowItWorks from './HowItWorks'
import StatsCounter from './StatsCounter'
export default function Home() {
  return (
    <main className="min-h-screen bg-bg-main text-text-primary">
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-20 text-center">
        <div className="animate-fade-in-up inline-block bg-accent-bg border border-accent text-accent-text text-xs font-medium px-3 py-1 rounded-full mb-6">
          Proof of real work, not just promises
        </div>

        <h1 className="animate-fade-in-up-delay-1 text-5xl md:text-6xl font-semibold leading-tight mb-6">
          Where startups find talent,
          <br />
          and talent proves itself.
        </h1>

        <p className="animate-fade-in-up-delay-1 text-text-muted text-lg max-w-xl mx-auto mb-10">
          buildcircle connects founders with builders through real missions —
          then documents the work that actually gets done.
        </p>

        <div className="animate-fade-in-up-delay-2 flex items-center justify-center gap-3">
          <a
            href="/signup"
            className="bg-accent text-bg-main rounded-lg px-6 py-3 text-sm font-medium hover:opacity-90 transition"
          >
            Start building
          </a>

          <a
            href="/login"
            className="border border-border text-text-primary rounded-lg px-6 py-3 text-sm font-medium hover:bg-bg-surface transition"
          >
            Log in
          </a>
        </div>
        <div className="mt-16">
          <HeroVisual />
        </div>
      </section> 
       <HowItWorks />

      <StatsCounter />
        <Footer />
       
    </main>
  );
}