import React from 'react';
import styles from './ImpactEffects.module.css';

// Helper function to format distances
function formatDistance(meters: number | null): string {
  if (meters === null) return 'N/A';
  if (meters >= 1000000) return `${(meters / 1000000).toFixed(1)} km`;
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${meters.toFixed(0)} m`;
}

// Helper function to format energy
function formatEnergy(joules: number): string {
  const mt = joules / 4.184e15; // Convert to megatons
  if (mt >= 1000) return `${(mt / 1000).toFixed(1)} Gigatons`;
  if (mt >= 1) return `${mt.toFixed(1)} Megatons`;
  return `${(mt * 1000).toFixed(1)} Kilotons`;
}

interface ImpactEffectsProps {
  effects: {
    E_Mt: number;
    airburst: boolean;
    zb_breakup: number;
    v_impact_for_crater: number;
    Rf_m: number | null;
    r_clothing_m: number;
    r_2nd_burn_m: number;
    r_3rd_burn_m: number;
    Dtc_m: number | null;
    dtc_m: number | null;
    earth_effect: 'destroyed' | 'strongly_disturbed' | 'negligible_disturbed';
    airblast_radius_building_collapse_m: number | null;
    airblast_radius_glass_shatter_m: number | null;
  };
  impactLat: number;
  impactLon: number;
}

export default function ImpactEffects({ effects, impactLat, impactLon }: ImpactEffectsProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  // Get descriptive text for earth effect
  const earthEffectText = {
    destroyed: 'Global Catastrophe - Earth Severely Affected',
    strongly_disturbed: 'Major Regional Effects - Significant Disturbance',
    negligible_disturbed: 'Local Effects - Limited Impact'
  }[effects.earth_effect];

  const earthEffectClass = {
    destroyed: styles.destroyed,
    strongly_disturbed: styles.disturbed,
    negligible_disturbed: styles.negligible
  }[effects.earth_effect];

  return (
    <div className={`${styles.effectsPanel} ${isCollapsed ? styles.collapsed : ''}`}>
      <button 
        className={styles.toggleButton} 
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Show Impact Details" : "Hide Impact Details"}
      >
        {isCollapsed ? '◀' : '▶'}
      </button>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Impact Overview</div>
        <div className={styles.dataRow}>
          <span className={styles.label}>Location</span>
          <span className={styles.value}>{impactLat.toFixed(1)}°N, {impactLon.toFixed(1)}°E</span>
        </div>
        <div className={styles.dataRow}>
          <span className={styles.label}>Impact Energy</span>
          <span className={styles.value}>{formatEnergy(effects.E_Mt * 4.184e15)}</span>
        </div>
        <div className={styles.impactType + ' ' + (effects.airburst ? styles.airburst : styles.surface)}>
          {effects.airburst ? '☁️ Airburst' : '🌋 Surface Impact'}
          {effects.airburst && (
            <span> at {formatDistance(effects.zb_breakup)} altitude</span>
          )}
        </div>
      </div>

      {/* Thermal Effects */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Thermal Effects</div>
        <div className={styles.distanceGrid}>
          {effects.r_3rd_burn_m && (
            <div className={styles.distanceCard}>
              <div className={styles.distanceValue}>{formatDistance(effects.r_3rd_burn_m)}</div>
              <div className={styles.distanceLabel}>Third Degree Burns</div>
            </div>
          )}
          {effects.r_2nd_burn_m && (
            <div className={styles.distanceCard}>
              <div className={styles.distanceValue}>{formatDistance(effects.r_2nd_burn_m)}</div>
              <div className={styles.distanceLabel}>Second Degree Burns</div>
            </div>
          )}
        </div>
      </div>

      {/* Blast Effects */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Blast Wave Effects</div>
        <div className={styles.distanceGrid}>
          {effects.airblast_radius_building_collapse_m && (
            <div className={styles.distanceCard}>
              <div className={styles.distanceValue}>
                {formatDistance(effects.airblast_radius_building_collapse_m)}
              </div>
              <div className={styles.distanceLabel}>Building Collapse</div>
            </div>
          )}
          {effects.airblast_radius_glass_shatter_m && (
            <div className={styles.distanceCard}>
              <div className={styles.distanceValue}>
                {formatDistance(effects.airblast_radius_glass_shatter_m)}
              </div>
              <div className={styles.distanceLabel}>Window Breakage</div>
            </div>
          )}
        </div>
      </div>

      {/* Crater Info (if surface impact) */}
      {!effects.airburst && effects.Dtc_m && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Crater Formation</div>
          <div className={styles.distanceGrid}>
            <div className={styles.distanceCard}>
              <div className={styles.distanceValue}>{formatDistance(effects.Dtc_m)}</div>
              <div className={styles.distanceLabel}>Crater Diameter</div>
            </div>
            {effects.dtc_m && (
              <div className={styles.distanceCard}>
                <div className={styles.distanceValue}>{formatDistance(effects.dtc_m)}</div>
                <div className={styles.distanceLabel}>Crater Depth</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Effect */}
      <div className={`${styles.earthEffect} ${earthEffectClass}`}>
        {earthEffectText}
      </div>
    </div>
  );
}
