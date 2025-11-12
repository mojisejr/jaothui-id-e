import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JAOTHUI - ระบบข้อมูลควาย",
  description: "ระบบจัดการข้อมูลควายสำหรับเกษตรกรไทย - JAOTHUI ID-Trace System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
