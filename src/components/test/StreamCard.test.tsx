// components/StreamCard/StreamCard.test.tsx

import { render, screen } from "@testing-library/react";
import StreamCard from "./StreamCard";

describe("StreamCard", () => {
  it("renders title and sender correctly", () => {
    render(<StreamCard title="Test Stream" sender="Alice" />);

    expect(screen.getByText("Test Stream")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders container element", () => {
    render(<StreamCard title="Test" sender="Bob" />);
    expect(screen.getByTestId("stream-card")).toBeInTheDocument();
  });

  it("handles empty values gracefully", () => {
    render(<StreamCard title="" sender="" />);
    expect(screen.getByTestId("stream-card")).toBeInTheDocument();
  });
});