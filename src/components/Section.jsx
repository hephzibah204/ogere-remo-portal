export default function Section({ bg, py, children, mw, noContainer }) {
  return (
    <section
      style={{
        background: bg || 'transparent',
        padding: `${py || 'var(--section-py)'} 0`,
        position: 'relative',
      }}
    >
      {noContainer ? (
        children
      ) : (
        <div 
          className="container" 
          style={{ maxWidth: mw || 'var(--max-width)' }}
        >
          {children}
        </div>
      )}
    </section>
  );
}
