import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Render } from '@measured/puck';
import { config } from '../puck.config';
import { loadItems } from '../services/cms';
import Spinner from '../components/Spinner';

export default function CustomPage() {
  const { slug } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      try {
        const pages = await loadItems('pages');
        const page = pages.find(p => p.slug === slug);
        if (page) {
          if (page.status === 'published' || window.location.search.includes('preview=true')) {
             setPageData(page.data);
          } else {
             setError('This page is currently a draft.');
          }
        } else {
          setError('Page not found.');
        }
      } catch (err) {
        console.error('Error loading custom page:', err);
        setError('Failed to load page.');
      } finally {
        setLoading(false);
      }
    }
    fetchPage();
  }, [slug]);

  if (loading) return <div style={{ padding: '100px 0', textAlign: 'center' }}><Spinner /></div>;

  if (error) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#F5EDD8' }}>{error}</h1>
        <p style={{ marginTop: '20px' }}>
          <Link to="/" style={{ color: '#C9963A', textDecoration: 'none' }}>← Back to Home</Link>
        </p>
      </div>
    );
  }

  if (!pageData) return null;

  return (
    <div className="custom-page-render">
      <Render config={config} data={pageData} />
    </div>
  );
}
