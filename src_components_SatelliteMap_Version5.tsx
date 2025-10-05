import React, { useEffect, useMemo, useRef } from 'react';
import L, { Map as LeafletMap, Marker } from 'leaflet';
import { type TLEEntry } from '../lib/tle';
import { geodeticFromSatrec, satrecFromTLE } from '../lib/satellite';

// Fix default marker icons for bundlers
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

type Props = {
  tles: TLEEntry[];
};

export function SatelliteMap({ tles }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const satrecs = useMemo(() => tles.map((t) => ({ name: t.name, rec: satrecFromTLE(t) })), [tles]);

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      const map = L.map(containerRef.current, {
        worldCopyJump: true,
        center: [0, 0],
        zoom: 2,
        minZoom: 1,
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      }).addTo(map);
      mapRef.current = map;
    }
  }, []);

  // Sync markers with current selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove markers for deselected sats
    for (const [name, marker] of markersRef.current) {
      if (!satrecs.find((s) => s.name === name)) {
        marker.remove();
        markersRef.current.delete(name);
      }
    }

    // Add markers for newly selected sats
    for (const { name } of satrecs) {
      if (!markersRef.current.has(name)) {
        const m = L.marker([0, 0], { title: name }).addTo(map);
        m.bindTooltip(name);
        markersRef.current.set(name, m);
      }
    }
  }, [satrecs]);

  // Update positions every second
  useEffect(() => {
    let timer: number | undefined;
    let stop = false;

    const tick = () => {
      if (stop) return;
      const now = new Date();
      for (const { name, rec } of satrecs) {
        const geo = geodeticFromSatrec(rec, now);
        const marker = markersRef.current.get(name);
        if (geo && marker) {
          marker.setLatLng([geo.lat, geo.lon]);
        }
      }
      timer = window.setTimeout(tick, 1000);
    };

    tick();
    return () => {
      stop = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [satrecs]);

  return <div ref={containerRef} className="map__root" />;
}