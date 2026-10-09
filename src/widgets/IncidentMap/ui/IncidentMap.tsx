"use client";

import { useEffect, useRef } from "react";
import {
  useIncidentSelector,
  type IncidentStreamState,
} from "@/entities/IncidentStream";
import { formatCount } from "@/shared/lib/format";
import { addPaintCost } from "@/shared/lib/frameBudget";
import { createIncidentPainter } from "../lib/drawIncidents";
import styles from "./IncidentMap.module.css";

function selectMapFrame(state: IncidentStreamState) {
  return {
    incidents: state.incidents,
    filters: state.filters,
  };
}

export function IncidentMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const view = useIncidentSelector(selectMapFrame);
  const viewRef = useRef(view);
  viewRef.current = view;

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const size = { width: 0, height: 0 };
    let appliedDpr = 0;
    const paint = createIncidentPainter();
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    const onMotionChange = () => {
      reducedMotion = motionQuery.matches;
    };
    motionQuery.addEventListener("change", onMotionChange);

    const resize = () => {
      const rect = frame.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      size.width = Math.max(0, Math.floor(rect.width));
      size.height = Math.max(0, Math.floor(rect.height));
      appliedDpr = dpr;
      canvas.width = Math.max(1, Math.floor(size.width * dpr));
      canvas.height = Math.max(1, Math.floor(size.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(frame);

    let frameId = 0;
    const loop = () => {
      frameId = requestAnimationFrame(loop);
      const dpr = window.devicePixelRatio || 1;
      if (dpr !== appliedDpr) resize();
      if (size.width < 2 || size.height < 2) return;

      const { incidents, filters } = viewRef.current;
      const started = performance.now();
      paint(context, size.width, size.height, incidents, filters, Date.now(), reducedMotion);
      addPaintCost(performance.now() - started);
    };
    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div
      ref={frameRef}
      className="relative w-full h-full min-h-0 bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        role="img"
        aria-label="Geographic plot of live vehicle attack coordinates"
      />
      <p className="pointer-events-none absolute right-3 top-3 z-10 m-0 max-w-[70%] text-right font-mono text-[11px] leading-snug tracking-wide text-zinc-200 font-bold">
        Canvas Engine: Active Nodes: {formatCount(view.incidents.size)} | Render Throttling: 60 FPS
      </p>
      <div className={styles.legend}>
        <span className={styles.item}>
          <span className={styles.swatch} data-threat="DDoS" />
          DDoS
        </span>
        <span className={styles.item}>
          <span className={styles.swatch} data-threat="CanBus Injection" />
          CanBus Injection
        </span>
        <span className={styles.item}>
          <span className={styles.swatch} data-threat="BruteForce" />
          BruteForce
        </span>
      </div>
    </div>
  );
}
