export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://examdesk.io";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/notes", "/full-tests", "/about", "/contact", "/privacy-policy", "/terms", "/disclaimer"],
        disallow: ["/admin", "/admin-login", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
