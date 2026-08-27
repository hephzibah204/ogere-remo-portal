import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadItems } from '../services/cms';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import Spinner from '../components/Spinner';
import SEO from '../components/SEO';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    (async () => {
      const all = await loadItems('blog');
      setPosts((all || []).filter(p => p.status === 'published'));
      setLoading(false);
    })();
  }, []);

  const categories = ['all', ...new Set(posts.flatMap(p => p.categories || []))];
  const filtered = category === 'all' ? posts : posts.filter(p => (p.categories || []).includes(category));

  return (
    <div>
      <SEO title="Blog" description="Stories, news, and perspectives from the Ogere Remo community." />
      <Hero ey="Ogere Remo" ti="Blog" sub="Stories, news, and perspectives from the Ogere Remo community." />
      <AdireDivider />
      <Section bg="#1a0d06">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <p className="sl" style={{ margin: 0 }}>Latest Posts</p>
          {categories.length > 1 && (
            <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
              {categories.map(c => (
                <button key={c} className={category === c ? 'btn-p' : 'btn-o'}
                  onClick={() => setCategory(c)} style={{ fontSize: '.5rem', padding: '.3rem .6rem' }}>
                  {c === 'all' ? 'All' : c}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(245,237,216,.3)' }}>
            No posts yet. Check back soon.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill,minmax(min(280px, 100%),1fr))' }}>
            {filtered.map((post, i) => {
              const slug = post.slug || slugify(post.title);
              return (
                <Link key={post.id || i} to={`/blog/${slug}`} style={{ textDecoration: 'none' }}>
                  <article className="card" style={{
                    borderRadius: 6, overflow: 'hidden', height: '100%',
                    display: 'flex', flexDirection: 'column',
                  }}>
                    {post.featuredImage && (
                      <div style={{ height: 180, background: `url(${post.featuredImage}) center/cover`, flexShrink: 0 }} />
                    )}
                    <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
                        {(post.categories || []).map(c => (
                          <span key={c} className="tag tag-gold" style={{ fontSize: '.45rem', padding: '.1rem .4rem' }}>{c}</span>
                        ))}
                      </div>
                      <h3 className="playfair" style={{ fontSize: '1.1rem', color: '#F5EDD8', marginBottom: '.3rem', lineHeight: 1.3 }}>
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p style={{ fontSize: '.78rem', color: 'rgba(245,237,216,.55)', lineHeight: 1.7, flex: 1 }}>{post.excerpt}</p>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.8rem', fontSize: '.65rem', color: 'rgba(245,237,216,.3)' }}>
                        <span>{post.author || 'OCDA'}</span>
                        <span>{post.publishDate || ''}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </Section>
      <AdireDivider />
    </div>
  );
}
