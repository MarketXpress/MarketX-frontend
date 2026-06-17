export type AssetType = "Digital" | "Physical" | "Service";
export type EscrowStatus = "Active" | "Completed";

export interface MockAsset {
  id: string;
  name: string;
  priceAmount: number;
  priceCurrency: "XLM" | "USDC";
  assetType: AssetType;
  escrowStatus: EscrowStatus;
  sellerName: string;
  sellerRating: number;
  timeStr: string;
  imageFallbackIcon: "Package" | "Image" | "Code" | "Briefcase" | "Camera";
}

export const mockAssets: MockAsset[] = [
  {
    id: "1",
    name: "Digital Artwork #042",
    priceAmount: 240,
    priceCurrency: "XLM",
    assetType: "Digital",
    escrowStatus: "Active",
    sellerName: "art_node",
    sellerRating: 4.8,
    timeStr: "2h ago",
    imageFallbackIcon: "Image"
  },
  {
    id: "2",
    name: "SaaS Enterprise License",
    priceAmount: 1200,
    priceCurrency: "USDC",
    assetType: "Digital",
    escrowStatus: "Completed",
    sellerName: "cloud_soft",
    sellerRating: 4.9,
    timeStr: "5h ago",
    imageFallbackIcon: "Code"
  },
  {
    id: "3",
    name: "Vintage Camera Collection",
    priceAmount: 850,
    priceCurrency: "XLM",
    assetType: "Physical",
    escrowStatus: "Active",
    sellerName: "retro_shop",
    sellerRating: 4.5,
    timeStr: "1d ago",
    imageFallbackIcon: "Camera"
  },
  {
    id: "4",
    name: "Smart Contract Audit",
    priceAmount: 5000,
    priceCurrency: "USDC",
    assetType: "Service",
    escrowStatus: "Active",
    sellerName: "rust_sec",
    sellerRating: 5.0,
    timeStr: "2d ago",
    imageFallbackIcon: "Briefcase"
  },
  {
    id: "5",
    name: "Limited Edition Sneakers",
    priceAmount: 300,
    priceCurrency: "USDC",
    assetType: "Physical",
    escrowStatus: "Completed",
    sellerName: "hype_kicks",
    sellerRating: 4.2,
    timeStr: "3d ago",
    imageFallbackIcon: "Package"
  },
  {
    id: "6",
    name: "3D Character Models",
    priceAmount: 150,
    priceCurrency: "XLM",
    assetType: "Digital",
    escrowStatus: "Active",
    sellerName: "poly_crafter",
    sellerRating: 4.7,
    timeStr: "4h ago",
    imageFallbackIcon: "Image"
  },
  {
    id: "7",
    name: "Marketing Strategy Consultation",
    priceAmount: 400,
    priceCurrency: "USDC",
    assetType: "Service",
    escrowStatus: "Completed",
    sellerName: "growth_guru",
    sellerRating: 4.9,
    timeStr: "5d ago",
    imageFallbackIcon: "Briefcase"
  },
  {
    id: "8",
    name: "Custom Mechanical Keyboard",
    priceAmount: 250,
    priceCurrency: "USDC",
    assetType: "Physical",
    escrowStatus: "Active",
    sellerName: "keeb_maker",
    sellerRating: 4.6,
    timeStr: "1w ago",
    imageFallbackIcon: "Package"
  },
  {
    id: "9",
    name: "Stellar Network Workshop",
    priceAmount: 100,
    priceCurrency: "XLM",
    assetType: "Service",
    escrowStatus: "Active",
    sellerName: "stellar_edu",
    sellerRating: 4.8,
    timeStr: "1h ago",
    imageFallbackIcon: "Code"
  },
  {
    id: "10",
    name: "Exclusive Music Track (Stem Files)",
    priceAmount: 50,
    priceCurrency: "XLM",
    assetType: "Digital",
    escrowStatus: "Completed",
    sellerName: "beats_by_dre",
    sellerRating: 3.9,
    timeStr: "3w ago",
    imageFallbackIcon: "Image"
  }
];

export interface ProductMock {
  id: string;
  name: string;
  usdPrice: number;
  originalUsdPrice: number;
  xlmPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  category: string;
  seller: string;
  badge?: "flash" | "new" | "hot";
  description?: string;
  images?: string[];
  sellerRating?: number;
  sellerSales?: number;
}

export const mockProducts: ProductMock[] = [
  {
    id: "p1", name: "Samsung Galaxy A55 5G", usdPrice: 299, originalUsdPrice: 459, xlmPrice: 1450, discountPercent: 35, rating: 4.5, reviewCount: 312, category: "Electronics", seller: "TechHub NG", badge: "flash",
    sellerRating: 4.8, sellerSales: 1240,
    description: "The Samsung Galaxy A55 5G delivers flagship-level performance at a mid-range price. Featuring a 6.6\" Super AMOLED display, 50MP OIS camera, 5000mAh battery, and 5G connectivity. Comes with 8GB RAM and 256GB internal storage.",
    images: ["/products/p1-1.jpg", "/products/p1-2.jpg", "/products/p1-3.jpg"],
  },
  {
    id: "p2", name: "Nike Air Max 270", usdPrice: 88, originalUsdPrice: 110, xlmPrice: 427, discountPercent: 20, rating: 4.7, reviewCount: 198, category: "Fashion", seller: "SoleKing", badge: "hot",
    sellerRating: 4.9, sellerSales: 3200,
    description: "The Nike Air Max 270 features Nike's biggest heel Air unit yet for an incredibly plush feel with every step. The mesh upper provides lightweight breathability, while the updated rubber outsole gives you durable traction on any surface.",
    images: ["/products/p2-1.jpg", "/products/p2-2.jpg", "/products/p2-3.jpg"],
  },
  {
    id: "p3", name: "Sony WH-1000XM5", usdPrice: 193, originalUsdPrice: 350, xlmPrice: 936, discountPercent: 45, rating: 4.8, reviewCount: 540, category: "Electronics", seller: "AudioWorld", badge: "flash",
    sellerRating: 4.7, sellerSales: 890,
    description: "Industry-leading noise cancellation with eight microphones and two processors. 30-hour battery life, multipoint connection for two devices simultaneously. Ultra-comfortable over-ear design with soft fit leather earpads.",
    images: ["/products/p3-1.jpg", "/products/p3-2.jpg", "/products/p3-3.jpg"],
  },
  {
    id: "p4", name: "Levi's 501 Original Jeans", usdPrice: 45, originalUsdPrice: 60, xlmPrice: 218, discountPercent: 25, rating: 4.3, reviewCount: 87, category: "Fashion", seller: "DenimCo",
    sellerRating: 4.5, sellerSales: 620,
    description: "The original jean since 1873. Levi's 501 is a straight fit with a button fly, sits at the waist, and is made from 100% cotton denim. A timeless piece that gets better with every wear.",
    images: ["/products/p4-1.jpg", "/products/p4-2.jpg"],
  },
  {
    id: "p5", name: "Anker 65W GaN Charger", usdPrice: 28, originalUsdPrice: 40, xlmPrice: 136, discountPercent: 30, rating: 4.6, reviewCount: 231, category: "Electronics", seller: "PowerDeals",
    sellerRating: 4.6, sellerSales: 4100,
    description: "Charge your laptop, phone, and tablet simultaneously with Anker's compact 65W GaN charger. 3 ports (2× USB-C + 1× USB-A), foldable prongs, and ActiveShield 2.0 technology that monitors temperature 3 million times per day.",
    images: ["/products/p5-1.jpg", "/products/p5-2.jpg"],
  },
  {
    id: "p6", name: "JBL Flip 6 Speaker", usdPrice: 99, originalUsdPrice: 130, xlmPrice: 480, discountPercent: 24, rating: 4.4, reviewCount: 175, category: "Electronics", seller: "SoundZone", badge: "new",
    sellerRating: 4.4, sellerSales: 730,
    description: "Bold sound wherever you go. JBL Flip 6 delivers powerful JBL Original Pro Sound with a racetrack-shaped driver and separate tweeter. IP67 waterproof and dustproof, with 12 hours of playtime and JBL PartyBoost.",
    images: ["/products/p6-1.jpg", "/products/p6-2.jpg", "/products/p6-3.jpg"],
  },
  {
    id: "p7", name: "Adidas Ultraboost 22", usdPrice: 120, originalUsdPrice: 180, xlmPrice: 582, discountPercent: 33, rating: 4.6, reviewCount: 94, category: "Fashion", seller: "SoleKing",
    sellerRating: 4.9, sellerSales: 3200,
    description: "Engineered for long-distance running. The Adidas Ultraboost 22 features a responsive Boost midsole with a Linear Energy Push system for forward propulsion. Primeknit upper wraps your foot for a sock-like fit.",
    images: ["/products/p7-1.jpg", "/products/p7-2.jpg"],
  },
  {
    id: "p8", name: "Xiaomi Smart Band 9", usdPrice: 35, originalUsdPrice: 50, xlmPrice: 170, discountPercent: 30, rating: 4.2, reviewCount: 412, category: "Electronics", seller: "TechHub NG",
    sellerRating: 4.8, sellerSales: 1240,
    description: "Track your health around the clock with the Xiaomi Smart Band 9. 1.62\" AMOLED display, 14-day battery life, 150+ workout modes, blood oxygen monitoring, sleep tracking, and 5ATM water resistance.",
    images: ["/products/p8-1.jpg", "/products/p8-2.jpg"],
  },
  {
    id: "p9", name: "Legendary NFT #0042", usdPrice: 450, originalUsdPrice: 450, xlmPrice: 2183, discountPercent: 0, rating: 5.0, reviewCount: 12, category: "NFTs", seller: "art_node", badge: "hot",
    sellerRating: 4.9, sellerSales: 58,
    description: "A one-of-a-kind generative art piece from the Legendary collection. This NFT grants exclusive membership to the Legendary DAO, access to future drops, and commercial usage rights. Minted on Stellar and secured by smart contract escrow.",
    images: ["/products/p9-1.jpg", "/products/p9-2.jpg", "/products/p9-3.jpg"],
  },
  {
    id: "p10", name: "iPhone 15 Case (MagSafe)", usdPrice: 19, originalUsdPrice: 25, xlmPrice: 92, discountPercent: 24, rating: 4.1, reviewCount: 63, category: "Electronics", seller: "CaseWorld",
    sellerRating: 4.3, sellerSales: 980,
    description: "Premium MagSafe-compatible case for iPhone 15. Military-grade drop protection with a slim profile, precise cutouts, and built-in magnets that snap perfectly to all MagSafe accessories. Available in multiple colors.",
    images: ["/products/p10-1.jpg", "/products/p10-2.jpg"],
  },
];
