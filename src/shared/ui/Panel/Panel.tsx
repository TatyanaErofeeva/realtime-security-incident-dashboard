import type { ReactNode } from "react";
import styles from "./Panel.module.css";

interface PanelProps {
  title: string;
  children: ReactNode;
}

export function Panel({ title, children }: PanelProps) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
