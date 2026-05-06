import * as cheerio from "cheerio";
import { openai } from "@/lib/openai";

export interface ScrapeResult {
  systemPrompt: string;
  siteName: string;
  preview: string;
  detectedLanguage: string;
}

const MAX_CHARS = 20000;

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Meetzy/1.0; +https://meetzy.ai/bot)",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  $("script, style, nav, footer, header, aside, .cookie-banner, #cookie-banner").remove();

  const title = $("title").text().trim();
  const metaDesc =
    $('meta[name="description"]').attr("content") ??
    $('meta[property="og:description"]').attr("content") ??
    "";
  const siteName =
    $('meta[property="og:site_name"]').attr("content") ?? title ?? url;

  const headings: string[] = [];
  $("h1, h2, h3").each((_, el) => {
    const text = $(el).text().trim();
    const tag = (el as { tagName?: string }).tagName ?? "H";
    if (text) headings.push(`${tag.toUpperCase()}: ${text}`);
  });

  const paragraphs: string[] = [];
  $("p, li").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 20) paragraphs.push(text);
  });

  const priceElements: string[] = [];
  $('[class*="price"], [class*="precio"], [id*="price"], [id*="precio"]').each(
    (_, el) => {
      const text = $(el).text().trim();
      if (text) priceElements.push(text);
    }
  );

  const contactInfo: string[] = [];
  $('a[href^="tel:"], a[href^="mailto:"]').each((_, el) => {
    contactInfo.push($(el).attr("href") ?? "");
  });

  let rawContent = [
    `TITLE: ${title}`,
    `DESCRIPTION: ${metaDesc}`,
    `URL: ${url}`,
    "",
    "HEADINGS:",
    ...headings,
    "",
    "CONTENT:",
    ...paragraphs,
    "",
    priceElements.length ? "PRICES: " + priceElements.join(" | ") : "",
    contactInfo.length ? "CONTACT: " + contactInfo.join(" | ") : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (rawContent.length > MAX_CHARS) {
    rawContent = rawContent.substring(0, MAX_CHARS);
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an AI that analyzes website content and creates a comprehensive system prompt for a conversational AI agent.
The agent will represent this business on their website.
Return a JSON object with: { systemPrompt: string, detectedLanguage: string, preview: string }
- systemPrompt: A detailed system prompt (500-1000 words) that includes: business description, products/services, pricing, contact info, FAQs, tone, and instructions to be helpful, accurate, and represent the brand well. Write it in the same language as the website.
- detectedLanguage: ISO 639-1 language code (e.g. "es", "en", "pt")
- preview: 2-3 sentence summary of what the business does`,
      },
      {
        role: "user",
        content: `Analyze this website content and create a system prompt:\n\n${rawContent}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const result = JSON.parse(
    completion.choices[0].message.content ?? "{}"
  ) as {
    systemPrompt: string;
    detectedLanguage: string;
    preview: string;
  };

  return {
    systemPrompt: result.systemPrompt ?? "",
    detectedLanguage: result.detectedLanguage ?? "es",
    preview: result.preview ?? "",
    siteName,
  };
}
