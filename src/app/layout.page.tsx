import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "Automotive Security Incident Dashboard",
  description: "Real-time vehicle fleet attack monitoring",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
