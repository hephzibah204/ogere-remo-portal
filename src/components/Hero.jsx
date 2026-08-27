export default function Hero({ ey, ti, sub, dark }) {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'calc(var(--nav-height) + 4rem) 2rem 4rem',
        position: 'relative',
        overflow: 'hidden',
        background: dark 
          ? 'linear-gradient(160deg, #1A0D06, #2C1A0E)' 
          : 'var(--darker)',
      }}
    >
      {/* Dynamic Background Elements */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.4,
          background: 'radial-gradient(circle at 20% 30%, var(--red) 0%, transparent 40%), radial-gradient(circle at 80% 70%, var(--gold) 0%, transparent 40%)',
          filter: 'blur(60px)',
        }}
      />
      
      {/* Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(201, 150, 58, 0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: '800px' }}>
        <p
          className="cinzel fu"
          style={{ 
            color: 'var(--gold)', 
            fontSize: '0.8rem', 
            letterSpacing: '0.4em', 
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            opacity: 0.8
          }}
        >
          {ey}
        </p>
        <h1 
          className="playfair fu2"
          style={{ 
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', 
            fontWeight: 900, 
            lineHeight: 1.1,
            color: 'var(--cream)',
            marginBottom: '2rem'
          }}
        >
          {ti}
        </h1>
        <div 
          className="fu3"
          style={{ 
            width: '60px', 
            height: '2px', 
            background: 'var(--gold)', 
            margin: '0 auto 2rem',
            boxShadow: '0 0 10px var(--gold)'
          }} 
        />
        <p 
          className="baskerville fu3" 
          style={{ 
            fontSize: 'clamp(1rem, 2vw, 1.25rem)', 
            color: 'rgba(245, 237, 216, 0.7)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.8
          }}
        >
          {sub}
        </p>
      </div>
    </div>
  );
}
