const BRAND_PATTERNS: [RegExp, string][] = [
  [/sony/i, "Sony"],
  [/apple|airpods|ipad/i, "Apple"],
  [/samsung/i, "Samsung"],
  [/logitech/i, "Logitech"],
  [/instant.?pot/i, "Instant Pot"],
  [/vitamix/i, "Vitamix"],
  [/dyson/i, "Dyson"],
  [/nespresso/i, "Nespresso"],
  [/le.?creuset/i, "Le Creuset"],
  [/nike/i, "Nike"],
  [/levi/i, "Levi's"],
  [/ray.?ban/i, "Ray-Ban"],
  [/columbia/i, "Columbia"],
  [/garmin/i, "Garmin"],
  [/hydro.?flask/i, "Hydro Flask"],
  [/cerave/i, "CeraVe"],
  [/philips|sonicare/i, "Philips"],
  [/james.?clear|atomic.?habits/i, "James Clear"],
  [/morgan.?housel|psychology.?of.?money/i, "Morgan Housel"],
  [/cal.?newport|deep.?work/i, "Cal Newport"],
];

export function extractBrand(title: string): string {
  for (const [pattern, brand] of BRAND_PATTERNS) {
    if (pattern.test(title)) return brand;
  }
  return "Other";
}

export const ALL_BRANDS = [
  "Apple",
  "Cal Newport",
  "CeraVe",
  "Columbia",
  "Dyson",
  "Garmin",
  "Hydro Flask",
  "Instant Pot",
  "James Clear",
  "Le Creuset",
  "Levi's",
  "Logitech",
  "Morgan Housel",
  "Nespresso",
  "Nike",
  "Philips",
  "Ray-Ban",
  "Samsung",
  "Sony",
  "Vitamix",
];
