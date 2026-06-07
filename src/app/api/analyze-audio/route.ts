import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `คุณคือผู้เชี่ยวชาญ Sales Analysis สำหรับธุรกิจกันสาดไฟฟ้า HAPPY Awning

ภารกิจ: วิเคราะห์ transcript บทสนทนาระหว่างเซลล์กับลูกค้า แล้วสกัดข้อมูลเพื่อประเมิน Lead

คุณต้องส่งออกผลลัพธ์เป็น JSON ที่มีโครงสร้างดังนี้:

{
  "transcript": "สรุปบทสนทนาสั้น ๆ 2-3 ประโยค",
  "customerName": "ชื่อลูกค้า (ถ้าพูดถึง)",
  "phoneNumber": "เบอร์โทร (ถ้าพูดถึง)",
  "province": "จังหวัด (ถ้าพูดถึง)",
  "projectName": "โครงการหรือที่อยู่ (ถ้าพูดถึง)",
  "customerNote": "สรุป note สำคัญจากการคุย",
  "installationLocationType": "bangkok_metropolitan | near_bangkok_under_200km | medium_distance_201_299km | far_over_300km | unknown",
  "projectValueLevel": "luxury_over_6m | mid_high_4m_to_6m | below_4m | unknown",
  "sitePhotoStatus": "detailed_with_measurement | photo_without_measurement | not_sent",
  "urgencyStatus": "within_1_month | within_3_months | just_researching | unknown",
  "quotationStatus": "quoted_and_price_accepted | quoted_but_hesitating | quoted_but_price_rejected | not_quoted",
  "communicationStatus": "highly_responsive | partially_responsive | unresponsive",
  "siteSurveyStatus": "scheduled_easy_site | scheduled_difficult_site | not_scheduled",
  "persona": "A | B | C | unknown",
  "personaReason": "เหตุผลที่วิเคราะห์ว่าเป็น Persona นี้",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "mainObjection": "ข้อโต้แย้งหลักของลูกค้า (ถ้ามี)",
  "confidence": "high | medium | low"
}

## เกณฑ์วิเคราะห์ Persona:
- Persona A: วัย 25-40 ปี บ้านใหม่ อยากให้บ้านสวย อ้างถึง Social / รูปสวย / เพื่อน
- Persona B: ผู้บริหาร/เจ้าของธุรกิจ เน้นคุณภาพ คุ้มค่า ไม่ต่อราคา
- Persona C: วัย 50+ เกษียณ ทนทาน ดูแลง่าย ลูกหลาน

## เกณฑ์วิเคราะห์ installationLocationType:
- bangkok_metropolitan: กรุงเทพ นนทบุรี ปทุมธานี สมุทรปราการ สมุทรสาคร นครปฐม
- near_bangkok_under_200km: ระยะ <200km จากกรุงเทพ
- medium_distance_201_299km: ระยะ 201-299km
- far_over_300km: ระยะ 300km+

ตอบเฉพาะ JSON เท่านั้น ไม่มีข้อความอื่น`;

async function transcribeWithWhisper(file: File, openaiKey: string): Promise<string> {
  // Guard: Anthropic keys start with sk-ant — wrong key for Whisper
  if (openaiKey.startsWith("sk-ant")) {
    throw new Error(
      "นี่คือ Anthropic API Key — Whisper ต้องการ OpenAI API Key (sk-proj-... หรือ sk-...) จาก platform.openai.com"
    );
  }

  const form = new FormData();
  form.append("file", file, file.name);
  form.append("model", "whisper-1");
  form.append("language", "th");
  form.append("response_format", "text");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiKey}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    let detail = body;
    try {
      const parsed = JSON.parse(body);
      detail = parsed?.error?.message ?? body;
    } catch { /* use raw body */ }
    throw new Error(`Whisper ${res.status}: ${detail}`);
  }

  return res.text();
}

async function analyzeWithClaude(transcript: string): Promise<{ raw: string }> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!anthropicKey) {
    throw new Error("ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY ใน .env.local");
  }

  const client = new Anthropic({ apiKey: anthropicKey });
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `บทสนทนาที่ถอดเสียงมาได้:\n\n${transcript}\n\nวิเคราะห์และส่งออก JSON ตาม format ที่กำหนด`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  return { raw };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const manualTranscript = (formData.get("transcript") as string | null)?.trim() ?? "";

    let transcript: string;
    let transcriptPreview: string;

    if (manualTranscript.length >= 10) {
      // Mode: วาง transcript โดยตรง — ไม่ต้องใช้ Whisper / OpenAI
      transcript = manualTranscript;
      transcriptPreview = manualTranscript.slice(0, 200);
    } else {
      // Mode: ไฟล์เสียง → Whisper
      const file = formData.get("audio") as File | null;
      if (!file) {
        return NextResponse.json({ error: "ไม่พบไฟล์เสียงหรือข้อความ" }, { status: 400 });
      }

      const allowedPrefixes = ["audio/", "video/mp4"];
      if (!allowedPrefixes.some((p) => file.type.startsWith(p))) {
        return NextResponse.json({ error: "รองรับเฉพาะไฟล์เสียง mp3, m4a, wav, webm" }, { status: 400 });
      }
      if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json({ error: "ไฟล์ใหญ่เกิน 25MB" }, { status: 400 });
      }

      const openaiKey = req.headers.get("x-openai-key") ?? process.env.OPENAI_API_KEY ?? "";
      if (!openaiKey) {
        return NextResponse.json(
          { error: "กรุณากรอก OpenAI API Key (sk-proj-...) ในช่องตั้งค่า ⚙️ — ใช้สำหรับ Whisper ถอดเสียง" },
          { status: 400 }
        );
      }

      transcript = await transcribeWithWhisper(file, openaiKey);
      transcriptPreview = transcript.slice(0, 200);

      if (!transcript || transcript.trim().length < 5) {
        return NextResponse.json({ error: "ถอดเสียงไม่สำเร็จ หรือไฟล์เสียงเงียบเกินไป" }, { status: 422 });
      }
    }

    const { raw } = await analyzeWithClaude(transcript);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Claude วิเคราะห์ไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, data: result, transcriptPreview });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
