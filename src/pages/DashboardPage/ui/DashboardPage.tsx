"use client";

import { FilterThreats } from "@/features/FilterThreats";
import { selectStreamSnapshot, useIncidentSelector, useSocketBridge } from "@/entities/IncidentStream";
import { formatCount } from "@/shared/lib/format";
import { Panel } from "@/shared/ui/Panel";
import { IncidentMap } from "@/widgets/IncidentMap";
import { LiveIncidentLog } from "@/widgets/LiveIncidentLog";
import { MetricsGrid } from "@/widgets/MetricsGrid";
import styles from "./DashboardPage.module.css";

function StreamStatus() {
  const snapshot = useIncidentSelector(selectStreamSnapshot);

  return (
    <dl className={styles.stats}>
      <div>
        <dt>Phase</dt>
        <dd className={styles.phase} data-phase={snapshot.phase}>
          {snapshot.phase}
        </dd>
      </div>
      <div>
        <dt>Ingest</dt>
        <dd>{formatCount(Math.round(snapshot.ingestRate))}/s</dd>
      </div>
      <div>
        <dt>Received</dt>
        <dd>{formatCount(snapshot.received)}</dd>
      </div>
      <div>
        <dt>Retained</dt>
        <dd>{formatCount(snapshot.retained)}</dd>
      </div>
      <div>
        <dt>Overwritten</dt>
        <dd>{formatCount(snapshot.droppedByOverflow)}</dd>
      </div>
    </dl>
  );
}

export function DashboardPage() {
  useSocketBridge();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Automotive Security Incidents</h1>
          <p className={styles.subtitle}>Live fleet attacks across DDoS, CanBus Injection, and BruteForce</p>
        </div>
        <StreamStatus />
      </header>
      <div className={styles.filters}>
        <Panel title="Threat filters">
          <FilterThreats />
        </Panel>
      </div>
      <div className={styles.map}>
        <Panel title="Fleet attack map">
          <IncidentMap />
        </Panel>
      </div>
      <div className={styles.log}>
        <Panel title="Live incident log">
          <LiveIncidentLog />
        </Panel>
      </div>
      <div className={styles.metrics}>
        <Panel title="Stream metrics">
          <MetricsGrid />
        </Panel>
      </div>
    </main>
  );
}
