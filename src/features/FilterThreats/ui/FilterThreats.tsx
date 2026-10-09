"use client";

import { THREAT_TYPES } from "@/entities/IncidentStream";
import { formatCount } from "@/shared/lib/format";
import { useThreatFilters } from "../model/useThreatFilters";
import styles from "./FilterThreats.module.css";

export function FilterThreats() {
  const { filters, byThreat, toggleThreat } = useThreatFilters();

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Payload type</legend>
      {THREAT_TYPES.map((threatType) => (
        <label key={threatType} className={styles.option}>
          <input
            type="checkbox"
            checked={filters[threatType]}
            onChange={() => toggleThreat(threatType)}
          />
          <span className={styles.name} data-threat={threatType}>
            {threatType}
          </span>
          <span className={styles.count}>{formatCount(byThreat[threatType])}</span>
        </label>
      ))}
    </fieldset>
  );
}
