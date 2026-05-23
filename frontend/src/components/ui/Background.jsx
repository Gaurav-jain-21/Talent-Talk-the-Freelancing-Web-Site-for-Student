export function MeshBackground({ children, className = "" }) {
  return (
    <div className={`app-bg min-h-screen ${className}`}>
      <div>{children}</div>
    </div>
  );
}

export function Particles() {
  return null;
}

