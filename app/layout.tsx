import React from "react";
import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import { Kaisei_Tokumin } from "next/font/google";
import "./globals.css";

const kaiseiTokumin = Kaisei_Tokumin({ subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={kaiseiTokumin.className}>{children}</body>
    </html>
  );
}
