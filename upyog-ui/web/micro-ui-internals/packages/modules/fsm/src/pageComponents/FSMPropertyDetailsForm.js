import React, { useEffect, useRef, useState } from "react";
import {
  CardLabel,
  Dropdown,
  RadioOrSelect,
  TextInput,
  LabelFieldPair,
  Loader,
  SubmitBar,
  CitizenInfoLabel,
} from "@upyog/digit-ui-react-components";
import { useHistory, useRouteMatch } from "react-router-dom";
import Timeline from "../components/TLTimelineInFSM";

const locationTypes = [
  { active: true, code: "WITHIN_ULB_LIMITS", i18nKey: "WITHIN_ULB_LIMITS", name: "Within ULB Limits" },
  { active: true, code: "FROM_GRAM_PANCHAYAT", i18nKey: "FROM_GRAM_PANCHAYAT", name: "From Gram Panchayat" },
];

const slumOptions = [
  { code: true, i18nKey: "CS_COMMON_YES" },
  { code: false, i18nKey: "CS_COMMON_NO" },
];

const sectionStyle = {
  background: "#fff",
  borderRadius: "14px",
  border: "1px solid #e8edf5",
  padding: "24px 28px",
  marginBottom: "20px",
  boxShadow: "0 2px 10px rgba(9,30,100,0.07)",
};

const sectionHeaderStyle = {
  fontSize: "17px",
  fontWeight: "700",
  color: "#091E64",
  marginBottom: "20px",
  paddingBottom: "12px",
  borderBottom: "1.5px solid #f0f3f9",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  letterSpacing: "0.1px",
};

const ErrorText = ({ msg }) =>
  msg ? <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>{msg}</span> : null;

// ── Custom photo upload — avoids dist CSS .upload-wrap conflicts ──
const PitPhotoUpload = ({ tenantId, pitImages, onPhotoChange }) => {
  const MAX = 3;
  const [thumbs, setThumbs] = React.useState([]);
  const [uploading, setUploading] = React.useState(false);
  const [uploadErr, setUploadErr] = React.useState(null);

  React.useEffect(() => {
    if (pitImages && pitImages.length > 0 && thumbs.length === 0) {
      Digit.UploadServices.Filefetch(pitImages, tenantId).then(res => {
        const keys = Object.keys(res.data).filter(k => k !== "fileStoreIds");
        setThumbs(keys.map(k => ({ id: k, url: (res.data[k] || "").split(",")[2] || "" })));
      }).catch(() => {});
    }
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setUploadErr("File too large (max 5 MB)"); return; }
    setUploadErr(null);
    setUploading(true);
    try {
      const res = await Digit.UploadServices.Filestorage("property-upload", file, tenantId);
      const id = res.data.files[0].fileStoreId;
      const newIds = [...(pitImages || []), id];
      onPhotoChange(newIds);
      const thumbRes = await Digit.UploadServices.Filefetch([id], tenantId);
      const keys = Object.keys(thumbRes.data).filter(k => k !== "fileStoreIds");
      if (keys.length > 0) {
        const url = (thumbRes.data[keys[0]] || "").split(",")[2] || "";
        setThumbs(prev => [...prev, { id, url }]);
      }
    } catch (err) { setUploadErr("Upload failed. Try again."); }
    setUploading(false);
  };

  const handleDelete = (id) => {
    const newIds = (pitImages || []).filter(i => i !== id);
    onPhotoChange(newIds);
    setThumbs(prev => prev.filter(t => t.id !== id));
  };

  const baseSlot = {
    width: "120px", height: "120px", borderRadius: "12px",
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: "6px", position: "relative",
    flexShrink: 0, overflow: "hidden",
  };

  return (
    <React.Fragment>
      {uploadErr && (
        <div style={{ color: "#ef4444", fontSize: "12px", marginBottom: "8px" }}>{uploadErr}</div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "flex-start" }}>
        {thumbs.map(t => (
          <div key={t.id} style={{ ...baseSlot, border: "2px solid #e5e7eb", background: "#fff" }}>
            <img src={t.url} alt="pit" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, borderRadius: "10px" }} />
            <button
              onClick={() => handleDelete(t.id)}
              style={{
                position: "absolute", top: "5px", right: "5px",
                width: "22px", height: "22px", borderRadius: "50%",
                background: "rgba(239,68,68,0.9)", border: "none",
                color: "#fff", fontSize: "15px", fontWeight: "700",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", zIndex: 2, lineHeight: 1,
              }}
            >×</button>
          </div>
        ))}
        {thumbs.length < MAX && (
          <label
            style={{
              ...baseSlot,
              border: "2px dashed #e5e7eb",
              background: "#fafbff",
              cursor: uploading ? "wait" : "pointer",
              transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "#f47738";
              e.currentTarget.style.background = "linear-gradient(145deg,#fff8f3,#fff)";
              e.currentTarget.style.boxShadow = "0 0 0 4px rgba(244,119,56,0.1)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.background = "#fafbff";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} style={{ display: "none" }} />
            {uploading ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10"/>
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            )}
            <span style={{ fontSize: "11px", fontWeight: "600", color: uploading ? "#f47738" : "#9ca3af", letterSpacing: "0.3px" }}>
              {uploading ? "Uploading…" : "Tap to upload"}
            </span>
          </label>
        )}
      </div>
    </React.Fragment>
  );
};

// ── Reusable custom searchable dropdown ──
const CustomDropdown = ({ options, optionKey, selected, onSelect, placeholder, disabled, hasError, t }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
  const getLabel = (o) => {
    if (!o) return "";
    // i18nkey is set to t(rawKey) by useBoundaryLocalities.
    // If translation exists it holds the human label; if not it holds the raw key.
    // Fall back to name when the value looks like an untranslated key (all-caps + underscores).
    if (o.i18nkey) {
      const val = o.i18nkey;
      return /^[A-Z0-9_]+$/.test(val) ? (o.name || val) : val;
    }
    if (t && o.i18nKey) return t(o.i18nKey, { defaultValue: o[optionKey] || o.i18nKey });
    return o[optionKey] || o.name || "";
  };
  const displayLabel = selected ? getLabel(selected) : "";
  const filtered = (options || []).filter((o) => getLabel(o).toLowerCase().includes(search.toLowerCase()));
  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        disabled={!!disabled}
        onClick={() => { if (!disabled) { setOpen((v) => !v); setSearch(""); } }}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "11px 14px",
          borderRadius: open ? "8px 8px 0 0" : "8px",
          border: hasError ? "1.5px solid #ef4444" : open ? "1.5px solid #f47738" : "1.5px solid #e5e7eb",
          fontSize: "14px", background: disabled ? "#f9fafb" : "#fff",
          color: disabled ? "#9ca3af" : displayLabel ? "#111827" : "#6b7280",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left", outline: "none",
          boxShadow: open ? "0 0 0 3px rgba(244,119,56,0.15)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayLabel || (placeholder || "— Select —")}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={disabled ? "#d1d5db" : "#6b7280"} strokeWidth="2.5"
          style={{ flexShrink: 0, marginLeft: "8px", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 999,
          background: "#fff",
          border: "1.5px solid #f47738", borderTop: "none",
          borderRadius: "0 0 10px 10px",
          boxShadow: "0 8px 24px rgba(9,30,100,0.13)",
          overflow: "hidden", maxHeight: "260px", display: "flex", flexDirection: "column",
        }}>
          <div style={{ padding: "8px 10px", borderBottom: "1px solid #f0f3f9", display: "flex", alignItems: "center", gap: "8px", background: "#fafbff" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, border: "none", outline: "none", fontSize: "13px", color: "#111827", background: "transparent" }}
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", lineHeight: 1, padding: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>No results found</div>
            ) : filtered.map((o, idx) => {
              const sel = selected && selected[optionKey] === o[optionKey];
              return (
                <div
                  key={o.code || o.name || idx}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onSelect(o); setOpen(false); setSearch(""); }}
                  style={{
                    padding: "10px 14px", fontSize: "14px", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: sel ? "#fff8f3" : "#fff",
                    color: sel ? "#f47738" : "#111827",
                    fontWeight: sel ? "700" : "400",
                    borderLeft: sel ? "3px solid #f47738" : "3px solid transparent",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = "#f9fafb"; }}
                  onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = "#fff"; }}
                >
                  <span>{getLabel(o)}</span>
                  {sel && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── OpenStreetMap (Leaflet) loader ──
// react-leaflet@4 requires React 18 (project is on React 17) and this package is built
// by microbundle (no CSS/asset import support), so Leaflet JS is loaded from CDN at runtime.
// CSS is injected INLINE (not from CDN) because locked-down environments (tracking
// prevention / corporate proxy / CSP) frequently block external stylesheets, which would
// leave tiles unstyled and scattered down the page.
const LEAFLET_VERSION = "1.9.4";
const LEAFLET_JS_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;

// Minimal-but-complete Leaflet layout CSS (positioning, panes, controls, attribution,
// zoom buttons). Inlined so the map never depends on an external stylesheet.
const LEAFLET_INLINE_CSS = `
.leaflet-pane,.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile-container,.leaflet-pane>svg,.leaflet-pane>canvas,.leaflet-zoom-box,.leaflet-image-layer,.leaflet-layer{position:absolute;left:0;top:0}
.leaflet-container{overflow:hidden;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;background:#ddd;-webkit-tap-highlight-color:transparent}
.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow{-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-user-drag:none}
.leaflet-marker-icon,.leaflet-marker-shadow{display:block}
.leaflet-container .leaflet-overlay-pane svg{max-width:none!important;max-height:none!important}
.leaflet-container .leaflet-marker-pane img,.leaflet-container .leaflet-shadow-pane img,.leaflet-container .leaflet-tile-pane img,.leaflet-container img.leaflet-image-layer,.leaflet-container .leaflet-tile{max-width:none!important;max-height:none!important;width:auto;padding:0}
.leaflet-tile{filter:inherit;visibility:hidden}
.leaflet-tile-loaded{visibility:inherit}
.leaflet-zoom-box{width:0;height:0;box-sizing:border-box;z-index:800}
.leaflet-pane{z-index:400}
.leaflet-tile-pane{z-index:200}
.leaflet-overlay-pane{z-index:400}
.leaflet-shadow-pane{z-index:500}
.leaflet-marker-pane{z-index:600}
.leaflet-tooltip-pane{z-index:650}
.leaflet-popup-pane{z-index:700}
.leaflet-map-pane canvas{z-index:100}
.leaflet-map-pane svg{z-index:200}
.leaflet-control{position:relative;z-index:800;pointer-events:auto;float:left;clear:both}
.leaflet-top,.leaflet-bottom{position:absolute;z-index:1000;pointer-events:none}
.leaflet-top{top:0}.leaflet-right{right:0}.leaflet-bottom{bottom:0}.leaflet-left{left:0}
.leaflet-right .leaflet-control{float:right;margin-right:10px}
.leaflet-top .leaflet-control{margin-top:10px}
.leaflet-bottom .leaflet-control{margin-bottom:10px}
.leaflet-left .leaflet-control{margin-left:10px}
.leaflet-bar{box-shadow:0 1px 5px rgba(0,0,0,0.65);border-radius:4px}
.leaflet-bar a{background:#fff;border-bottom:1px solid #ccc;width:26px;height:26px;line-height:26px;display:block;text-align:center;text-decoration:none;color:#000;font-size:18px;font-weight:700}
.leaflet-bar a:hover{background:#f4f4f4}
.leaflet-bar a:first-child{border-top-left-radius:4px;border-top-right-radius:4px}
.leaflet-bar a:last-child{border-bottom-left-radius:4px;border-bottom-right-radius:4px;border-bottom:none}
.leaflet-control-attribution{background:rgba(255,255,255,0.7);margin:0;padding:0 5px;color:#333;font-size:11px}
.leaflet-control-attribution a{color:#0078A8;text-decoration:none}
.leaflet-container a.leaflet-control-attribution{color:#0078A8}
.leaflet-grab{cursor:grab;cursor:-webkit-grab}
.leaflet-dragging .leaflet-grab,.leaflet-dragging .leaflet-grab .leaflet-interactive{cursor:grabbing;cursor:-webkit-grabbing}
.leaflet-marker-icon.leaflet-interactive,.leaflet-image-layer.leaflet-interactive,.leaflet-pane>svg path.leaflet-interactive{cursor:pointer}
.leaflet-fade-anim .leaflet-tile{will-change:opacity}
.leaflet-zoom-anim .leaflet-zoom-animated{transition:transform .25s cubic-bezier(0,0,0.25,1)}
`;

const injectLeafletCss = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("leaflet-inline-css")) return;
  const style = document.createElement("style");
  style.id = "leaflet-inline-css";
  style.textContent = LEAFLET_INLINE_CSS;
  document.head.appendChild(style);
};

// Inline SVG pin — avoids depending on Leaflet's marker PNG images (also CDN-blocked).
const MARKER_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">' +
  '<path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 26 14 26S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="#f47738"/>' +
  '<circle cx="14" cy="14" r="6" fill="#fff"/></svg>';

let leafletLoaderPromise = null;
const loadLeaflet = () => {
  injectLeafletCss();
  if (typeof window !== "undefined" && window.L) return Promise.resolve(window.L);
  if (leafletLoaderPromise) return leafletLoaderPromise;
  leafletLoaderPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-leaflet="1"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.L));
      existingScript.addEventListener("error", reject);
      if (window.L) resolve(window.L);
      return;
    }
    const script = document.createElement("script");
    script.src = LEAFLET_JS_URL;
    script.async = true;
    script.setAttribute("data-leaflet", "1");
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.body.appendChild(script);
  });
  return leafletLoaderPromise;
};

const OpenStreetMapPicker = ({ value, onChange, onAddressFill, t }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const setPointRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onAddressFillRef = useRef(onAddressFill);
  onAddressFillRef.current = onAddressFill;
  const [error, setError] = useState(false);

  const reverseGeocode = (lat, lng) => {
    if (!onAddressFillRef.current) return;
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    )
      .then((r) => r.json())
      .then((data) => {
        const a = data.address || {};
        onAddressFillRef.current({
          pincode:  a.postcode   || "",
          street:   a.road || a.street || a.pedestrian || "",
          doorNo:   a.house_number || "",
          landmark: a.neighbourhood || a.suburb || a.city_district || a.village || a.town || "",
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        const hasValue = value && value.latitude && value.longitude;
        const center = hasValue ? [Number(value.latitude), Number(value.longitude)] : [21.2514, 81.6296];
        const map = L.map(containerRef.current).setView(center, hasValue ? 15 : 7);
        mapRef.current = map;
        // Remove the "Leaflet" branding prefix (keep OSM attribution per tile policy).
        if (map.attributionControl) map.attributionControl.setPrefix("");

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        const icon = L.divIcon({
          html: MARKER_SVG,
          className: "",
          iconSize: [28, 40],
          iconAnchor: [14, 40],
          popupAnchor: [0, -36],
        });

        const setPoint = (lat, lng, recenter) => {
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            const marker = L.marker([lat, lng], { draggable: true, icon }).addTo(map);
            marker.on("dragend", () => {
              const p = marker.getLatLng();
              onChangeRef.current({ latitude: p.lat, longitude: p.lng });
              reverseGeocode(p.lat, p.lng);
            });
            markerRef.current = marker;
          }
          if (recenter) map.setView([lat, lng], 16);
          onChangeRef.current({ latitude: lat, longitude: lng });
          reverseGeocode(lat, lng);
        };
        setPointRef.current = setPoint;

        if (hasValue) setPoint(Number(value.latitude), Number(value.longitude));
        map.on("click", (e) => setPoint(e.latlng.lat, e.latlng.lng));
        // Recalculate size once the container is laid out — prevents tiles
        // rendering outside the box (grey/blank or misaligned map).
        const fixSize = () => mapRef.current && map.invalidateSize();
        requestAnimationFrame(fixSize);
        [100, 350, 800].forEach((ms) => setTimeout(fixSize, ms));
      })
      .catch(() => setError(true));

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        setPointRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation || !setPointRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setPointRef.current(pos.coords.latitude, pos.coords.longitude, true),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const hasValue = value && value.latitude && value.longitude;

  return (
    <div style={{ marginBottom: "16px" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
        <span style={{ fontSize: "15px", fontWeight: "700", color: "#091E64", letterSpacing: "0.1px" }}>
          {t("CS_ADDCOMPLAINT_SELECT_GEOLOCATION_HEADER", { defaultValue: "Pin Property Location on Map" })}
        </span>
        <span style={{ fontSize: "11px", color: "#6b7280", background: "#f0f4ff", border: "1px solid #d1d9f0", borderRadius: "20px", padding: "1px 8px", marginLeft: "2px" }}>
          {t("CS_COMMON_OPTIONAL", { defaultValue: "Optional" })}
        </span>
      </div>
      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {t("FSM_MAP_PICK_HINT", { defaultValue: "Click on the map or drag the marker to set the property location. Address fields will be filled automatically." })}
      </div>

      {error ? (
        <div style={{ padding: "14px 16px", background: "#fff5f5", border: "1px solid #fecaca", borderRadius: "10px", color: "#dc2626", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {t("FSM_MAP_LOAD_ERROR", { defaultValue: "Unable to load map. Please check your internet connection." })}
        </div>
      ) : (
        <React.Fragment>
          {/* Map container with styled border */}
          <div style={{ borderRadius: "12px", overflow: "hidden", border: "1.5px solid #d1d9f0", boxShadow: "0 2px 8px rgba(9,30,100,0.08)" }}>
            <div
              ref={containerRef}
              style={{ height: "340px", width: "100%", display: "block", zIndex: 0 }}
            />
          </div>

          {/* Footer row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px", flexWrap: "wrap", gap: "8px" }}>
            {/* Coordinates pill */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px",
                background: hasValue ? "#f0fdf4" : "#f9fafb",
                border: `1px solid ${hasValue ? "#86efac" : "#e5e7eb"}`,
                borderRadius: "20px", padding: "5px 12px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={hasValue ? "#16a34a" : "#9ca3af"} strokeWidth="2">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              </svg>
              <span style={{ fontSize: "12px", fontWeight: hasValue ? "600" : "400", color: hasValue ? "#15803d" : "#9ca3af" }}>
                {hasValue
                  ? `${Number(value.latitude).toFixed(5)}, ${Number(value.longitude).toFixed(5)}`
                  : t("FSM_MAP_NO_SELECTION", { defaultValue: "No location selected yet" })}
              </span>
            </div>

            {/* Use My Location button */}
            <button
              type="button"
              onClick={useMyLocation}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "linear-gradient(135deg, #f47738 0%, #e8621f 100%)",
                border: "none", color: "#fff",
                padding: "7px 16px", borderRadius: "20px",
                cursor: "pointer", fontWeight: 600, fontSize: "13px",
                boxShadow: "0 2px 6px rgba(244,119,56,0.35)",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8"/>
              </svg>
              {t("FSM_MAP_USE_MY_LOCATION", { defaultValue: "Use My Current Location" })}
            </button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

const FSMPropertyDetailsForm = ({ config, onSelect, t, formData }) => {
  const history = useHistory();
  const { url } = useRouteMatch();
  const stateId = Digit.ULBService.getStateId();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const allCities = Digit.Hooks.fsm.useTenants();

  const mdmsSelect = (items) => items.map((item) => ({ ...item, i18nKey: t(item.i18nKey) }));

  const { data: propertyTypes, isLoading: ptLoading } = Digit.Hooks.fsm.useMDMS(stateId, "FSM", "PropertyType", { select: mdmsSelect });
  const { data: propertySubtypes, isLoading: pstLoading } = Digit.Hooks.fsm.useMDMS(stateId, "FSM", "PropertySubtype", { select: mdmsSelect });
  const { data: pitTypes, isLoading: pitLoading } = Digit.Hooks.fsm.useMDMS(stateId, "FSM", "PitType");

  // ── Restore from session storage when coming back from a later step ──
  // formData is only populated when onSelect has been called; session storage is the
  // authoritative store when navigating back (since handleSubmit writes there directly).
  const _ss = Digit.SessionStorage.get("FSM_CITIZEN_FILE_PROPERTY") || {};
  const _saved = formData?.propertyType ? formData : _ss;

  // ── Form State ──
  const [propertyType, setPropertyType] = useState(_saved?.propertyType || null);
  const [subtype, setSubtype] = useState(_saved?.subtype || null);
  const [subtypeOptions, setSubtypeOptions] = useState([]);

  const [city, setCity] = useState(
    _saved?.address?.city || Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY") || null
  );
  const [locationType, setLocationType] = useState(_saved?.address?.propertyLocation || locationTypes[0]);
  const [locality, setLocality] = useState(_saved?.address?.locality || null);
  const [localities, setLocalities] = useState([]);
  const [gramPanchayat, setGramPanchayat] = useState(_saved?.address?.gramPanchayat || null);
  const [gramPanchayats, setGramPanchayats] = useState([]);
  const [village, setVillage] = useState(_saved?.address?.village || null);
  const [villages, setVillages] = useState([]);

  const [slumCheck, setSlumCheck] = useState(_saved?.address?.slumArea || null);
  const [slumName, setSlumName] = useState(_saved?.address?.slumData || null);
  const [slumMenu, setSlumMenu] = useState([]);

  const [pincode, setPincode] = useState(_saved?.address?.pincode || "");
  const [street, setStreet] = useState(_saved?.address?.street || "");
  const [doorNo, setDoorNo] = useState(_saved?.address?.doorNo || "");
  const [landmark, setLandmark] = useState(_saved?.address?.landmark || "");

  const [pitType, setPitType] = useState(_saved?.pitType || null);
  const [pitImages, setPitImages] = useState(_saved?.pitDetail?.images || null);
  const [roadWidth, setRoadWidth] = useState(_saved?.roadWidth?.roadWidth || "");
  const [distanceFromRoad, setDistanceFromRoad] = useState(_saved?.roadWidth?.distancefromroad || "");

  const [geoLocation, setGeoLocation] = useState(_saved?.address?.geoLocation || {});
  const [newLocality, setNewLocality] = useState(_saved?.address?.newLocality || "");
  const [newGp, setNewGp] = useState(_saved?.address?.newGramPanchayat || "");
  const [newVillage, setNewVillage] = useState(_saved?.address?.newVillage || "");

  const [errors, setErrors] = useState({});
  const [subtypeOpen, setSubtypeOpen] = useState(false);
  const [subtypeSearch, setSubtypeSearch] = useState("");
  const subtypeRef = useRef(null);
  useEffect(() => {
    if (!subtypeOpen) return;
    const handleClick = (e) => {
      if (subtypeRef.current && !subtypeRef.current.contains(e.target)) setSubtypeOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [subtypeOpen]);

  // ── Fetch boundary localities when city changes ──
  const { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
    city?.code,
    "revenue",
    { enabled: !!city },
    t
  );
  const { data: fetchedGramPanchayats } = Digit.Hooks.useBoundaryLocalities(
    city?.code,
    "gramPanchayats",
    { enabled: !!city },
    t
  );

  const slumTenantId = city?.code || tenantId;
  const { data: slumData } = Digit.Hooks.fsm.useMDMS(slumTenantId, "FSM", "Slum");
  const { data: urcConfig } = Digit.Hooks.fsm.useMDMS(city?.code || tenantId, "FSM", "UrcConfig");
  const isUrcEnable = urcConfig && urcConfig.length > 0 && urcConfig[0].URCEnable;
  const showGp = isUrcEnable && locationType?.code === "FROM_GRAM_PANCHAYAT";
  const showLocality = !showGp;

  useEffect(() => {
    if (fetchedLocalities) {
      setLocalities(fetchedLocalities);
    }
  }, [fetchedLocalities]);

  useEffect(() => {
    if (fetchedGramPanchayats) {
      setGramPanchayats(fetchedGramPanchayats);
    }
  }, [fetchedGramPanchayats]);

  useEffect(() => {
    if (gramPanchayat && fetchedGramPanchayats) {
      const gp = fetchedGramPanchayats.find((g) => g.code === gramPanchayat?.code);
      if (gp?.children) setVillages(gp.children);
    }
  }, [gramPanchayat, fetchedGramPanchayats]);

  useEffect(() => {
    if (propertySubtypes && propertyType) {
      const filtered = propertySubtypes.filter(
        (item) => item.propertyType === (propertyType?.code || propertyType)
      );
      setSubtypeOptions(filtered);
      if (subtype && !filtered.find((s) => s.code === subtype?.code)) {
        setSubtype(null);
      }
    }
  }, [propertyType, propertySubtypes]);

  useEffect(() => {
    if (slumData) {
      if (showLocality) {
        const localityCode = locality?.code;
        if (localityCode && slumData[localityCode]) {
          setSlumMenu(slumData[localityCode]);
        } else {
          const allSlums = Object.keys(slumData)
            .map((key) => slumData[key])
            .reduce((prev, curr) => [...prev, ...curr], []);
          setSlumMenu(allSlums);
        }
      } else {
        // GP flow — load all slums across all localities
        const allSlums = Object.keys(slumData)
          .map((key) => slumData[key])
          .reduce((prev, curr) => [...prev, ...curr], []);
        setSlumMenu(allSlums);
      }
    }
  }, [slumData, locationType, locality, showLocality, showGp]);

  // ── Validation ──
  const validate = () => {
    const errs = {};
    if (!propertyType) errs.propertyType = t("CS_PROPERTY_TYPE_REQUIRED");
    if (subtypeOptions.length > 0 && !subtype) errs.subtype = t("CS_SUBTYPE_REQUIRED");
    if (!city) errs.city = t("CS_CITY_REQUIRED");
    if (showGp) {
      if (!gramPanchayat || !gramPanchayat?.code) errs.gramPanchayat = t("CS_GP_REQUIRED");
      else if (gramPanchayat?.name === "Other" && !newGp?.trim()) errs.newGp = t("ES_INBOX_PLEASE_SPECIFY_GRAM_PANCHAYAT");
    } else {
      if (!locality) errs.locality = t("CS_LOCALITY_REQUIRED");
      else if (locality?.name === "Other" && !newLocality?.trim()) errs.newLocality = t("ES_INBOX_PLEASE_SPECIFY_LOCALITY");
    }
    if (slumCheck === null || slumCheck === undefined) errs.slumCheck = t("CS_SLUM_CHECK_REQUIRED", { defaultValue: "Please select Yes or No" });
    if (slumCheck?.code === true && (slumMenu.length > 0 || !!slumName) && !slumName) errs.slumName = t("CS_SLUM_NAME_REQUIRED", { defaultValue: "Please select a slum" });
    if (pincode && !/^[1-9][0-9]{5}$/.test(pincode)) errs.pincode = t("CORE_COMMON_PINCODE_INVALID");
    else if (pincode && !allCities?.some((c) => c?.pincode?.some((p) => p == pincode))) errs.pincode = t("CS_COMMON_PINCODE_NOT_SERVICABLE");
    if (street && !/^[a-zA-Z0-9 ]{1,255}$/.test(street)) errs.street = t("CORE_COMMON_STREET_INVALID");
    if (doorNo && !/^[A-Za-z0-9#,\/ -]{1,63}$/.test(doorNo)) errs.doorNo = t("CORE_COMMON_DOOR_INVALID");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const isFormComplete = !!propertyType &&
    (subtypeOptions.length === 0 || !!subtype) &&
    !!city &&
    (showGp ? (!!gramPanchayat?.code) : !!locality) &&
    (slumCheck !== null && slumCheck !== undefined) &&
    (slumCheck?.code === true && (slumMenu.length > 0 || !!slumName) ? !!slumName : true);

  // ── Submit: write directly to session storage, then navigate to check ──
  const handleSubmit = () => {
    if (!validate()) return;

    const existingParams = Digit.SessionStorage.get("FSM_CITIZEN_FILE_PROPERTY") || {};
    const isFromGp = showGp;
    const isWithinUlb = !showGp;
    const updatedParams = {
      ...existingParams,
      propertyType,
      subtype,
      address: {
        city,
        propertyLocation: locationType,
        geoLocation: { latitude: geoLocation?.latitude, longitude: geoLocation?.longitude },
        locality: isWithinUlb ? locality : null,
        newLocality: isWithinUlb ? newLocality : null,
        gramPanchayat: isFromGp ? gramPanchayat : null,
        newGramPanchayat: isFromGp ? newGp : null,
        village: isFromGp ? village : null,
        newVillage: isFromGp ? newVillage : null,
        pincode,
        street,
        doorNo,
        landmark,
        slumArea: slumCheck,
        slum: slumCheck?.code === true ? slumName?.code || null : null,
        slumData: slumCheck?.code === true ? slumName || null : null,
      },
      pitType,
      pitDetail: pitImages && pitImages.length ? { images: pitImages } : undefined,
      roadWidth: {
        roadWidth,
        distancefromroad: distanceFromRoad,
      },
      source: "ONLINE",
    };

    Digit.SessionStorage.set("FSM_CITIZEN_FILE_PROPERTY", updatedParams);

    // Navigate to payment step
    const paymentPath = url.replace(/\/[^/]+$/, "/select-payment-preference");
    history.push(paymentPath);
  };

  if (ptLoading || pstLoading || pitLoading) return <Loader />;

  return (
    <React.Fragment>
      <Timeline currentStep={1} flow="APPLY" />
      <div style={{ padding: "16px 0", maxWidth: "900px" }}>

        {/* ── Section 1: Property Details ── */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>{t("ES_TITLE_APPLICATION_DETAILS")}</div>

          {/* Property Type — card grid */}
          <div style={{ marginBottom: "4px" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#0b0c0c", marginBottom: "12px" }}>
              {t("CS_FILE_APPLICATION_PROPERTY_LABEL")}
              <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {(propertyTypes || []).map((opt) => {
                const selected = propertyType?.code === opt.code;
                const icons = {
                  RESIDENTIAL:   (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>),
                  COMMERCIAL:    (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="1"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>),
                  INSTITUTIONAL: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L2 7h20L12 2z"/><rect x="4" y="7" width="16" height="13"/><rect x="9" y="12" width="6" height="8"/></svg>),
                  INDUSTRIAL:    (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="10" width="20" height="11"/><path d="M6 10V6l4 4V6l4 4V6l4 4"/></svg>),
                };
                const icon = icons[opt.code?.toUpperCase()] || (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                );
                return (
                  <div
                    key={opt.code}
                    onClick={() => { setPropertyType(opt); setSubtype(null); }}
                    style={{
                      flex: "1 1 120px", minWidth: "110px", maxWidth: "160px",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      gap: "10px", padding: "16px 12px",
                      borderRadius: "12px", cursor: "pointer",
                      border: selected ? "2px solid #f47738" : "1.5px solid #e5e7eb",
                      background: selected ? "#fff8f3" : "#fff",
                      boxShadow: selected ? "0 0 0 3px rgba(244,119,56,0.15)" : "0 1px 3px rgba(0,0,0,0.06)",
                      color: selected ? "#f47738" : "#4b5563",
                      transition: "all 0.15s",
                      userSelect: "none",
                    }}
                    onMouseEnter={(e) => { if (!selected) e.currentTarget.style.borderColor = "#f47738"; }}
                    onMouseLeave={(e) => { if (!selected) e.currentTarget.style.borderColor = "#e5e7eb"; }}
                  >
                    <div style={{ color: selected ? "#f47738" : "#6b7280" }}>{icon}</div>
                    <span style={{ fontSize: "13px", fontWeight: selected ? "700" : "500", textAlign: "center", lineHeight: "1.3" }}>
                      {opt.i18nKey}
                    </span>
                    {selected && (
                      <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#f47738", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <ErrorText msg={errors.propertyType} />

          {/* Property Sub-Type — custom dropdown, disabled until a type is chosen */}
          <div style={{ marginTop: "24px" }} ref={subtypeRef}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#0b0c0c", marginBottom: "8px" }}>
              {t("CS_FILE_APPLICATION_PROPERTY_SUBTYPE_LABEL")}
              <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
            </div>
            <div style={{ position: "relative" }}>
              {/* Trigger button */}
              <button
                type="button"
                disabled={!propertyType}
                onClick={() => { if (propertyType) { setSubtypeOpen((o) => !o); setSubtypeSearch(""); } }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "11px 14px",
                  borderRadius: subtypeOpen ? "8px 8px 0 0" : "8px",
                  border: errors.subtype ? "1.5px solid #ef4444" : subtypeOpen ? "1.5px solid #f47738" : "1.5px solid #e5e7eb",
                  fontSize: "14px", background: !propertyType ? "#f9fafb" : "#fff",
                  color: !propertyType ? "#9ca3af" : subtype ? "#111827" : "#6b7280",
                  cursor: !propertyType ? "not-allowed" : "pointer",
                  textAlign: "left", outline: "none",
                  boxShadow: subtypeOpen ? "0 0 0 3px rgba(244,119,56,0.15)" : "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
              >
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {subtype
                    ? subtype.i18nKey
                    : !propertyType
                      ? t("CS_SELECT_PROPERTY_TYPE_FIRST", { defaultValue: "Select a property type first" })
                      : t("CS_SELECT_SUBTYPE_PLACEHOLDER", { defaultValue: "Select sub-type" })}
                </span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke={!propertyType ? "#d1d5db" : "#6b7280"} strokeWidth="2.5"
                  style={{ flexShrink: 0, marginLeft: "8px", transform: subtypeOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* Dropdown panel */}
              {subtypeOpen && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 999,
                  background: "#fff",
                  border: "1.5px solid #f47738", borderTop: "none",
                  borderRadius: "0 0 10px 10px",
                  boxShadow: "0 8px 24px rgba(9,30,100,0.13)",
                  overflow: "hidden",
                  maxHeight: "280px", display: "flex", flexDirection: "column",
                }}>
                  {/* Search box */}
                  <div style={{ padding: "8px 10px", borderBottom: "1px solid #f0f3f9", display: "flex", alignItems: "center", gap: "8px", background: "#fafbff" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      autoFocus
                      type="text"
                      placeholder={t("CS_COMMON_SEARCH", { defaultValue: "Search..." })}
                      value={subtypeSearch}
                      onChange={(e) => setSubtypeSearch(e.target.value)}
                      style={{
                        flex: 1, border: "none", outline: "none",
                        fontSize: "13px", color: "#111827", background: "transparent",
                      }}
                    />
                    {subtypeSearch && (
                      <button type="button" onClick={() => setSubtypeSearch("")} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", lineHeight: 1, padding: 0 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}
                  </div>
                  {/* Options list */}
                  <div style={{ overflowY: "auto", flex: 1 }}>
                    {subtypeOptions
                      .filter((o) => o.i18nKey?.toLowerCase().includes(subtypeSearch.toLowerCase()))
                      .map((o) => {
                        const sel = subtype?.code === o.code;
                        return (
                          <div
                            key={o.code}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { setSubtype(o); setSubtypeOpen(false); setSubtypeSearch(""); }}
                            style={{
                              padding: "10px 14px", fontSize: "14px", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              background: sel ? "#fff8f3" : "#fff",
                              color: sel ? "#f47738" : "#111827",
                              fontWeight: sel ? "700" : "400",
                              borderLeft: sel ? "3px solid #f47738" : "3px solid transparent",
                              transition: "background 0.1s",
                            }}
                            onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = "#f9fafb"; }}
                            onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = "#fff"; }}
                          >
                            <span>{o.i18nKey}</span>
                            {sel && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            )}
                          </div>
                        );
                      })}
                    {subtypeOptions.filter((o) => o.i18nKey?.toLowerCase().includes(subtypeSearch.toLowerCase())).length === 0 && (
                      <div style={{ padding: "16px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>
                        {t("CS_COMMON_NO_RESULTS", { defaultValue: "No results found" })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <ErrorText msg={errors.subtype} />
          </div>

          {propertyType && (
            <div style={{
              marginTop: "20px",
              background: "linear-gradient(135deg, #fffbf7 0%, #fff4ec 100%)",
              border: "1px solid #fcd9bc",
              borderLeft: "4px solid #f47738",
              borderRadius: "10px",
              padding: "14px 16px",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}>
              <div style={{ flexShrink: 0, marginTop: "1px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#f47738", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/><circle cx="12" cy="12" r="10"/></svg>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#c2400c", marginBottom: "3px" }}>
                  {t("CS_FILE_APPLICATION_INFO_LABEL", { defaultValue: "Info" })}
                </div>
                <div style={{ fontSize: "13px", color: "#7c3b10", lineHeight: "1.5" }}>
                  {t("CS_FILE_APPLICATION_INFO_TEXT", { content: t("CS_DEFAULT_INFO_TEXT"), ...propertyType })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 2: Location ── */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            {t("ES_NEW_APPLICATION_LOCATION_DETAILS")}
          </div>

          {/* Location type toggle */}
          {isUrcEnable && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "10px" }}>
                {t("CS_PROPERTY_LOCATION", { defaultValue: "Property Location" })}
                <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                {locationTypes.map((lt) => {
                  const sel = locationType?.code === lt.code;
                  const icons = {
                    WITHIN_ULB_LIMITS: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                      </svg>
                    ),
                    FROM_GRAM_PANCHAYAT: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    ),
                  };
                  return (
                    <button
                      key={lt.code}
                      type="button"
                      onClick={() => {
                        setLocationType(lt);
                        setLocality(null); setGramPanchayat(null); setVillage(null);
                        setNewLocality(""); setNewGp(""); setNewVillage("");
                        setSlumCheck(null); setSlumName(null);
                      }}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                        gap: "8px", padding: "12px 10px", borderRadius: "10px",
                        border: sel ? "2px solid #f47738" : "2px solid #e5e7eb",
                        background: sel ? "#fff8f3" : "#fafbff",
                        color: sel ? "#f47738" : "#6b7280",
                        fontWeight: sel ? "700" : "500", fontSize: "13px",
                        cursor: "pointer", transition: "all 0.15s",
                        boxShadow: sel ? "0 2px 8px rgba(244,119,56,0.15)" : "none",
                      }}
                    >
                      {icons[lt.code]}
                      {t(lt.i18nKey, { defaultValue: lt.name })}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* City */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              {t("MYCITY_CODE_LABEL")}
              <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
            </div>
            <CustomDropdown
              options={allCities || []}
              optionKey="i18nKey"
              selected={city}
              onSelect={(val) => { setCity(val); setLocality(null); setGramPanchayat(null); setVillage(null); setNewLocality(""); setNewGp(""); setNewVillage(""); }}
              placeholder="— Select city —"
              hasError={!!errors.city}
              t={t}
            />
            <ErrorText msg={errors.city} />
          </div>

          {/* WITHIN_ULB_LIMITS → Locality */}
          {showLocality && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                {t("CS_CREATECOMPLAINT_MOHALLA")}
                <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
              </div>
              <CustomDropdown
                options={(localities || []).slice().sort((a, b) => (a?.name || "").localeCompare(b?.name || ""))}
                optionKey="name"
                selected={locality}
                onSelect={(val) => { setLocality(val); setNewLocality(""); }}
                placeholder="— Select locality —"
                hasError={!!errors.locality}
                t={t}
              />
              <ErrorText msg={errors.locality} />
              {locality?.name === "Other" && (
                <div style={{ marginTop: "16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                    {t("ES_INBOX_PLEASE_SPECIFY_LOCALITY")}
                    <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
                  </div>
                  <TextInput id="newLocality" value={newLocality} onChange={(e) => setNewLocality(e.target.value)} />
                  <ErrorText msg={errors.newLocality} />
                </div>
              )}
            </div>
          )}

          {/* FROM_GRAM_PANCHAYAT → GP + Village */}
          {showGp && (
            <React.Fragment>
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                  {t("CS_GRAM_PANCHAYAT")}
                  <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
                </div>
                <CustomDropdown
                  options={(gramPanchayats || []).slice().sort((a, b) => (a?.name || "").localeCompare(b?.name || ""))}
                  optionKey="name"
                  selected={gramPanchayat}
                  onSelect={(val) => { setGramPanchayat(val); setVillage(null); setNewVillage(""); setNewGp(""); }}
                  placeholder="— Select gram panchayat —"
                  hasError={!!errors.gramPanchayat}
                  t={t}
                />
                <ErrorText msg={errors.gramPanchayat} />
              </div>
              {gramPanchayat?.name === "Other" && (
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                    {t("ES_INBOX_PLEASE_SPECIFY_GRAM_PANCHAYAT")}
                    <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
                  </div>
                  <TextInput id="newGp" value={newGp} onChange={(e) => setNewGp(e.target.value)} />
                  <ErrorText msg={errors.newGp} />
                </div>
              )}
              {gramPanchayat?.code && (
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                    {t("CS_VILLAGE_NAME")}
                  </div>
                  {villages.length > 0 ? (
                    <CustomDropdown
                      options={villages.slice().sort((a, b) => (a?.name || "").localeCompare(b?.name || ""))}
                      optionKey="i18nkey"
                      selected={village}
                      onSelect={setVillage}
                      placeholder="— Select village —"
                      t={t}
                    />
                  ) : (
                    <TextInput id="newVillage" value={newVillage} onChange={(e) => setNewVillage(e.target.value)} />
                  )}
                </div>
              )}
            </React.Fragment>
          )}

          {/* Slum check */}
          <div style={{ marginBottom: "4px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "10px" }}>
                {t("ES_NEW_APPLICATION_SLUM_CHECK", { defaultValue: "Is your property located in a notified slum area?" })}
                <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
              </div>
              <div style={{ display: "flex", gap: "10px", maxWidth: "300px" }}>
                {slumOptions.map((opt) => {
                  const sel = slumCheck?.code === opt.code;
                  return (
                    <button
                      key={String(opt.code)}
                      type="button"
                      onClick={() => { setSlumCheck(opt); setSlumName(null); }}
                      style={{
                        flex: 1, padding: "10px 0", borderRadius: "8px",
                        border: sel ? "2px solid #f47738" : "2px solid #e5e7eb",
                        background: sel ? "#fff8f3" : "#fafbff",
                        color: sel ? "#f47738" : "#6b7280",
                        fontWeight: sel ? "700" : "500", fontSize: "14px",
                        cursor: "pointer", transition: "all 0.15s",
                        boxShadow: sel ? "0 2px 8px rgba(244,119,56,0.12)" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      }}
                    >
                      {sel && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                      {t(opt.i18nKey, { defaultValue: opt.code ? "Yes" : "No" })}
                    </button>
                  );
                })}
              </div>
              <ErrorText msg={errors.slumCheck} />
              {slumCheck?.code === true && (slumMenu.length > 0 || !!slumName) && (
                <div style={{ marginTop: "16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                    {t("CS_NEW_APPLICATION_SLUM_NAME")}
                    <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
                  </div>
                  <CustomDropdown
                    options={slumMenu}
                    optionKey="i18nKey"
                    selected={slumName}
                    onSelect={setSlumName}
                    placeholder="— Select slum —"
                    hasError={!!errors.slumName}
                    t={t}
                  />
                  <ErrorText msg={errors.slumName} />
                </div>
              )}
            </div>

        </div>

        {/* ── Section 3: Address Details ── */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>{t("CS_FILE_APPLICATION_PROPERTY_LOCATION_ADDRESS_TEXT")}</div>

          <OpenStreetMapPicker
            value={geoLocation}
            onChange={setGeoLocation}
            onAddressFill={(fields) => {
              if (!pincode   && fields.pincode)   setPincode(fields.pincode);
              if (!street    && fields.street)    setStreet(fields.street);
              if (!doorNo    && fields.doorNo)    setDoorNo(fields.doorNo);
              if (!landmark  && fields.landmark)  setLandmark(fields.landmark);
            }}
            t={t}
          />

          {/* Address fields — 2-column grid on wider screens */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "8px" }}>
            {/* Pincode */}
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                {t("CORE_COMMON_PINCODE")}
              </div>
              <input
                id="pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 492001"
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: "8px",
                  border: errors.pincode ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb",
                  fontSize: "14px", color: "#111827", outline: "none",
                  boxSizing: "border-box", fontFamily: "inherit",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#f47738"; e.target.style.boxShadow = "0 0 0 3px rgba(244,119,56,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = errors.pincode ? "#ef4444" : "#e5e7eb"; e.target.style.boxShadow = "none"; }}
              />
              <ErrorText msg={errors.pincode} />
            </div>

            {/* House No. */}
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                {t("PT_PROPERTY_ADDRESS_HOUSE_NO")}
              </div>
              <input
                id="doorNo"
                type="text"
                value={doorNo}
                onChange={(e) => setDoorNo(e.target.value)}
                placeholder="e.g. 12-A"
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: "8px",
                  border: errors.doorNo ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb",
                  fontSize: "14px", color: "#111827", outline: "none",
                  boxSizing: "border-box", fontFamily: "inherit",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#f47738"; e.target.style.boxShadow = "0 0 0 3px rgba(244,119,56,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = errors.doorNo ? "#ef4444" : "#e5e7eb"; e.target.style.boxShadow = "none"; }}
              />
              <ErrorText msg={errors.doorNo} />
            </div>
          </div>

          {/* Street Name — full width */}
          <div style={{ marginTop: "20px" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              {t("PT_PROPERTY_ADDRESS_STREET_NAME")}
            </div>
            <input
              id="street"
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="e.g. MG Road, Sector 5"
              style={{
                width: "100%", padding: "11px 14px", borderRadius: "8px",
                border: errors.street ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb",
                fontSize: "14px", color: "#111827", outline: "none",
                boxSizing: "border-box", fontFamily: "inherit",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#f47738"; e.target.style.boxShadow = "0 0 0 3px rgba(244,119,56,0.15)"; }}
              onBlur={(e) => { e.target.style.borderColor = errors.street ? "#ef4444" : "#e5e7eb"; e.target.style.boxShadow = "none"; }}
            />
            <ErrorText msg={errors.street} />
          </div>

          {/* Landmark — full width textarea */}
          <div style={{ marginTop: "20px" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              {t("CS_FILE_APPLICATION_PROPERTY_LOCATION_LANDMARK_LABEL")}
            </div>
            <textarea
              id="landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near water tank, opposite school"
              maxLength={1024}
              rows={3}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: "8px",
                border: "1.5px solid #e5e7eb",
                fontSize: "14px", color: "#111827", outline: "none",
                boxSizing: "border-box", fontFamily: "inherit",
                resize: "vertical", lineHeight: "1.5",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#f47738"; e.target.style.boxShadow = "0 0 0 3px rgba(244,119,56,0.15)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
            />
          </div>

        </div>

        {/* ── Section 4: Sanitation Details ── */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>{t("CS_CHECK_PIT_SEPTIC_TANK_DETAILS", { defaultValue: "Pit/Septic Tank Details" })}</div>

          {/* Pit type — pill card selector */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "10px" }}>
              Choose Pit type
            </div>
            {/* Description — above the type pills */}
            <div style={{
              background: "#f8faff", border: "1px solid #e8edf5", borderRadius: "10px",
              padding: "12px 16px", marginBottom: "14px",
              fontSize: "13px", color: "#4b5563", lineHeight: "1.6",
            }}>
              {t("FSM_PIT_TYPE_DESCRIPTION", { defaultValue: "A conventional septic tank is a box type septic tank with dimensions \"Length, Breadth and Depth\" and Soak pit is cylindrical in nature with dimensions \"Diameter and Depth\". If you are not sure of the septic tank type or its dimensions, you may leave this field blank." })}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {(pitTypes || []).map((pt) => {
                const sel = pitType?.code === pt.code;
                return (
                  <button
                    key={pt.code}
                    type="button"
                    onClick={() => setPitType(pt)}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "10px 18px", borderRadius: "10px",
                      border: sel ? "2px solid #f47738" : "2px solid #e5e7eb",
                      background: sel ? "#fff8f3" : "#fafbff",
                      color: sel ? "#f47738" : "#374151",
                      fontWeight: sel ? "700" : "500", fontSize: "14px",
                      cursor: "pointer", transition: "all 0.15s",
                      boxShadow: sel ? "0 2px 8px rgba(244,119,56,0.15)" : "none",
                    }}
                  >
                    {sel && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {t(pt.i18nKey, { defaultValue: pt.name || pt.code })}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Road Width + Distance — 2-column grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                {t("ES_NEW_APPLICATION_ROAD_WIDTH", { defaultValue: "Road Width (m)" })}
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="roadWidth"
                  type="number"
                  min="0"
                  value={roadWidth}
                  onChange={(e) => setRoadWidth(e.target.value)}
                  placeholder="e.g. 6"
                  style={{
                    width: "100%", padding: "11px 44px 11px 14px", borderRadius: "8px",
                    border: errors.roadWidth ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb",
                    fontSize: "14px", color: "#111827", outline: "none",
                    boxSizing: "border-box", fontFamily: "inherit",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#f47738"; e.target.style.boxShadow = "0 0 0 3px rgba(244,119,56,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.roadWidth ? "#ef4444" : "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                />
                <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", fontWeight: "600", color: "#9ca3af", pointerEvents: "none" }}>m</span>
              </div>
              <ErrorText msg={errors.roadWidth} />
            </div>

            <div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                {t("ES_NEW_APPLICATION_DISTANCE_FROM_ROAD", { defaultValue: "Distance of Pit from Road (m)" })}
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="distanceFromRoad"
                  type="number"
                  min="0"
                  value={distanceFromRoad}
                  onChange={(e) => setDistanceFromRoad(e.target.value)}
                  placeholder="e.g. 2"
                  style={{
                    width: "100%", padding: "11px 44px 11px 14px", borderRadius: "8px",
                    border: errors.distanceFromRoad ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb",
                    fontSize: "14px", color: "#111827", outline: "none",
                    boxSizing: "border-box", fontFamily: "inherit",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#f47738"; e.target.style.boxShadow = "0 0 0 3px rgba(244,119,56,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.distanceFromRoad ? "#ef4444" : "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                />
                <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", fontWeight: "600", color: "#9ca3af", pointerEvents: "none" }}>m</span>
              </div>
              <ErrorText msg={errors.distanceFromRoad} />
            </div>
          </div>

          {/* Photo upload */}
          <div style={{ borderTop: "1.5px solid #f0f3f9", paddingTop: "24px" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "16px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
                background: "linear-gradient(135deg, #f47738 0%, #d4521a 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(244,119,56,0.35)",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#111827", marginBottom: "2px" }}>Upload Pit Photos</div>
                <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.5" }}>
                  Capture or upload photos of the pit/septic tank.<br/>Clear photos help the operator prepare for the job.
                </div>
              </div>
              <div style={{
                marginLeft: "auto", padding: "3px 10px", borderRadius: "20px",
                background: "#f0fdf4", border: "1px solid #86efac",
                fontSize: "11px", fontWeight: "600", color: "#16a34a", flexShrink: 0,
              }}>
                Optional
              </div>
            </div>

            {/* Tips row */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {[
                { icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", text: "Good lighting" },
                { icon: "M1 6s1-2 5-2 7 3 11 3 5-2 5-2v13s-1 2-5 2-7-3-11-3-5 2-5 2Z", text: "All angles" },
                { icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12", text: "JPG or PNG" },
              ].map((tip, i) => (
                <div key={i} style={{
                  flex: 1, display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 10px", borderRadius: "8px",
                  background: "#f9fafb", border: "1px solid #e5e7eb",
                  fontSize: "12px", color: "#4b5563",
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round"><path d={tip.icon}/></svg>
                  {tip.text}
                </div>
              ))}
            </div>

            {/* Upload zone */}
            <div style={{ padding: "16px", borderRadius: "14px", background: "#f9fafb", border: "1.5px solid #e5e7eb" }}>
              <PitPhotoUpload
                tenantId={tenantId}
                pitImages={pitImages}
                onPhotoChange={(ids) => setPitImages(ids)}
              />
            </div>

            {/* Status bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
              {pitImages && pitImages.length > 0 ? (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "5px 14px", borderRadius: "20px",
                  background: "#fff8f3", border: "1.5px solid #f47738",
                  fontSize: "12px", fontWeight: "700", color: "#f47738",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {pitImages.length} photo{pitImages.length > 1 ? "s" : ""} uploaded
                </div>
              ) : (
                <div style={{ fontSize: "12px", color: "#9ca3af" }}>No photos uploaded yet</div>
              )}
              <div style={{ fontSize: "11px", color: "#d1d5db" }}>Max 5 MB per file</div>
            </div>
          </div>
        </div>

        {/* ── Submit ── */}
        <div style={{ marginTop: "8px" }}>
          <SubmitBar label={t("CS_COMMON_NEXT")} onSubmit={handleSubmit} disabled={!isFormComplete} />
        </div>
      </div>
    </React.Fragment>
  );
};

export default FSMPropertyDetailsForm;
