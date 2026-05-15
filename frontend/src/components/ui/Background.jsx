import { motion } from "framer-motion";

export function MeshBackground({ children, className = "" }) {
  return (
    <div className={`mesh-bg relative min-h-screen overflow-hidden ${className}`}>
      <Particles />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 18 }).map((_, index) => (
        <motion.span
          key={index}
          className="particle"
          style={{
            left: `${(index * 37) % 100}%`,
            top: `${(index * 53) % 100}%`,
          }}
          animate={{
            y: [0, -24, 0],
            x: [0, index % 2 ? 12 : -12, 0],
            opacity: [0.2, 0.65, 0.2],
          }}
          transition={{
            duration: 5 + (index % 5),
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.14,
          }}
        />
      ))}
    </div>
  );
}

