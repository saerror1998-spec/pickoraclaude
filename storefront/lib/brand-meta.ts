// Real per-brand titles/intro copy for the brands with dedicated content;
// any other real catalog brand still gets a genuinely unique (if templated)
// title/intro rather than falling back to generic shared copy — that was
// the actual SEO bug (every brand filter sharing one title/meta).
export const BRAND_META: Record<string, { title: string; description: string; intro: string; tagline: string }> = {
  Dell: {
    title: "Refurbished Dell Laptops in the UAE | Latitude & Inspiron | Pickora",
    description:
      "Shop certified refurbished Dell laptops in the UAE — Latitude & Inspiron models from AED 550. Inspected, 90-day warranty, free UAE-wide shipping.",
    intro:
      "Dell has one of the widest refurbished business-laptop lineups in the UAE — Latitude and Inspiron models that hold up well for everyday work and light multitasking.",
    tagline: "Business workhorses. Latitude to Inspiron.",
  },
  HP: {
    title: "Refurbished HP Laptops UAE | Chromebooks & EliteBook | Pickora",
    description:
      "Certified refurbished HP laptops in the UAE, from Chromebooks to EliteBooks. Every unit inspected and backed by a 90-day Pickora warranty.",
    intro:
      "HP's refurbished range spans budget Chromebooks all the way up to EliteBook business laptops, so there's a real spread of specs and prices to choose from.",
    tagline: "Chromebook to EliteBook essentials.",
  },
  Lenovo: {
    title: "Refurbished Lenovo Laptops UAE | ThinkPad & Chromebook | Pickora",
    description:
      "Shop refurbished Lenovo laptops in the UAE — ThinkPad and Chromebook models, inspected and warrantied for 90 days. Free shipping across the UAE.",
    intro:
      "Lenovo's ThinkPad line is known for durability, and it shows up well in the refurbished market — alongside a solid Chromebook selection for lighter use.",
    tagline: "ThinkPad reliability, rebuilt right.",
  },
  Elite: {
    title: "Refurbished Elite Business Laptops UAE | Pickora",
    description:
      "Certified refurbished Elite business laptops in the UAE — touchscreen 2-in-1 models with 11th Gen i5 CPUs, inspected and warrantied.",
    intro: "Elite business laptops in our catalog are touchscreen 2-in-1 models built around 11th Gen i5 CPUs.",
    tagline: "Touchscreen 2-in-1s, 11th Gen i5.",
  },
};

export function brandSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function brandMeta(brandName: string): { title: string; description: string; intro: string; tagline: string } {
  const known = BRAND_META[brandName];
  if (known) return known;

  return {
    title: `Refurbished ${brandName} Laptops UAE | Pickora`,
    description: `Shop certified refurbished ${brandName} laptops in the UAE — inspected, cleaned, and backed by a 90-day Pickora warranty.`,
    intro: `Every ${brandName} laptop in this catalog is inspected, cleaned, and backed by the same 90-day Pickora warranty as the rest of our range.`,
    tagline: `Inspected and warrantied ${brandName} laptops.`,
  };
}
