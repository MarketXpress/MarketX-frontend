export type EscrowState = "funded" | "in_escrow" | "in_transit" | "released" | "disputed";

export interface EscrowTransaction {
  id: string;
  assetName: string;
  assetCategory: "Digital" | "Physical" | "Service";
  priceXLM: number;
  seller: {
    name: string;
    address: string;
  };
  buyer: {
    name: string;
    address: string;
  };
  currentState: EscrowState;
  createdAt: string;
  deliveryDeadline: string;
  disputeDeadline: string;
  autoReleaseAt: string;
  events: EscrowEvent[];
}

export interface EscrowEvent {
  id: string;
  state: EscrowState;
  label: string;
  timestamp: string;
  actor: "buyer" | "seller" | "system";
  description: string;
}

export const ESCROW_STATES: { state: EscrowState; label: string; icon: string }[] = [
  { state: "funded", label: "Funded", icon: "💰" },
  { state: "in_escrow", label: "In Escrow", icon: "🔒" },
  { state: "in_transit", label: "In Transit", icon: "📦" },
  { state: "released", label: "Released", icon: "✅" },
];

export const mockTransaction: EscrowTransaction = {
  id: "escrow-0x7f3a…d91e",
  assetName: "Exclusive SaaS License — MarketBot Pro",
  assetCategory: "Digital",
  priceXLM: 2500,
  seller: {
    name: "Alice Stellaris",
    address: "GBXY…SELLER",
  },
  buyer: {
    name: "Bob Lumens",
    address: "GCDA…BUYER",
  },
  currentState: "in_transit",
  createdAt: "2026-03-20T09:00:00Z",
  deliveryDeadline: "2026-03-27T09:00:00Z",
  disputeDeadline: "2026-03-30T09:00:00Z",
  autoReleaseAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  events: [
    {
      id: "ev-1",
      state: "funded",
      label: "Escrow Funded",
      timestamp: "2026-03-20T09:00:00Z",
      actor: "buyer",
      description: "Buyer deposited 2,500 XLM into the Soroban escrow contract.",
    },
    {
      id: "ev-2",
      state: "in_escrow",
      label: "Funds Locked",
      timestamp: "2026-03-20T09:01:12Z",
      actor: "system",
      description: "Smart contract confirmed receipt. Funds are now locked.",
    },
    {
      id: "ev-3",
      state: "in_transit",
      label: "Delivery Proof Submitted",
      timestamp: "2026-03-22T14:30:00Z",
      actor: "seller",
      description: "Seller submitted delivery proof: License key sent via encrypted channel.",
    },
  ],
};
