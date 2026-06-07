# HAPPY v0.1 Lead Scoring System

ระบบให้คะแนน แบ่งเกรด และจัดลำดับความสำคัญของ Lead ลูกค้ากันสาดไฟฟ้า

Source of truth ของ MVP นี้คือไฟล์ใน workspace นี้เท่านั้น:

```text
/Users/mark/Desktop/HAPPYSCORE
```

## MVP Scope

- เพิ่ม Lead ใหม่
- แก้ไข Lead
- ลบ Lead
- เก็บข้อมูลด้วย localStorage
- คำนวณคะแนนอัตโนมัติเต็ม 100 คะแนน
- แสดง Fit Score, Interest Score, Grade, Temperature, Segment
- แสดง Risk Flags, เหตุผลคะแนน, Recommendation และ Next Step
- สร้าง Priority Call List วันนี้
- มี mock data 10 Lead
- มี unit tests สำหรับ logic หลัก
- Railway-ready

## Tech Stack

```text
Next.js 16
React 19
TypeScript
Vitest
localStorage
```

## Run Local

```bash
npm install
npm run dev
```

เปิดเว็บ:

```text
http://localhost:3000
```

## Test

```bash
npm test
```

## Production Build

```bash
npm run build
npm run start
```

## Railway Deploy

Railway ใช้คำสั่งมาตรฐานจาก `package.json`

```text
Build command: npm run build
Start command: npm run start
```

ไม่ต้องตั้ง environment variables สำหรับ MVP v0.1

หมายเหตุสำคัญ:

- Railway ใช้ host ตัวเว็บ
- ข้อมูล Lead เก็บใน `localStorage` ของ browser แต่ละเครื่อง
- หากต้องการให้หลายคนเห็นข้อมูลกลางร่วมกันในอนาคต ให้เพิ่ม Railway Postgres ใน Phase 2

## Architecture

```text
Lead Form
-> Validate Required Fields
-> Scoring Engine
-> Fit Score / Interest Score
-> Grade / Temperature
-> Segment
-> Risk Flags
-> Recommendation / Next Step
-> Priority Score
-> Save to localStorage
-> Dashboard / Detail / Priority Call List
```

โครงสร้างหลัก:

```text
/src/app          หน้า Dashboard, Add Lead, Detail/Edit
/src/components   UI components ภาษาไทย
/src/lib          business logic ทั้งหมด
/src/types        TypeScript data model
/src/data         mock leads
/src/tests        unit tests
```

## Business Rules

อ่านรายละเอียดได้ที่:

- `business_knowledge.md`
- `scoring_rules.md`

## Important Constraints

- ห้ามให้เซลล์กรอกคะแนนเอง
- ห้ามทำ logic คะแนนปนใน UI
- ห้ามต่อ API จริงใน v0.1
- ห้ามทำ Login/Auth
- ห้ามทำ Database จริง
- ห้ามทำ CRM เต็มระบบ
- คะแนนรวมต้องไม่เกิน 100
- ทุก Lead ต้องมี Recommendation และ Next Step
