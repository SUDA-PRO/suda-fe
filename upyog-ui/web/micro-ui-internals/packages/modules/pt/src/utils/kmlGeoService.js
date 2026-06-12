/**
 * kmlGeoService.js
 *
 * Client-side GPS-to-ULB detection using pre-built GeoJSON ward boundaries.
 *
 * ALL data (index + per-ULB GeoJSON) is bundled as static imports at build
 * time — zero network fetches, no URL/proxy issues whatsoever.
 *
 * Export:
 *   detectULBAndWard(lat, lng) → Promise<DetectionResult | null>
 *   getAllWardsForULB(cityCode) → Promise<Array>
 */

// ── Static imports: all data bundled at build time ─────────────────────────
import geoBundle from "./geoDataBundle";

// Build a bounding-box index from the bundled GeoJSON data at module load time.
// This replaces the previously missing ulb-index.json file import.
function _extractCoords(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates[0];
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flatMap(function(poly) { return poly[0]; });
  return [];
}

function _computeBbox(featureCollection) {
  var minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (var i = 0; i < featureCollection.features.length; i++) {
    var coords = _extractCoords(featureCollection.features[i].geometry);
    for (var j = 0; j < coords.length; j++) {
      var lng = coords[j][0], lat = coords[j][1];
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return [minLng, minLat, maxLng, maxLat];
}

var ulbIndex = Object.keys(geoBundle).map(function(code) {
  return { code: code, bbox: _computeBbox(geoBundle[code]) };
});

// Module-level in-memory GeoJSON cache (populated from bundle on first use).
const _cache = { ulbs: {}, index: null };

// ── Ray-casting point-in-polygon ───────────────────────────────────────────
function _pointInRing(lat, lng, ring) {
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function _pointInGeometry(lat, lng, geometry) {
  if (!geometry) return false;
  if (geometry.type === "Polygon") {
    return _pointInRing(lat, lng, geometry.coordinates[0]);
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((poly) => _pointInRing(lat, lng, poly[0]));
  }
  return false;
}

// ── Bounding-box pre-filter ────────────────────────────────────────────────
function _bboxContains(bbox, lat, lng) {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
}

// ── Index derived from geoBundle (bbox computed from features) ────────────
function _computeBbox(geojson) {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const feature of geojson.features) {
    const coords = feature.geometry.type === "Polygon"
      ? feature.geometry.coordinates[0]
      : feature.geometry.coordinates.flat(2);
    for (const [lng, lat] of coords) {
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return [minLng, minLat, maxLng, maxLat];
}

async function _loadIndex() {
  if (_cache.index) return _cache.index;
  _cache.index = Object.keys(geoBundle).map((code) => ({
    code,
    bbox: _computeBbox(geoBundle[code]),
  }));
  return _cache.index;
}

// ── Per-ULB GeoJSON loader (uses bundled data — no fetch) ─────────────────
async function _loadULBData(code) {
  if (_cache.ulbs[code]) {
    console.log("[kmlGeo] cache hit:", code);
    return _cache.ulbs[code];
  }

  const data = geoBundle[code];
  if (data) {
    console.log("[kmlGeo] bundle hit:", code, "features:", data.features ? data.features.length : 0);
    _cache.ulbs[code] = data;
    return data;
  }

  throw new Error("[kmlGeoService] " + code + " not found in geoBundle");
}

// ── Public API ─────────────────────────────────────────────────────────────
export async function detectULBAndWard(lat, lng) {
  console.log("[kmlGeo] detectULBAndWard called lat:", lat, "lng:", lng);
  try {
    const index = await _loadIndex();
    console.log("[kmlGeo] index loaded, entries:", index.length);
    const candidates = index.filter((ulb) => _bboxContains(ulb.bbox, lat, lng));
    console.log("[kmlGeo] bbox candidates:", candidates.map(function(c){ return c.code; }));
    if (!candidates.length) { console.warn("[kmlGeo] no ULB bbox contains lat:", lat, "lng:", lng); return null; }

    const geojsons = await Promise.all(
      candidates.map((ulb) => _loadULBData(ulb.code).catch(() => null))
    );

    for (let i = 0; i < candidates.length; i++) {
      const geojson = geojsons[i];
      if (!geojson) continue;
      for (const feature of geojson.features) {
        if (_pointInGeometry(lat, lng, feature.geometry)) {
          const result = {
            cityCode:   candidates[i].code,
            wardNumber: feature.properties.wardNumber != null ? feature.properties.wardNumber : null,
            wardName:   feature.properties.wardName   != null ? feature.properties.wardName   : null,
            ulbCode:    feature.properties.ulbCode    != null ? feature.properties.ulbCode    : null,
          };
          console.log("[kmlGeo] detectULBAndWard MATCH:", result);
          return result;
        }
      }
      console.log("[kmlGeo] point-in-polygon: no matching ward in", candidates[i].code);
    }
    console.warn("[kmlGeo] detectULBAndWard: no match found for lat:", lat, "lng:", lng);
    return null;
  } catch (err) {
    console.error("[kmlGeoService] Detection failed:", err.message, err);
    return null;
  }
}

/**
 * Synchronously returns the bounding box [minLng, minLat, maxLng, maxLat]
 * for a ULB city code directly from geoBundle (no async, no network).
 * Returns null if the code is not found in the bundle.
 */
export function getULBBbox(cityCode) {
  const geo = geoBundle[cityCode];
  if (!geo || !geo.features || geo.features.length === 0) return null;
  return _computeBbox(geo);
}

/** Returns the raw GeoJSON FeatureCollection for a ULB (sync, from bundle). */
export function getULBGeoJSON(cityCode) {
  return geoBundle[cityCode] || null;
}

/**
 * Returns true if the point (lat, lng) falls inside any ward polygon of the ULB.
 * Used to restrict map pin placement to the locked tenant city.
 */
export function isPointInULB(lat, lng, cityCode) {
  const geo = geoBundle[cityCode];
  if (!geo || !geo.features) return false;
  const bbox = _computeBbox(geo);
  if (!_bboxContains(bbox, lat, lng)) return false;
  return geo.features.some((f) => f.geometry && _pointInGeometry(lat, lng, f.geometry));
}

export async function getAllWardsForULB(cityCode) {
  try {
    const geojson = await _loadULBData(cityCode);
    if (!geojson || !geojson.features) return [];
    const seen = new Set();
    const wards = [];
    for (const feature of geojson.features) {
      const wn = feature.properties.wardNumber;
      if (wn == null || seen.has(wn)) continue;
      seen.add(wn);
      const rawName = feature.properties.wardName != null ? feature.properties.wardName : null;
      const displayName = (rawName && rawName.trim()) ? rawName.trim() : ("Ward " + wn);
      wards.push({
        code:         "WARD_" + wn,
        name:         displayName,
        i18nkey:      displayName,
        label:        "Ward",
        children:     [],
        wardNumber:   wn,
        _fromGeoJSON: true,
      });
    }
    return wards.sort(function(a, b) { return a.wardNumber - b.wardNumber; });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[kmlGeoService] getAllWardsForULB failed:", err.message);
    }
    return [];
  }
}

export function prewarmCache() {
  // Index is now a static import — nothing to prewarm.
}

