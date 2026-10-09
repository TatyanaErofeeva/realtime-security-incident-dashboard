import type { Incident, ThreatFilterMap } from "@/entities/IncidentStream";
import { WORLD_EAST, WORLD_NORTH, WORLD_SOUTH, WORLD_WEST } from "@/shared/lib/canvas/project";
import { itemAt, type ChunkedRing } from "@/shared/lib/ringBuffer";

const BACKGROUND = "#09090b";
const GRID = "#18181b";
const GRID_STEP = 50;
const INDIGO_GLOW = "#6366f1";
const INDIGO_CORE = "#e0e7ff";
const ALERT_RED = "#ff2a2a";
const AMBER = "#f59e0b";
const FULL_TURN = Math.PI * 2;

export function createIncidentPainter(): (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  ring: ChunkedRing<Incident>,
  filters: ThreatFilterMap,
  now: number,
  reducedMotion: boolean,
) => void {
  return (ctx, width, height, ring, filters, now, reducedMotion) => {
    ctx.globalAlpha = 1;
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, width, height);
    drawBlueprintGrid(ctx, width, height);

    const spanX = WORLD_EAST - WORLD_WEST;
    const spanY = WORLD_NORTH - WORLD_SOUTH;

    for (let index = 0; index < ring.size; index += 1) {
      const incident = itemAt(ring, index);
      if (!filters[incident.payloadType]) continue;

      const age = now - incident.timestamp;
      const alpha = Math.max(0, 1 - age / 2000);
      if (age > 2000 || alpha <= 0) continue;

      const latitude = (incident.bounds.north + incident.bounds.south) * 0.5;
      const longitude = (incident.bounds.east + incident.bounds.west) * 0.5;
      const x = ((longitude - WORLD_WEST) / spanX) * width;
      const y = ((WORLD_NORTH - latitude) / spanY) * height;
      if (x < -16 || y < -16 || x > width + 16 || y > height + 16) continue;

      ctx.globalAlpha = alpha;

      if (incident.payloadType === "DDoS") {
        ctx.fillStyle = INDIGO_GLOW;
        ctx.globalAlpha = alpha * 0.38;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, FULL_TURN);
        ctx.fill();
        ctx.fillStyle = INDIGO_CORE;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, 1.7, 0, FULL_TURN);
        ctx.fill();
        continue;
      }

      if (incident.payloadType === "CanBus Injection") {
        ctx.fillStyle = ALERT_RED;
        ctx.strokeStyle = ALERT_RED;
        if (reducedMotion) {
          ctx.fillRect(x - 4, y - 4, 8, 8);
          continue;
        }

        const scale = 1 + Math.sin(now * 0.01) * 0.4;
        const spread = (scale - 0.6) / 0.8;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, FULL_TURN);
        ctx.fill();
        ctx.globalAlpha = alpha * (1 - spread);
        ctx.lineWidth = (1 - spread) * 2.5;
        ctx.beginPath();
        ctx.arc(x, y, 4 * scale, 0, FULL_TURN);
        ctx.stroke();
        continue;
      }

      ctx.fillStyle = AMBER;
      ctx.beginPath();
      ctx.moveTo(x, y - 6);
      ctx.lineTo(x + 5.4, y + 4.2);
      ctx.lineTo(x - 5.4, y + 4.2);
      ctx.closePath();
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
  };
}

function drawBlueprintGrid(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.strokeStyle = GRID;
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let x = 0; x <= width; x += GRID_STEP) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }

  for (let y = 0; y <= height; y += GRID_STEP) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }

  ctx.stroke();
}
