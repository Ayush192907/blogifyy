import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  robots?: string;
  schemaJson?: object | object[];
}

export default function SEO({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonicalUrl,
  robots = 'index, follow',
  schemaJson,
}: SEOProps) {
  const location = useLocation();
  const { settings } = useSettings();

  useEffect(() => {
    // Resolve dynamic site URL from environment variables, fallback to localhost:5174
    const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5174';
    const defaultSiteName = settings.site_name || 'Blogifyy';

    // 1. Update Title
    const finalTitle = title ? `${title} | ${defaultSiteName}` : `${defaultSiteName} - Premium Blog & Article CMS`;
    document.title = finalTitle;

    // Helper to find or create a meta tag
    const updateMetaTag = (name: string, value: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    };

    // Helper to find or create a link tag
    const updateLinkTag = (rel: string, value: string, type?: string) => {
      let tag = document.querySelector(`link[rel="${rel}"]`);
      if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', rel);
        document.head.appendChild(tag);
      }
      tag.setAttribute('href', value);
      if (type) tag.setAttribute('type', type);
    };

    // Update favicon tags dynamically
    const finalFavicon = settings.favicon_url || '/favicon.ico';
    updateLinkTag('icon', finalFavicon);
    updateLinkTag('shortcut icon', finalFavicon);
    updateLinkTag('apple-touch-icon', finalFavicon);

    // 2. Update Meta Description
    const finalDescription = description || 'Read the latest high-quality articles, guides, and stories on tech, business, lifestyle, health, and travel.';
    updateMetaTag('description', finalDescription);
    updateMetaTag('og:description', finalDescription, true);
    updateMetaTag('twitter:description', finalDescription);

    // 3. Update Meta Keywords
    if (keywords) {
      updateMetaTag('keywords', keywords);
    } else {
      updateMetaTag('keywords', 'blog, cms, articles, technology, news, tutorials');
    }

    // 4. Update Robots (force noindex, nofollow if site is not live yet)
    const isLive = import.meta.env.VITE_SITE_IS_LIVE === 'true';
    const finalRobots = isLive ? robots : 'noindex, nofollow';
    updateMetaTag('robots', finalRobots);

    // 5. Update Canonical URL
    const finalCanonical = canonicalUrl || `${siteUrl}${location.pathname}`;
    updateLinkTag('canonical', finalCanonical);

    // 6. Update OpenGraph & Twitter tags
    updateMetaTag('og:title', title || defaultSiteName, true);
    updateMetaTag('og:url', finalCanonical, true);
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:site_name', defaultSiteName, true);

    const defaultImage = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop';
    const finalImage = ogImage || defaultImage;
    updateMetaTag('og:image', finalImage, true);
    updateMetaTag('twitter:image', finalImage);

    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title || defaultSiteName);

    // 7. Update JSON-LD Structured Data
    // Remove existing LD+JSON tags to prevent duplicates
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    if (schemaJson) {
      const scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.innerHTML = JSON.stringify(schemaJson);
      document.head.appendChild(scriptTag);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, robots, schemaJson, location.pathname]);

  return null;
}
