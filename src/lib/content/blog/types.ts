/** Static, SEO-oriented articles. Content is bilingual; body is lightweight markdown. */
export interface Article {
  slug: string;
  date: string;
  tags: string[];
  title: { ar: string; en: string };
  excerpt: { ar: string; en: string };
  body: { ar: string; en: string };
}

