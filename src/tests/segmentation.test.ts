import { describe, expect, it } from "vitest";
import { calculateSegment } from "@/lib/segmentation";

describe("segmentation", () => {
  it("segments leads by fit and interest", () => {
    expect(calculateSegment(30, 45)).toBe("Ideal Customer");
    expect(calculateSegment(30, 44)).toBe("Nurture Target");
    expect(calculateSegment(29, 45)).toBe("Quick Win");
    expect(calculateSegment(29, 44)).toBe("Low Priority");
  });
});
