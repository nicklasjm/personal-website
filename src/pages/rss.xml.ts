import type { APIRoute } from "astro";
import { getAllPosts } from "@/lib/sanity";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const GET: APIRoute = async ({ site }) => {
  const posts = await getAllPosts();
  const siteUrl = site?.toString() || "https://nicklasjakobsen.dk";

  const items = posts
    .map((post) => {
      const link =
        post.category === "links" && post.externalLink
          ? post.externalLink
          : `${siteUrl}/feed/${post.slug.current}`;

      const pubDate = new Date(post.publishedAt).toUTCString();

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(`${siteUrl}/feed/${post.slug.current}`)}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(post.category)}</category>${
        post.excerpt
          ? `
      <description>${escapeXml(post.excerpt)}</description>`
          : ""
      }
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nicklas Jakobsen</title>
    <description>Digital design, work, experiments, and thoughts from Nicklas Jakobsen.</description>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
