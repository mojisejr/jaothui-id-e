import { HeroSection } from "@/components/ui/HeroSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JAOTHUI - ระบบข้อมูลควาย",
  description: "ระบบจัดการข้อมูลควายสำหรับเกษตรกรไทย - JAOTHUI ID-Trace System",
};

export default function Home() {
  return (
    <main>
      <HeroSection />
    </main>
  );
}
