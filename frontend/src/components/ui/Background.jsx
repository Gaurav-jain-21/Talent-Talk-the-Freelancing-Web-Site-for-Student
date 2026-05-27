export function MeshBackground({ children, className = "" }) {
  return (
    <div className={`mesh-bg relative min-h-screen overflow-hidden ${className}`}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 18 }).map((_, index) => (
        <span
          key={index}
          className="particle"
          style={{
            left: `${(index * 37) % 100}%`,
            top: `${(index * 53) % 100}%`,
            animationDelay: `${index * 0.14}s`,
            animationDuration: `${5 + (index % 5)}s`,
          }}
        />
      ))}
    </div>
  );
}

