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
