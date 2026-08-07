import { tilePlaceholder } from "@/lib/placeholder";

export type TileSpan = "wide" | "narrow" | "half";
export type TileTextTone = "light" | "dark";

export interface HomeTile {
  id: string;
  label: string;
  href: string;
  imageUrl: string;
  span: TileSpan;
  textTone: TileTextTone;
}

/**
 * Casetify-style homepage subcategory tiles.
 * Layout rows (desktop): wide+narrow+narrow, narrow+narrow+wide, …
 */
export const homeTiles: HomeTile[] = [
  {
    id: "phone-cases",
    label: "Phone Cases",
    href: "/category/cases-and-covers",
    imageUrl: tilePlaceholder("Phone Cases", "tile-phone-cases"),
    span: "wide",
    textTone: "light",
  },
  {
    id: "phone-straps",
    label: "Phone Straps",
    href: "/category/straps-and-charms",
    imageUrl: tilePlaceholder("Phone Straps", "tile-phone-straps"),
    span: "narrow",
    textTone: "dark",
  },
  {
    id: "magsafe",
    label: "MagSafe Compatible",
    href: "/category/magsafe-and-wallets",
    imageUrl: tilePlaceholder("MagSafe", "tile-magsafe"),
    span: "narrow",
    textTone: "dark",
  },
  {
    id: "watch-bands",
    label: "Watch Bands",
    href: "/category/watch-bands",
    imageUrl: tilePlaceholder("Watch Bands", "tile-watch-bands"),
    span: "narrow",
    textTone: "light",
  },
  {
    id: "earbuds-cases",
    label: "Earbuds Cases",
    href: "/category/earbuds-cases",
    imageUrl: tilePlaceholder("Earbuds Cases", "tile-earbuds"),
    span: "narrow",
    textTone: "dark",
  },
  {
    id: "charms",
    label: "Charms",
    href: "/search?q=charm",
    imageUrl: tilePlaceholder("Charms", "tile-charms"),
    span: "wide",
    textTone: "light",
  },
  {
    id: "tablet-cases",
    label: "Tablet Cases",
    href: "/category/tablet-cases",
    imageUrl: tilePlaceholder("Tablet Cases", "tile-tablet"),
    span: "wide",
    textTone: "dark",
  },
  {
    id: "laptop-cases",
    label: "Laptop Cases",
    href: "/search?q=laptop+case",
    imageUrl: tilePlaceholder("Laptop Cases", "tile-laptop"),
    span: "narrow",
    textTone: "light",
  },
  {
    id: "protectors",
    label: "Protectors",
    href: "/category/screen-protectors",
    imageUrl: tilePlaceholder("Protectors", "tile-protectors"),
    span: "narrow",
    textTone: "dark",
  },
  {
    id: "ripple-cases",
    label: "Ripple Cases",
    href: "/search?q=Ripple",
    imageUrl: tilePlaceholder("Ripple Cases", "tile-ripple"),
    span: "half",
    textTone: "dark",
  },
  {
    id: "chargers",
    label: "Chargers",
    href: "/category/chargers",
    imageUrl: tilePlaceholder("Chargers", "tile-chargers"),
    span: "half",
    textTone: "light",
  },
  {
    id: "stickers",
    label: "Stickers",
    href: "/search?q=sticker",
    imageUrl: tilePlaceholder("Stickers", "tile-stickers"),
    span: "half",
    textTone: "dark",
  },
  {
    id: "sets-bundles",
    label: "Sets & Bundles",
    href: "/shop",
    imageUrl: tilePlaceholder("Sets & Bundles", "tile-bundles"),
    span: "half",
    textTone: "dark",
  },
];
