import type { Product, ProductSpec, StockStatus } from "@/types";
import { productPlaceholder } from "@/lib/placeholder";
import { slugify } from "@/lib/utils";

/**
 * Product catalogue built from sourced brand taxonomies
 * (Mous, dbrand, Nomad, ESR, CASETiFY).
 *
 * Taxonomy columns:
 * Department · Category · Sub Category · Series · Product Category ·
 * Product Type · Variant · Compatible Device · Brand
 */

interface Seed {
  department: string;
  taxonomyCategory: string;
  subCategory: string;
  series: string;
  productCategory: string;
  productType: string;
  variant: string;
  compatibleDevice: string;
  brand: string;
}

const seeds: Seed[] = [
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "Limitless",
    "productCategory": "Phone Cases",
    "productType": "Phone Case",
    "variant": "",
    "compatibleDevice": "All iPhone Models",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "Limitless",
    "productCategory": "Phone Cases",
    "productType": "Phone Case",
    "variant": "",
    "compatibleDevice": "All Samsung Galaxy Models",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "Limitless",
    "productCategory": "Phone Cases",
    "productType": "Phone Case",
    "variant": "",
    "compatibleDevice": "All Google Pixel Models",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "Ultra Protective",
    "productCategory": "Phone Cases",
    "productType": "Protective Phone Case",
    "variant": "",
    "compatibleDevice": "All Supported Devices",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "Crystal Clear",
    "productCategory": "Phone Cases",
    "productType": "Clear Phone Case",
    "variant": "Transparent",
    "compatibleDevice": "All Supported Devices",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "IntraLock",
    "productCategory": "Phone Cases",
    "productType": "Motorcycle Phone Case",
    "variant": "Magnetic Lock",
    "compatibleDevice": "All Supported Devices",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "Mount Ready",
    "productCategory": "Phone Cases",
    "productType": "Mount Compatible Phone Case",
    "variant": "Mount Ready",
    "compatibleDevice": "All Supported Devices",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Charging",
    "productCategory": "Wireless Charging",
    "productType": "Wireless Charger",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Charging",
    "productCategory": "Wireless Charging",
    "productType": "Car Charger",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Charging",
    "productCategory": "Wireless Charging",
    "productType": "Portable Charger",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Charging",
    "productCategory": "Wireless Charging",
    "productType": "Desk Charger",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Charging",
    "productCategory": "Wireless Charging",
    "productType": "Charging Stand",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Charging",
    "productCategory": "Wireless Charging",
    "productType": "Watch Charger",
    "variant": "",
    "compatibleDevice": "Apple Watch / Pixel Watch",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Charging",
    "productCategory": "Wireless Charging",
    "productType": "Charging Mount",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Charging",
    "productCategory": "Wireless Charging",
    "productType": "Cable",
    "variant": "USB-C / Lightning",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Charging",
    "productCategory": "Wireless Charging",
    "productType": "Adapter",
    "variant": "USB-C",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Charging",
    "productCategory": "Wireless Charging",
    "productType": "Power Bank",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Device Accessories",
    "productCategory": "Protection",
    "productType": "Screen Protector",
    "variant": "",
    "compatibleDevice": "All Supported Devices",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Device Accessories",
    "productCategory": "Phone Accessories",
    "productType": "Case Strap",
    "variant": "",
    "compatibleDevice": "All Phone Cases",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Device Accessories",
    "productCategory": "Phone Accessories",
    "productType": "Phone Ring",
    "variant": "",
    "compatibleDevice": "All Phone Cases",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Device Accessories",
    "productCategory": "Wallet",
    "productType": "Magnetic Wallet",
    "variant": "MagSafe",
    "compatibleDevice": "Supported Devices",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Device Accessories",
    "productCategory": "Watch Accessories",
    "productType": "Watch Strap",
    "variant": "",
    "compatibleDevice": "Apple / Pixel / Samsung Watch",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Device Accessories",
    "productCategory": "Audio Accessories",
    "productType": "AirPods Case",
    "variant": "",
    "compatibleDevice": "AirPods",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Device Accessories",
    "productCategory": "Charging Accessories",
    "productType": "Cable",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Device Accessories",
    "productCategory": "Charging Accessories",
    "productType": "Adapter",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Device Accessories",
    "productCategory": "Bike Accessories",
    "productType": "Cycling Mount",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Lifestyle",
    "subCategory": "Travel Accessories",
    "series": "Travel",
    "productCategory": "Bags",
    "productType": "Laptop Sleeve",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Lifestyle",
    "subCategory": "Travel Accessories",
    "series": "Travel",
    "productCategory": "Bags",
    "productType": "Pouch",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Lifestyle",
    "subCategory": "Travel Accessories",
    "series": "Travel",
    "productCategory": "Bags",
    "productType": "Tech Pouch",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Lifestyle",
    "subCategory": "Travel Accessories",
    "series": "Travel",
    "productCategory": "Bags",
    "productType": "Toiletry Pouch",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Lifestyle",
    "subCategory": "Travel Accessories",
    "series": "Travel",
    "productCategory": "Organization",
    "productType": "Compression Wardrobe",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Lifestyle",
    "subCategory": "Travel Accessories",
    "series": "Travel",
    "productCategory": "Organization",
    "productType": "Document Pouch",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Mous"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "Tank",
    "productCategory": "Rugged Cases",
    "productType": "Rugged Phone Case",
    "variant": "Standard",
    "compatibleDevice": "All Supported Phone Devices",
    "brand": "dbrand"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "Ghost",
    "productCategory": "Clear Cases",
    "productType": "Clear Phone Case",
    "variant": "Transparent",
    "compatibleDevice": "All Supported Phone Devices",
    "brand": "dbrand"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "Grip",
    "productCategory": "Custom Cases",
    "productType": "Grip Phone Case",
    "variant": "Standard",
    "compatibleDevice": "All Supported Phone Devices",
    "brand": "dbrand"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Screen Protection",
    "series": "Prism",
    "productCategory": "Screen Protectors",
    "productType": "Tempered Glass",
    "variant": "Clear",
    "compatibleDevice": "All Supported Phone Devices",
    "brand": "dbrand"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Skins",
    "series": "Signature",
    "productCategory": "Phone Skins",
    "productType": "Device Skin",
    "variant": "Carbon Fiber / Leather / Matte / Gloss",
    "compatibleDevice": "All Supported Phone Devices",
    "brand": "dbrand"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Lifestyle",
    "subCategory": "Stickers",
    "series": "Signature",
    "productCategory": "Stickers",
    "productType": "Vinyl Sticker",
    "variant": "Assorted Designs",
    "compatibleDevice": "Universal",
    "brand": "dbrand"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "Standard",
    "productCategory": "Phone Cases",
    "productType": "Phone Case",
    "variant": "",
    "compatibleDevice": "All Supported Phones",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Tablet",
    "subCategory": "Cases & Covers",
    "series": "Standard",
    "productCategory": "iPad Cases",
    "productType": "iPad Case",
    "variant": "",
    "compatibleDevice": "All Supported iPads",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Audio",
    "subCategory": "Cases & Covers",
    "series": "Standard",
    "productCategory": "Headphone Cases",
    "productType": "Headphone Case",
    "variant": "",
    "compatibleDevice": "AirPods / Headphones",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Watch Bands",
    "series": "Leather",
    "productCategory": "Leather Bands",
    "productType": "Modern Band",
    "variant": "",
    "compatibleDevice": "Apple Watch",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Watch Bands",
    "series": "Leather",
    "productCategory": "Leather Bands",
    "productType": "Traditional Band",
    "variant": "",
    "compatibleDevice": "Apple Watch",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Watch Bands",
    "series": "Leather",
    "productCategory": "Leather Bands",
    "productType": "Active Band Pro",
    "variant": "",
    "compatibleDevice": "Apple Watch",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Watch Bands",
    "series": "Leather",
    "productCategory": "Leather Bands",
    "productType": "Garmin Band",
    "variant": "",
    "compatibleDevice": "Garmin Watch",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Watch Bands",
    "series": "Metal",
    "productCategory": "Metal Bands",
    "productType": "Stratos Band",
    "variant": "",
    "compatibleDevice": "Apple Watch",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Watch Bands",
    "series": "Metal",
    "productCategory": "Metal Bands",
    "productType": "Titanium Band",
    "variant": "",
    "compatibleDevice": "Apple Watch",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Watch Bands",
    "series": "Metal",
    "productCategory": "Metal Bands",
    "productType": "Steel Band",
    "variant": "",
    "compatibleDevice": "Apple Watch",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Watch Bands",
    "series": "Sport",
    "productCategory": "Sport Bands",
    "productType": "Sport Band",
    "variant": "",
    "compatibleDevice": "Apple Watch",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Watch Bands",
    "series": "Rugged",
    "productCategory": "Rugged Bands",
    "productType": "Rocky Point Band",
    "variant": "",
    "compatibleDevice": "Apple Watch",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Watch Bands",
    "series": "Rugged",
    "productCategory": "Rugged Bands",
    "productType": "Rugged Band",
    "variant": "",
    "compatibleDevice": "Apple Watch",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Watch Bands",
    "series": "Sport",
    "productCategory": "Sport Bands",
    "productType": "Active Band Pro",
    "variant": "",
    "compatibleDevice": "Apple Watch",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Watch Bands",
    "series": "Sport",
    "productCategory": "Sport Bands",
    "productType": "Tempo Band",
    "variant": "",
    "compatibleDevice": "Apple Watch",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Charging",
    "series": "Standard",
    "productCategory": "Watch Charging",
    "productType": "Apple Watch Charger",
    "variant": "",
    "compatibleDevice": "Apple Watch",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "Standard",
    "productCategory": "Charging Accessories",
    "productType": "Universal Cable",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Accessories",
    "series": "Standard",
    "productCategory": "Smartwatch Accessories",
    "productType": "Pixel Watch Accessories",
    "variant": "",
    "compatibleDevice": "Pixel Watch",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Accessories",
    "series": "Standard",
    "productCategory": "Smartwatch Accessories",
    "productType": "Garmin Watch Accessories",
    "variant": "",
    "compatibleDevice": "Garmin Watch",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Lifestyle",
    "subCategory": "Design Lab",
    "series": "Standard",
    "productCategory": "Customization",
    "productType": "Design Lab",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "Cables",
    "productCategory": "Data Cables",
    "productType": "USB Cable",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "Cables",
    "productCategory": "USB-C",
    "productType": "USB-C Cable",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "Cables",
    "productCategory": "ChargeKey",
    "productType": "ChargeKey Cable",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Charging",
    "series": "Cables",
    "productCategory": "Apple Watch Cable",
    "productType": "Charging Cable",
    "variant": "",
    "compatibleDevice": "Apple Watch",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "Cables",
    "productCategory": "Cable Adapters",
    "productType": "Adapter",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "AC Adapter",
    "productCategory": "USB-C Adapter",
    "productType": "Wall Charger",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "AC Adapter",
    "productCategory": "USB-C + Apple Watch",
    "productType": "Multi Charger",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Car",
    "subCategory": "Charging",
    "series": "Car Charging",
    "productCategory": "USB-C Car Adapter",
    "productType": "Car Charger",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "Stand One",
    "productCategory": "Wireless Chargers",
    "productType": "Charging Stand",
    "variant": "",
    "compatibleDevice": "MagSafe Devices",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "Base One Max",
    "productCategory": "Wireless Chargers",
    "productType": "Charging Base",
    "variant": "",
    "compatibleDevice": "MagSafe Devices",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "Stand One Max",
    "productCategory": "Wireless Chargers",
    "productType": "Charging Stand",
    "variant": "",
    "compatibleDevice": "MagSafe Devices",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Car",
    "subCategory": "Charging",
    "series": "Vehicle Charging",
    "productCategory": "Vehicle Accessories",
    "productType": "Starlink Cable",
    "variant": "",
    "compatibleDevice": "Starlink",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Car",
    "subCategory": "Charging",
    "series": "Vehicle Charging",
    "productCategory": "Vehicle Accessories",
    "productType": "12V Car Adapter",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Car",
    "subCategory": "Charging",
    "series": "Vehicle Charging",
    "productCategory": "Vehicle Accessories",
    "productType": "Charge Mount",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Smart Tracking",
    "subCategory": "Find My",
    "series": "Standard",
    "productCategory": "Tracking Devices",
    "productType": "Tracking Card",
    "variant": "",
    "compatibleDevice": "Apple Find My",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Smart Tracking",
    "subCategory": "Find My",
    "series": "Leather Mag",
    "productCategory": "Wallet Accessories",
    "productType": "Leather Mag Wallet",
    "variant": "",
    "compatibleDevice": "MagSafe Devices",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Smart Tracking",
    "subCategory": "Find My",
    "series": "AirTag",
    "productCategory": "AirTag Accessories",
    "productType": "AirTag Holder",
    "variant": "",
    "compatibleDevice": "Apple AirTag",
    "brand": "Nomad"
  },
  {
    "department": "Lifestyle",
    "taxonomyCategory": "Wallets",
    "subCategory": "Traditional",
    "series": "Standard",
    "productCategory": "Wallet",
    "productType": "Bifold Wallet",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Lifestyle",
    "taxonomyCategory": "Wallets",
    "subCategory": "Minimalist",
    "series": "Standard",
    "productCategory": "Wallet",
    "productType": "Card Wallet Plus",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Lifestyle",
    "taxonomyCategory": "Wallets",
    "subCategory": "Travel",
    "series": "Standard",
    "productCategory": "Wallet",
    "productType": "Passport Wallet",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Lifestyle",
    "taxonomyCategory": "Wallets",
    "subCategory": "Minimalist",
    "series": "Leather Mag",
    "productCategory": "Wallet",
    "productType": "Leather Mag Wallet",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Lifestyle",
    "taxonomyCategory": "Wallets",
    "subCategory": "Minimalist",
    "series": "Standard",
    "productCategory": "Wallet",
    "productType": "Card Wallet",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Lifestyle",
    "taxonomyCategory": "Wallets",
    "subCategory": "Traditional",
    "series": "Standard",
    "productCategory": "Wallet",
    "productType": "Traditional Wallet",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Lifestyle",
    "taxonomyCategory": "Wallets",
    "subCategory": "Premium",
    "series": "Shell Cordovan",
    "productCategory": "Wallet",
    "productType": "Shell Cordovan Wallet",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Lifestyle",
    "taxonomyCategory": "Accessories",
    "subCategory": "Lifestyle Gear",
    "series": "Standard",
    "productCategory": "Everyday Carry",
    "productType": "Rugged Chain",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Lifestyle",
    "taxonomyCategory": "Accessories",
    "subCategory": "Lifestyle Gear",
    "series": "Standard",
    "productCategory": "Stationery",
    "productType": "Pen",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Lifestyle",
    "taxonomyCategory": "Accessories",
    "subCategory": "Lifestyle Gear",
    "series": "Standard",
    "productCategory": "Stationery",
    "productType": "Pen Refill",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Lifestyle",
    "taxonomyCategory": "Accessories",
    "subCategory": "Lifestyle Gear",
    "series": "Standard",
    "productCategory": "Carry Accessories",
    "productType": "Wrist Strap",
    "variant": "",
    "compatibleDevice": "Universal",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Google Pixel",
    "series": "Standard",
    "productCategory": "Smartwatch Accessories",
    "productType": "Pixel Watch",
    "variant": "",
    "compatibleDevice": "Pixel Watch",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Audio",
    "subCategory": "Earbuds",
    "series": "Pixel",
    "productCategory": "Earbuds Accessories",
    "productType": "Pixel Buds Pro",
    "variant": "",
    "compatibleDevice": "Pixel Buds Pro",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Audio",
    "subCategory": "Earbuds",
    "series": "Pixel",
    "productCategory": "Earbuds Accessories",
    "productType": "Pixel Buds",
    "variant": "",
    "compatibleDevice": "Pixel Buds",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Audio",
    "subCategory": "Earbuds",
    "series": "Pixel",
    "productCategory": "Earbuds Accessories",
    "productType": "Pixel Buds A Series",
    "variant": "",
    "compatibleDevice": "Pixel Buds A Series",
    "brand": "Nomad"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "HaloLock",
    "productCategory": "Wireless Chargers",
    "productType": "Apple Watch Portable Charger",
    "variant": "Black",
    "compatibleDevice": "Apple Watch",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "HaloLock",
    "productCategory": "Charging Stations",
    "productType": "3-in-1 Wireless Charging Set",
    "variant": "Black",
    "compatibleDevice": "Apple Ecosystem",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Car",
    "subCategory": "Charging",
    "series": "HaloLock",
    "productCategory": "Car Chargers",
    "productType": "Magnetic Wireless Car Charger",
    "variant": "Black",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "HaloLock",
    "productCategory": "Magnetic Accessories",
    "productType": "Universal Ring 360",
    "variant": "Standard",
    "compatibleDevice": "Universal",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "HaloLock",
    "productCategory": "Wireless Chargers",
    "productType": "Kickstand MagSafe Charger",
    "variant": "Standard",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "HaloLock",
    "productCategory": "Travel Chargers",
    "productType": "3-in-1 Travel Charging Set",
    "variant": "Black",
    "compatibleDevice": "Apple Ecosystem",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "HaloLock",
    "productCategory": "Wireless Chargers",
    "productType": "Mini Wireless Charger",
    "variant": "Black",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "MagSlim",
    "productCategory": "Power Banks",
    "productType": "MagSlim Power Bank",
    "variant": "Black",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Car",
    "subCategory": "Charging",
    "series": "HaloLock",
    "productCategory": "Dashboard Chargers",
    "productType": "Dashboard Wireless Charger",
    "variant": "Black",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "HaloLock",
    "productCategory": "Charging Stations",
    "productType": "5-in-1 Charging Station",
    "variant": "Standard",
    "compatibleDevice": "Apple Ecosystem",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "HaloLock",
    "productCategory": "Charging Stations",
    "productType": "2-in-1 Watch Charging Set",
    "variant": "White",
    "compatibleDevice": "Apple Watch",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "MagSlim",
    "productCategory": "Power Banks",
    "productType": "5000mAh Kickstand Power Bank",
    "variant": "Black",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "CryoBoost",
    "productCategory": "Charging Stations",
    "productType": "3-in-1 Wireless Charging Station",
    "variant": "Black",
    "compatibleDevice": "Apple Ecosystem",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "MagSlim",
    "productCategory": "Power Banks",
    "productType": "10000mAh Power Bank",
    "variant": "Black",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Car",
    "subCategory": "Charging",
    "series": "CryoBoost",
    "productCategory": "Car Chargers",
    "productType": "Wireless Car Charger",
    "variant": "Standard",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Car",
    "subCategory": "Charging",
    "series": "HaloLock",
    "productCategory": "Car Chargers",
    "productType": "Touchscreen Wireless Car Charger",
    "variant": "Black",
    "compatibleDevice": "Universal",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "HaloLock",
    "productCategory": "Wireless Chargers",
    "productType": "Mini Kickstand Charger",
    "variant": "Black",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "HaloLock",
    "productCategory": "Charging Stations",
    "productType": "3-in-1 Charging Stand",
    "variant": "Black",
    "compatibleDevice": "Apple Ecosystem",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "CryoBoost",
    "productCategory": "Bundles",
    "productType": "CryoBoost Pro Bundle",
    "variant": "Standard",
    "compatibleDevice": "Apple Ecosystem",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "CryoBoost",
    "productCategory": "Bundles",
    "productType": "MagSafe Everyday Bundle",
    "variant": "Standard",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "HaloLock",
    "productCategory": "Bundles",
    "productType": "One-Stop Bundle",
    "variant": "Black/White",
    "compatibleDevice": "Apple Ecosystem",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "HaloLock",
    "productCategory": "Travel Chargers",
    "productType": "Travel Charging Set",
    "variant": "Black",
    "compatibleDevice": "Apple Ecosystem",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "HaloLock",
    "productCategory": "Charging Stations",
    "productType": "65W 5-in-1 Charging Station",
    "variant": "Standard",
    "compatibleDevice": "Universal",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "CryoBoost",
    "productCategory": "Charging Stations",
    "productType": "3-in-1 Wireless Charger",
    "variant": "Black",
    "compatibleDevice": "Apple Ecosystem",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "HaloLock",
    "productCategory": "Wireless Chargers",
    "productType": "Kickstand Wireless Charger",
    "variant": "Sierra Blue",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Charging",
    "series": "CryoBoost",
    "productCategory": "Charging Stations",
    "productType": "100W 6-in-1 Charging Station",
    "variant": "Standard",
    "compatibleDevice": "Apple Ecosystem",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "HaloLock",
    "productCategory": "Hybrid Cases",
    "productType": "Classic Hybrid Case",
    "variant": "Clear",
    "compatibleDevice": "iPhone 16 Pro Max",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "HaloLock",
    "productCategory": "Hybrid Cases",
    "productType": "Classic Hybrid Stash Stand Case",
    "variant": "Clear",
    "compatibleDevice": "iPhone 16 Pro Max",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "HaloLock",
    "productCategory": "Clear Cases",
    "productType": "Zero Clear Case",
    "variant": "Clear",
    "compatibleDevice": "iPhone 16 Pro Max",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "HaloLock",
    "productCategory": "Silicone Cases",
    "productType": "Cloud Soft Case",
    "variant": "Pink",
    "compatibleDevice": "iPhone 16 Pro Max",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "HaloLock",
    "productCategory": "Premium Cases",
    "productType": "Classic Pro Case",
    "variant": "Frosted Dark Green",
    "compatibleDevice": "iPhone 16 Pro Max",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "HaloLock",
    "productCategory": "Silicone Cases",
    "productType": "Cloud Soft Stash Stand",
    "variant": "Black",
    "compatibleDevice": "iPhone 16 Pro Max",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "HaloLock",
    "productCategory": "Rugged Cases",
    "productType": "Cyber Tough Case",
    "variant": "Black",
    "compatibleDevice": "iPhone 16 Pro Max",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "HaloLock",
    "productCategory": "Kickstand Cases",
    "productType": "Boost Flickstand Case",
    "variant": "Clear",
    "compatibleDevice": "iPhone 16 Pro Max",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "HaloLock",
    "productCategory": "Rugged Cases",
    "productType": "Armor Tough Case",
    "variant": "Clear Black",
    "compatibleDevice": "iPhone 16 Pro Max",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Wallets",
    "series": "HaloLock",
    "productCategory": "Smart Wallets",
    "productType": "Geo Wallet Stand",
    "variant": "Midnight Black",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Wallets",
    "series": "HaloLock",
    "productCategory": "Smart Wallets",
    "productType": "Geo Wallet Boost",
    "variant": "Grey",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Wallets",
    "series": "HaloLock",
    "productCategory": "Magnetic Wallets",
    "productType": "Magnetic Wallet Boost",
    "variant": "Black",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Wallets",
    "series": "HaloLock",
    "productCategory": "Wallet Stands",
    "productType": "Grip Wallet Stand",
    "variant": "Carbon Fiber",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Wallets",
    "series": "HaloLock",
    "productCategory": "Magnetic Wallets",
    "productType": "Magnetic Wallet",
    "variant": "Midnight Black",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Wallets",
    "series": "HaloLock",
    "productCategory": "Wallet Stands",
    "productType": "Aura Wallet Stand",
    "variant": "Pink",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Wallets",
    "series": "HaloLock",
    "productCategory": "Leather Wallets",
    "productType": "Vegan Leather Wallet Stand",
    "variant": "Black Sheepskin",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Power Banks",
    "series": "MagSlim",
    "productCategory": "Magnetic Power Banks",
    "productType": "Kickstand Power Bank",
    "variant": "10000mAh Black",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Power Banks",
    "series": "MagSlim",
    "productCategory": "Magnetic Power Banks",
    "productType": "Power Bank",
    "variant": "5000mAh Black",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Power Banks",
    "series": "MagSlim",
    "productCategory": "Magnetic Power Banks",
    "productType": "Power Bank",
    "variant": "10000mAh Blue",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Power Banks",
    "series": "MagSlim",
    "productCategory": "Magnetic Power Banks",
    "productType": "Kickstand Power Bank",
    "variant": "5000mAh White",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Power Banks",
    "series": "HaloLock",
    "productCategory": "Wallet Power Banks",
    "productType": "Power Bank Wallet",
    "variant": "5000mAh Midnight Black",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Power Banks",
    "series": "MagSlim",
    "productCategory": "Magnetic Power Banks",
    "productType": "Kickstand Power Bank",
    "variant": "10000mAh Titanium",
    "compatibleDevice": "MagSafe Devices",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "HaloLock",
    "productCategory": "Phone Mounts",
    "productType": "Airplane Phone Holder",
    "variant": "Black",
    "compatibleDevice": "Universal",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "HaloLock",
    "productCategory": "Ring Holders",
    "productType": "Ring Stand",
    "variant": "Sierra Blue",
    "compatibleDevice": "Universal",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "HaloLock",
    "productCategory": "Magnetic Rings",
    "productType": "Universal Ring",
    "variant": "Black/Silver",
    "compatibleDevice": "Universal",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "HaloLock",
    "productCategory": "Magnetic Rings",
    "productType": "Universal Ring 360",
    "variant": "White",
    "compatibleDevice": "Universal",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Smart Tracking",
    "subCategory": "Find My",
    "series": "HaloLock",
    "productCategory": "Smart Wallets",
    "productType": "Geo Wallet Stand",
    "variant": "Midnight Black",
    "compatibleDevice": "Apple Find My",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Smart Tracking",
    "subCategory": "Find My",
    "series": "HaloLock",
    "productCategory": "Smart Wallets",
    "productType": "Geo Wallet Boost",
    "variant": "Grey",
    "compatibleDevice": "Apple Find My",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Smart Tracking",
    "subCategory": "Find My",
    "series": "Geo",
    "productCategory": "Smart Stylus",
    "productType": "Geo Digital Pencil",
    "variant": "White",
    "compatibleDevice": "iPad",
    "brand": "ESR"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "Standard",
    "productCategory": "Phone Cases",
    "productType": "Phone Case",
    "variant": "Various Designs",
    "compatibleDevice": "All Supported Phone Devices",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Standard",
    "productCategory": "Phone Accessories",
    "productType": "Phone Strap",
    "variant": "Various Designs",
    "compatibleDevice": "All Supported Phones",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Accessories",
    "series": "Standard",
    "productCategory": "Watch Accessories",
    "productType": "Watch Strap Accessory",
    "variant": "Various Designs",
    "compatibleDevice": "All Watches",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Audio",
    "subCategory": "Accessories",
    "series": "Standard",
    "productCategory": "Earbud Accessories",
    "productType": "Earbud Strap",
    "variant": "Various Designs",
    "compatibleDevice": "All Earbuds",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Laptop",
    "subCategory": "Accessories",
    "series": "Standard",
    "productCategory": "Laptop Accessories",
    "productType": "Laptop Strap",
    "variant": "Various Designs",
    "compatibleDevice": "MacBook",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Tablet",
    "subCategory": "Accessories",
    "series": "Standard",
    "productCategory": "Tablet Accessories",
    "productType": "Tablet Strap",
    "variant": "Various Designs",
    "compatibleDevice": "iPad",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Smart Tracking",
    "subCategory": "Accessories",
    "series": "Standard",
    "productCategory": "AirTag Accessories",
    "productType": "AirTag Strap",
    "variant": "Various Designs",
    "compatibleDevice": "AirTag",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "MagSafe",
    "productCategory": "MagSafe Accessories",
    "productType": "Various MagSafe Products",
    "variant": "Various",
    "compatibleDevice": "MagSafe Compatible Devices",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Watch Bands",
    "series": "Standard",
    "productCategory": "Watch Bands",
    "productType": "Apple Watch Band",
    "variant": "Various Materials",
    "compatibleDevice": "Apple Watch",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Audio",
    "subCategory": "Cases & Covers",
    "series": "Standard",
    "productCategory": "Earbud Cases",
    "productType": "AirPods Case",
    "variant": "Various Designs",
    "compatibleDevice": "AirPods",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Audio",
    "subCategory": "Cases & Covers",
    "series": "Standard",
    "productCategory": "Earbud Cases",
    "productType": "Galaxy Buds Case",
    "variant": "Various Designs",
    "compatibleDevice": "Galaxy Buds",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Accessories",
    "series": "Standard",
    "productCategory": "Charms",
    "productType": "Phone Charm",
    "variant": "Various",
    "compatibleDevice": "Phones",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Accessories",
    "series": "Standard",
    "productCategory": "Charms",
    "productType": "Watch Charm",
    "variant": "Various",
    "compatibleDevice": "Watches",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Audio",
    "subCategory": "Accessories",
    "series": "Standard",
    "productCategory": "Charms",
    "productType": "Earbud Charm",
    "variant": "Various",
    "compatibleDevice": "Earbuds",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Laptop",
    "subCategory": "Accessories",
    "series": "Standard",
    "productCategory": "Charms",
    "productType": "Laptop Charm",
    "variant": "Various",
    "compatibleDevice": "MacBook",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Tablet",
    "subCategory": "Accessories",
    "series": "Standard",
    "productCategory": "Charms",
    "productType": "Tablet Charm",
    "variant": "Various",
    "compatibleDevice": "iPad",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Smart Tracking",
    "subCategory": "Accessories",
    "series": "Standard",
    "productCategory": "Charms",
    "productType": "AirTag Charm",
    "variant": "Various",
    "compatibleDevice": "AirTag",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Tablet",
    "subCategory": "Cases & Covers",
    "series": "Standard",
    "productCategory": "Tablet Cases",
    "productType": "iPad Case",
    "variant": "Various",
    "compatibleDevice": "iPad",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Laptop",
    "subCategory": "Cases & Covers",
    "series": "Standard",
    "productCategory": "Laptop Cases",
    "productType": "MacBook Case",
    "variant": "Various",
    "compatibleDevice": "MacBook",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Laptop",
    "subCategory": "Cases & Covers",
    "series": "Standard",
    "productCategory": "Laptop Cases",
    "productType": "Gaming Laptop Case",
    "variant": "Various",
    "compatibleDevice": "Gaming Laptops",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Screen Protection",
    "series": "Standard",
    "productCategory": "Screen Protectors",
    "productType": "Screen Protector",
    "variant": "Standard",
    "compatibleDevice": "Phones",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Screen Protection",
    "series": "Standard",
    "productCategory": "Screen Protectors",
    "productType": "Privacy Screen Protector",
    "variant": "Privacy",
    "compatibleDevice": "Phones",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Screen Protection",
    "series": "Standard",
    "productCategory": "Camera Protection",
    "productType": "Lens Protector",
    "variant": "Standard",
    "compatibleDevice": "Phones",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Laptop",
    "subCategory": "Screen Protection",
    "series": "Standard",
    "productCategory": "Screen Protectors",
    "productType": "MacBook Screen Protector",
    "variant": "Standard",
    "compatibleDevice": "MacBook",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Mobile",
    "subCategory": "Cases & Covers",
    "series": "Ripple",
    "productCategory": "Ripple Cases",
    "productType": "Phone Case",
    "variant": "Ripple Design",
    "compatibleDevice": "Phones",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Wearables",
    "subCategory": "Cases & Covers",
    "series": "Ripple",
    "productCategory": "Ripple Cases",
    "productType": "Watch Case",
    "variant": "Ripple Design",
    "compatibleDevice": "Watches",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Audio",
    "subCategory": "Cases & Covers",
    "series": "Ripple",
    "productCategory": "Ripple Cases",
    "productType": "Earbud Case",
    "variant": "Ripple Design",
    "compatibleDevice": "Earbuds",
    "brand": "CASETiFY"
  },
  {
    "department": "Electronics",
    "taxonomyCategory": "Audio",
    "subCategory": "Cases & Covers",
    "series": "Ripple",
    "productCategory": "Ripple Cases",
    "productType": "Headphone Case",
    "variant": "Ripple Design",
    "compatibleDevice": "Headphones",
    "brand": "CASETiFY"
  }
];

function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out_of_stock";
  if (stock < 10) return "low_stock";
  return "in_stock";
}

function brandId(name: string): string {
  return `brand-${name.toLowerCase().replace(/\s+/g, "-")}`;
}

/** Map taxonomy into the shop category rail. */
function mapCategoryId(seed: Seed): string {
  const s = `${seed.subCategory} ${seed.productCategory} ${seed.productType}`.toLowerCase();
  if (s.includes("screen protector") || s.includes("lens protector") || s.includes("camera protection") || s.includes("tempered glass") || seed.subCategory === "Screen Protection")
    return "cat-screen";
  if (s.includes("power bank") || seed.subCategory === "Power Banks" || seed.productCategory.includes("Power Bank"))
    return "cat-powerbanks";
  if (s.includes("cable") || s.includes("adapter") && !s.includes("car"))
    return "cat-cables";
  if (
    s.includes("charg") ||
    s.includes("wireless") ||
    seed.subCategory === "Charging" ||
    seed.productCategory.includes("Charging")
  )
    return "cat-chargers";
  if (s.includes("watch band") || s.includes("leather band") || s.includes("metal band") || s.includes("sport band") || s.includes("rugged band") || seed.subCategory === "Watch Bands")
    return "cat-watch";
  if (s.includes("airpods case") || s.includes("earbud case") || s.includes("galaxy buds") || s.includes("headphone case") || seed.productCategory.includes("Earbud"))
    return "cat-earbuds-cases";
  if (s.includes("ipad") || s.includes("tablet") || seed.taxonomyCategory === "Tablet")
    return "cat-tablet";
  if (s.includes("wallet") || s.includes("magsafe") || s.includes("airtag") || s.includes("tracking") || s.includes("find my") || seed.subCategory === "Wallets" || seed.subCategory === "Find My")
    return "cat-magsafe";
  if (s.includes("strap") || s.includes("charm") || s.includes("skin") || s.includes("sticker") || s.includes("ring") || seed.subCategory === "Skins" || seed.subCategory === "Stickers")
    return "cat-straps";
  if (s.includes("mount") || s.includes("holder") || s.includes("stand") && !s.includes("case") || s.includes("pouch") || s.includes("sleeve") || s.includes("travel") || seed.subCategory === "Travel Accessories")
    return "cat-holders";
  if (s.includes("earbud") || s.includes("audio") || seed.taxonomyCategory === "Audio")
    return "cat-audio";
  if (s.includes("case") || seed.subCategory === "Cases & Covers")
    return "cat-cases";
  return "cat-cases";
}

function isUniversal(compatibleDevice: string): boolean {
  const d = compatibleDevice.toLowerCase();
  return (
    d.includes("universal") ||
    d.includes("all supported") ||
    d.includes("all phone") ||
    d.includes("all iphone") ||
    d.includes("all samsung") ||
    d.includes("all google") ||
    d.includes("all watch") ||
    d.includes("phones") ||
    d.includes("watches") ||
    d.includes("earbuds")
  );
}

function basePrice(seed: Seed): { price: number; mrp: number } {
  const brandPremium: Record<string, number> = {
    Mous: 1.15,
    dbrand: 1.1,
    Nomad: 1.25,
    ESR: 0.95,
    CASETiFY: 1.2,
  };
  const type = seed.productType.toLowerCase();
  let base = 999;
  if (type.includes("power bank")) base = 2499;
  else if (type.includes("charging station") || type.includes("5-in-1") || type.includes("6-in-1") || type.includes("3-in-1") || type.includes("bundle")) base = 4999;
  else if (type.includes("keyboard")) base = 6999;
  else if (type.includes("charger") || type.includes("wireless") || type.includes("charging stand") || type.includes("charging base")) base = 1999;
  else if (type.includes("car charger") || type.includes("dashboard")) base = 1799;
  else if (type.includes("cable") || type.includes("adapter") || type.includes("chargekey")) base = 799;
  else if (type.includes("wallet")) base = 2499;
  else if (type.includes("band") || type.includes("watch")) base = 1899;
  else if (type.includes("screen") || type.includes("tempered") || type.includes("lens")) base = 699;
  else if (type.includes("skin") || type.includes("sticker") || type.includes("charm") || type.includes("strap") || type.includes("ring")) base = 599;
  else if (type.includes("case") || type.includes("cover")) base = 1499;
  else if (type.includes("sleeve") || type.includes("pouch") || type.includes("wardrobe")) base = 1299;
  else if (type.includes("pen") || type.includes("pencil")) base = 2199;
  else if (type.includes("tracking")) base = 3499;
  else if (type.includes("mount") || type.includes("holder")) base = 999;

  const mult = brandPremium[seed.brand] ?? 1;
  const price = Math.round((base * mult) / 10) * 10;
  const mrp = Math.round((price * 1.85) / 10) * 10;
  return { price, mrp };
}

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function buildTitle(seed: Seed): string {
  const parts = [seed.brand];
  if (seed.series && seed.series !== "Standard") parts.push(seed.series);
  parts.push(seed.productType);
  if (seed.variant) parts.push(`– ${seed.variant}`);
  return parts.join(" ");
}

function build(seed: Seed, index: number): Product {
  const title = buildTitle(seed);
  const baseSlug = slugify(
    `${seed.brand}-${seed.series}-${seed.productType}-${seed.variant || "default"}-${seed.compatibleDevice}`
  );
  const slug = `${baseSlug}-${index + 1}`;
  const { price, mrp } = basePrice(seed);
  const h = hash(slug);
  const stock = 20 + (h % 180);
  const rating = 3.8 + ((h % 12) / 10);
  const reviewCount = 40 + (h % 2400);
  const colors = seed.variant
    ? seed.variant.split("/").map((c) => c.trim()).filter(Boolean)
    : ["Default"];
  const images = colors.slice(0, 3).map((c, i) => ({
    id: `${slug}-img-${i}`,
    productId: slug,
    url: productPlaceholder(`${title} ${c}`, `${slug}-${i}`),
    alt: `${title} in ${c}`,
    sortOrder: i,
  }));
  const variants = colors.map((color, i) => ({
    id: `${slug}-var-${i}`,
    productId: slug,
    sku: `${slug.toUpperCase().replace(/-/g, "").slice(0, 24)}-${i}`,
    name: color,
    color,
    price,
    mrp,
    stock: Math.max(1, Math.floor(stock / colors.length)),
    isDefault: i === 0,
  }));

  const specs: ProductSpec[] = [
    { label: "Department", value: seed.department },
    { label: "Category", value: seed.taxonomyCategory },
    { label: "Sub Category", value: seed.subCategory },
    { label: "Series", value: seed.series },
    { label: "Product Category", value: seed.productCategory },
    { label: "Product Type", value: seed.productType },
    { label: "Compatible Device", value: seed.compatibleDevice },
    { label: "Brand", value: seed.brand },
  ];
  if (seed.variant) specs.push({ label: "Variant", value: seed.variant });

  const short = `${seed.brand} ${seed.productType} from the ${seed.series} series — for ${seed.compatibleDevice}.`;
  const flags = {
    trending: h % 5 === 0,
    bestseller: h % 4 === 0,
    new: h % 6 === 0,
  };

  return {
    id: slug,
    slug,
    title,
    brandId: brandId(seed.brand),
    categoryId: mapCategoryId(seed),
    department: seed.department,
    taxonomyCategory: seed.taxonomyCategory,
    subCategory: seed.subCategory,
    series: seed.series,
    productCategory: seed.productCategory,
    productType: seed.productType,
    variantLabel: seed.variant,
    compatibleDevice: seed.compatibleDevice,
    shortDescription: short,
    description: `${short} Part of ${seed.productCategory} under ${seed.subCategory}.`,
    price,
    mrp,
    rating: Math.round(rating * 10) / 10,
    reviewCount,
    stockStatus: stockStatus(stock),
    stock,
    images,
    variants,
    features: [
      `Series: ${seed.series}`,
      `Compatible with ${seed.compatibleDevice}`,
      `${seed.productCategory}`,
      `Genuine ${seed.brand} product`,
    ],
    specs,
    compatibleModelIds: [],
    universal: isUniversal(seed.compatibleDevice),
    colors,
    warrantyMonths: seed.brand === "Nomad" || seed.brand === "Mous" ? 24 : 12,
    isTrending: flags.trending,
    isBestSeller: flags.bestseller,
    isNewArrival: flags.new,
    tags: [
      seed.brand.toLowerCase(),
      seed.series.toLowerCase().replace(/\s+/g, "-"),
      seed.productType.toLowerCase().replace(/\s+/g, "-"),
    ],
    createdAt: "2026-07-01T00:00:00.000Z",
  };
}

export const products: Product[] = [
  ...seeds.map(build),
  {
    id: "credobuy-payment-test-49",
    slug: "credobuy-payment-test-49",
    title: "CredoBuy Payment Test Item (₹49)",
    brandId: "brand-credobuy",
    brandName: "CredoBuy",
    categoryId: "cat-cables",
    department: "Accessories",
    taxonomyCategory: "Cables",
    subCategory: "Test",
    series: "QA",
    productCategory: "Test SKU",
    productType: "Payment test",
    variantLabel: "Default",
    compatibleDevice: "Universal",
    shortDescription: "Low-value SKU for Razorpay test payments under ₹100.",
    description:
      "Use this product to verify Razorpay checkout end-to-end. Not for retail sale.",
    price: 49,
    mrp: 49,
    rating: 5,
    reviewCount: 1,
    stockStatus: "in_stock",
    stock: 100,
    images: [
      {
        id: "credobuy-payment-test-49-img",
        productId: "credobuy-payment-test-49",
        url: productPlaceholder("Payment Test", "credobuy-payment-test-49"),
        alt: "Payment test item",
        sortOrder: 0,
      },
    ],
    variants: [
      {
        id: "credobuy-payment-test-49-default",
        productId: "credobuy-payment-test-49",
        sku: "CB-PAY-TEST-49",
        name: "Default",
        price: 49,
        mrp: 49,
        stock: 100,
        isDefault: true,
      },
    ],
    features: ["Razorpay test SKU", "Under ₹100"],
    specs: [{ label: "Purpose", value: "Payment QA" }],
    compatibleModelIds: [],
    universal: true,
    colors: ["Black"],
    warrantyMonths: 0,
    isTrending: false,
    isBestSeller: false,
    isNewArrival: true,
    tags: ["payment-test", "razorpay"],
    createdAt: "2026-08-14T00:00:00.000Z",
  },
];
