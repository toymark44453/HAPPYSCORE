"use client";

import { useEffect, useRef, useState } from "react";
import {
  addActivity,
  deleteActivity,
  getActivitiesForLead,
} from "@/lib/activityStorage";
import { activityTypeIcons, activityTypeLabels } from "@/types/activity";
import type { ActivityEntry, ActivityType } from "@/types/activity";

const ACTIVITY_TYPES: ActivityType[] = ["call", "line", "visit", "quote", "note"];

export function ActivityLog({ leadId }: { leadId: string }) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [type, setType] = useState<ActivityType>("call");
  const [note, setNote] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const noteRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEntries(getActivitiesForLead(leadId));
  }, [leadId]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    addActivity(leadId, type, note, createdBy || undefined);
    setEntries(getActivitiesForLead(leadId));
    setNote("");
    noteRef.current?.focus();
  }

  function handleDelete(id: string) {
    deleteActivity(id);
    setEntries(getActivitiesForLead(leadId));
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="card">
      <h2>Activity Log</h2>

      <form onSubmit={handleAdd} className="activity-form">
        <div className="activity-type-row">
          {ACTIVITY_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={`activity-type-btn${type === t ? " active" : ""}`}
              onClick={() => setType(t)}
            >
              {activityTypeIcons[t]} {activityTypeLabels[t]}
            </button>
          ))}
        </div>
        <div className="activity-input-row">
          <textarea
            ref={noteRef}
            className="activity-note"
            placeholder={`บันทึก${activityTypeLabels[type]}...`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
          <div className="activity-meta-row">
            <input
              className="activity-by"
              placeholder="เซลล์ผู้ดูแล (optional)"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
            />
            <button className="button" type="submit" disabled={!note.trim()}>
              บันทึก
            </button>
          </div>
        </div>
      </form>

      {entries.length === 0 ? (
        <p className="muted" style={{ marginTop: 12 }}>ยังไม่มีกิจกรรม</p>
      ) : (
        <ul className="activity-list">
          {entries.map((entry) => (
            <li key={entry.id} className="activity-item">
              <span className="activity-icon">{activityTypeIcons[entry.type]}</span>
              <div className="activity-body">
                <div className="activity-header">
                  <strong>{activityTypeLabels[entry.type]}</strong>
                  {entry.createdBy && <span className="muted"> — {entry.createdBy}</span>}
                  <span className="activity-time muted">{formatDate(entry.createdAt)}</span>
                </div>
                <p className="activity-note-text">{entry.note}</p>
              </div>
              <button
                className="activity-delete"
                type="button"
                title="ลบ"
                onClick={() => handleDelete(entry.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
