import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portal ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0d0704',
            color: '#F5EDD8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: "'Cinzel', serif",
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              background: 'rgba(201,150,58,0.06)',
              border: '2px solid var(--gold)',
              borderRadius: '16px',
              padding: 'clamp(1.5rem, 5vw, 3rem)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏛️</div>
            <h1
              style={{
                fontSize: '1.8rem',
                color: 'var(--cream)',
                fontFamily: "'Playfair Display', serif",
                marginBottom: '0.8rem',
              }}
            >
              Àbùkù Kò Sí (No Disgrace Found)
            </h1>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'rgba(245,237,216,0.7)',
                lineHeight: 1.8,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                marginBottom: '2rem',
              }}
            >
              A momentary interruption occurred while rendering this page. The community database and archives are safe.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="btn-p"
                style={{ fontSize: '0.75rem', padding: '0.8rem 1.8rem' }}
              >
                🔄 Try Refreshing View
              </button>
              <button
                onClick={this.handleReset}
                className="btn-o"
                style={{ fontSize: '0.75rem', padding: '0.8rem 1.8rem' }}
              >
                🏠 Return to Town Square (Home)
              </button>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div
                style={{
                  marginTop: '2rem',
                  padding: '1rem',
                  background: 'rgba(220,38,38,0.1)',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  textAlign: 'left',
                  fontSize: '0.72rem',
                  color: '#fca5a5',
                  maxHeight: '180px',
                  overflow: 'auto',
                  fontFamily: 'monospace',
                }}
              >
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
