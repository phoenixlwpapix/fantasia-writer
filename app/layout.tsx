import type { Metadata } from "next";
import { Inter, Noto_Serif_SC, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { StoryProvider } from "../components/StoryProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fantasia - AI小说创作助手",
  description:
    "一款顶级AI辅助小说创作环境，具备结构化世界构建和迭代式章节生成功能。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${inter.variable} ${notoSerifSC.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <StoryProvider>{children}</StoryProvider>
      </body>
    </html>
  );
}
