"use client";

import { useEffect, useRef, useState } from "react";
import type { LeadInput } from "@/types/lead";

const STORAGE_KEY = "happyscore_openai_key";
type Mode = "file" | "text";

interface AudioAnalysisResult {
  transcript: string;
  customerName?: string;
  phoneNumber?: string;
  province?: string;
  projectName?: string;
  customerNote?: string;
  installationLocationType: LeadInput["installationLocationType"];
  projectValueLevel: LeadInput["projectValueLevel"];
  sitePhotoStatus: LeadInput["sitePhotoStatus"];
  urgencyStatus: LeadInput["urgencyStatus"];
  quotationStatus: LeadInput["quotationStatus"];
  communicationStatus: LeadInput["communicationStatus"];
  siteSurveyStatus: LeadInput["siteSurveyStatus"];
  persona: "A" | "B" | "C" | "unknown";
  personaReason: string;
  keyInsights: string[];
  mainObjection?: string;
  confidence: "high" | "medium" | "low";
}

const personaLabels: Record<string, string> = {
  A: "Persona A — บ้านใหม่อยากอวด",
  B: "Persona B — ผู้บริหารเจ้าคุณค่า ⭐",
  C: "Persona C — วัยเกษียณกำลังสร้าง",
  unknown: "ยังระบุไม่ได้",
};

const confidenceColors: Record<string, string> = {
  high: "#067647",
  medium: "#b54708",
  low: "#b42318",
};

const confidenceLabels: Record<string, string> = {
  high: "มั่นใจสูง",
  medium: "มั่นใจปานกลาง",
  low: "ข้อมูลน้อย",
};

export function AudioAnalyzer({ onApply }: { onApply: (partial: Partial<LeadInput>) => void }) {
  const [mode, setMode] = useState<Mode>("text"); // default = text mode (no OpenAI needed)
  const [file, setFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [loadingStep, setLoadingStep] = useState<"transcribe" | "analyze">("transcribe");
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [transcriptPreview, setTranscriptPreview] = useState("");
  const [error, setError] = useState("");

  // OpenAI key (for file mode only)
  const [openaiKey, setOpenaiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) ?? "";
    setOpenaiKey(saved);
  }, []);

  function saveKey() {
    localStorage.setItem(STORAGE_KEY, openaiKey.trim());
    setKeySaved(true);
    setShowKeyInput(false);
    setTimeout(() => setKeySaved(false), 2000);
  }

  async function handleAnalyze() {
    const isTextMode = mode === "text";

    if (isTextMode && manualText.trim().length < 10) {
      setError("กรุณาพิมพ์หรือวาง transcript อย่างน้อย 10 ตัวอักษร");
      return;
    }
    if (!isTextMode && !file) {
      setError("กรุณาเลือกไฟล์เสียงก่อน");
      return;
    }
    if (!isTextMode && !openaiKey.trim()) {
      setError("กรุณากรอก OpenAI API Key ก่อน (กดปุ่ม ⚙️)");
      setShowKeyInput(true);
      return;
    }

    setStatus("loading");
    setLoadingStep("transcribe");
    setError("");
    setResult(null);
    setTranscriptPreview("");

    const form = new FormData();
    if (isTextMode) {
      form.append("transcript", manualText.trim());
    } else {
      form.append("audio", file!);
    }

    const headers: Record<string, string> = {};
    if (!isTextMode && openaiKey.trim()) {
      headers["x-openai-key"] = openaiKey.trim();
    }

    try {
      const timer = setTimeout(() => setLoadingStep("analyze"), 4000);
      const res = await fetch("/api/analyze-audio", { method: "POST", headers, body: form });
      clearTimeout(timer);

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "วิเคราะห์ไม่สำเร็จ");
        setStatus("error");
        return;
      }
      setResult(json.data);
      setTranscriptPreview(json.transcriptPreview ?? "");
      setStatus("done");
    } catch {
      setError("เชื่อมต่อ API ไม่ได้ กรุณาตรวจสอบว่า dev server รันอยู่");
      setStatus("error");
    }
  }

  function handleApply() {
    if (!result) return;
    const partial: Partial<LeadInput> = {
      installationLocationType: result.installationLocationType,
      projectValueLevel: result.projectValueLevel,
      sitePhotoStatus: result.sitePhotoStatus,
      urgencyStatus: result.urgencyStatus,
      quotationStatus: result.quotationStatus,
      communicationStatus: result.communicationStatus,
      siteSurveyStatus: result.siteSurveyStatus,
    };
    if (result.customerName) partial.customerName = result.customerName;
    if (result.phoneNumber) partial.phoneNumber = result.phoneNumber;
    if (result.province) partial.province = result.province;
    if (result.projectName) partial.projectName = result.projectName;
    if (result.customerNote) partial.customerNote = result.customerNote;
    onApply(partial);
  }

  return (
    <div className="card audio-analyzer">
      {/* Header */}
      <div className="audio-header">
        <span className="audio-icon">🎙️</span>
        <div style={{ flex: 1 }}>
          <h2>วิเคราะห์บทสนทนา</h2>
          <p className="muted">Claude สกัด Fact 7 หมวดจากบทสนทนากับลูกค้า</p>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="audio-tabs">
        <button
          type="button"
          className={`audio-tab${mode === "text" ? " active" : ""}`}
          onClick={() => { setMode("text"); setStatus("idle"); setError(""); }}
        >
          📝 วาง Transcript
          <span className="audio-tab-badge">ใช้ได้เลย</span>
        </button>
        <button
          type="button"
          className={`audio-tab${mode === "file" ? " active" : ""}`}
          onClick={() => { setMode("file"); setStatus("idle"); setError(""); }}
        >
          🎵 ไฟล์เสียง
          <span className="audio-tab-badge secondary">ต้องการ OpenAI Key</span>
        </button>
      </div>

      {/* TEXT MODE */}
      {mode === "text" && (
        <div className="audio-text-mode">
          <p className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
            คัดลอก transcript จากแอปบันทึกเสียง (เช่น Line, Call Recorder) แล้ววางตรงนี้
          </p>
          <textarea
            className="audio-textarea"
            placeholder="วางข้อความบทสนทนาที่นี่... เช่น &#10;เซลล์: สวัสดีครับ คุณสนใจกันสาดไหมครับ&#10;ลูกค้า: สนใจอยู่ครับ บ้านอยู่สุขุมวิท..."
            value={manualText}
            onChange={(e) => { setManualText(e.target.value); setStatus("idle"); setResult(null); }}
            rows={5}
          />
          <button
            className="button"
            type="button"
            disabled={manualText.trim().length < 10 || status === "loading"}
            onClick={handleAnalyze}
            style={{ marginTop: 8 }}
          >
            {status === "loading" ? "⏳ Claude กำลังวิเคราะห์..." : "🤖 วิเคราะห์บทสนทนา"}
          </button>
        </div>
      )}

      {/* FILE MODE */}
      {mode === "file" && (
        <div className="audio-file-mode">
          {/* OpenAI key settings */}
          <div className="audio-key-row">
            <div className="audio-key-status">
              {openaiKey ? (
                <span className="audio-key-ok">✅ OpenAI Key ตั้งค่าแล้ว</span>
              ) : (
                <span className="audio-key-missing">⚠️ ยังไม่มี OpenAI API Key</span>
              )}
            </div>
            <button
              type="button"
              className="audio-settings-btn"
              onClick={() => setShowKeyInput((v) => !v)}
            >
              ⚙️ {keySaved ? "บันทึกแล้ว ✅" : "ตั้งค่า Key"}
            </button>
          </div>

          {showKeyInput && (
            <div className="audio-api-settings">
              <div className="audio-api-label">
                <strong>OpenAI API Key</strong>
                <span className="muted"> — สำหรับ Whisper (ถอดเสียงเป็นข้อความ)</span>
              </div>
              <div className="audio-api-row">
                <input
                  type="password"
                  className="audio-api-input"
                  placeholder="sk-proj-... (ไม่ใช่ sk-ant-...)"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveKey()}
                />
                <button type="button" className="button" onClick={saveKey} disabled={!openaiKey.trim()}>
                  บันทึก
                </button>
                {openaiKey && (
                  <button type="button" className="button secondary" onClick={() => { localStorage.removeItem(STORAGE_KEY); setOpenaiKey(""); }}>
                    ลบ
                  </button>
                )}
              </div>
              <p className="audio-api-hint">
                ⚠️ ต้องเป็น OpenAI key (<code>sk-proj-...</code>) ไม่ใช่ Anthropic key (<code>sk-ant-...</code>)
              </p>
              <p className="audio-api-hint">
                สร้างได้ที่{" "}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                  platform.openai.com/api-keys
                </a>{" "}
                · เก็บเฉพาะใน Browser (localStorage)
              </p>
            </div>
          )}

          <div className="audio-upload-row">
            <input
              ref={inputRef}
              type="file"
              accept="audio/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                setStatus("idle");
                setResult(null);
              }}
            />
            <button className="button secondary" type="button" onClick={() => inputRef.current?.click()}>
              {file ? `📁 ${file.name}` : "เลือกไฟล์เสียง (mp3, m4a, wav)"}
            </button>
            <button
              className="button"
              type="button"
              disabled={!file || status === "loading"}
              onClick={handleAnalyze}
            >
              {status === "loading" ? "⏳ กำลังประมวลผล..." : "วิเคราะห์เสียง"}
            </button>
          </div>

          {status === "loading" && (
            <div className="audio-loading">
              <div className="audio-loading-bar" />
              <p className="muted">
                {loadingStep === "transcribe"
                  ? "🎧 Whisper กำลังถอดเสียงเป็นข้อความ..."
                  : "🤖 Claude กำลังวิเคราะห์บทสนทนา..."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Text mode loading */}
      {mode === "text" && status === "loading" && (
        <div className="audio-loading">
          <div className="audio-loading-bar" />
          <p className="muted">🤖 Claude กำลังวิเคราะห์บทสนทนา...</p>
        </div>
      )}

      {/* Error */}
      {status === "error" && <div className="error-box">{error}</div>}

      {/* Result */}
      {status === "done" && result && (
        <div className="audio-result">
          {transcriptPreview && (
            <div className="audio-transcript-preview">
              <strong>ข้อความที่ถอดได้ (ตัวอย่าง):</strong>
              <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                {transcriptPreview}{transcriptPreview.length >= 200 ? "…" : ""}
              </p>
            </div>
          )}

          <div className="audio-result-header">
            <div className="audio-confidence" style={{ color: confidenceColors[result.confidence] }}>
              ● {confidenceLabels[result.confidence]}
            </div>
            <div className="audio-persona">{personaLabels[result.persona] ?? result.persona}</div>
          </div>

          <div className="audio-transcript">
            <strong>สรุปการสนทนา:</strong>
            <p>{result.transcript}</p>
          </div>

          {result.mainObjection && (
            <div className="audio-objection">
              <strong>⚠️ ข้อโต้แย้งหลัก:</strong> {result.mainObjection}
            </div>
          )}

          {result.keyInsights.length > 0 && (
            <div className="audio-insights">
              <strong>Insights:</strong>
              <ul className="list">
                {result.keyInsights.map((ins) => <li key={ins}>{ins}</li>)}
              </ul>
            </div>
          )}

          <div className="audio-facts">
            <strong>Fact ที่ระบบจะกรอกให้:</strong>
            <div className="audio-fact-grid">
              {[
                ["สถานที่", result.installationLocationType],
                ["มูลค่าโครงการ", result.projectValueLevel],
                ["รูปหน้างาน", result.sitePhotoStatus],
                ["ความเร่งด่วน", result.urgencyStatus],
                ["ใบเสนอราคา", result.quotationStatus],
                ["การสื่อสาร", result.communicationStatus],
                ["นัดวัดพื้นที่", result.siteSurveyStatus],
              ].map(([label, value]) => (
                <div key={label} className="audio-fact-item">
                  <span className="muted">{label}</span>
                  <span className="audio-fact-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="audio-persona-reason">
            <strong>เหตุผล Persona:</strong> {result.personaReason}
          </div>

          <button className="button audio-apply-btn" type="button" onClick={handleApply}>
            ✅ นำผลไปกรอกฟอร์มอัตโนมัติ
          </button>
        </div>
      )}
    </div>
  );
}
