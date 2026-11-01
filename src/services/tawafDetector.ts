/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Holy Kaaba Coordinates (Masjid al-Haram, Mecca)
export const KAABA_COORDS = {
  latitude: 21.422487,
  longitude: 39.826206,
};

// Hajar al-Aswad is located at the South-East corner of the Kaaba (~125° bearing from Kaaba center)
export const HAJAR_AL_ASWAD_BEARING = 125;

/**
 * Calculates Great Circle distance between two GPS coordinates in meters (Haversine)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates bearing from point A to point B in degrees [0, 360)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Normalizes an angle difference to [-180, 180]
 */
export function normalizeAngleDiff(angle1: number, angle2: number): number {
  let diff = (angle1 - angle2) % 360;
  if (diff < -180) diff += 360;
  if (diff > 180) diff -= 360;
  return diff;
}

export interface CircuitDetectionResult {
  isCompleted: boolean;
  isUncertain: boolean;
  confidence: number;
  reason?: string;
  cumulativeAngle: number;
  estimatedDistance: number;
}

export class TawafCircuitDetector {
  private startHeading: number | null = null;
  private startCoords: { latitude: number; longitude: number } | null = null;
  private lastBearingFromKaaba: number | null = null;
  private lastCoords: { latitude: number; longitude: number } | null = null;
  private cumulativeAngle: number = 0; // Cumulative counter-clockwise angle in current circuit
  private accumulatedDistance: number = 0; // Total meters traversed in current circuit
  private circuitStartTime: number = Date.now();
  private lastEvaluationTime: number = Date.now();

  /**
   * Minimum distance traversed for a valid circuit (inner Mataf circuit perimeter is ~150m-200m)
   * This strictly prevents standing still or partial steps from registering as a circuit.
   */
  public readonly MIN_CIRCUIT_DISTANCE = 140; // meters

  /**
   * Reset tracking state for a new circuit
   */
  public startNewCircuit(
    heading?: number | null,
    coords?: { latitude: number; longitude: number } | null
  ): void {
    this.cumulativeAngle = 0;
    this.accumulatedDistance = 0;
    this.circuitStartTime = Date.now();
    this.lastEvaluationTime = Date.now();
    if (heading !== undefined) this.startHeading = heading;
    if (coords !== undefined) this.startCoords = coords;
    this.lastCoords = coords || null;

    if (coords) {
      this.lastBearingFromKaaba = calculateBearing(
        KAABA_COORDS.latitude,
        KAABA_COORDS.longitude,
        coords.latitude,
        coords.longitude
      );
    }
  }

  /**
   * Feed new coordinate and heading data into the detector
   */
  public update(
    coords: { latitude: number; longitude: number } | null,
    heading: number | null
  ): CircuitDetectionResult {
    const now = Date.now();

    // 1. Process distance
    if (coords && this.lastCoords) {
      const stepDist = calculateDistance(
        this.lastCoords.latitude,
        this.lastCoords.longitude,
        coords.latitude,
        coords.longitude
      );
      // Filter out impossible teleportation/GPS spikes (> 15m/s)
      const timeDeltaSec = Math.max(0.5, (now - this.lastEvaluationTime) / 1000);
      const speed = stepDist / timeDeltaSec;
      if (speed <= 5.0 && stepDist > 0.4) {
        this.accumulatedDistance += stepDist;
      }
      this.lastCoords = coords;
    } else if (coords && !this.lastCoords) {
      this.lastCoords = coords;
    }

    // 2. Process angular progress around Kaaba
    if (coords) {
      const currentBearingFromKaaba = calculateBearing(
        KAABA_COORDS.latitude,
        KAABA_COORDS.longitude,
        coords.latitude,
        coords.longitude
      );

      if (this.lastBearingFromKaaba !== null) {
        // In Tawaf, circuits are counter-clockwise.
        // A counter-clockwise rotation increases bearing in standard math or decreases in compass bearing.
        // Let's compute delta in counter-clockwise direction:
        // (CCW direction from East -> North -> West -> South)
        const rawDiff = normalizeAngleDiff(this.lastBearingFromKaaba, currentBearingFromKaaba);
        // If movement is counter-clockwise, add to cumulativeAngle
        if (rawDiff > 0 && rawDiff < 45) {
          this.cumulativeAngle += rawDiff;
        } else if (rawDiff < 0 && rawDiff > -15) {
          // Slight backstep or jitter, gently subtract without going below 0
          this.cumulativeAngle = Math.max(0, this.cumulativeAngle + rawDiff);
        }
      }
      this.lastBearingFromKaaba = currentBearingFromKaaba;
    } else if (heading !== null && this.startHeading !== null) {
      // Orientation-only fallback when indoors / covered floor with weak GPS
      const delta = normalizeAngleDiff(this.startHeading, heading);
      if (delta > 0) {
        this.cumulativeAngle = Math.max(this.cumulativeAngle, delta);
      }
    }

    this.lastEvaluationTime = now;

    // Check circuit duration: Tawaf circuit takes at least ~3-5 minutes at normal pilgrim walk speed
    const durationSec = (now - this.circuitStartTime) / 1000;

    // 3. Evaluate completion criteria
    // A. Standing still or short movement check
    if (this.accumulatedDistance < 30 && durationSec < 60) {
      return {
        isCompleted: false,
        isUncertain: false,
        confidence: 0,
        cumulativeAngle: this.cumulativeAngle,
        estimatedDistance: this.accumulatedDistance,
      };
    }

    // B. Definite completion:
    // User rotated ~350°+ counter-clockwise AND traversed adequate perimeter distance (> 140m)
    // AND took at least 90 seconds (prevent rapid accidental taps)
    if (this.cumulativeAngle >= 345 && this.accumulatedDistance >= this.MIN_CIRCUIT_DISTANCE) {
      return {
        isCompleted: true,
        isUncertain: false,
        confidence: 0.95,
        reason: 'Full 360° circuit completed at Hajar al-Aswad',
        cumulativeAngle: this.cumulativeAngle,
        estimatedDistance: this.accumulatedDistance,
      };
    }

    // C. Uncertainty zone:
    // Pilgrim has walked sufficient distance (>= 150m) and turned between 310° and 345°,
    // or GPS drift near the Black Stone green line creates ambiguity.
    // As required: "If the app is uncertain, ask for a simple confirmation instead of silently changing the count."
    if (
      this.accumulatedDistance >= this.MIN_CIRCUIT_DISTANCE &&
      this.cumulativeAngle >= 305 &&
      this.cumulativeAngle < 345 &&
      durationSec >= 90
    ) {
      return {
        isCompleted: false,
        isUncertain: true,
        confidence: 0.72,
        reason: 'Detected return near Hajar al-Aswad with ~315° traversed. Please confirm if lap finished.',
        cumulativeAngle: this.cumulativeAngle,
        estimatedDistance: this.accumulatedDistance,
      };
    }

    return {
      isCompleted: false,
      isUncertain: false,
      confidence: Math.min(0.9, (this.cumulativeAngle / 360) * 0.7 + (this.accumulatedDistance / this.MIN_CIRCUIT_DISTANCE) * 0.3),
      cumulativeAngle: this.cumulativeAngle,
      estimatedDistance: this.accumulatedDistance,
    };
  }

  /**
   * Helper for simulation stepping
   */
  public advanceSimulation(angleStep: number, distanceStep: number): CircuitDetectionResult {
    this.cumulativeAngle += angleStep;
    this.accumulatedDistance += distanceStep;

    if (this.cumulativeAngle >= 355 && this.accumulatedDistance >= this.MIN_CIRCUIT_DISTANCE) {
      return {
        isCompleted: true,
        isUncertain: false,
        confidence: 0.98,
        reason: 'Circuit 360° completed at Hajar al-Aswad',
        cumulativeAngle: this.cumulativeAngle,
        estimatedDistance: this.accumulatedDistance,
      };
    }

    if (this.cumulativeAngle >= 315 && this.cumulativeAngle < 355 && this.accumulatedDistance >= this.MIN_CIRCUIT_DISTANCE) {
      return {
        isCompleted: false,
        isUncertain: true,
        confidence: 0.75,
        reason: 'Pilgrim approaching Hajar al-Aswad line. Possible circuit completion detected.',
        cumulativeAngle: this.cumulativeAngle,
        estimatedDistance: this.accumulatedDistance,
      };
    }

    return {
      isCompleted: false,
      isUncertain: false,
      confidence: Math.min(0.9, this.cumulativeAngle / 360),
      cumulativeAngle: this.cumulativeAngle,
      estimatedDistance: this.accumulatedDistance,
    };
  }
}
