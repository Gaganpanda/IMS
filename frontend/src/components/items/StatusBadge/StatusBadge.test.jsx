import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders the status text and maps a known status to its variant class", () => {
    render(<StatusBadge status="Developed" />);
    const el = screen.getByText("Developed");
    expect(el.closest(".status-badge")).toHaveClass("status-badge--success");
  });

  it("maps 'To Be Filed' to the danger variant", () => {
    render(<StatusBadge status="To Be Filed" />);
    expect(screen.getByText("To Be Filed").closest(".status-badge")).toHaveClass(
      "status-badge--danger"
    );
  });

  it("falls back to the neutral variant for an unrecognized status", () => {
    render(<StatusBadge status="Some Unmapped Status" />);
    expect(
      screen.getByText("Some Unmapped Status").closest(".status-badge")
    ).toHaveClass("status-badge--neutral");
  });

  it("prefers an explicit label over the raw status for display, but keys the variant off status", () => {
    render(<StatusBadge status="Developed" label="✓ Done" />);
    expect(screen.getByText("✓ Done").closest(".status-badge")).toHaveClass(
      "status-badge--success"
    );
    expect(screen.queryByText("Developed")).not.toBeInTheDocument();
  });

  it("applies the size modifier class, defaulting to md", () => {
    const { rerender } = render(<StatusBadge status="Developed" />);
    expect(screen.getByText("Developed").closest(".status-badge")).toHaveClass(
      "status-badge--md"
    );
    rerender(<StatusBadge status="Developed" size="sm" />);
    expect(screen.getByText("Developed").closest(".status-badge")).toHaveClass(
      "status-badge--sm"
    );
  });

  it("renders nothing when status is falsy", () => {
    const { container } = render(<StatusBadge status={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
