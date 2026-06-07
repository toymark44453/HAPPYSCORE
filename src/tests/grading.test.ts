import { describe, expect, it } from "vitest";
import { calculateGrade, calculateTemperature } from "@/lib/grading";

describe("grading", () => {
  it("assigns Grade A/B/C/D correctly", () => {
    expect(calculateGrade(100)).toBe("A");
    expect(calculateGrade(80)).toBe("A");
    expect(calculateGrade(79)).toBe("B");
    expect(calculateGrade(59)).toBe("B");
    expect(calculateGrade(58)).toBe("C");
    expect(calculateGrade(30)).toBe("C");
    expect(calculateGrade(29)).toBe("D");
  });

  it("assigns HOT/WARM/COOL/COLD correctly", () => {
    expect(calculateTemperature(80)).toBe("HOT");
    expect(calculateTemperature(79)).toBe("WARM");
    expect(calculateTemperature(60)).toBe("WARM");
    expect(calculateTemperature(59)).toBe("COOL");
    expect(calculateTemperature(40)).toBe("COOL");
    expect(calculateTemperature(39)).toBe("COLD");
  });
});
