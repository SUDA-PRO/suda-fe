import { Loader } from "@upyog/digit-ui-react-components";
import React, { useEffect, useRef, useState } from "react";
import Timeline from "../components/TLTimeline";

/* ─── Inline style tokens ─────────────────────────────────────── */
const S = {
  page: {
    padding: "16px 24px 40px",
    background: "#f5f5f5",
    minHeight: "100vh",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
    padding: "28px 32px 24px",
    marginBottom: "24px",
    border: "1px solid #f0f0f0",
  },
  sectionHeader: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#363636",
    borderLeft: "4px solid #F47738",
    paddingLeft: "12px",
    marginBottom: "20px",
    marginTop: "4px",
    letterSpacing: "0.2px",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px 24px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px 24px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#363636",
    marginBottom: "8px",
    display: "block",
    letterSpacing: "0.1px",
  },
  required: { color: "#c0392b", marginLeft: "2px" },
  input: {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #c7c7c7",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#363636",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  inputError: {
    border: "1px solid #c0392b",
  },
  errorMsg: {
    fontSize: "11px",
    color: "#c0392b",
    marginTop: "4px",
  },
  submitRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "8px",
    paddingRight: "4px",
  },
  submitBtn: {
    background: "#F47738",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "10px 32px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    letterSpacing: "0.3px",
    transition: "background 0.2s",
  },
  submitBtnDisabled: {
    background: "#ccc",
    cursor: "not-allowed",
  },
  mapSearch: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
  },
  mapSearchInput: {
    flex: 1,
    padding: "9px 12px",
    border: "1px solid #c7c7c7",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
  },
  mapSearchBtn: {
    padding: "9px 16px",
    background: "#F47738",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  mapInstruction: {
    fontSize: "12px",
    color: "#505a5f",
    marginBottom: "8px",
    display: "flex",
    alignItems: "flex-start",
    gap: "6px",
  },
  mapPin: { fontSize: "14px", marginTop: "1px" },
  mapContainer: {
    width: "100%",
    height: "320px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    overflow: "hidden",
    marginTop: "4px",
  },
  coordsBar: {
    marginTop: "8px",
    padding: "6px 12px",
    background: "#f8f8f8",
    borderRadius: "6px",
    fontSize: "12px",
    color: "#505a5f",
    border: "1px solid #e5e5e5",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #f0f0f0",
    margin: "4px 0 20px",
  },
};

/* Global CSS for native select/input elements — !important overrides UPYOG CDN bundle */
const GLOBAL_CSS = `
  select.pt-form-field-select {
    display: block !important;
    width: 100% !important;
    height: 44px !important;
    padding: 0 36px 0 12px !important;
    border: 1.5px solid #b0b8c1 !important;
    border-radius: 8px !important;
    font-size: 14px !important;
    color: #363636 !important;
    background-color: #fff !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23505a5f' d='M1.41 0L6 4.59 10.59 0 12 1.41l-6 6-6-6z'/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: right 12px center !important;
    background-size: 12px !important;
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    appearance: none !important;
    cursor: pointer !important;
    outline: none !important;
    box-sizing: border-box !important;
    transition: border-color 0.18s, box-shadow 0.18s !important;
    font-family: inherit !important;
    box-shadow: none !important;
    line-height: normal !important;
  }
  select.pt-form-field-select:focus {
    border-color: #F47738 !important;
    box-shadow: 0 0 0 3px rgba(244, 119, 56, 0.15) !important;
    outline: none !important;
  }
  select.pt-form-field-select.error { border-color: #e53935 !important; }
  input.pt-form-field-input {
    display: block !important;
    width: 100% !important;
    height: 44px !important;
    padding: 0 12px !important;
    border: 1.5px solid #b0b8c1 !important;
    border-radius: 8px !important;
    font-size: 14px !important;
    color: #363636 !important;
    background: #fff !important;
    outline: none !important;
    box-sizing: border-box !important;
    transition: border-color 0.18s, box-shadow 0.18s !important;
    font-family: inherit !important;
    box-shadow: none !important;
    line-height: normal !important;
  }
  input.pt-form-field-input:focus {
    border-color: #F47738 !important;
    box-shadow: 0 0 0 3px rgba(244, 119, 56, 0.15) !important;
    outline: none !important;
  }
  input.pt-form-field-input::placeholder { color: #aab0b7 !important; }
  input.pt-form-field-input.error { border-color: #e53935 !important; }
`;

/* ─── (kept for compatibility, no longer injected) ────────────── */
const DROPDOWN_OVERRIDE_CSS = `
  .pt-details-form .select-wrap,
  .pt-details-form .employee-select-wrap {
    width: 100% !important;
    min-width: unset !important;
  }
  .pt-details-form .select-wrap .select,
  .pt-details-form .select-wrap .select-active,
  .pt-details-form .employee-select-wrap .select,
  .pt-details-form .employee-select-wrap .select-active {
    border: 1px solid #c7c7c7 !important;
    border-radius: 6px !important;
    padding: 0 !important;
    background: #fff !important;
    min-height: 38px !important;
    box-shadow: none !important;
  }
  .pt-details-form .select-wrap .select-active,
  .pt-details-form .employee-select-wrap .select-active {
    border-color: #F47738 !important;
    box-shadow: 0 0 0 2px rgba(244,119,56,0.18) !important;
  }
  .pt-details-form .select-wrap input,
  .pt-details-form .employee-select-wrap input {
    font-size: 14px !important;
    color: #363636 !important;
    padding: 9px 12px !important;
    height: auto !important;
    background: transparent !important;
    border: none !important;
    outline: none !important;
    width: calc(100% - 32px) !important;
  }
  .pt-details-form .select-wrap svg,
  .pt-details-form .employee-select-wrap svg {
    right: 10px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    position: absolute !important;
  }
  .pt-details-form .jk-dropdown-unique {
    border: 1px solid #e0e0e0 !important;
    border-radius: 6px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important;
    max-height: 220px !important;
    overflow-y: auto !important;
    z-index: 9999 !important;
  }
  .pt-details-form .jk-dropdown-unique li {
    padding: 9px 14px !important;
    font-size: 13px !important;
    color: #363636 !important;
    cursor: pointer !important;
  }
  .pt-details-form .jk-dropdown-unique li:hover {
    background: #fff5f0 !important;
    color: #F47738 !important;
  }
`;

const SELECT_STYLE = {
  display: "block",
  width: "100%",
  height: "44px",
  padding: "0 36px 0 12px",
  border: "1.5px solid #b0b8c1",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#363636",
  backgroundColor: "#ffffff",
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23505a5f' d='M1.41 0L6 4.59 10.59 0 12 1.41l-6 6-6-6z'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  backgroundSize: "12px",
  WebkitAppearance: "none",
  MozAppearance: "none",
  appearance: "none",
  cursor: "pointer",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  boxShadow: "none",
};

const INPUT_STYLE = {
  display: "block",
  width: "100%",
  height: "44px",
  padding: "0 12px",
  border: "1.5px solid #b0b8c1",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#363636",
  backgroundColor: "#ffffff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  boxShadow: "none",
};

const NativeSelect = ({ value, onChange, options, placeholder, error, t }) => (
  <select
    style={{ ...SELECT_STYLE, ...(error ? { borderColor: "#e53935" } : {}) }}
    value={value?.code || ""}
    onChange={(e) => {
      const found = options.find((o) => o.code === e.target.value);
      onChange(found || null);
    }}
  >
    <option value="">{placeholder || "Select…"}</option>
    {options.map((o) => (
      <option key={o.code} value={o.code}>{t ? t(o.i18nKey) : o.i18nKey}</option>
    ))}
  </select>
);

const NativeInput = ({ value, onChange, placeholder, type = "text", maxLength, onKeyDown, error }) => (
  <input
    style={{ ...INPUT_STYLE, ...(error ? { borderColor: "#e53935" } : {}) }}
    type={type}
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    placeholder={placeholder}
    maxLength={maxLength}
  />
);

/* ─── Leaflet Map Sub-Component ────────────────────────────────── */
const MapPicker = ({ t, value, onChange }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const stateId = Digit.ULBService.getStateId();
  const { data: defaultConfig = {} } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "MapConfig");

  const defaultCoord = React.useMemo(() => {
    const cfg = defaultConfig?.PropertyTax?.MapConfig?.[0];
    return { lat: cfg?.lat || 26.9124, lng: cfg?.lng || 75.7873 };
  }, [defaultConfig]);

  useEffect(() => {
    if (!window.L || mapInstanceRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { zoomControl: true }).setView(
      [defaultCoord.lat, defaultCoord.lng],
      value?.lat ? 15 : 5
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    if (value?.lat && value?.lng) {
      markerRef.current = L.marker([value.lat, value.lng], { draggable: true }).addTo(map);
      markerRef.current.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();
        onChange({ lat, lng });
      });
    }

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current.on("dragend", (ev) => {
          const pos = ev.target.getLatLng();
          onChange({ lat: pos.lat, lng: pos.lng });
        });
      }
      onChange({ lat, lng });
    });

    mapInstanceRef.current = map;
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !value?.lat) return;
    const L = window.L;
    mapInstanceRef.current.setView([value.lat, value.lng], 15);
    if (markerRef.current) {
      markerRef.current.setLatLng([value.lat, value.lng]);
    } else {
      markerRef.current = L.marker([value.lat, value.lng], { draggable: true }).addTo(mapInstanceRef.current);
      markerRef.current.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();
        onChange({ lat, lng });
      });
    }
  }, [value]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        onChange({ lat: parseFloat(lat), lng: parseFloat(lon) });
      } else {
        setSearchError(t("PT_MAP_SEARCH_ERROR") || "Location not found. Please try again.");
      }
    } catch {
      setSearchError(t("PT_MAP_SEARCH_ERROR") || "Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setSearchError(t("PT_MAP_GEO_NOT_SUPPORTED") || "Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setSearchError(t("PT_MAP_GEO_DENIED") || "Location access denied.");
      }
    );
  };

  if (!window.L) {
    return (
      <div style={{ padding: "16px", background: "#fff8f0", borderRadius: "8px", border: "1px dashed #F47738", color: "#505a5f", fontSize: "13px" }}>
        Map requires Leaflet. Add the Leaflet CDN to <code>public/index.html</code>:<br />
        <code style={{ fontSize: "11px" }}>{"<link rel='stylesheet' href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'/>"}</code><br />
        <code style={{ fontSize: "11px" }}>{"<script src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'></script>"}</code>
      </div>
    );
  }

  return (
    <div>
      <div style={S.mapSearch}>
        <input
          style={S.mapSearchInput}
          type="text"
          placeholder={t("PT_MAP_SEARCH_PLACEHOLDER") || "Search for a location..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button style={S.mapSearchBtn} onClick={handleSearch} disabled={searching}>
          {searching ? (t("PT_MAP_SEARCHING") || "Searching...") : "Search"}
        </button>
        <button
          style={{ ...S.mapSearchBtn, background: "#505a5f", fontSize: "12px", padding: "9px 12px" }}
          onClick={handleUseMyLocation}
          title={t("PT_MAP_MY_LOCATION") || "Use my location"}
        >
          📍
        </button>
      </div>
      {searchError && <div style={{ ...S.errorMsg, marginBottom: "8px" }}>{searchError}</div>}
      <div style={S.mapInstruction}>
        <span style={S.mapPin}>📌</span>
        <span>{t("PT_MAP_CLICK_INSTRUCTION") || "Search for a location above, or click on the map to set the property location. You can also drag the pin to adjust."}</span>
      </div>
      <div ref={mapRef} style={S.mapContainer} />
      {value?.lat && (
        <div style={S.coordsBar}>
          {t("PT_MAP_SELECTED_COORDINATES") || "Selected Coordinates:"}&nbsp;
          <strong>{Number(value.lat).toFixed(6)}, {Number(value.lng).toFixed(6)}</strong>
        </div>
      )}
    </div>
  );
};

/* ─── Main Component ───────────────────────────────────────────── */
const PTPropertyDetailsForm = ({ t, config, onSelect, userType, formData }) => {
  const [errors, setErrors] = useState({});

  /* ── Data options ── */
  const allCities = Digit.Hooks.pt.useTenants();
  const stateId = Digit.ULBService.getStateId();
  const { data: mdmsData, isLoading } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "PTPropertyType");

  const usageCategoryMenu = [
    { code: "RESIDENTIAL", i18nKey: "PROPERTYTAX_BILLING_SLAB_RESIDENTIAL" },
    { code: "NONRESIDENTIAL.COMMERCIAL", i18nKey: "PROPERTYTAX_BILLING_SLAB_COMMERCIAL" },
    { code: "NONRESIDENTIAL.INDUSTRIAL", i18nKey: "PROPERTYTAX_BILLING_SLAB_INDUSTRIAL" },
    { code: "NONRESIDENTIAL.INSTITUTIONAL", i18nKey: "PROPERTYTAX_BILLING_SLAB_INSTITUTIONAL" },
    { code: "NONRESIDENTIAL.OTHERS", i18nKey: "PROPERTYTAX_BILLING_SLAB_OTHERS" },
  ];

  const propertyTypeMenu = (mdmsData?.PropertyTax?.PropertyType || []).map((item) => ({
    code: item.code,
    i18nKey: "COMMON_PROPTYPE_" + item.code.replace(/\./g, "_"),
  }));

  const structureTypeMenu = [
    { code: "permanent", i18nKey: "Permanent" },
    { code: "temporary", i18nKey: "Temporary" },
    { code: "semi permanent", i18nKey: "SEMI_PERMANENT" },
    { code: "RCC", i18nKey: "RCC" },
  ];

  const ageOfPropertyMenu = [
    { code: "10", i18nKey: "PROPERTYTAX_MONTH>10" },
    { code: "15", i18nKey: "PROPERTYTAX_MONTH>15" },
    { code: "25", i18nKey: "PROPERTYTAX_MONTH>25" },
  ];

  /* ── Field state ── */
  const prev = formData || {};
  const [usageCategory, setUsageCategory] = useState(prev.isResdential || null);
  const [propertyType, setPropertyType] = useState(prev.PropertyType || null);
  const [electricity, setElectricity] = useState(prev.electricity?.electricity || prev.additionalDetails?.electricity || "");
  const [structureType, setStructureType] = useState(prev.propertyStructureDetails?.structureType || null);
  const [ageOfProperty, setAgeOfProperty] = useState(prev.propertyStructureDetails?.ageOfProperty || null);
  const [plotSize, setPlotSize] = useState(prev.units?.length > 0 ? prev.units[0]?.constructionDetail?.builtUpArea : "");
  const [selectedCity, setSelectedCity] = useState(prev.address?.city || null);
  const [pincode, setPincode] = useState(prev.address?.pincode || "");
  const [streetName, setStreetName] = useState(prev.address?.street || "");
  const [houseNo, setHouseNo] = useState(prev.address?.doorNo || "");
  const [landmark, setLandmark] = useState(prev.address?.landmark || "");
  const [geoLocation, setGeoLocation] = useState(prev.address?.geoLocation || null);

  /* ── Inject global CSS (always update so dev changes take effect) ── */
  useEffect(() => {
    let tag = document.getElementById("pt-form-global-css");
    if (!tag) {
      tag = document.createElement("style");
      tag.id = "pt-form-global-css";
      document.head.appendChild(tag);
    }
    tag.textContent = GLOBAL_CSS;
  }, []);

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!usageCategory) e.usageCategory = t("CORE_COMMON_REQUIRED_ERRMSG");
    if (!propertyType) e.propertyType = t("CORE_COMMON_REQUIRED_ERRMSG");
    if (!electricity || !/^\d{10}$/.test(electricity)) e.electricity = t("PT_BP_NUMBER_10_DIGIT_ERR") || "Must be exactly 10 digits";
    if (!structureType) e.structureType = t("CORE_COMMON_REQUIRED_ERRMSG");
    if (!ageOfProperty) e.ageOfProperty = t("CORE_COMMON_REQUIRED_ERRMSG");
    if (!plotSize || isNaN(plotSize) || Number(plotSize) <= 0) e.plotSize = t("ERR_DEFAULT_INPUT_FIELD_MSG") || "Enter a valid area";
    if (!selectedCity) e.city = t("CORE_COMMON_REQUIRED_ERRMSG");
    if (!houseNo) e.houseNo = t("CORE_COMMON_REQUIRED_ERRMSG");
    if (!streetName) e.streetName = t("CORE_COMMON_REQUIRED_ERRMSG");
    if (!geoLocation?.lat) e.geoLocation = t("CORE_COMMON_REQUIRED_ERRMSG");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isFormComplete =
    usageCategory && propertyType && /^\d{10}$/.test(electricity) &&
    structureType && ageOfProperty && plotSize && Number(plotSize) > 0 &&
    selectedCity && houseNo && streetName && geoLocation?.lat;

  const handleSubmit = () => {
    if (!validate()) return;
    /* Store in session storage under multiple keys, matching the wizard's expected structure */
    sessionStorage.setItem("PropertyType", propertyType?.i18nKey || "");
    sessionStorage.setItem("electricity", electricity);

    onSelect("propertyDetailsForm", {
      isResdential: usageCategory,
      PropertyType: propertyType,
      electricity: { electricity },
      propertyStructureDetails: { structureType, ageOfProperty },
      units: [{ constructionDetail: { builtUpArea: plotSize } }],
      address: {
        city: selectedCity,
        pincode,
        street: streetName,
        doorNo: houseNo,
        landmark,
        geoLocation,
        locality: prev.address?.locality || null,
      },
    });
  };

  if (isLoading) return <Loader />;

  const sectionHeaderStyle = {
    display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px",
  };
  const accentBarStyle = {
    width: "4px", height: "22px", background: "#F47738", borderRadius: "2px", flexShrink: 0,
  };

  return (
    <div style={S.page}>
      {window.location.href.includes("/citizen") && <Timeline currentStep={1} />}

      {/* ── Section 1: Property Assessment ── */}
      <div style={S.card}>
        <div style={sectionHeaderStyle}>
          <div style={accentBarStyle} />
          <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#363636", margin: 0 }}>
            {t("ES_NEW_APPLICATION_PROPERTY_ASSESSMENT") || "Property Assessment Details"}
          </h3>
        </div>
        <hr style={S.divider} />
        <div style={S.grid3}>

          <div style={S.fieldGroup}>
            <label style={S.label}>{t("PT_PROPERTY_DETAILS_RESIDENTIAL_PROPERTY_HEADER") || "Usage Category"}<span style={S.required}>*</span></label>
            <NativeSelect t={t} options={usageCategoryMenu} value={usageCategory} onChange={setUsageCategory}
              placeholder="Select Usage Category" error={errors.usageCategory} />
            {errors.usageCategory && <span style={S.errorMsg}>{errors.usageCategory}</span>}
          </div>

          <div style={S.fieldGroup}>
            <label style={S.label}>{t("PT_ASSESMENT1_PROPERTY_TYPE") || "Property Type"}<span style={S.required}>*</span></label>
            <NativeSelect t={t} options={propertyTypeMenu} value={propertyType} onChange={setPropertyType}
              placeholder="Select Property Type" error={errors.propertyType} />
            {errors.propertyType && <span style={S.errorMsg}>{errors.propertyType}</span>}
          </div>

          <div style={S.fieldGroup}>
            <label style={S.label}>{t("PT_ELECTRICITY_LABEL") || "Electricity Number"}<span style={S.required}>*</span></label>
            <NativeInput
              value={electricity}
              onChange={(e) => { if (/^\d{0,10}$/.test(e.target.value)) setElectricity(e.target.value); }}
              error={errors.electricity}
              placeholder="Enter 10-digit electricity no."
              maxLength={10}
            />
            {errors.electricity && <span style={S.errorMsg}>{errors.electricity}</span>}
          </div>

          <div style={S.fieldGroup}>
            <label style={S.label}>{t("PT_STRUCTURE_TYPE") || "Structure Type"}<span style={S.required}>*</span></label>
            <NativeSelect t={t} options={structureTypeMenu} value={structureType} onChange={setStructureType}
              placeholder="Select Structure Type" error={errors.structureType} />
            {errors.structureType && <span style={S.errorMsg}>{errors.structureType}</span>}
          </div>

          <div style={S.fieldGroup}>
            <label style={S.label}>{t("PT_AGE_OF_PROPERTY") || "Age of Property"}<span style={S.required}>*</span></label>
            <NativeSelect t={t} options={ageOfPropertyMenu} value={ageOfProperty} onChange={setAgeOfProperty}
              placeholder="Select Age of Property" error={errors.ageOfProperty} />
            {errors.ageOfProperty && <span style={S.errorMsg}>{errors.ageOfProperty}</span>}
          </div>

          <div style={S.fieldGroup}>
            <label style={S.label}>{t("PT_PLOT_SIZE_SQUARE_FEET_LABEL") || "Plot Size (Sq. Ft.)"}<span style={S.required}>*</span></label>
            <NativeInput value={plotSize} onChange={(e) => setPlotSize(e.target.value)}
              placeholder="Enter area in sq. ft." type="number" error={errors.plotSize} />
            {errors.plotSize && <span style={S.errorMsg}>{errors.plotSize}</span>}
          </div>
        </div>
      </div>

      {/* ── Section 2: Property Location ── */}
      <div style={S.card}>
        <div style={sectionHeaderStyle}>
          <div style={accentBarStyle} />
          <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#363636", margin: 0 }}>
            {t("CS_FILE_APPLICATION_PROPERTY_LOCATION_ADDRESS_TEXT") || "Property Location & Address"}
          </h3>
        </div>
        <hr style={S.divider} />
        <div style={S.grid3}>
          <div style={S.fieldGroup}>
            <label style={S.label}>{t("MYCITY_CODE_LABEL") || "City"}<span style={S.required}>*</span></label>
            <NativeSelect t={t}
              options={(allCities || []).slice().sort((a, b) => (a.name || "").localeCompare(b.name || "")).map((c) => ({ code: c.code, i18nKey: c.name }))}
              value={selectedCity} onChange={setSelectedCity}
              placeholder="Select City" error={errors.city} />
            {errors.city && <span style={S.errorMsg}>{errors.city}</span>}
          </div>

          <div style={S.fieldGroup}>
            <label style={S.label}>{t("PT_PROPERTY_ADDRESS_PINCODE") || "Pincode"}</label>
            <NativeInput value={pincode}
              onChange={(e) => { if (/^\d{0,6}$/.test(e.target.value)) setPincode(e.target.value); }}
              placeholder="Enter 6-digit pincode" maxLength={6} />
          </div>

          <div style={S.fieldGroup}>
            <label style={S.label}>{t("PT_PROPERTY_ADDRESS_STREET_NAME") || "Street Name"}<span style={S.required}>*</span></label>
            <NativeInput value={streetName} onChange={(e) => setStreetName(e.target.value)}
              placeholder="Enter street name" error={errors.streetName} />
            {errors.streetName && <span style={S.errorMsg}>{errors.streetName}</span>}
          </div>

          <div style={S.fieldGroup}>
            <label style={S.label}>{t("PT_PROPERTY_ADDRESS_HOUSE_NO") || "House / Door No."}<span style={S.required}>*</span></label>
            <NativeInput value={houseNo} onChange={(e) => setHouseNo(e.target.value)}
              placeholder="Enter house / door number" error={errors.houseNo} />
            {errors.houseNo && <span style={S.errorMsg}>{errors.houseNo}</span>}
          </div>

          <div style={S.fieldGroup}>
            <label style={S.label}>{t("ES_NEW_APPLICATION_LOCATION_LANDMARK") || "Landmark"}</label>
            <NativeInput value={landmark} onChange={(e) => setLandmark(e.target.value)}
              placeholder="Enter nearby landmark (optional)" />
          </div>
        </div>

        {/* ── Map ── */}
        <div style={{ marginTop: "24px" }}>
          <label style={{ ...S.label, marginBottom: "10px" }}>
            {t("PT_MAP_LOCATION_LABEL") || "Property Location on Map"}
            <span style={S.required}>*</span>
          </label>
          {errors.geoLocation && <div style={{ ...S.errorMsg, marginBottom: "6px" }}>{errors.geoLocation}</div>}
          <MapPicker t={t} value={geoLocation} onChange={setGeoLocation} />
        </div>
      </div>

      {/* ── Submit ── */}
      <div style={S.submitRow}>
        <button
          style={{ ...S.submitBtn, ...(isFormComplete ? {} : S.submitBtnDisabled) }}
          onClick={handleSubmit}
          disabled={!isFormComplete}
        >
          {t("PT_COMMON_NEXT") || "Next"}
        </button>
      </div>
    </div>
  );
};

export default PTPropertyDetailsForm;
