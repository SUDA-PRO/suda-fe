import React, { useEffect, useRef, useState } from "react";

/**
 * PTMapPicker
 *
 * Renders an OpenStreetMap via Leaflet.  The user can click anywhere on the
 * map to drop / move a pin; the resulting latitude and longitude are reported
 * back through the `onLocationSelect` callback.
 *
 * Props:
 *   lat            {number|null}  – initial latitude  (optional)
 *   lng            {number|null}  – initial longitude (optional)
 *   onLocationSelect(lat, lng)    – called whenever the pin is placed/moved
 *   t              {function}     – i18n helper
 */
const DEFAULT_CENTER = [20.5937, 78.9629]; // centre of India
const DEFAULT_ZOOM   = 5;
const PLACED_ZOOM    = 15;
const PHOTON_URL          = "https://photon.komoot.io/api/";
const NOMINATIM_URL       = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE   = "https://nominatim.openstreetmap.org/reverse";
const OVERPASS_URL        = "https://overpass-api.de/api/interpreter";

const MAP_STRINGS = {
  PT_MAP_LOCATION_LABEL:    "Property Location on Map",
  PT_MAP_OPTIONAL_LABEL:    "optional",
  PT_MAP_SEARCH_PLACEHOLDER: "Search for a location...",
  PT_MAP_SEARCHING:         "Searching...",
  PT_MAP_SEARCH_ERROR:      "Search failed. Please try again.",
  PT_MAP_CLICK_INSTRUCTION: "Search for a location above, or click on the map to set the property location. You can also drag the pin to adjust.",
  PT_MAP_SELECTED_COORDINATES: "Selected Coordinates:",
  PT_MAP_MY_LOCATION:       "Use my current location",
  PT_MAP_GEO_NOT_SUPPORTED: "Geolocation is not supported by your browser.",
  PT_MAP_GEO_DENIED:        "Location access was denied. Please allow location permission in your browser settings and try again.",
  PT_MAP_GEO_UNAVAILABLE:   "Your location could not be determined. Please ensure Windows Location Services are enabled (Settings → Privacy → Location) and try again.",
  PT_MAP_GEO_TIMEOUT:       "Location request timed out. Please try again.",
};

const PTMapPicker = ({ lat, lng, onLocationSelect, onAddressResolve, t }) => {
  // tMap resolves i18n key; falls back to built-in English if key not yet in MDMS
  const tMap = (key) => {
    if (!t) return MAP_STRINGS[key] || key;
    const translated = t(key);
    return translated === key ? (MAP_STRINGS[key] || key) : translated;
  };

  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);
  const markerRef       = useRef(null);
  const searchDebounce  = useRef(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [pinLabel, setPinLabel] = useState(
    lat && lng
      ? `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`
      : null
  );

  /* ── Search state ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [reverseLoading, setReverseLoading] = useState(false);

  /* ── Reverse geocode a lat/lng → address components ── */
  const reverseGeocode = async (pLat, pLng) => {
    if (!onAddressResolve) return;
    setReverseLoading(true);
    try {
      // Fire Nominatim reverse + Overpass boundary query in parallel
      const nominatimParams = new URLSearchParams({
        lat: pLat, lon: pLng, format: "json", addressdetails: "1", zoom: "18",
      });

      // Overpass: find all admin boundaries that contain this point
      // admin_level 5=State 6=District 7=Tehsil 8=Municipality/ULB 9=Zone 10=Ward
      const overpassQuery = `[out:json][timeout:10];
is_in(${pLat},${pLng})->.a;
area.a["boundary"="administrative"]["admin_level"~"^(6|7|8|9|10)$"];
out tags;`;

      const [nomRes, ovRes] = await Promise.allSettled([
        fetch(`${NOMINATIM_REVERSE}?${nominatimParams}`, { headers: { "Accept-Language": "en" } }),
        fetch(OVERPASS_URL, { method: "POST", body: overpassQuery }),
      ]);

      // ── Parse Nominatim ──
      const a = (nomRes.status === "fulfilled" && nomRes.value.ok)
        ? ((await nomRes.value.json()).address || {})
        : {};

      const nomDistrict = a.state_district || a.district || a.county || "";
      const nomTehsil   = (a.county && a.county !== nomDistrict ? a.county : "") || a.state_district || "";
      const nomZone     = a.city_district || a.borough || a.suburb || a.town || a.village || "";
      const nomWard     = a.neighbourhood || a.quarter || a.residential || a.hamlet || a.isolated_dwelling || "";

      // ── Parse Overpass boundaries, keyed by admin_level ──
      let ovByLevel = {};
      if (ovRes.status === "fulfilled" && ovRes.value.ok) {
        const ovData = await ovRes.value.json();
        (ovData.elements || []).forEach((el) => {
          const lvl = el.tags && el.tags["admin_level"];
          const name = el.tags && (el.tags["name:en"] || el.tags["name"] || "");
          if (lvl && name) ovByLevel[lvl] = name;
        });
      }

      // Merge: prefer Overpass boundary names (more authoritative) over Nominatim free-text
      const district = ovByLevel["6"] || nomDistrict;
      const tehsil   = ovByLevel["7"] || nomTehsil;
      const zone     = ovByLevel["8"] || ovByLevel["9"] || nomZone;
      const ward     = ovByLevel["10"] || ovByLevel["9"] || nomWard;

      onAddressResolve({
        district,
        tehsil,
        zone,
        ward,
        pincode:     a.postcode || "",
        state:       a.state || "",
        city:        a.city || a.town || a.municipality || a.city_district || a.village || "",
        street:      a.road || a.pedestrian || a.footway || a.path || a.street || "",
        fullAddress: a.display_name || "",
      });
    } catch { /* silently ignore reverse geocode failures */ }
    finally { setReverseLoading(false); }
  };

  const placeMarker = (L, pLat, pLng) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([pLat, pLng]);
    } else {
      markerRef.current = L.marker([pLat, pLng], { draggable: true }).addTo(mapRef.current);
      markerRef.current.on("dragend", () => {
        const pos = markerRef.current.getLatLng();
        setPinLabel(`${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
        onLocationSelect(pos.lat, pos.lng);
      });
    }
    mapRef.current.setView([pLat, pLng], PLACED_ZOOM);
    setPinLabel(`${pLat.toFixed(6)}, ${pLng.toFixed(6)}`);
    onLocationSelect(pLat, pLng);
    reverseGeocode(pLat, pLng);
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSearchError(null);

    if (searchDebounce.current) clearTimeout(searchDebounce.current);

    if (!value.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchDebounce.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        // Use current map centre as bias so nearby places rank first
        const mapCenter = mapRef.current ? mapRef.current.getCenter() : { lat: 20.5937, lng: 78.9629 };

        // ── All three searches fire in parallel ──
        const [photonRes, nomRes1, nomRes2] = await Promise.allSettled([

          // 1. Photon — best fuzzy matching, India-restricted
          fetch(`${PHOTON_URL}?${new URLSearchParams({
            q: value,
            limit: "15",
            lang: "en",
            countrycode: "in",
            lat: String(mapCenter.lat),
            lon: String(mapCenter.lng),
            location_bias_scale: "0.8",
          })}`),

          // 2. Nominatim free-text, India only, deduplication off
          fetch(`${NOMINATIM_URL}?${new URLSearchParams({
            q: value,
            format: "json",
            addressdetails: "1",
            dedupe: "0",
            limit: "10",
            countrycodes: "in",
          })}`, { headers: { "Accept-Language": "en" } }),

          // 3. Nominatim structured — treats the query as a neighbourhood/suburb
          fetch(`${NOMINATIM_URL}?${new URLSearchParams({
            neighbourhood: value,
            suburb: value,
            city: "",
            country: "India",
            format: "json",
            addressdetails: "1",
            dedupe: "0",
            limit: "5",
          })}`, { headers: { "Accept-Language": "en" } }),
        ]);

        const seen = new Set();
        const merged = [];

        const addResult = (item) => {
          const key = `${parseFloat(item.lat).toFixed(4)},${parseFloat(item.lon).toFixed(4)}`;
          if (!seen.has(key)) { seen.add(key); merged.push(item); }
        };

        // Parse Photon GeoJSON
        if (photonRes.status === "fulfilled" && photonRes.value.ok) {
          const data = await photonRes.value.json();
          (data.features || []).forEach((f) => addResult({
            place_id: `${f.properties.osm_type}${f.properties.osm_id}`,
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            display_name: buildPhotonLabel(f.properties),
          }));
        }

        // Parse Nominatim free-text
        if (nomRes1.status === "fulfilled" && nomRes1.value.ok) {
          const data = await nomRes1.value.json();
          data.forEach((r) => addResult({
            place_id: r.place_id,
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            display_name: r.display_name,
          }));
        }

        // Parse Nominatim structured
        if (nomRes2.status === "fulfilled" && nomRes2.value.ok) {
          const data = await nomRes2.value.json();
          data.forEach((r) => addResult({
            place_id: `s_${r.place_id}`,
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            display_name: r.display_name,
          }));
        }

        setSearchResults(merged.slice(0, 20));
        setShowResults(true);
      } catch {
        setSearchError(tMap("PT_MAP_SEARCH_ERROR"));
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  const handleResultSelect = (result) => {
    const rLat = typeof result.lat === "number" ? result.lat : parseFloat(result.lat);
    const rLng = typeof result.lon === "number" ? result.lon : parseFloat(result.lon);
    setSearchQuery(result.display_name);
    setSearchResults([]);
    setShowResults(false);
    if (!mapRef.current) return;
    import("leaflet").then((L) => placeMarker(L, rLat, rLng));
  };

  // Build a readable label from Photon feature properties
  const buildPhotonLabel = (p) => {
    const parts = [
      p.name,
      p.housenumber ? `${p.housenumber} ${p.street || ""}`.trim() : p.street,
      p.district || p.suburb || p.village,
      p.city || p.town,
      p.state,
      p.country,
    ].filter(Boolean);
    // Deduplicate adjacent identical parts
    return parts.filter((v, i) => v !== parts[i - 1]).join(", ");
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Escape") { setShowResults(false); }
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(tMap("PT_MAP_GEO_NOT_SUPPORTED"));
      return;
    }
    setGeolocating(true);
    setGeoError(null);

    const onSuccess = (position) => {
      const gLat = position.coords.latitude;
      const gLng = position.coords.longitude;
      setGeolocating(false);
      if (!mapRef.current) return;
      import("leaflet").then((L) => placeMarker(L, gLat, gLng));
    };

    const onError = (err, retried) => {
      // If high-accuracy fails with POSITION_UNAVAILABLE, retry with low accuracy
      if (!retried && err.code === 2) {
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          (err2) => {
            setGeolocating(false);
            setGeoError(getGeoErrorMsg(err2.code));
          },
          { enableHighAccuracy: false, timeout: 10000 }
        );
        return;
      }
      setGeolocating(false);
      setGeoError(getGeoErrorMsg(err.code));
    };

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (err) => onError(err, false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getGeoErrorMsg = (code) => {
    if (code === 1) return tMap("PT_MAP_GEO_DENIED");
    if (code === 2) return tMap("PT_MAP_GEO_UNAVAILABLE");
    if (code === 3) return tMap("PT_MAP_GEO_TIMEOUT");
    return tMap("PT_MAP_GEO_UNAVAILABLE");
  };

  /* ── Load Leaflet CSS once ── */
  useEffect(() => {
    const LEAFLET_CSS_ID = "leaflet-css";
    if (!document.getElementById(LEAFLET_CSS_ID)) {
      const link = document.createElement("link");
      link.id   = LEAFLET_CSS_ID;
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }
    setLeafletReady(true);
  }, []);

  /* ── Initialise / destroy map ── */
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current) return;

    // Avoid double-init (React StrictMode / HMR)
    if (mapRef.current) return;

    import("leaflet").then((L) => {
      // Fix default icon path broken by bundlers
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initialCenter = lat && lng ? [parseFloat(lat), parseFloat(lng)] : DEFAULT_CENTER;
      const initialZoom   = lat && lng ? PLACED_ZOOM : DEFAULT_ZOOM;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom:   initialZoom,
        zoomControl: true,
        attributionControl: true,
      });

      // Remove "Leaflet" branding; keep attribution (required by licenses)
      map.attributionControl.setPrefix("");

      // ── Active tile layer: OpenStreetMap ──
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // ── Backup tile layer: CARTO Voyager (modern Google Maps-like look, free, no API key) ──
      // To switch: comment out the OSM block above and uncomment the block below.
      // L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
      //   subdomains: "abcd",
      //   maxZoom: 20,
      // }).addTo(map);

      // Place initial marker if coordinates already exist
      if (lat && lng) {
        markerRef.current = L.marker([parseFloat(lat), parseFloat(lng)], { draggable: true }).addTo(map);
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current.getLatLng();
          setPinLabel(`${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
          onLocationSelect(pos.lat, pos.lng);
        });
      }

      // Click to place / move marker
      map.on("click", (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        placeMarker(L, clickLat, clickLng);
      });

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current  = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletReady]);

  /* ── Sync external lat/lng changes (e.g. form restore) ── */
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    import("leaflet").then((L) => {
      const pos = [parseFloat(lat), parseFloat(lng)];
      if (markerRef.current) {
        markerRef.current.setLatLng(pos);
      } else {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
        markerRef.current = L.marker(pos, { draggable: true }).addTo(mapRef.current);
        markerRef.current.on("dragend", () => {
          const p = markerRef.current.getLatLng();
          setPinLabel(`${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`);
          onLocationSelect(p.lat, p.lng);
        });
      }
      mapRef.current.setView(pos, PLACED_ZOOM);
      setPinLabel(`${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return (
    <div style={{ marginTop: "8px" }}>
      {/* Search box */}
      <div style={{ position: "relative", marginBottom: "8px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInput}
            onKeyDown={handleSearchKeyDown}
            placeholder={tMap("PT_MAP_SEARCH_PLACEHOLDER")}
            style={{
              flex: 1,
              height: "40px",
              padding: "0 12px",
              border: "1px solid #b1b4b6",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {searchLoading && (
            <span style={{ fontSize: "13px", color: "#505a5f", whiteSpace: "nowrap" }}>
              {tMap("PT_MAP_SEARCHING")}
            </span>
          )}
        </div>

        {/* Autocomplete results */}
        {showResults && searchResults.length > 0 && (
          <ul
            style={{
              position: "absolute",
              top: "44px",
              left: 0,
              right: 0,
              zIndex: 10000,
              background: "#fff",
              border: "1px solid #b1b4b6",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              listStyle: "none",
              margin: 0,
              padding: "4px 0",
              maxHeight: "220px",
              overflowY: "auto",
            }}
          >
            {searchResults.map((result) => (
              <li
                key={result.place_id}
                onClick={() => handleResultSelect(result)}
                style={{
                  padding: "8px 12px",
                  fontSize: "13px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f0f0f0",
                  lineHeight: "1.4",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#EEF6FB")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                {result.display_name}
              </li>
            ))}
          </ul>
        )}

        {searchError && (
          <div style={{ color: "#d4351c", fontSize: "12px", marginTop: "4px" }}>{searchError}</div>
        )}
        {!searchLoading && !searchError && showResults && searchResults.length === 0 && searchQuery.trim() && (
          <div style={{ fontSize: "12px", color: "#505a5f", marginTop: "4px" }}>
            No results found. Try a broader search term, add the city name, or click directly on the map.
          </div>
        )}
      </div>

      {/* Instruction banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#EEF6FB",
          border: "1px solid #C3DEF0",
          borderRadius: "6px",
          padding: "8px 12px",
          marginBottom: "8px",
          fontSize: "13px",
          color: "#1a1a1a",
        }}
      >
        <span style={{ fontSize: "18px" }}>📍</span>
        <span>{tMap("PT_MAP_CLICK_INSTRUCTION")}</span>
      </div>

      {/* Map container — wrapped for relative positioning of overlay button */}
      <div style={{ position: "relative" }}>
        <div
          ref={mapContainerRef}
          style={{
            width: "100%",
            height: "320px",
            borderRadius: "8px",
            border: "1px solid #b1b4b6",
            overflow: "hidden",
            background: "#e8e8e8",
          }}
        />

        {/* My Location button */}
        <button
          type="button"
          onClick={handleMyLocation}
          disabled={geolocating}
          title={tMap("PT_MAP_MY_LOCATION")}
          style={{
            position: "absolute",
            bottom: "16px",
            right: "10px",
            zIndex: 1000,
            width: "34px",
            height: "34px",
            background: "#fff",
            border: "2px solid rgba(0,0,0,0.3)",
            borderRadius: "4px",
            cursor: geolocating ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            boxShadow: "0 1px 5px rgba(0,0,0,0.25)",
          }}
        >
          {geolocating ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
              </circle>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <line x1="12" y1="2" x2="12" y2="6"/>
              <line x1="12" y1="18" x2="12" y2="22"/>
              <line x1="2" y1="12" x2="6" y2="12"/>
              <line x1="18" y1="12" x2="22" y2="12"/>
            </svg>
          )}
        </button>
      </div>

      {geoError && (
        <div style={{ color: "#d4351c", fontSize: "12px", marginTop: "4px" }}>{geoError}</div>
      )}

      {reverseLoading && (
        <div style={{ fontSize: "12px", color: "#505a5f", fontStyle: "italic", marginTop: "4px" }}>
          Detecting address...
        </div>
      )}
    </div>
  );
};

export default PTMapPicker;
