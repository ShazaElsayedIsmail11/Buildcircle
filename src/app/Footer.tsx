export default function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-5xl mx-auto px-6 py-10 flex items-center justify-between">
        <p className="text-text-muted text-sm">
          © 2026 buildcircle. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-text-muted">
          <a href="/dashboard/explore" className="hover:text-text-primary transition">
            Explore missions
          </a>
          <a href="/dashboard/community" className="hover:text-text-primary transition">
            Community
          </a>
          <a href="/login" className="hover:text-text-primary transition">
            Log in
          </a>
        </div>
      </div>
    </footer>
  )
}