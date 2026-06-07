# HAPPY v0.1 — Session Handoff
> วาง document นี้ใน new session เพื่อ continue ได้ทันที

---

## โปรเจกต์คืออะไร

**HAPPY v0.1 Lead Scoring System** — ระบบให้คะแนน Lead ลูกค้ากันสาดไฟฟ้า HAPPY Awning
- คะแนนเต็ม 100 (Fit 40 + Interest 60), Grade A/B/C/D, Temperature HOT/WARM/COOL/COLD
- ใช้ Next.js 16 + TypeScript + localStorage (ไม่มี DB)
- Dev server รันที่ `http://localhost:3000`

**Path:** `/Users/mark/Desktop/HAPPYSCORE`

---

## สิ่งที่สร้างเสร็จแล้ว ✅

### MVP Core (ทั้งหมดทำงานได้)
| หน้า | URL | สถานะ |
|------|-----|--------|
| Dashboard | `/` | ✅ |
| Add Lead | `/leads/new` | ✅ |
| Lead Detail/Edit | `/leads/[id]` | ✅ |

### Features ที่เพิ่มมาใน session นี้
| Feature | ไฟล์ | สถานะ |
|---------|------|--------|
| Filter + Search | `src/components/LeadFilters.tsx` | ✅ |
| Export CSV | `src/lib/exportCsv.ts` | ✅ |
| Activity Log | `src/components/ActivityLog.tsx` + `src/lib/activityStorage.ts` + `src/types/activity.ts` | ✅ |
| Quick View Modal | `src/components/LeadQuickView.tsx` | ✅ |
| Last Contact Indicator | ใน `LeadTable.tsx` | ✅ |
| Audio Analysis (Claude API) | `src/app/api/analyze-audio/route.ts` + `src/components/AudioAnalyzer.tsx` | ⚠️ ต้องตั้งค่า |

---

## สิ่งที่ยังต้องทำ ⚠️

### Audio Analysis — ต้องทำ 2 ขั้นตอนนี้ใน Terminal:

```bash
# 1. สร้าง .env.local (แทน KEY ด้วย Anthropic API key จริง)
echo 'ANTHROPIC_API_KEY=sk-proj-xxxx' > /Users/mark/Desktop/HAPPYSCORE/.env.local

# 2. Restart dev server
cd /Users/mark/Desktop/HAPPYSCORE
npm run dev
```

> SDK `@anthropic-ai/sdk` ติดตั้งแล้ว ✅ ขาดแค่ `.env.local`

### วิธีการทำงานของ Audio Analysis
1. หน้า `/leads/new` — กล่อง "🎙️ วิเคราะห์จากไฟล์เสียง" จะขึ้นบนสุด
2. อัปโหลดไฟล์ mp3/m4a/wav → Claude API วิเคราะห์
3. ระบุ Persona A/B/C + Objection + Key Insights
4. Map ไป Fact 7 หมวดอัตโนมัติ
5. กด "✅ นำผลไปกรอกฟอร์มอัตโนมัติ" → pre-fill ฟอร์ม

---

## Architecture

```
UI Layer       /app + /components     แสดงผล
    ↓
Logic Layer    /lib                   คำนวณ (pure functions)
    ↓
Data Layer     localStorage + types
    ↓
AI Layer       /api/analyze-audio     Claude API (audio → scoring facts)
```

### Score Pipeline
```
Fact 7 หมวด → scoring.ts → grading.ts → segmentation.ts
            → recommendations.ts → priority.ts → leadFactory.ts → localStorage
```

### Score Breakdown
| หมวด | Max | กลุ่ม |
|------|-----|-------|
| สถานที่ | 20 | Fit |
| มูลค่าโครงการ | 10 | Fit |
| นัดวัดพื้นที่ | 10 | Fit |
| **Fit Total** | **40** | |
| รูปหน้างาน | 10 | Interest |
| ความเร่งด่วน | 20 | Interest |
| ใบเสนอราคา | 20 | Interest |
| การสื่อสาร | 10 | Interest |
| **Interest Total** | **60** | |

---

## ไฟล์สำคัญทั้งหมด

```
/Users/mark/Desktop/HAPPYSCORE/
├── src/
│   ├── app/
│   │   ├── page.tsx                    Dashboard
│   │   ├── leads/new/page.tsx          Add Lead
│   │   ├── leads/[id]/page.tsx         Detail/Edit
│   │   ├── api/analyze-audio/route.ts  🆕 Claude Audio API
│   │   └── globals.css
│   ├── components/
│   │   ├── AudioAnalyzer.tsx           🆕 UI อัปโหลดเสียง
│   │   ├── ActivityLog.tsx             🆕 บันทึก action
│   │   ├── LeadFilters.tsx             🆕 Filter + Search
│   │   ├── LeadQuickView.tsx           🆕 Quick View Modal
│   │   ├── LeadTable.tsx               🔄 + Last Contact + ดูเร็ว
│   │   ├── PriorityCallList.tsx        🔄 redesign
│   │   ├── LeadForm.tsx                🔄 + AudioAnalyzer
│   │   ├── DashboardKpiCards.tsx
│   │   ├── FitInterestScoreCard.tsx
│   │   ├── LeadGradeBadge.tsx
│   │   ├── LeadTemperatureBadge.tsx
│   │   ├── LeadRecommendation.tsx
│   │   ├── LeadScoreCard.tsx
│   │   ├── LeadScoringForm.tsx
│   │   └── RiskFlags.tsx
│   ├── lib/
│   │   ├── scoring.ts                  7 calculators + riskFlags
│   │   ├── grading.ts                  grade() + temperature()
│   │   ├── segmentation.ts             segment()
│   │   ├── recommendations.ts          recommendation() + nextStep()
│   │   ├── priority.ts                 priorityScore + callList
│   │   ├── storage.ts                  localStorage CRUD
│   │   ├── activityStorage.ts          🆕 activity log storage
│   │   ├── exportCsv.ts               🆕 export to CSV
│   │   ├── leadFactory.ts              buildScoredLead()
│   │   └── validation.ts
│   ├── types/
│   │   ├── lead.ts                     Lead interface + all enums
│   │   └── activity.ts                 🆕 ActivityEntry interface
│   ├── data/
│   │   └── mockLeads.ts                11 mock leads
│   └── tests/
│       ├── scoring.test.ts             8 tests ผ่านทั้งหมด
│       ├── grading.test.ts
│       ├── segmentation.test.ts
│       └── priority.test.ts
├── .env.local                          ⚠️ ต้องสร้างเอง (API key)
├── package.json                        @anthropic-ai/sdk ✅ installed
├── README.md
└── scoring_rules.md
```

---

## Commands

```bash
npm run dev      # start dev server → localhost:3000
npm run test     # run 8 unit tests (ทั้งหมดผ่าน)
npm run build    # production build
```

---

## Plugin ที่เชื่อมอยู่

**superboom** plugin จาก `https://github.com/toymark44453/superboom`
- Claude Code slash commands: audit, check, closing, objection, persona, pitch, roleplay, why
- Agent: `happy-lead-scorer` — ประเมิน Lead ตาม HAPPY v0.1
- Knowledge base: 3 Personas, 9 Objections, สินค้า HAPPY Awning
- Audio analysis API route ใช้ความรู้จาก plugin นี้ใน system prompt

---

## Next Steps ที่แนะนำ (Phase 2)

1. **ทดสอบ Audio Analysis** หลังตั้งค่า .env.local
2. **Pipeline Stage** — New → Contacted → Quoted → Won/Lost
3. **Score Bar Visual** — progress bar แสดง Fit/Interest
4. **Deploy** — Railway พร้อม (มี railway.json แล้ว)
