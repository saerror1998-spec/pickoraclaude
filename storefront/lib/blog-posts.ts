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
  {
    slug: "best-refurbished-business-laptops-uae",
    title: "Best Refurbished Business Laptops in the UAE (2026)",
    metaTitle: "Best Refurbished Business Laptops in the UAE | Pickora",
    metaDescription:
      "Comparing refurbished Dell Latitude, HP EliteBook and Lenovo ThinkPad for work in the UAE — pricing, specs, and which one to actually buy.",
    publishedAt: "2026-09-10",
    excerpt:
      "Dell Latitude, HP EliteBook, or Lenovo ThinkPad — three of the most common refurbished business laptop lines in the UAE. Here's how they actually compare on our own catalog.",
    sections: [
      {
        heading: "Dell Latitude vs. HP EliteBook vs. Lenovo ThinkPad — which fits your work?",
        body: [
          "All three are genuine business laptop lines built for daily office use, and all three show up regularly in our refurbished catalog with both i5 and i7 configurations available. The honest differences come down to price range and what condition units are currently in stock, more than any single \"best\" answer.",
          "Dell Latitude has the deepest bench in our catalog — the widest range of models and configurations, spanning entry-level to higher-spec i7 units. If you want the most choice at a given budget, start here.",
          "HP EliteBook covers a similar spread, with EliteBook models running from budget-friendly units up to higher-end touchscreen 2-in-1 configurations at the top of the range. Good if you specifically want a 2-in-1 or higher-spec business machine.",
          "Lenovo ThinkPad is the smallest of the three lines in our catalog but tends to run cheaper at the entry end — ThinkPads have a reputation for build quality that holds up well even several generations in, which is exactly the kind of unit that makes sense to buy refurbished.",
        ],
      },
      {
        heading: "FAQ",
        body: [
          "Are i5 or i7 refurbished laptops better value? For general office work — documents, browsers, video calls — an i5 configuration is usually the better value; you're paying less for performance most business tasks won't fully use. An i7 makes sense if you're running heavier software (multiple VMs, large spreadsheets, light development work) where the extra headroom actually gets used.",
          "Does the brand matter more than the condition grade? The condition grade (Excellent, Good, or Fair) shown on every product page tells you more about what you'll actually receive than the brand name does — a Good-condition unit from any of these three lines has been through the same 4-step certification and carries the same 90-day warranty.",
          "Can I filter by brand to compare current stock? Yes — each brand (Dell, HP, Lenovo) has its own page on Pickora showing every current in-stock unit with real pricing, not a fixed list that goes stale.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
