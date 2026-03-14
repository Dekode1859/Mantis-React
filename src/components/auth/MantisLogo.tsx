import { useEffect, useState } from "react"

export function MantisLogo() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  return (
    <div className="flex justify-center mb-8">
      <h1
        className={`text-5xl font-mono text-emerald-400 relative ${
          mounted ? "animate-shine" : ""
        }`}
        style={{
          letterSpacing: "0.05em",
        }}
      >
        <span className="mr-2">&gt;</span>
        mantis_
      </h1>
    </div>
  )
}