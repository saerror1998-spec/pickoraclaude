export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  publishedAt: string; // ISO date
  excerpt: string;
  sections: { heading: string; body: string[] }[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "renewed-vs-refurbished-laptops",
    title: "Renewed vs Refurbished Laptops: What's Actually the Difference?",
    metaTitle: "Renewed vs Refurbished Laptops: What's the Difference? | Pickora",
    metaDescription:
      "Confused between renewed and refurbished laptops? We break down the real difference and show what Pickora's 90-day warranty and certification actually cover.",
    publishedAt: "2026-09-10",
    excerpt:
      "\"Renewed\" and \"refurbished\" get used almost interchangeably when you're shopping for a laptop — here's what each term actually means, and why it matters less than you'd think once a unit ships from Pickora.",
    sections: [
      {
        heading: "What does \"renewed\" mean?",
        body: [
          "\"Renewed\" is a term that became widely known through marketplace programs like Amazon Renewed, where a laptop is inspected and tested by an approved renewer, confirmed to work like new, and typically shows little to no visible wear. It's a marketplace-defined label — the exact inspection checklist varies by whoever is doing the renewing.",
          "You'll see \"(Renewed)\" in the name of some listings in our own catalog too — that wording is usually inherited from how the original supplier listed the unit, not a separate grading system we run ourselves.",
        ],
      },
      {
        heading: "What does \"refurbished\" mean?",
        body: [
          "\"Refurbished\" is the broader, older term. It generally means a used device has been restored to working condition — repaired if needed, cleaned, and tested — before being resold. Unlike \"renewed,\" it isn't tied to one specific program, so the quality bar depends entirely on who's doing the refurbishing.",
          "That's really the core issue with both terms: neither one tells you, on its own, exactly what was actually checked, repaired, or guaranteed. The label matters far less than the process behind it.",
        ],
      },
      {
        heading: "Which is better — renewed or refurbished?",
        body: [
          "Neither term is inherently better — what matters is who's standing behind the laptop after you buy it. A \"renewed\" listing with no real warranty is a worse deal than a \"refurbished\" one backed by 90 days of coverage. The label on a listing is a starting point, not a guarantee.",
          "That's why, on Pickora, every laptop goes through the exact same process before it's listed — whether the product name still carries \"(Renewed)\" from the original source listing or not. The condition grade (Excellent, Good, or Fair) shown on every product page reflects our own inspection, not the marketplace label.",
        ],
      },
      {
        heading: "How Pickora's 4-step certification process compares",
        body: [
          "Every laptop we sell — regardless of what it's named — runs through the same four steps before it goes up for sale:",
          "1. Diagnose: a full hardware and software diagnostic before anything else happens.",
          "2. Repair & replace: batteries, keyboards, screens, and drives that don't meet spec get replaced with quality parts.",
          "3. Deep clean: chassis, ports, and internals are cleaned so the laptop looks and feels genuinely refreshed.",
          "4. Grade & certify: a final pass grades cosmetic condition and confirms performance before it's listed.",
          "Every unit then ships with a 90-day warranty covering parts and workmanship — the same coverage no matter what the listing title says.",
        ],
      },
      {
        heading: "FAQ",
        body: [
          "Does Pickora sell both renewed and refurbished laptops? Some product names inherited the word \"Renewed\" from their original listing, but every laptop we sell goes through the same certification process and warranty — we don't run two different quality tiers.",
          "Is a renewed laptop always in better condition than a refurbished one? Not necessarily — it depends entirely on the actual inspection process, not the label. Check the condition grade (Excellent/Good/Fair) and warranty terms instead.",
          "What condition grade should I trust more? Trust the grade shown on the product page (Excellent, Good, or Fair) and the 90-day warranty — both are set by our own certification, not by the original listing's naming.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
