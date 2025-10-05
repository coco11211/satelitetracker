import React, { useEffect, useMemo, useState } from 'react';
import { SatelliteMap } from './components/SatelliteMap';
import { fetchTLEGroup, type TLEEntry, groups } from './lib/tle';

export type SatelliteRecord = {
  name: string;
  tle: TLEEntry;
};

export default function App() {
  const [group, setGroup] = useState<keyof typeof groups>('stations');
  const [tles, setTles] = useState<TLEEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTLEGroup(group);
        if (!cancelled) {
          setTles(data);
          const defaultSel = new Set(
            data.slice(0, Math.min(5, data.length)).map((d) => d.name)
          );
          setSelectedNames(defaultSel);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to fetch TLEs');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [group]);

  const selectedTLEs = useMemo(
    () => tles.filter((t) => selectedNames.has(t.name)),
    [tles, selectedNames]
  );

  return (
    <div className="app">
      <header className="app__header">
        <h1>Satellite Tracker</h1>
        <div className="controls">
          <label>
            Group:
            <select value={group} onChange={(e) => setGroup(e.target.value as any)}>
              {Object.entries(groups).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.label}
                </option>
              ))}
            </select>
          </label>
          {loading && <span className="status">Loading TLEs…</span>}
          {error && <span className="status error">{error}</span>}
        </div>
      </header>

      <main className="app__main">
        <aside className="sidebar">
          <h2>Satellites</h2>
          <div className="list">
            {tles.map((t) => (
              <label key={t.name} className="list__item">
                <input
                  type="checkbox"
                  checked={selectedNames.has(t.name)}
                  onChange={(e) => {
                    const next = new Set(selectedNames);
                    if (e.target.checked) next.add(t.name);
                    else next.delete(t.name);
                    setSelectedNames(next);
                  }}
                />
                <span title={`${t.name}\n${t.line1}\n${t.line2}`}>{t.name}</span>
              </label>
            ))}
            {!loading && tles.length === 0 && <div>No satellites found.</div>}
          </div>
        </aside>

        <section className="map__section">
          <SatelliteMap tles={selectedTLEs} />
        </section>
      </main>

      <footer className="app__footer">
        Data from Celestrak. Orbits propagated with satellite.js. Map by Leaflet.
      </footer>
    </div>
  );
}