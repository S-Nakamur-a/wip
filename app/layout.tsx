import type { Metadata } from "next";
import { Inter } from "next/font/google";
import styles from "./page.module.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GitHub Pages",
  description: "S-Nakamur-a GitHub Pages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
      <div className={styles.header}><span><Link href="/">🏠</Link></span></div>
      {children}
      </body>
    </html>
  );
}
