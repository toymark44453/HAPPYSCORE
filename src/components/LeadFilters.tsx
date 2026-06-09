"use client";

import type { LeadGrade, LeadTemperature, LeadSegment, PipelineStage } from "@/types/lead";

export interface FilterState {
  search: string;
  grade: LeadGrade | "all";
  temperature: LeadTemperature | "all";
  segment: LeadSegment | "all";
  pipeline: PipelineStage | "all";
}

export const defaultFilter: FilterState = {
  search: "",
  grade: "all",
  temperature: "all",
  segment: "all",
  pipeline: "all",
};

export function LeadFilters({
  value,
  onChange,
  total,
  filtered,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  total: number;
  filtered: number;
}) {
  function update<K extends keyof FilterState>(key: K, val: FilterState[K]) {
    onChange({ ...value, [key]: val });
  }

  const hasFilter =
    value.search !== "" ||
    value.grade !== "all" ||
    value.temperature !== "all" ||
    value.segment !== "all" ||
    value.pipeline !== "all";

  return (
    <div className="filter-bar">
      <div className="filter-row">
        <input
          className="filter-search"
          placeholder="ค้นหาชื่อ, เบอร์, จังหวัด, โครงการ..."
          value={value.search}
          onChange={(e) => update("search", e.target.value)}
        />

        <select
          value={value.grade}
          onChange={(e) => update("grade", e.target.value as FilterState["grade"])}
        >
          <option value="all">ทุก Grade</option>
          <option value="A">Grade A</option>
          <option value="B">Grade B</option>
          <option value="C">Grade C</option>
          <option value="D">Grade D</option>
        </select>

        <select
          value={value.temperature}
          onChange={(e) => update("temperature", e.target.value as FilterState["temperature"])}
        >
          <option value="all">ทุก Temperature</option>
          <option value="HOT">HOT 🔥</option>
          <option value="WARM">WARM</option>
          <option value="COOL">COOL</option>
          <option value="COLD">COLD</option>
        </select>

        <select
          value={value.segment}
          onChange={(e) => update("segment", e.target.value as FilterState["segment"])}
        >
          <option value="all">ทุก Segment</option>
          <option value="Ideal Customer">Ideal Customer</option>
          <option value="Nurture Target">Nurture Target</option>
          <option value="Quick Win">Quick Win</option>
          <option value="Low Priority">Low Priority</option>
        </select>

        <select
          value={value.pipeline}
          onChange={(e) => update("pipeline", e.target.value as FilterState["pipeline"])}
        >
          <option value="all">ทุก Pipeline Stage</option>
          <option value="new">🆕 New</option>
          <option value="contacted">📞 Contacted</option>
          <option value="quoted">📋 Quoted</option>
          <option value="won">🏆 Won</option>
          <option value="lost">❌ Lost</option>
        </select>

        {hasFilter && (
          <button
            className="button secondary"
            type="button"
            onClick={() => onChange(defaultFilter)}
          >
            ล้าง Filter
          </button>
        )}
      </div>

      {hasFilter && (
        <p className="filter-count muted">
          แสดง <strong>{filtered}</strong> จาก {total} Lead
        </p>
      )}
    </div>
  );
}
