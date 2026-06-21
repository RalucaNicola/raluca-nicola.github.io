// Geometry helpers for the scroll-driven story map.
//
// A port of the route-drawing math from the old ArcGIS `holiday-map` project
// (PolylineSections.ts + interpolate.ts), reworked to operate on plain
// [lng, lat] coordinate arrays so it needs no mapping-SDK dependency.

export type Coord = [number, number];

/**
 * Flatten a GeoJSON value into a single ordered list of [lng, lat] coordinates.
 * Accepts a LineString / MultiLineString geometry, a Feature wrapping one, or a
 * FeatureCollection (uses the first line-like feature). MultiLineString parts are
 * concatenated in order.
 */
export function extractLine(geojson: any): Coord[] {
  if (!geojson) return [];

  // FeatureCollection -> first feature with line geometry
  if (geojson.type === 'FeatureCollection') {
    const feature = (geojson.features ?? []).find(
      (f: any) =>
        f?.geometry?.type === 'LineString' || f?.geometry?.type === 'MultiLineString'
    );
    return feature ? extractLine(feature) : [];
  }

  // Feature -> unwrap geometry
  if (geojson.type === 'Feature') {
    return extractLine(geojson.geometry);
  }

  if (geojson.type === 'LineString') {
    return (geojson.coordinates ?? []).map((c: number[]) => [c[0], c[1]] as Coord);
  }

  if (geojson.type === 'MultiLineString') {
    return (geojson.coordinates ?? []).flatMap((part: number[][]) =>
      part.map((c) => [c[0], c[1]] as Coord)
    );
  }

  return [];
}

/** Great-circle distance between two [lng, lat] points, in metres. */
export function haversine(a: Coord, b: Coord): number {
  const R = 6371008.8; // mean Earth radius (m)
  const toRad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * toRad;
  const dLng = (b[0] - a[0]) * toRad;
  const lat1 = a[1] * toRad;
  const lat2 = b[1] * toRad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface TrackMetrics {
  /** Cumulative distance from the start to each vertex (length === coords.length). */
  xs: number[];
  /** Distance of each segment i -> i+1 (length === coords.length - 1). */
  dxs: number[];
  /** Total track length in metres. */
  total: number;
}

/** Precompute cumulative + per-segment distances along a coordinate list. */
export function cumulativeDistances(coords: Coord[]): TrackMetrics {
  const xs: number[] = [];
  const dxs: number[] = [];
  let prev: Coord | null = null;
  coords.forEach((coord, index) => {
    if (index === 0) {
      xs.push(0);
    } else {
      const d = haversine(prev as Coord, coord);
      dxs.push(d);
      xs.push(xs[index - 1] + d);
    }
    prev = coord;
  });
  return { xs, dxs, total: xs.length ? xs[xs.length - 1] : 0 };
}

/** Linearly interpolate between two coords at distance `d` into a segment of length `dx`. */
function lerp(p1: Coord, p2: Coord, d: number, dx: number): Coord {
  if (!dx) return [p1[0], p1[1]];
  const t = Math.min(Math.max(d / dx, 0), 1);
  return [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t];
}

/**
 * Return the portion of `coords` from the start up to `fraction` (0..1) of the
 * total length, interpolating the final partial segment so the line grows smoothly.
 */
export function sliceLine(
  coords: Coord[],
  metrics: TrackMetrics,
  fraction: number
): Coord[] {
  const { xs, dxs } = metrics;
  if (coords.length < 2) return coords.slice();

  const f = Math.min(Math.max(fraction, 0), 1);
  const target = xs[xs.length - 1] * f;

  const path: Coord[] = [coords[0]];
  let i = 0;
  while (i < xs.length - 1 && target > xs[i + 1]) {
    i++;
    path.push(coords[i]);
  }

  // Interpolate the tip inside segment i -> i+1.
  if (i < coords.length - 1) {
    path.push(lerp(coords[i], coords[i + 1], target - xs[i], dxs[i]));
  }

  return path;
}

/** Coordinate at `fraction` (0..1) along the track — the current "head" position. */
export function pointAt(coords: Coord[], metrics: TrackMetrics, fraction: number): Coord {
  const sliced = sliceLine(coords, metrics, fraction);
  return sliced[sliced.length - 1] ?? coords[0];
}
