import type { LeadInput, PipelineStage } from "@/types/lead";

const pipelineOptions: { value: PipelineStage; label: string; emoji: string }[] = [
  { value: "new", label: "New", emoji: "🆕" },
  { value: "contacted", label: "Contacted", emoji: "📞" },
  { value: "quoted", label: "Quoted", emoji: "📋" },
  { value: "won", label: "Won", emoji: "🏆" },
  { value: "lost", label: "Lost", emoji: "❌" },
];

type Option<T extends string> = {
  value: T;
  label: string;
};

const locationOptions: Option<LeadInput["installationLocationType"]>[] = [
  { value: "bangkok_metropolitan", label: "กรุงเทพ/ปริมณฑล" },
  { value: "near_bangkok_under_200km", label: "ต่างจังหวัดไม่เกิน 200 km" },
  { value: "medium_distance_201_299km", label: "ระยะทาง 201-299 km" },
  { value: "far_over_300km", label: "ระยะทาง 300 km ขึ้นไป" },
  { value: "unknown", label: "ไม่ทราบพื้นที่" }
];

const projectOptions: Option<LeadInput["projectValueLevel"]>[] = [
  { value: "luxury_over_6m", label: "บ้าน/โครงการ 6 ล้านบาทขึ้นไป" },
  { value: "mid_high_4m_to_6m", label: "บ้าน/โครงการ 4-6 ล้านบาท" },
  { value: "below_4m", label: "ต่ำกว่า 4 ล้านบาท" },
  { value: "unknown", label: "ไม่พบข้อมูล" }
];

const photoOptions: Option<LeadInput["sitePhotoStatus"]>[] = [
  { value: "detailed_with_measurement", label: "ส่งรูปละเอียดพร้อมขนาด" },
  { value: "photo_without_measurement", label: "ส่งรูปแต่ไม่มีขนาด/มีขนาดแต่ยังไม่มีรูป" },
  { value: "not_sent", label: "ไม่ส่งรูป" }
];

const urgencyOptions: Option<LeadInput["urgencyStatus"]>[] = [
  { value: "within_1_month", label: "ต้องการติดภายใน 1 เดือน" },
  { value: "within_3_months", label: "ต้องการติดภายใน 3 เดือน" },
  { value: "just_researching", label: "สอบถามไว้ก่อน" },
  { value: "unknown", label: "ไม่ทราบ" }
];

const quotationOptions: Option<LeadInput["quotationStatus"]>[] = [
  { value: "quoted_and_price_accepted", label: "ออกใบเสนอราคาแล้ว และลูกค้ารับราคาได้" },
  { value: "quoted_but_hesitating", label: "ออกใบเสนอราคาแล้ว แต่ลูกค้ายังลังเล" },
  { value: "quoted_but_price_rejected", label: "ออกใบเสนอราคาแล้ว แต่ลูกค้ารับราคาไม่ได้" },
  { value: "not_quoted", label: "ยังไม่ได้ออกใบเสนอราคา" }
];

const communicationOptions: Option<LeadInput["communicationStatus"]>[] = [
  { value: "highly_responsive", label: "รับสาย/ตอบ Line สม่ำเสมอ" },
  { value: "partially_responsive", label: "รับบ้าง ไม่รับบ้าง" },
  { value: "unresponsive", label: "ไม่รับสาย/ไม่ตอบ Line" }
];

const surveyOptions: Option<LeadInput["siteSurveyStatus"]>[] = [
  { value: "scheduled_easy_site", label: "รับนัด และพื้นที่ติดตั้งง่าย" },
  { value: "scheduled_difficult_site", label: "รับนัด แต่พื้นที่ติดตั้งยาก/มีงานเสริม" },
  { value: "not_scheduled", label: "ยังไม่รับนัด" }
];

function SelectField<T extends keyof LeadInput>({
  label,
  name,
  value,
  options,
  onChange
}: {
  label: string;
  name: T;
  value: LeadInput[T];
  options: Option<Extract<LeadInput[T], string>>[];
  onChange: (name: T, value: LeadInput[T]) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={String(name)}>{label}</label>
      <select id={String(name)} value={String(value)} onChange={(event) => onChange(name, event.target.value as LeadInput[T])}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function LeadScoringForm({
  value,
  onChange
}: {
  value: LeadInput;
  onChange: <T extends keyof LeadInput>(name: T, fieldValue: LeadInput[T]) => void;
}) {
  return (
    <>
      <div className="card">
        <h2>Pipeline Stage</h2>
        <div className="pipeline-stage-selector">
          {pipelineOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`pipeline-stage-btn${value.pipelineStage === opt.value ? " active" : ""} stage-${opt.value}`}
              onClick={() => onChange("pipelineStage", opt.value)}
            >
              <span className="stage-emoji">{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Fact สำหรับให้คะแนน</h2>
        <div className="grid form-grid">
          <SelectField label="สถานที่ติดตั้ง" name="installationLocationType" value={value.installationLocationType} options={locationOptions} onChange={onChange} />
          <SelectField label="มูลค่าโครงการ/กำลังซื้อ" name="projectValueLevel" value={value.projectValueLevel} options={projectOptions} onChange={onChange} />
          <SelectField label="รูปและข้อมูลหน้างาน" name="sitePhotoStatus" value={value.sitePhotoStatus} options={photoOptions} onChange={onChange} />
          <SelectField label="ความเร่งด่วน" name="urgencyStatus" value={value.urgencyStatus} options={urgencyOptions} onChange={onChange} />
          <SelectField label="ใบเสนอราคา/การรับราคา" name="quotationStatus" value={value.quotationStatus} options={quotationOptions} onChange={onChange} />
          <SelectField label="การสื่อสาร" name="communicationStatus" value={value.communicationStatus} options={communicationOptions} onChange={onChange} />
          <SelectField label="นัดวัดพื้นที่" name="siteSurveyStatus" value={value.siteSurveyStatus} options={surveyOptions} onChange={onChange} />
        </div>
      </div>
    </>
  );
}
