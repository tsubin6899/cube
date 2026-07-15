import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cube查詢｜現在該切哪個方案？",
  description: "輸入店家，立即查詢國泰世華 CUBE 卡最有利的權益方案、回饋率與付款提醒。",
  applicationName: "Cube查詢",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/cube-query-icon.png",
    apple: "/cube-query-icon.png",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#071426",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
