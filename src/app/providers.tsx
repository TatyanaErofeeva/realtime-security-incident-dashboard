import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <div className="theme-root">{children}</div>;
}
