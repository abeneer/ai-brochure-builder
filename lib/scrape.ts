
import * as cheerio from "cheerio";

// Fetch raw HTML from a website

export async function fetchHtml(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  // Return full HTML as string
  return await res.text();
}

// Extract readable text from HTML
export function extractText(html: string) {
  const $ = cheerio.load(html);

  // Remove unnecessary tags
  $("script, style, noscript").remove();
  const text = $("body").text();

  return text
    .replace(/\s+/g, " ") // remove extra spaces
    .trim()
    .slice(0, 5000); // limit size (important for AI cost + speed)
}

//  Extract links from page
export function extractLinks(baseUrl: string, html: string) {
  const $ = cheerio.load(html);

  const links = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");

    if (!href) return;

    // skip emails / phone
    if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

    try {
      // convert relative → full URL
      const fullUrl = new URL(href, baseUrl).toString();
      links.add(fullUrl);
    } catch {
      // ignore broken URLs
    }
  });

  // limit to avoid overload
  return Array.from(links).slice(0, 20);
}