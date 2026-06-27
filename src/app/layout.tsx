import type { ReactNode } from "react";

export const metadata = {
  title: "StratoMesh Backend",
  description: "StratoMesh insurance workflow API backend",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}