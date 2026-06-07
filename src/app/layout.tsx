import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HAPPY Lead Scoring",
  description: "ระบบให้คะแนนและจัดลำดับ Lead ลูกค้ากันสาดไฟฟ้า"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
