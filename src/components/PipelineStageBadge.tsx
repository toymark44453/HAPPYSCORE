import type { PipelineStage } from "@/types/lead";

const STAGE_CONFIG: Record<PipelineStage, { label: string; emoji: string; className: string }> = {
  new:       { label: "New",       emoji: "🆕", className: "stage-new" },
  contacted: { label: "Contacted", emoji: "📞", className: "stage-contacted" },
  quoted:    { label: "Quoted",    emoji: "📋", className: "stage-quoted" },
  won:       { label: "Won",       emoji: "🏆", className: "stage-won" },
  lost:      { label: "Lost",      emoji: "❌", className: "stage-lost" },
};

export function PipelineStageBadge({ stage }: { stage: PipelineStage }) {
  const cfg = STAGE_CONFIG[stage] ?? STAGE_CONFIG.new;
  return (
    <span className={`pipeline-badge ${cfg.className}`}>
      {cfg.emoji} {cfg.label}
    </span>
  );
}
