export default function robots() {
  const baseUrl = 'https://passport-size-photo-generate.scaleupweb.xyz';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
