import {
  twoline2satrec,
  propagate,
  gstime,
  eciToGeodetic,
  degreesLat,
  degreesLong,
  type SatRec,
} from 'satellite.js';
import type { TLEEntry } from './tle';

export type GeoPoint = {
  lat: number;
  lon: number;
  altKm: number;
};

export type Propagated = {
  name: string;
  position: GeoPoint | null;
};

export function satrecFromTLE(tle: TLEEntry): SatRec {
  return twoline2satrec(tle.line1, tle.line2);
}

export function geodeticFromSatrec(satrec: SatRec, date = new Date()): GeoPoint | null {
  const pv = propagate(satrec, date);
  if (!pv.position) return null;
  const gmst = gstime(date);
  const gd = eciToGeodetic(pv.position, gmst);
  return {
    lat: degreesLat(gd.latitude),
    lon: degreesLong(gd.longitude),
    altKm: gd.height,
  };
}

export function propagateMany(tles: TLEEntry[], date = new Date()): Propagated[] {
  return tles.map((tle) => {
    const rec = satrecFromTLE(tle);
    const geo = geodeticFromSatrec(rec, date);
    return { name: tle.name, position: geo };
  });
}