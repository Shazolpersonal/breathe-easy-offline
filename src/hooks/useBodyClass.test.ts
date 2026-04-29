import { renderHook } from "@testing-library/react";
import { useBodyClass } from "./useBodyClass";
import { describe, it, expect, beforeEach } from "vitest";

describe("useBodyClass", () => {
  beforeEach(() => {
    document.body.className = "";
  });

  it("adds class to body when condition is true", () => {
    renderHook(() => useBodyClass("test-class", true));
    expect(document.body.classList.contains("test-class")).toBe(true);
  });

  it("removes class from body when condition is false", () => {
    const { rerender } = renderHook(({ condition }) => useBodyClass("test-class", condition), {
      initialProps: { condition: true }
    });
    expect(document.body.classList.contains("test-class")).toBe(true);

    rerender({ condition: false });
    expect(document.body.classList.contains("test-class")).toBe(false);
  });

  it("removes class from body on unmount", () => {
    const { unmount } = renderHook(() => useBodyClass("test-class", true));
    expect(document.body.classList.contains("test-class")).toBe(true);

    unmount();
    expect(document.body.classList.contains("test-class")).toBe(false);
  });

  it("defaults to condition true", () => {
    renderHook(() => useBodyClass("test-class"));
    expect(document.body.classList.contains("test-class")).toBe(true);
  });
});
