"use client";

import { useEffect, useRef, useState } from "react";
import { selectLogIncidents, useIncidentSelector } from "@/entities/IncidentStream";
import styles from "./LiveIncidentLog.module.css";

const ROW_HEIGHT = 28;

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const millis = date.getMilliseconds().toString().padStart(3, "0");
  return `${hours}:${minutes}:${seconds}.${millis}`;
}

export function LiveIncidentLog() {
  const incidents = useIncidentSelector(selectLogIncidents);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(ROW_HEIGHT * 8);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(() => {
      setHeight(viewport.clientHeight);
    });
    observer.observe(viewport);
    setHeight(viewport.clientHeight);
    return () => observer.disconnect();
  }, []);

  const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 2);
  const visibleCount = Math.ceil(height / ROW_HEIGHT) + 4;
  const slice = incidents.slice(start, start + visibleCount);

  return (
    <div className={styles.frame}>
      <div className={styles.columns} aria-hidden="true">
        <span>Time</span>
        <span>Vehicle</span>
        <span>Payload</span>
        <span>Sev</span>
      </div>
      <div
        ref={viewportRef}
        className={styles.viewport}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        role="log"
        aria-label="Live incident log"
      >
        {incidents.length === 0 ? (
          <p className={styles.empty}>Waiting for incidents</p>
        ) : (
          <div className={styles.spacer} style={{ height: incidents.length * ROW_HEIGHT }}>
            <ol className={styles.list} style={{ transform: `translateY(${start * ROW_HEIGHT}px)` }}>
              {slice.map((incident) => (
                <li key={incident.id} className={styles.row} data-threat={incident.payloadType}>
                  <span>{formatTimestamp(incident.timestamp)}</span>
                  <span>{incident.vehicleId}</span>
                  <span className={styles.type}>{incident.payloadType}</span>
                  <span className={styles.severity}>S{incident.severity}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
