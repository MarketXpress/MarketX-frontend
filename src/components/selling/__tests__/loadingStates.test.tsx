import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SellerListings from "../SellerListings";
import SellerStorefrontLoading from "@/app/seller/[id]/loading";
import ProductDetailLoading from "@/app/product/[id]/loading";

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "seller-123" },
    isLoading: true, // Simulate loading state
  }),
}));

vi.mock("@/context/ToastContext", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn(),
  }),
}));

describe("Loading states and skeletons", () => {
  it("SellerListings renders row-shaped skeletons instead of spinner while loading", () => {
    render(<SellerListings />);
    const loadingContainer = screen.getByLabelText("Loading your listings");
    expect(loadingContainer).toBeInTheDocument();
    expect(loadingContainer.getAttribute("aria-busy")).toBe("true");

    // Must not show spinner text
    expect(screen.queryByText("Loading your listings…")).not.toBeInTheDocument();
  });

  it("SellerStorefrontLoading renders skeleton layout matching seller profile and listings grid", () => {
    render(<SellerStorefrontLoading />);
    const loadingView = screen.getByLabelText("Loading seller storefront");
    expect(loadingView).toBeInTheDocument();
    expect(loadingView.getAttribute("aria-busy")).toBe("true");
  });

  it("ProductDetailLoading renders skeleton layout matching product detail page", () => {
    render(<ProductDetailLoading />);
    const loadingView = screen.getByLabelText("Loading product details");
    expect(loadingView).toBeInTheDocument();
    expect(loadingView.getAttribute("aria-busy")).toBe("true");
  });
});
