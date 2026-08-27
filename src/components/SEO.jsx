import { useEffect } from 'react';
import { SITE_DEFAULTS } from '../services/cms';

export default function SEO({ title, description, image, url, type = 'website', jsonld }) {
  useEffect(() => {
    const site = SITE_DEFAULTS;
    const fullTitle = title ? `${title} | ${site.title}` : site.title;
    const desc = description || site.description;
    const img = image || site.image;
    const fullUrl = url || site.url;

    document.title = fullTitle;

    const setMeta = (name, content, prop = false) => {
      let el = prop ? document.querySelector(`meta[property="${name}"]`) : document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        if (prop) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', desc);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', desc, true);
    setMeta('og:image', img, true);
    setMeta('og:url', fullUrl, true);
    setMeta('og:type', type, true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', img);
    setMeta('twitter:site', site.twitter);

    let ldEl = document.getElementById('json-ld');
    if (!ldEl) {
      ldEl = document.createElement('script');
      ldEl.id = 'json-ld';
      ldEl.type = 'application/ld+json';
      document.head.appendChild(ldEl);
    }
    const orgLd = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Ogere Remo Community',
      url: site.url,
      description: site.description,
      foundingDate: '1401',
      areaServed: 'Ogere Remo, Ogun State, Nigeria',
    };
    const pageLd = jsonld || {};
    ldEl.textContent = JSON.stringify(pageLd['@type'] ? { '@context': 'https://schema.org', ...pageLd } : { '@context': 'https://schema.org', ...orgLd, ...pageLd });
  }, [title, description, image, url, type, jsonld]);

  return null;
}
