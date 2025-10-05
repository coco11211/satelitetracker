export type TLEEntry = {
  name: string;
  line1: string;
  line2: string;
};

// Supported groups from Celestrak TLE classic sets
export const groups = {
  stations: {
    label: 'Stations (ISS, etc.)',
    url: 'https://celestrak.org/NORAD/elements/stations.txt',
  },
  active: {
    label: 'Active',
    url: 'https://celestrak.org/NORAD/elements/active.txt',
  },
  weather: {
    label: 'Weather',
    url: 'https://celestrak.org/NORAD/elements/weather.txt',
  },
  oneweb: {
    label: 'OneWeb',
    url: 'https://celestrak.org/NORAD/elements/supplemental/oneweb.txt',
  },
  starlink: {
    label: 'Starlink',
    url: 'https://celestrak.org/NORAD/elements/starlink.txt',
  },
} as const;

export async function fetchTLEGroup(groupKey: keyof typeof groups): Promise<TLEEntry[]> {
  const u = groups[groupKey]?.url;
  if (!u) throw new Error('Unknown TLE group');
  const res = await fetch(u, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch TLEs: ${res.status}`);
  const text = await res.text();
  return parseTLEText(text);
}

export function parseTLEText(text: string): TLEEntry[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out: TLEEntry[] = [];
  for (let i = 0; i + 2 < lines.length; ) {
    const name = lines[i++];
    const line1 = lines[i++];
    const line2 = lines[i++];
    if (line1.startsWith('1 ') && line2.startsWith('2 ')) {
      out.push({ name, line1, line2 });
    } else {
      // Resync if malformed by seeking next "1 " line
      const idx1 = lines.slice(i - 2).findIndex((l) => l.startsWith('1 '));
      if (idx1 === -1) break;
      i = i - 2 + idx1;
    }
  }
  return out;
}