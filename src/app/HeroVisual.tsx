export default function HeroVisual() {
  return (
    <svg viewBox="0 0 680 400" className="w-full max-w-2xl mx-auto">
      <line x1="340" y1="200" x2="180" y2="120" stroke="#30363d" strokeWidth="1">
        <animate attributeName="stroke" values="#30363d;#E85D2C;#30363d" dur="4s" repeatCount="indefinite" />
      </line>
      <line x1="340" y1="200" x2="500" y2="130" stroke="#30363d" strokeWidth="1">
        <animate attributeName="stroke" values="#30363d;#E85D2C;#30363d" dur="4s" begin="1.3s" repeatCount="indefinite" />
      </line>
      <line x1="340" y1="200" x2="470" y2="300" stroke="#30363d" strokeWidth="1">
        <animate attributeName="stroke" values="#30363d;#E85D2C;#30363d" dur="4s" begin="2.6s" repeatCount="indefinite" />
      </line>

      <circle cx="180" cy="120" r="24" fill="#161b22" stroke="#8b949e" strokeWidth="1" />
      <text x="180" y="124" fill="#f0f6fc" fontSize="11" textAnchor="middle">Hunter</text>

      <circle cx="500" cy="130" r="24" fill="#161b22" stroke="#8b949e" strokeWidth="1" />
      <text x="500" y="134" fill="#f0f6fc" fontSize="11" textAnchor="middle">Builder</text>

      <circle cx="340" cy="200" r="32" fill="#3D1A0C" stroke="#E85D2C" strokeWidth="1.5">
        <animate attributeName="r" values="32;36;32" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <text x="340" y="205" fill="#FF8A5C" fontSize="12" textAnchor="middle">Mission</text>

      <rect x="410" y="270" width="120" height="60" rx="8" fill="#161b22" stroke="#E85D2C" strokeWidth="1" opacity="0">
        <animate attributeName="opacity" values="0;0;1" dur="4s" repeatCount="indefinite" />
      </rect>
      <text x="470" y="292" fill="#8b949e" fontSize="10" textAnchor="middle" opacity="0">
        <animate attributeName="opacity" values="0;0;1" dur="4s" repeatCount="indefinite" />
        Proof of work
      </text>
      <text x="470" y="310" fill="#FF8A5C" fontSize="10" textAnchor="middle" opacity="0">
        <animate attributeName="opacity" values="0;0;1" dur="4s" repeatCount="indefinite" />
        ✓ Verified
      </text>
    </svg>
  )
}