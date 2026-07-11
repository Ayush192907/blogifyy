const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Parse .env manually
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.warn('.env file not found, skipping sitemap generation.');
  process.exit(0);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[key] = value.trim();
  }
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key || key === 'YOUR_SUPABASE_ANON_KEY' || key.startsWith('YOUR_')) {
  console.warn('Supabase URL or Key is missing, skipping sitemap generation.');
  process.exit(0);
}

// Dynamically resolve site url based on live mode status
const isLive = env.VITE_SITE_IS_LIVE === 'true';
const siteUrl = isLive ? (env.VITE_SITE_URL || 'http://localhost:5174') : 'http://localhost:5174';
const supabase = createClient(url, key);

async function main() {
  console.log(`Generating sitemap.xml and SEO assets for: ${siteUrl}...`);

  // Ensure output directories exist
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }

  const now = new Date().toISOString();

  // Self-heal/ensure default static pages exist in the DB for compliance
  const defaultPages = [
    {
      title: 'About Us',
      slug: 'about',
      content: '<p>Welcome to our Blogify CMS! We are dedicated to providing the best content on technology, lifestyle, and business. Start browsing now.</p>',
      status: 'published',
      show_in_header: true,
      header_label: 'About Us',
      show_in_footer: true,
      footer_label: 'About Us',
      sort_order: 10,
      enabled: true
    },
    {
      title: 'Contact Us',
      slug: 'contact',
      content: '<p>Have any questions, suggestions, or just want to say hello? Send us a message and we\'ll reply as soon as possible.</p>',
      status: 'published',
      show_in_header: true,
      header_label: 'Contact Us',
      show_in_footer: true,
      footer_label: 'Contact Us',
      sort_order: 20,
      enabled: true
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: '<p>We take your privacy seriously. Your data is never sold or shared with any third-party services.</p>',
      status: 'published',
      show_in_header: false,
      show_in_footer: true,
      footer_label: 'Privacy Policy',
      sort_order: 30,
      enabled: true
    },
    {
      title: 'Disclaimer',
      slug: 'disclaimer',
      content: '<p>The content presented on this website is for informational purposes only.</p>',
      status: 'published',
      show_in_header: false,
      show_in_footer: true,
      footer_label: 'Disclaimer',
      sort_order: 40,
      enabled: true
    },
    {
      title: 'Terms & Conditions',
      slug: 'terms-and-conditions',
      content: '<p>By using this website, you agree to comply with and be bound by our terms and conditions.</p>',
      status: 'published',
      show_in_header: false,
      show_in_footer: true,
      footer_label: 'Terms & Conditions',
      sort_order: 50,
      enabled: true
    }
  ];

  try {
    for (const page of defaultPages) {
      const { data } = await supabase.from('pages').select('id').eq('slug', page.slug);
      if (!data || data.length === 0) {
        console.log(`Seeding missing static page: ${page.title}`);
        await supabase.from('pages').insert(page);
      }
    }
  } catch (e) {
    console.error('Error seeding default pages:', e.message);
  }

  // 1. Static Routes
  const rootUrls = [
    { loc: `${siteUrl}/`, lastmod: now, changefreq: 'daily', priority: '1.0' },
    { loc: `${siteUrl}/blogs`, lastmod: now, changefreq: 'daily', priority: '0.9' },
    { loc: `${siteUrl}/contact`, lastmod: now, changefreq: 'monthly', priority: '0.5' },
    { loc: `${siteUrl}/search`, lastmod: now, changefreq: 'monthly', priority: '0.3' },
  ];

  // 2. Fetch Categories
  let categoriesUrls = [];
  try {
    const { data: cats, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    if (cats) {
      categoriesUrls = cats
        .filter(c => c.enabled !== false)
        .map(c => ({
          loc: `${siteUrl}/category/${c.slug}`,
          lastmod: c.updated_at || c.created_at || now,
          changefreq: 'weekly',
          priority: '0.7'
        }));
    }
  } catch (e) {
    console.error('Error fetching categories for sitemap:', e.message);
  }

  // 3. Fetch Pages (Published only)
  let pagesUrls = [];
  try {
    const { data: pages, error } = await supabase.from('pages').select('*').eq('status', 'published');
    if (error) throw error;
    if (pages) {
      pagesUrls = pages
        .filter(p => p.enabled !== false)
        .map(p => ({
          loc: `${siteUrl}/${p.slug}`,
          lastmod: p.updated_at || p.created_at || now,
          changefreq: 'monthly',
          priority: '0.6'
        }));
    }
  } catch (e) {
    console.error('Error fetching pages for sitemap:', e.message);
  }

  // 4. Fetch Posts (Published only)
  let postsUrls = [];
  try {
    const { data: posts, error } = await supabase.from('posts').select('*').eq('status', 'published');
    if (error) throw error;
    if (posts) {
      posts.forEach(p => {
        postsUrls.push({
          loc: `${siteUrl}/blogs/${p.slug}`,
          lastmod: p.updated_at || p.created_at || now,
          changefreq: 'weekly',
          priority: '0.8',
          image: p.featured_image ? {
            loc: p.featured_image,
            title: p.title
          } : null
        });
      });
    }
  } catch (e) {
    console.error('Error fetching posts for sitemap:', e.message);
  }

  // Helper to compile a single <url> entry
  const makeUrlElement = (item) => {
    let el = `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${new Date(item.lastmod).toISOString().split('T')[0]}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>`;
    if (item.image) {
      el += `\n    <image:image>
      <image:loc>${escapeXml(item.image.loc)}</image:loc>
      <image:title>${escapeXml(item.image.title)}</image:title>
    </image:image>`;
    }
    el += '\n  </url>';
    return el;
  };

  const escapeXml = (unsafe) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  // Compile unified sitemap.xml content with logical grouping comments
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Website Home and Indexes -->
${rootUrls.map(makeUrlElement).join('\n')}

  <!-- Published Articles / Blogs -->
${postsUrls.map(makeUrlElement).join('\n')}

  <!-- Category Archives -->
${categoriesUrls.map(makeUrlElement).join('\n')}

  <!-- Static Information & Compliance Pages -->
${pagesUrls.map(makeUrlElement).join('\n')}
</urlset>`;

  // Compile robots.txt based on live status
  const isLive = env.VITE_SITE_IS_LIVE === 'true';
  let robotsTxt;
  if (isLive) {
    robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin
Disallow: /admin/*

Sitemap: ${siteUrl}/sitemap.xml
`;
  } else {
    robotsTxt = `User-agent: *
Disallow: /
`;
  }

  // Compile llms.txt
  const llmsTxt = `# Blogify CMS - AI Agent Context

## Base Site URL
${siteUrl}

## Site Index Feed
- Blogs: /blogs
- Contact Form: /contact

## Topical Coverage
Technology, Business, Lifestyle, Travel, and Health.
`;

  // Write sitemap and text files
  const saveAsset = (filename, content) => {
    fs.writeFileSync(path.join(publicDir, filename), content);
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, filename), content);
    }
  };

  saveAsset('sitemap.xml', sitemapXml);
  saveAsset('robots.txt', robotsTxt);
  saveAsset('llms.txt', llmsTxt);

  // Clean up old sitemap files if they exist in public/ or dist/
  const deleteOldAsset = (filename) => {
    try {
      const pubPath = path.join(publicDir, filename);
      if (fs.existsSync(pubPath)) fs.unlinkSync(pubPath);
      if (fs.existsSync(distDir)) {
        const distPath = path.join(distDir, filename);
        if (fs.existsSync(distPath)) fs.unlinkSync(distPath);
      }
    } catch (e) {}
  };

  deleteOldAsset('sitemap-index.xml');
  deleteOldAsset('post-sitemap.xml');
  deleteOldAsset('page-sitemap.xml');
  deleteOldAsset('category-sitemap.xml');
  deleteOldAsset('image-sitemap.xml');

  console.log('Unified sitemap.xml and SEO assets generated successfully in both public/ and dist/ folders!');
}

main();
