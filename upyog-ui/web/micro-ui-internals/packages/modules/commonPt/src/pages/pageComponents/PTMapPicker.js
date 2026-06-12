import React, { useEffect, useRef, useState } from "react";

/**
 * Read-only property location map.
 * Shows a fixed, non-draggable marker at the property's lat/lng from the API.
 *
 * Props:
 *   lat  {number|string}  – property latitude
 *   lng  {number|string}  – property longitude
 */
const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM   = 5;
const PLACED_ZOOM    = 15;

const PTMapPicker = ({ lat, lng }) => {
  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);
  const markerRef       = useRef(null);
  const [leafletReady, setLeafletReady] = useState(false);

  /* ── Load Leaflet CSS + JS once ── */
  useEffect(() => {
    const LEAFLET_CSS_ID = "leaflet-css";
    if (!document.getElementById(LEAFLET_CSS_ID)) {
      const link = document.createElement("link");
      link.id          = LEAFLET_CSS_ID;
      link.rel         = "stylesheet";
      link.href        = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }

    const LEAFLET_JS_ID = "leaflet-js";
    if (!document.getElementById(LEAFLET_JS_ID)) {
      const script = document.createElement("script");
      script.id          = LEAFLET_JS_ID;
      script.src         = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.crossOrigin = "";
      script.onload      = () => setLeafletReady(true);
      document.head.appendChild(script);
    } else if (window.L) {
      setLeafletReady(true);
    } else {
      document.getElementById(LEAFLET_JS_ID).addEventListener("load", () => setLeafletReady(true));
    }
  }, []);

  /* ── Initialise / destroy map ── */
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current) return;
    if (mapRef.current) return;

    const L = window.L;

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const hasCoords     = lat && lng;
    console.log("[PTMapPicker] lat:", lat, "lng:", lng, "hasCoords:", hasCoords);
    const initialCenter = hasCoords ? [parseFloat(lat), parseFloat(lng)] : DEFAULT_CENTER;
    const initialZoom   = hasCoords ? PLACED_ZOOM : DEFAULT_ZOOM;

    const map = L.map(mapContainerRef.current, {
      center:             initialCenter,
      zoom:               initialZoom,
      zoomControl:        true,
      attributionControl: true,
    });

    map.attributionControl.setPrefix("");

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    if (hasCoords) {
      markerRef.current = L.marker([parseFloat(lat), parseFloat(lng)], { draggable: false }).addTo(map);
    }

    mapRef.current = map;

    // Force Leaflet to recalculate container size after paint
    setTimeout(() => { if (mapRef.current) mapRef.current.invalidateSize(); }, 100);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current    = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletReady]);

  /* ── Sync if lat/lng prop changes ── */
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    const L   = window.L;
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
      markerRef.current = L.marker(pos, { draggable: false }).addTo(mapRef.current);
    }
    mapRef.current.setView(pos, PLACED_ZOOM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width:        "100%",
        height:       "300px",
        borderRadius: "8px",
        border:       "1px solid #b1b4b6",
        overflow:     "hidden",
        background:   "#e8e8e8",
      }}
    />
  );
};

export default PTMapPicker;
