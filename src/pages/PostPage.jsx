import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadItems } from '../services/cms';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import Spinner from '../components/Spinner';
import SEO from '../components/SEO';

export default function PostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const all = await loadItems('blog');
      const found = (all || []).find(p => p.slug === slug);
      setPost(found || null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>;

  if (!post) {
    return (
      <div>
        <Hero ey="Not Found" ti="Post Not Found" sub="The blog post you're looking for doesn't exist." />
        <AdireDivider />
        <Section bg="#1a0d06" style={{ textAlign: 'center' }}>
          <Link to="/blog" className="btn-p" style={{ textDecoration: 'none', display: 'inline-block' }}>← Back to Blog</Link>
        </Section>
      </div>
    );
  }

  return (
    <div>
      <SEO title={post?.title || 'Post'} description={post?.excerpt || post?.body?.substring(0, 160) || 'Blog post'} />
      <Hero ey={post.author || 'OCDA'} ti={post.title} sub={post.publishDate || ''} />
      <AdireDivider />
      <Section bg="#1a0d06" mw={760}>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <Link to="/blog" className="btn-o" style={{ textDecoration: 'none', fontSize: '.55rem', padding: '.3rem .7rem', display: 'inline-block' }}>← Back</Link>
          {(post.categories || []).map(c => (
            <span key={c} className="tag tag-gold" style={{ fontSize: '.48rem' }}>{c}</span>
          ))}
          {(post.tags || []).map(t => (
            <span key={t} className="tag tag-terra" style={{ fontSize: '.48rem' }}>{t}</span>
          ))}
        </div>

        {post.featuredImage && (
          <img src={post.featuredImage} alt={post.title}
            style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 8, marginBottom: '1.5rem' }} />
        )}

        {post.excerpt && (
          <p className="playfair" style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'rgba(201,150,58,.75)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
            {post.excerpt}
          </p>
        )}

        <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: post.body || '' }} />

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(201,150,58,.12)' }}>
          <Link to="/blog" className="btn-o" style={{ textDecoration: 'none', display: 'inline-block' }}>← More Posts</Link>
        </div>
      </Section>
      <AdireDivider />
    </div>
  );
}
