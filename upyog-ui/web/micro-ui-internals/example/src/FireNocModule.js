import React, { useState, useRef, useEffect } from "react";
import L from "leaflet";
import { Route, Switch, useRouteMatch, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* ------------------------------------------------------------------ */
/* Inject FireNOC translations directly so they work without a backend */
/* localization service push. Uses the "translations" namespace that   */
/* i18next is configured with.                                         */
/* ------------------------------------------------------------------ */
const FIRENOC_TRANSLATIONS_EN = {
  CS_COMMON_BACK: "Back",

  FIRENOC_FORM_STEP_NOC_DETAILS: "NOC Details",
  FIRENOC_FORM_STEP_PROPERTY_DETAILS: "Property Details",
  FIRENOC_FORM_STEP_APPLICANT_DETAILS: "Applicant Details",
  FIRENOC_FORM_STEP_DOCUMENTS: "Documents",

  FIRENOC_APPLICATION_TITLE: "Application for Fire NOC",
  FIRENOC_FORM_NOC_TYPE: "NOC Type",
  FIRENOC_NOC_TYPE_NEW: "New",
  FIRENOC_NOC_TYPE_PROVISIONAL: "Provisional",
  FIRENOC_NOC_TYPE_NEW_SUBTITLE: "Apply for a fresh Fire NOC",
  FIRENOC_NOC_TYPE_PROVISIONAL_SUBTITLE: "Apply against existing Provisional NOC",
  FIRENOC_FORM_PROVISIONAL_NOC_INFO: "Provide your existing Provisional NOC reference number",
  FIRENOC_FORM_GIS_CLICK_TO_SELECT: "Click to select location on map",
  FIRENOC_FORM_GIS_PINPOINTS_NOTE: "Pinpoints your property on OpenStreetMap",
  FIRENOC_FORM_GIS_OPEN_MAP: "Open Map",
  FIRENOC_FORM_GIS_CHANGE: "Change",
  FIRENOC_FORM_GIS_SELECT_LOCATION_TITLE: "Select Location on Map",
  FIRENOC_FORM_GIS_CLICK_ON_MAP: "Click on the map to select a location",
  FIRENOC_FORM_GIS_GETTING_ADDRESS: "Getting address...",
  FIRENOC_FORM_PROVISIONAL_NOC_NUMBER: "Provisional fire NoC number",
  FIRENOC_FORM_PLACEHOLDER_PROVISIONAL_NOC_NUMBER: "Enter Provisional fire NoC number",

  FIRENOC_FORM_BUILDING_DETAILS: "Building Details",
  FIRENOC_FORM_NO_OF_BUILDINGS: "No. of Buildings",
  FIRENOC_FORM_SINGLE_BUILDING: "Single Building",
  FIRENOC_FORM_MULTIPLE_BUILDINGS: "Multiple Buildings",
  FIRENOC_FORM_ADD_BUILDING: "ADD BUILDING",
  FIRENOC_FORM_NAME_OF_BUILDING: "Name of the Building",
  FIRENOC_FORM_PLACEHOLDER_BUILDING_NAME: "Enter Name of the Building",
  FIRENOC_FORM_BUILDING_USAGE_TYPE: "Building Usage Type as per NBC",
  FIRENOC_FORM_SELECT_BUILDING_USAGE_TYPE: "Select Building Usage Type",
  FIRENOC_FORM_BUILDING_USAGE_SUBTYPE: "Building Usage Subtype as per NBC",
  FIRENOC_FORM_SELECT_BUILDING_USAGE_SUBTYPE: "Select Building Usage Subtype",
  FIRENOC_FORM_NO_OF_FLOORS: "No. Of Floors (Excluding Basement, Including Ground Floor)",
  FIRENOC_FORM_SELECT_NO_OF_FLOORS: "Select No. of Floors",
  FIRENOC_FORM_NO_OF_BASEMENTS: "No. Of Basements",
  FIRENOC_FORM_SELECT_NO_OF_BASEMENTS: "Select No. Of Basements",
  FIRENOC_FORM_PLOT_SIZE: "Plot Size (in Sq meters)",
  FIRENOC_FORM_PLACEHOLDER_PLOT_SIZE: "Enter Plot Size (In Sq meters)",
  FIRENOC_FORM_GROUND_FLOOR_AREA: "Ground floor builtup area (in sq. meter)",
  FIRENOC_FORM_PLACEHOLDER_GROUND_FLOOR_AREA: "Enter Ground floor builtup area (in sq. meter)",
  FIRENOC_FORM_HEIGHT_OF_BUILDING: "Height of the Building from Ground level (in meters)",
  FIRENOC_FORM_PLACEHOLDER_HEIGHT_OF_BUILDING: "Enter Height of the Building in meters",

  FIRENOC_FORM_PROPERTY_LOCATION_DETAILS: "Property Location Details",
  FIRENOC_FORM_PROPERTY_ID: "Property ID",
  FIRENOC_FORM_PLACEHOLDER_PROPERTY_ID: "Enter Property ID",
  FIRENOC_FORM_CITY: "City",
  FIRENOC_FORM_SELECT_CITY: "Select City",
  FIRENOC_FORM_PLOT_SURVEY_NO: "Plot/Survey No.",
  FIRENOC_FORM_PLACEHOLDER_PLOT_SURVEY_NO: "Enter Plot/Survey No.",
  FIRENOC_FORM_COLONY_BUILDING_NAME: "Building Name",
  FIRENOC_FORM_PLACEHOLDER_COLONY_BUILDING_NAME: "Enter Building/Colony Name",
  FIRENOC_FORM_STREET_NAME: "Street Name",
  FIRENOC_FORM_PLACEHOLDER_STREET_NAME: "Enter Street Name",
  FIRENOC_FORM_MOHALLA: "Mohalla",
  FIRENOC_FORM_PLACEHOLDER_MOHALLA: "Enter Mohalla",
  FIRENOC_FORM_PINCODE: "Pincode",
  FIRENOC_FORM_PLACEHOLDER_PINCODE: "Enter Pincode",
  FIRENOC_FORM_GIS_LOCATION: "GIS Location",
  FIRENOC_FORM_PLACEHOLDER_GIS_LOCATION: "Select your property location on map",
  FIRENOC_FORM_FIRE_STATION: "Fire Station",
  FIRENOC_FORM_PLACEHOLDER_FIRE_STATION: "Enter Applicable Fire Station",
  FIRENOC_FORM_SELECT_CITY_FIRST: "Please select city first",
  FIRENOC_FORM_SELECT_MOHALLA: "Select Mohalla",

  FIRENOC_FORM_APPLICANT_TYPE: "Applicant Type",
  FIRENOC_FORM_SELECT_APPLICANT_TYPE: "Select Applicant Type",
  FIRENOC_FORM_APPLICANT_SUBTYPE: "Applicant Sub-Type",
  FIRENOC_FORM_SELECT_APPLICANT_SUBTYPE: "Select Applicant Sub-Type",
  FIRENOC_FORM_APPLICANT_INFORMATION: "Applicant Information",
  FIRENOC_FORM_REMOVE_APPLICANT: "Remove",
  FIRENOC_FORM_ADD_APPLICANT: "Add Applicant",
  FIRENOC_FORM_APPLICANT_NAME: "Applicant Name",
  FIRENOC_FORM_PLACEHOLDER_APPLICANT_NAME: "Enter Applicant Name",
  FIRENOC_FORM_MOBILE_NUMBER: "Mobile Number",
  FIRENOC_FORM_PLACEHOLDER_MOBILE_NUMBER: "Enter Mobile Number",
  FIRENOC_FORM_EMAIL_ID: "Email ID",
  FIRENOC_FORM_PLACEHOLDER_EMAIL_ID: "Enter Email ID",
  FIRENOC_FORM_GENDER: "Gender",
  FIRENOC_FORM_SELECT_GENDER: "Select Gender",
  FIRENOC_FORM_DATE_OF_BIRTH: "Date of Birth",
  FIRENOC_FORM_RELATIONSHIP: "Relationship",
  FIRENOC_FORM_FATHER_HUSBAND_NAME: "Father/Husband Name",
  FIRENOC_FORM_PLACEHOLDER_FATHER_HUSBAND_NAME: "Enter Father/Husband Name",
  FIRENOC_FORM_PAN_NUMBER: "PAN Number",
  FIRENOC_FORM_PLACEHOLDER_PAN_NUMBER: "Enter Applicant PAN Number",
  FIRENOC_FORM_CORRESPONDENCE_ADDRESS: "Correspondence Address",
  FIRENOC_FORM_PLACEHOLDER_CORRESPONDENCE_ADDRESS: "Enter Correspondence Address",
  FIRENOC_FORM_SPECIAL_APPLICANT_CATEGORY: "Special Applicant Category",

  FIRENOC_APPLICANT_TYPE_INDIVIDUAL: "Individual",
  FIRENOC_APPLICANT_TYPE_INSTITUTIONALPRIVATE: "Institutional (Private)",
  FIRENOC_APPLICANT_TYPE_INSTITUTIONALGOVERNMENT: "Institutional (Government)",
  FIRENOC_APPLICANT_SUBTYPE_INDIVIDUAL_SINGLEOWNER: "Single Owner",
  FIRENOC_APPLICANT_SUBTYPE_INDIVIDUAL_MULTIPLEOWNERS: "Multiple Owners",
  FIRENOC_APPLICANT_SUBTYPE_INSTITUTIONALPRIVATE_NGO: "NGO",
  FIRENOC_APPLICANT_SUBTYPE_INSTITUTIONALPRIVATE_OTHERSPRIVATEINSTITUTION: "Others (Private Institution)",
  FIRENOC_APPLICANT_SUBTYPE_INSTITUTIONALPRIVATE_PRIVATEBOARD: "Private Board",
  FIRENOC_APPLICANT_SUBTYPE_INSTITUTIONALGOVERNMENT_CENTRALGOVERNMENT: "Central Government",
  FIRENOC_APPLICANT_SUBTYPE_INSTITUTIONALGOVERNMENT_OTHERSGOVERNMENTINSTITUTION: "Others (Government Institution)",
  FIRENOC_APPLICANT_SUBTYPE_INSTITUTIONALGOVERNMENT_STATEGOVERNMENT: "State Government",

  FIRENOC_GENDER_MALE: "Male",
  FIRENOC_GENDER_FEMALE: "Female",
  FIRENOC_GENDER_OTHER: "Other",
  FIRENOC_GENDER_TRANSGENDER: "Transgender",
  FIRENOC_RELATIONSHIP_FATHER: "Father",
  FIRENOC_RELATIONSHIP_HUSBAND: "Husband",

  FIRENOC_SPECIAL_CATEGORY_NONE: "None",
  FIRENOC_SPECIAL_CATEGORY_FREEDOMFIGHTER: "Freedom Fighter",
  FIRENOC_SPECIAL_CATEGORY_WIDOW: "Widow",
  FIRENOC_SPECIAL_CATEGORY_HANDICAPPED: "Divyang",
  FIRENOC_SPECIAL_CATEGORY_BPL: "BPL",
  FIRENOC_SPECIAL_CATEGORY_DEFENSE: "Defense Personnel",

  FIRENOC_FORM_CLICK_TO_UPLOAD: "Click to upload document",
  FIRENOC_FORM_BTN_NEXT_STEP: "NEXT STEP",
  FIRENOC_FORM_BTN_PREVIOUS_STEP: "PREVIOUS STEP",
  FIRENOC_FORM_BTN_SUBMIT: "SUBMIT",
  FIRENOC_FORM_SUBMITTING: "Submitting...",
  FIRENOC_FORM_BTN_GO_HOME: "Go to Home",
  FIRENOC_FORM_BTN_APPLY_FIRENOC: "Apply for Fire NOC",

  FIRENOC_DOCS_OWNER_IDENTITYPROOF: "Identity Proof",
  FIRENOC_DOCS_OWNER_ADDRESSPROOF: "Address Proof",
  FIRENOC_DOCS_BUILDING_BUILDING_PLAN: "Building Plan",
  FIRENOC_DOCS_BUILDING_FIRE_FIGHTING_PLAN: "Fire-Fighting Plan",

  FIRENOC_ACKNOWLEDGEMENT_SUCCESS: "Application Submitted Successfully!",
  FIRENOC_ACKNOWLEDGEMENT_APP_NO: "Your Fire NOC application number is",
  FIRENOC_ACKNOWLEDGEMENT_SMS_NOTE: "You will receive a confirmation SMS on your registered mobile number.",
  FIRENOC_MY_APPLICATIONS_TITLE: "My Fire NOC Applications",
  FIRENOC_NO_APPLICATIONS_FOUND: "No applications found.",

  FIRENOC_HOME_HOW_IT_WORKS: "How it Works?",
  FIRENOC_HOME_REQUIRED_DOCS_HEADING: "Required Documents - Fire NOC",
  FIRENOC_DOCS_SECTION_OWNER: "Owner Documents",
  FIRENOC_DOCS_OWNER_NOTE: "* In case of multiple/institutional Applicant please provide ID of primary or authorized person",
  FIRENOC_DOCS_SECTION_BUILDING: "Building Documents",
  FIRENOC_DOCS_BUILDING_NOTE: "* In case of multiple buildings please provide Building plans for all buildings",
  FIRENOC_HOME_BTN_PRINT: "PRINT",
  FIRENOC_HOME_BTN_APPLY: "APPLY",
  FIRENOC_HOME_APPLICATION_LABEL: "Fire NOC Application",
  FIRENOC_HOME_DOCS_READINESS_NOTE: "Please keep all required documents ready before starting the application. Incomplete applications may be rejected.",

  ACTION_TEST_FIRENOC: "Fire NOC",
  FIRENOC_COMMON_HOME: "Fire NOC",
  FIRENOC_COMMON_APPLY: "Apply",
  FIRENOC_COMMON_MY_APPLICATIONS: "My Applications",
  FIRENOC_COMMON_TABLE_COL_APP_NO: "Application No.",
  FIRENOC_COMMON_TABLE_COL_STATUS: "Status",
  FIRENOC_COMMON_TABLE_COL_NOC_TYPE: "NOC Type",
  FIRENOC_COMMON_TABLE_COL_BUILDING_NAME: "Building Name",
  FIRENOC_COMMON_TABLE_COL_DATE: "Date",
};

/* Inject once when the module loads — window.i18next is set by initI18n */
(function injectFireNocTranslations() {
  const inject = () => {
    if (window.i18next && window.i18next.addResources) {
      Object.entries(FIRENOC_TRANSLATIONS_EN).forEach(([key, value]) => {
        window.i18next.addResource("en_IN", "translations", key, value);
      });
    } else {
      /* Retry until i18next is ready */
      setTimeout(inject, 100);
    }
  };
  inject();
})();

/* ------------------------------------------------------------------ */
/* Local BackButton — does not rely on the pre-built package dist      */
/* ------------------------------------------------------------------ */
const BackButton = ({ style, className = "" }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [hovered, setHovered] = useState(false);
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 18px 7px 12px",
    borderRadius: "20px",
    border: hovered ? "1.5px solid #1E3A8A" : "1.5px solid #1E3A8A",
    background: hovered ? "#EEF2FF" : "#ffffff",
    color: "#1E3A8A",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    marginBottom: "16px",
    userSelect: "none",
    width: "fit-content",
    boxShadow: hovered
      ? "0 4px 16px rgba(30,58,138,0.18)"
      : "0 1px 4px rgba(30,58,138,0.10)",
    transform: hovered ? "translateY(-1px)" : "translateY(0)",
    transition: "background 0.18s, box-shadow 0.18s, transform 0.15s",
    ...style,
  };
  return (
    <div
      className={`back-btn-local ${className}`}
      style={base}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => history.goBack()}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" style={{ fill: "#1E3A8A", flexShrink: 0 }}>
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
      </svg>
      <span style={{ margin: 0, color: "#1E3A8A" }}>{t("CS_COMMON_BACK")}</span>
    </div>
  );
};

/* Mirrors Digit.Utils.locale.getTransformedLocale */
const toLocaleKey = (code) => code && code.trim().toUpperCase().replace(/[.:\-\s\/]/g, "_");

/* ------------------------------------------------------------------ */
/* Stepper                                                              */
/* ------------------------------------------------------------------ */
const STEP_KEYS = [
  "FIRENOC_FORM_STEP_NOC_DETAILS",
  "FIRENOC_FORM_STEP_PROPERTY_DETAILS",
  "FIRENOC_FORM_STEP_APPLICANT_DETAILS",
  "FIRENOC_FORM_STEP_DOCUMENTS",
];

const Stepper = ({ active }) => {
  const { t } = useTranslation();
  return (
  <div style={{ display: "flex", alignItems: "flex-start", padding: "24px 0 32px", gap: "0" }}>
    {STEP_KEYS.map((key, idx) => {
      const label = t(key);
      const num = idx + 1;
      const isActive = num === active;
      const isDone = num < active;
      return (
        <React.Fragment key={idx}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "80px", maxWidth: "96px" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: isDone ? "#f47738" : isActive ? "#f47738" : "#e8eaf0",
                color: isDone || isActive ? "#fff" : "#aaa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
                boxShadow: isActive ? "0 0 0 4px rgba(244,119,56,0.2)" : isDone ? "none" : "none",
                transition: "background 0.2s, box-shadow 0.2s",
              }}
            >
              {isDone
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                : num}
            </div>
            <span
              style={{
                fontSize: 11,
                marginTop: 8,
                color: isActive ? "#f47738" : isDone ? "#f47738" : "#aaa",
                fontWeight: isActive ? 700 : isDone ? 600 : 400,
                textAlign: "center",
                maxWidth: 88,
                wordBreak: "break-word",
                lineHeight: 1.35,
                letterSpacing: "0.2px",
              }}
            >
              {label}
            </span>
          </div>
          {idx < STEP_KEYS.length - 1 && (
            <div style={{
              flex: 1, height: 2, marginTop: 17, marginBottom: 0,
              background: isDone ? "#f47738" : "#e8eaf0",
              transition: "background 0.3s",
            }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
  );
};

/* ------------------------------------------------------------------ */
/* Step 1: NOC Details                                                 */
/* ------------------------------------------------------------------ */
const NocDetails = ({ onNext }) => {
  const { t } = useTranslation();
  const [nocType, setNocType] = useState("NEW");
  const [provisionalNo, setProvisionalNo] = useState("");

  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: "24px", marginBottom: 16, boxShadow: "0 2px 12px rgba(9,30,100,0.08)", borderTop: "3px solid #091E64" }}>
      <h3 style={sectionHeadStyle}>{t("FIRENOC_FORM_STEP_NOC_DETAILS")}</h3>

      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>{t("FIRENOC_FORM_NOC_TYPE")} <span style={{ color: "#d32f2f" }}>*</span></label>
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          {["NEW", "PROVISIONAL"].map((type) => (
            <div
              key={type}
              onClick={() => setNocType(type)}
              style={{
                flex: 1, padding: "18px 20px", cursor: "pointer",
                border: `2px solid ${nocType === type ? "#091E64" : "#e0e0e0"}`,
                borderRadius: 8,
                background: nocType === type ? "#eef1fa" : "#fafafa",
                display: "flex", flexDirection: "row", alignItems: "center", gap: 14,
                boxShadow: nocType === type ? "0 2px 10px rgba(9,30,100,0.12)" : "none",
                transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${nocType === type ? "#091E64" : "#ccc"}`,
                background: nocType === type ? "#091E64" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s, border-color 0.15s",
              }}>
                {nocType === type && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
              </div>
              <div>
                <div style={{ fontWeight: nocType === type ? 700 : 500, fontSize: 14, color: nocType === type ? "#091E64" : "#444", lineHeight: 1.4 }}>
                  {t(`FIRENOC_NOC_TYPE_${type}`)}
                </div>
                <div style={{ fontSize: 11, color: nocType === type ? "#3a4f8c" : "#999", marginTop: 2 }}>
                  {t(type === "NEW" ? "FIRENOC_NOC_TYPE_NEW_SUBTITLE" : "FIRENOC_NOC_TYPE_PROVISIONAL_SUBTITLE")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {nocType === "NEW" && (
        <div style={{ marginBottom: 24, background: "#f0f3fa", border: "1px solid #d0d8f0", borderRadius: 8, padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#091E64" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ fontSize: 12, color: "#091E64", fontWeight: 600 }}>{t("FIRENOC_FORM_PROVISIONAL_NOC_INFO")}</span>
          </div>
          <label style={labelStyle}>{t("FIRENOC_FORM_PROVISIONAL_NOC_NUMBER")}</label>
          <div style={{ display: "flex", alignItems: "center", border: "1px solid #b0bcdb", borderRadius: 6, marginTop: 6, overflow: "hidden", background: "#fff" }}>
            <input
              type="text"
              value={provisionalNo}
              onChange={(e) => setProvisionalNo(e.target.value)}
              placeholder={t("FIRENOC_FORM_PLACEHOLDER_PROVISIONAL_NOC_NUMBER")}
              style={{ flex: 1, padding: "10px 12px", border: "none", outline: "none", fontSize: 14 }}
            />
            <button style={{ padding: "8px 14px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#091E64" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button
          onClick={() => onNext({ nocType, provisionalNo })}
          style={{
            background: "#f47738", color: "#fff", border: "none", borderRadius: 4,
            padding: "12px 32px", fontWeight: 700, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 2px 8px rgba(244,119,56,0.35)",
          }}
        >
          {t("FIRENOC_FORM_BTN_NEXT_STEP")}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Step 2: Property Details                                            */
/* ------------------------------------------------------------------ */

// Derived from Suda-MDMS/data/cg/firenoc/BuildingType.json
// Localization key pattern: FIRENOC_BUILDINGTYPE_<toLocaleKey(code)>
const BUILDING_USAGE_TYPES = [
  "GROUP_A_RESIDENTIAL",
  "GROUP_B_EDUCATIONAL",
  "GROUP_C_INSTITUTIONAL",
  "GROUP_D_ASSEMBLY",
  "GROUP_E_BUSINESS",
  "GROUP_F_MERCANTILE",
  "GROUP_G_INDUSTRIAL",
  "GROUP_H_STORAGE",
  "GROUP_I_HAZARDOUS",
];

// Subtypes keyed by usage type code; localization: FIRENOC_BUILDINGTYPE_<toLocaleKey(usageType + "." + subCode)>
const BUILDING_SUBTYPES = {
  GROUP_A_RESIDENTIAL: [
    "SUBDIVISIONA-1",
    "SUBDIVISIONA-2",
    "SUBDIVISIONA-3",
    "SUBDIVISIONA-4",
    "SUBDIVISIONA-5",
    "SUBDIVISIONA-6",
  ],
  GROUP_B_EDUCATIONAL:   ["SUBDIVISIONB-1", "SUBDIVISIONB-2"],
  GROUP_C_INSTITUTIONAL: ["SUBDIVISIONC-1", "SUBDIVISIONC-2", "SUBDIVISIONC-3"],
  GROUP_D_ASSEMBLY:      ["SUBDIVISIOND-1", "SUBDIVISIOND-2", "SUBDIVISIOND-3", "SUBDIVISIOND-4", "SUBDIVISIOND-5", "SUBDIVISIOND-6", "SUBDIVISIOND-7"],
  GROUP_E_BUSINESS:      ["SUBDIVISIONE-1", "SUBDIVISIONE-2", "SUBDIVISIONE-3", "SUBDIVISIONE-4", "SUBDIVISIONE-5"],
  GROUP_F_MERCANTILE:    ["SUBDIVISIONF-1", "SUBDIVISIONF-2", "SUBDIVISIONF-3"],
  GROUP_G_INDUSTRIAL:    ["SUBDIVISIONG-1", "SUBDIVISIONG-2"],
  GROUP_H_STORAGE:       ["SUBDIVISIONH-1", "SUBDIVISIONH-2"],
  GROUP_I_HAZARDOUS:     ["SUBDIVISIONI-1"],
};

// Localization key: FIRENOC_FIRESTATION_<toLocaleKey(code)>
const FIRE_STATIONS = ["FS_CITYA_01", "FS_CITYB_01", "FS_CITYC_01", "FS_CITYD_01", "FS_CITYE_01"];

const inputStyle = {
  display: "block", width: "100%", marginTop: 6,
  padding: "10px 12px", border: "1px solid #d0d0d0",
  borderRadius: 6, fontSize: 14, boxSizing: "border-box",
  background: "#fff", outline: "none",
  transition: "border-color 0.15s",
};
const selectStyle = {
  ...inputStyle,
  appearance: "none", WebkitAppearance: "none", MozAppearance: "none",
  paddingRight: 36, cursor: "pointer", color: "inherit",
};
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.4px" };
const sectionHeadStyle = {
  fontSize: 14, fontWeight: 700, margin: "0 0 16px",
  paddingBottom: 10, borderBottom: "2px solid #091E64",
  color: "#091E64", display: "flex", alignItems: "center", gap: 8,
};
const gridRow = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" };

/* ------------------------------------------------------------------ */
/* OpenStreetMap Picker Modal (Nominatim reverse geocoding)            */
/* ------------------------------------------------------------------ */
const MapPickerModal = ({ onConfirm, onClose, initialCoords }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedCoords, setSelectedCoords] = useState(initialCoords || null);
  const [geocodeResult, setGeocodeResult] = useState(null);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [locating, setLocating] = useState(false);
  const { t: tMap } = useTranslation();
  const [statusMsg, setStatusMsg] = useState(tMap("FIRENOC_FORM_GIS_CLICK_ON_MAP"));

  const doReverseGeocode = async (lat, lng) => {
    setLoadingGeo(true);
    setStatusMsg(tMap("FIRENOC_FORM_GIS_GETTING_ADDRESS"));
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en-IN,en" } }
      );
      const data = await res.json();
      setGeocodeResult(data);
      setStatusMsg(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch {
      setStatusMsg(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setLoadingGeo(false);
    }
  };

  const placeMarker = (map, pinIcon, lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
    }
    setSelectedCoords({ lat, lng });
    doReverseGeocode(lat, lng);
  };

  useEffect(() => {
    if (!document.getElementById("leaflet-css-firenoc")) {
      const link = document.createElement("link");
      link.id = "leaflet-css-firenoc";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const defaultLat = initialCoords?.lat || 21.2514;
    const defaultLng = initialCoords?.lng || 81.6296;

    /* Disable default zoom control — we render our own */
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: false })
      .setView([defaultLat, defaultLng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

    const pinIcon = L.divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40"><path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 26 14 26S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="#f47738"/><circle cx="14" cy="14" r="6" fill="#fff"/></svg>`,
      iconSize: [28, 40], iconAnchor: [14, 40], className: "",
    });

    if (initialCoords) {
      markerRef.current = L.marker([initialCoords.lat, initialCoords.lng], { icon: pinIcon }).addTo(map);
      doReverseGeocode(initialCoords.lat, initialCoords.lng);
    }

    map.on("click", ({ latlng: { lat, lng } }) => placeMarker(map, pinIcon, lat, lng));

    /* Expose map + pinIcon on ref so toolbar buttons can use them */
    mapRef.current = { map, pinIcon };
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  const handleZoom = (delta) => mapRef.current?.map.setZoom(mapRef.current.map.getZoom() + delta);

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    setStatusMsg("Detecting your location...");
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        const { map, pinIcon } = mapRef.current;
        map.setView([lat, lng], 16);
        placeMarker(map, pinIcon, lat, lng);
        setLocating(false);
      },
      () => {
        setStatusMsg("Could not get location. Please allow location access.");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    if (!selectedCoords) return;
    onConfirm(selectedCoords, geocodeResult);
  };

  const btnBase = {
    width: 36, height: 36, border: "none", borderRadius: 6,
    background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, fontWeight: 700, color: "#333",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 4, width: "min(700px, 94vw)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{tMap("FIRENOC_FORM_GIS_SELECT_LOCATION_TITLE")}</span>
          <span onClick={onClose} style={{ cursor: "pointer", fontSize: 22, color: "#666", lineHeight: 1, padding: "0 4px" }}>×</span>
        </div>

        {/* Map + toolbar overlay */}
        <div style={{ position: "relative" }}>
          <div ref={containerRef} style={{ height: 420, width: "100%" }} />

          {/* Custom zoom + my-location toolbar */}
          <div style={{ position: "absolute", top: 12, right: 12, zIndex: 1000, display: "flex", flexDirection: "column", gap: 6 }}>
            <button onClick={() => handleZoom(1)} style={btnBase} title="Zoom in">+</button>
            <button onClick={() => handleZoom(-1)} style={btnBase} title="Zoom out">−</button>
            <div style={{ height: 6 }} />
            <button
              onClick={handleMyLocation}
              style={{ ...btnBase, color: locating ? "#aaa" : "#f47738" }}
              title="My location"
              disabled={locating}
            >
              {locating
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v2M12 16v2M6 12H4M20 12h-2"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="#f47738"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#555" }}>
            {loadingGeo ? "Getting address..." : statusMsg}
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ padding: "8px 20px", border: "1px solid #ccc", background: "#fff", borderRadius: 4, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Cancel</button>
            <button onClick={handleConfirm} disabled={!selectedCoords}
              style={{ padding: "8px 20px", background: selectedCoords ? "#f47738" : "#ccc", color: "#fff", border: "none", borderRadius: 4, cursor: selectedCoords ? "pointer" : "not-allowed", fontWeight: 600, fontSize: 13 }}>
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Custom searchable dropdown – drop-in replacement for native <select> */
const SelectBox = ({ value, onChange, disabled, children }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [openUp, setOpenUp] = useState(false);
  const wrapRef = useRef(null);

  const allOptions = React.Children.toArray(children).filter(
    c => c.type === "option" && !c.props.disabled && !c.props.hidden
  );
  const filtered = search
    ? allOptions.filter(c => String(c.props.children).toLowerCase().includes(search.toLowerCase()))
    : allOptions;
  const selectedLabel = allOptions.find(c => String(c.props.value) === String(value))?.props?.children;

  useEffect(() => {
    const handler = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) { setOpen(false); setSearch(""); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    if (!open && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      const panelHeight = 280; // approx max panel height
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUp(spaceBelow < panelHeight && rect.top > panelHeight);
    }
    setOpen(o => !o);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", marginTop: 6 }}>
      {/* Trigger */}
      <div
        onClick={handleOpen}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 12px",
          border: `1px solid ${open ? "#f47738" : "#d0d0d0"}`,
          borderRadius: 6, background: disabled ? "#f9f9f9" : "#fff",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1, fontSize: 14,
          boxShadow: open ? "0 0 0 3px rgba(244,119,56,0.12)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          userSelect: "none",
        }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: value ? "#0b0c0c" : "#999", paddingRight: 8 }}>
          {selectedLabel || "Select..."}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5"
          style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* Dropdown panel — flips upward when near bottom of viewport */}
      {open && (
        <div style={{
          position: "absolute",
          ...(openUp
            ? { bottom: "calc(100% + 4px)", top: "auto" }
            : { top: "calc(100% + 4px)", bottom: "auto" }),
          left: 0, right: 0, zIndex: 1000,
          background: "#fff", border: "1px solid #e0e0e0", borderRadius: 6,
          boxShadow: "0 6px 24px rgba(0,0,0,0.13)", overflow: "hidden",
        }}>
          {/* Search bar */}
          <div style={{ padding: "8px 10px", borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #e0e0e0", borderRadius: 4, padding: "5px 10px", background: "#fff" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder="Search..."
                style={{ border: "none", outline: "none", fontSize: 13, flex: 1, background: "transparent", color: "#333" }}
              />
              {search && (
                <span onClick={e => { e.stopPropagation(); setSearch(""); }} style={{ cursor: "pointer", color: "#bbb", fontSize: 14, lineHeight: 1 }}>×</span>
              )}
            </div>
          </div>
          {/* Options */}
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "14px", color: "#aaa", fontSize: 13, textAlign: "center" }}>No results found</div>
            ) : filtered.map(opt => {
              const isSelected = String(opt.props.value) === String(value);
              return (
                <div
                  key={opt.props.value}
                  onClick={() => { onChange({ target: { value: opt.props.value } }); setOpen(false); setSearch(""); }}
                  style={{
                    padding: "10px 14px", fontSize: 14, cursor: "pointer",
                    background: isSelected ? "#fff8f5" : "#fff",
                    color: isSelected ? "#f47738" : "#333",
                    fontWeight: isSelected ? 600 : 400,
                    borderLeft: `3px solid ${isSelected ? "#f47738" : "transparent"}`,
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#f9f9f9"; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "#fff"; }}
                >
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#091E64" strokeWidth="2.8" style={{ flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                  <span style={{ flex: 1 }}>{opt.props.children}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const BuildingCard = ({ b, idx, showRemove, updateBuilding, removeBuilding, t, floorOptions, basementOptions }) => {
  const subtypes = b.usageType ? (BUILDING_SUBTYPES[b.usageType] || []) : [];
  return (
    <div style={{ border: "1px solid #d0d8f0", borderRadius: 8, marginBottom: 20, overflow: "hidden", boxShadow: "0 2px 8px rgba(9,30,100,0.08)" }}>
      {/* Card header */}
      <div style={{ background: "linear-gradient(90deg, #091E64 0%, #1a3a8c 100%)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)", color: "#fff", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{idx + 1}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 14, color: "#fff" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ flexShrink: 0 }}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18"/></svg>
            <span>{b.buildingName ? `${t("FIRENOC_FORM_NAME_OF_BUILDING")} - ${b.buildingName}` : t("FIRENOC_FORM_NAME_OF_BUILDING")}</span>
          </div>
        </div>
        {showRemove && (
          <button onClick={() => removeBuilding(idx)}
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 4, cursor: "pointer", padding: "4px 10px", color: "#fff", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
            title="Remove building"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Remove
          </button>
        )}
      </div>
      {/* Card body */}
      <div style={{ padding: "16px" }}>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>{t("FIRENOC_FORM_NAME_OF_BUILDING")} <span style={{ color: "#d32f2f" }}>*</span></label>
        <input type="text" value={b.buildingName} onChange={e => updateBuilding(idx, "buildingName", e.target.value)}
          placeholder={t("FIRENOC_FORM_PLACEHOLDER_BUILDING_NAME")} style={inputStyle} />
      </div>
      <div style={gridRow}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{t("FIRENOC_FORM_BUILDING_USAGE_TYPE")} <span style={{ color: "#d32f2f" }}>*</span></label>
          <SelectBox value={b.usageType} onChange={e => { updateBuilding(idx, "usageType", e.target.value); updateBuilding(idx, "usageSubtype", ""); }}>
            <option value="" disabled hidden>{t("FIRENOC_FORM_SELECT_BUILDING_USAGE_TYPE")}</option>
            {BUILDING_USAGE_TYPES.map(code => (
              <option key={code} value={code}>{t(`FIRENOC_BUILDINGTYPE_${toLocaleKey(code)}`)}</option>
            ))}
          </SelectBox>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{t("FIRENOC_FORM_BUILDING_USAGE_SUBTYPE")} <span style={{ color: "#d32f2f" }}>*</span></label>
          <SelectBox value={b.usageSubtype} onChange={e => updateBuilding(idx, "usageSubtype", e.target.value)} disabled={!b.usageType}>
            <option value="" disabled hidden>{t("FIRENOC_FORM_SELECT_BUILDING_USAGE_SUBTYPE")}</option>
            {subtypes.map(sub => {
              const fullCode = `${b.usageType}.${sub}`;
              return <option key={sub} value={fullCode}>{t(`FIRENOC_BUILDINGTYPE_${toLocaleKey(fullCode)}`)}</option>;
            })}
          </SelectBox>
        </div>
      </div>
      <div style={gridRow}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{t("FIRENOC_FORM_NO_OF_FLOORS")} <span style={{ color: "#d32f2f" }}>*</span></label>
          <SelectBox value={b.noOfFloors} onChange={e => updateBuilding(idx, "noOfFloors", e.target.value)}>
            <option value="" disabled hidden>{t("FIRENOC_FORM_SELECT_NO_OF_FLOORS")}</option>
            {floorOptions.map(n => <option key={n} value={String(n)}>{n}</option>)}
          </SelectBox>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{t("FIRENOC_FORM_NO_OF_BASEMENTS")} <span style={{ color: "#d32f2f" }}>*</span></label>
          <SelectBox value={b.noOfBasements} onChange={e => updateBuilding(idx, "noOfBasements", e.target.value)}>
            <option value="" disabled hidden>{t("FIRENOC_FORM_SELECT_NO_OF_BASEMENTS")}</option>
            {basementOptions.map(n => <option key={n} value={String(n)}>{n}</option>)}
          </SelectBox>
        </div>
      </div>
      <div style={gridRow}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{t("FIRENOC_FORM_PLOT_SIZE")}</label>
          <input type="number" value={b.plotSize} onChange={e => updateBuilding(idx, "plotSize", e.target.value)}
            placeholder={t("FIRENOC_FORM_PLACEHOLDER_PLOT_SIZE")} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{t("FIRENOC_FORM_GROUND_FLOOR_AREA")}</label>
          <input type="number" value={b.groundFloorArea} onChange={e => updateBuilding(idx, "groundFloorArea", e.target.value)}
            placeholder={t("FIRENOC_FORM_PLACEHOLDER_GROUND_FLOOR_AREA")} style={inputStyle} />
        </div>
      </div>
      <div style={{ marginBottom: 0 }}>
        <label style={labelStyle}>{t("FIRENOC_FORM_HEIGHT_OF_BUILDING")}</label>
        <input type="number" value={b.heightOfBuilding} onChange={e => updateBuilding(idx, "heightOfBuilding", e.target.value)}
          placeholder={t("FIRENOC_FORM_PLACEHOLDER_HEIGHT_OF_BUILDING")} style={inputStyle} />
      </div>
      </div>
    </div>
  );
};

const PropertyDetails = ({ onNext, onBack }) => {
  const { t } = useTranslation();
  const stateId = window.Digit.ULBService.getStateId();
  const initData = window.Digit.SessionStorage.get("initData");
  const cityList = (initData?.tenants || [])
    .filter(c => c.code !== stateId)
    .sort((a, b) => (a.name || a.code).localeCompare(b.name || b.code));
  const emptyBuilding = () => ({ buildingName: "", usageType: "", usageSubtype: "", noOfFloors: "", noOfBasements: "", plotSize: "", groundFloorArea: "", heightOfBuilding: "" });
  const [buildings, setBuildings] = useState([emptyBuilding()]);

  const updateBuilding = (idx, field, value) =>
    setBuildings(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b));
  const addBuilding = () => setBuildings(prev => [...prev, emptyBuilding()]);
  const removeBuilding = (idx) => setBuildings(prev => prev.filter((_, i) => i !== idx));
  // Location
  const [propertyId, setPropertyId]   = useState("");
  const [city, setCity]               = useState("");
  const [plotSurveyNo, setPlotSurveyNo] = useState("");
  const [locBuildingName, setLocBuildingName] = useState("");
  const [streetName, setStreetName]   = useState("");
  const [mohalla, setMohalla]         = useState("");
  const [pincode, setPincode]         = useState("");
  const [fireStation, setFireStation] = useState("");
  const [gisCoords, setGisCoords]     = useState(null);
  const [showMap, setShowMap]         = useState(false);
  const [propSearching, setPropSearching] = useState(false);
  const [propSearchError, setPropSearchError] = useState("");
  const [localityList, setLocalityList] = useState([]);
  const [localityLoading, setLocalityLoading] = useState(false);

  // Fetch localities from MDMS whenever city changes
  useEffect(() => {
    if (!city) { setLocalityList([]); setMohalla(""); return; }
    setMohalla("");
    setLocalityLoading(true);
    window.Digit.LocationService.getLocalities({ tenantId: city })
      .then(res => {
        const locs = res?.TenantBoundary?.[0]?.boundary || [];
        setLocalityList(locs.sort((a, b) => (a.name || a.code).localeCompare(b.name || b.code)));
      })
      .catch(() => setLocalityList([]))
      .finally(() => setLocalityLoading(false));
  }, [city]);

  const handlePropertySearch = async () => {
    if (!propertyId.trim()) return;
    setPropSearching(true);
    setPropSearchError("");
    try {
      const tenantId = window.Digit.ULBService.getStateId();
      /* Only pass auth:true when a token is actually present — sending authToken:null causes 400 */
      const hasToken = !!window.Digit.UserService.getUser()?.access_token;
      const res = await window.Digit.PTService.search({
        tenantId,
        filters: { propertyIds: propertyId.trim() },
        auth: hasToken,
      });
      const prop = res?.Properties?.[0];
      if (!prop) {
        setPropSearchError("Property not found.");
        return;
      }
      const addr = prop.address || {};
      if (addr.pincode)    setPincode(addr.pincode);
      if (addr.street)     setStreetName(addr.street);
      if (addr.doorNo)     setLocBuildingName(addr.doorNo);
      if (addr.locality?.code) setMohalla(addr.locality.code);
      if (addr.city || prop.tenantId) {
        const matchedCity = cityList.find(
          c => c.code === (addr.city || prop.tenantId)
        );
        if (matchedCity) setCity(matchedCity.code);
      }
      if (addr.latitude && addr.longitude)
        setGisCoords({ lat: addr.latitude, lng: addr.longitude });
      if (prop.plotArea)   updateBuilding(0, "plotSize", String(prop.plotArea));
      setPropSearchError("");
    } catch (e) {
      setPropSearchError("Search failed. Please try again.");
    } finally {
      setPropSearching(false);
    }
  };

  const handleMapConfirm = (coords, geocodeResult) => {
    setGisCoords(coords);
    setShowMap(false);
    if (!geocodeResult) return;
    const addr = geocodeResult.address || {};
    if (!pincode && addr.postcode)                                             setPincode(addr.postcode);
    if (!streetName && (addr.road || addr.street))                             setStreetName(addr.road || addr.street || "");
    if (!mohalla && (addr.suburb || addr.neighbourhood || addr.city_district)) setMohalla(addr.suburb || addr.neighbourhood || addr.city_district || "");
    if (!locBuildingName && addr.amenity)                                      setLocBuildingName(addr.amenity);
  };

  const floorOptions = Array.from({ length: 20 }, (_, i) => i + 1);
  const basementOptions = Array.from({ length: 6 }, (_, i) => i);

  const field = (labelKey, val, set, req, extra = {}) => (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{t(labelKey)}{req && <span style={{ color: "red" }}> *</span>}</label>
      <input type={extra.type || "text"} value={val} onChange={e => set(e.target.value)}
        placeholder={extra.placeholder ? t(extra.placeholder) : ""}
        style={inputStyle} />
    </div>
  );

  const dropdown = (labelKey, val, set, options, req, placeholderKey) => (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{t(labelKey)}{req && <span style={{ color: "red" }}> *</span>}</label>
      <SelectBox value={val} onChange={e => set(e.target.value)}>
        <option value="" disabled hidden>{t(placeholderKey)}</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </SelectBox>
    </div>
  );

  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: "24px", marginBottom: 16, boxShadow: "0 2px 12px rgba(9,30,100,0.08)", borderTop: "3px solid #091E64" }}>

      {/* ── Building Details ── */}
      <h3 style={sectionHeadStyle}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#091E64" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18"/></svg>
        {t("FIRENOC_FORM_BUILDING_DETAILS")}
      </h3>

      {buildings.map((b, idx) => (
        <BuildingCard key={idx} b={b} idx={idx} showRemove={buildings.length > 1}
          updateBuilding={updateBuilding} removeBuilding={removeBuilding}
          t={t} floorOptions={floorOptions} basementOptions={basementOptions} />
      ))}

      <button onClick={addBuilding}
        style={{ display: "flex", alignItems: "center", gap: 8, color: "#f47738", background: "#fff8f5", border: "2px dashed #f47738", borderRadius: 8, padding: "12px 20px", cursor: "pointer", fontWeight: 700, fontSize: 13, marginBottom: 24, width: "100%", justifyContent: "center", transition: "background 0.15s" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        {t("FIRENOC_FORM_ADD_BUILDING")}
      </button>

      {/* ── Property Location Details ── */}
      <h3 style={{ ...sectionHeadStyle, marginTop: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#091E64" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
        {t("FIRENOC_FORM_PROPERTY_LOCATION_DETAILS")}
      </h3>

      <div style={gridRow}>
        {/* Property ID with search icon */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{t("FIRENOC_FORM_PROPERTY_ID")}</label>
          <div style={{ display: "flex", border: "1px solid #d0d0d0", borderRadius: 6, marginTop: 6, overflow: "hidden", background: "#fff" }}>
            <input
              type="text"
              value={propertyId}
              onChange={e => { setPropertyId(e.target.value); setPropSearchError(""); }}
              onKeyDown={e => e.key === "Enter" && handlePropertySearch()}
              placeholder={t("FIRENOC_FORM_PLACEHOLDER_PROPERTY_ID")}
              style={{ flex: 1, padding: "10px 12px", border: "none", outline: "none", fontSize: 14 }}
            />
            <button
              onClick={handlePropertySearch}
              disabled={propSearching || !propertyId.trim()}
              style={{ padding: "8px 14px", border: "none", borderLeft: "1px solid #e0e0e0", background: "#f7f9ff", cursor: propSearching ? "wait" : "pointer", fontSize: 18, color: "#091E64", display: "flex", alignItems: "center" }}
              title="Search property"
            >
              {propSearching
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#091E64" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#091E64" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              }
            </button>
          </div>
          {propSearchError && (
            <div style={{ fontSize: 12, color: "#c62828", marginTop: 4 }}>{propSearchError}</div>
          )}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{t("FIRENOC_FORM_CITY")} <span style={{ color: "red" }}>*</span></label>
          <SelectBox value={city} onChange={e => setCity(e.target.value)}>
            <option value="" disabled hidden>{t("FIRENOC_FORM_SELECT_CITY")}</option>
            {cityList.map(tenant => (
              <option key={tenant.code} value={tenant.code}>{tenant.name || tenant.code}</option>
            ))}
          </SelectBox>
        </div>
      </div>

      <div style={gridRow}>
        {field("FIRENOC_FORM_PLOT_SURVEY_NO", plotSurveyNo, setPlotSurveyNo, false, { placeholder: "FIRENOC_FORM_PLACEHOLDER_PLOT_SURVEY_NO" })}
        {field("FIRENOC_FORM_COLONY_BUILDING_NAME", locBuildingName, setLocBuildingName, false, { placeholder: "FIRENOC_FORM_PLACEHOLDER_COLONY_BUILDING_NAME" })}
      </div>

      <div style={gridRow}>
        {field("FIRENOC_FORM_STREET_NAME", streetName, setStreetName, false, { placeholder: "FIRENOC_FORM_PLACEHOLDER_STREET_NAME" })}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{t("FIRENOC_FORM_MOHALLA")}</label>
          <SelectBox
            value={mohalla}
            onChange={e => setMohalla(e.target.value)}
            disabled={!city || localityLoading}
          >
            <option value="" disabled hidden>
              {localityLoading ? "Loading..." : !city ? t("FIRENOC_FORM_SELECT_CITY_FIRST") : t("FIRENOC_FORM_SELECT_MOHALLA")}
            </option>
            {localityList.map(loc => (
              <option key={loc.code} value={loc.code}>{loc.name || loc.code}</option>
            ))}
          </SelectBox>
        </div>
      </div>

      <div style={gridRow}>
        {field("FIRENOC_FORM_PINCODE", pincode, setPincode, false, { placeholder: "FIRENOC_FORM_PLACEHOLDER_PINCODE", type: "number" })}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{t("FIRENOC_FORM_FIRE_STATION")} <span style={{ color: "red" }}>*</span></label>
          <SelectBox value={fireStation} onChange={e => setFireStation(e.target.value)}>
            <option value="" disabled hidden>{t("FIRENOC_FORM_PLACEHOLDER_FIRE_STATION")}</option>
            {FIRE_STATIONS.map(code => (
              <option key={code} value={code}>{t(`FIRENOC_FIRESTATION_${toLocaleKey(code)}`)}</option>
            ))}
          </SelectBox>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>{t("FIRENOC_FORM_GIS_LOCATION")}</label>
        <div
          onClick={() => setShowMap(true)}
          style={{
            marginTop: 6, display: "flex", alignItems: "center", gap: 12,
            border: gisCoords ? "1px solid #091E64" : "1px dashed #b0bcdb",
            borderRadius: 6, padding: "12px 16px", cursor: "pointer",
            background: gisCoords ? "#eef1fa" : "#f7f9ff",
            transition: "border-color 0.2s, background 0.2s",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={gisCoords ? "#091E64" : "#b0bcdb"}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
          </svg>
          <div style={{ flex: 1 }}>
            {gisCoords ? (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#091E64" }}>Location selected</div>
                <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
                  {gisCoords.lat.toFixed(6)}, {gisCoords.lng.toFixed(6)}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>{t("FIRENOC_FORM_GIS_CLICK_TO_SELECT")}</div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{t("FIRENOC_FORM_GIS_PINPOINTS_NOTE")}</div>
              </div>
            )}
          </div>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: "6px 14px",
            border: "1px solid " + (gisCoords ? "#091E64" : "#d0d8f0"),
            borderRadius: 6, color: gisCoords ? "#091E64" : "#555",
            background: "#fff", whiteSpace: "nowrap",
          }}>
            {gisCoords ? t("FIRENOC_FORM_GIS_CHANGE") : t("FIRENOC_FORM_GIS_OPEN_MAP")}
          </span>
        </div>
      </div>

      {showMap && (
        <MapPickerModal
          initialCoords={gisCoords}
          onConfirm={handleMapConfirm}
          onClose={() => setShowMap(false)}
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button onClick={onBack}
          style={{ padding: "12px 28px", border: "1px solid #e0e0e0", background: "#fff", borderRadius: 4, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          {t("FIRENOC_FORM_BTN_PREVIOUS_STEP")}
        </button>
        <button
          onClick={() => onNext({ buildings, propertyId, city, plotSurveyNo, locBuildingName, streetName, mohalla, pincode, fireStation, gisCoords })}
          style={{ background: "#f47738", color: "#fff", border: "none", borderRadius: 4, padding: "12px 32px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 2px 8px rgba(244,119,56,0.35)" }}>
          {t("FIRENOC_FORM_BTN_NEXT_STEP")}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Step 3: Applicant Details                                           */
/* ------------------------------------------------------------------ */
const APPLICANT_TYPES = ["INDIVIDUAL", "INSTITUTIONALPRIVATE", "INSTITUTIONALGOVERNMENT"];
const APPLICANT_SUBTYPES = {
  INDIVIDUAL:             ["INDIVIDUAL.SINGLEOWNER", "INDIVIDUAL.MULTIPLEOWNERS"],
  INSTITUTIONALPRIVATE:   ["INSTITUTIONALPRIVATE.NGO", "INSTITUTIONALPRIVATE.OTHERSPRIVATEINSTITUTION", "INSTITUTIONALPRIVATE.PRIVATEBOARD"],
  INSTITUTIONALGOVERNMENT:["INSTITUTIONALGOVERNMENT.CENTRALGOVERNMENT", "INSTITUTIONALGOVERNMENT.OTHERSGOVERNMENTINSTITUTION", "INSTITUTIONALGOVERNMENT.STATEGOVERNMENT"],
};
const SPECIAL_CATEGORIES = ["NONE", "FREEDOMFIGHTER", "WIDOW", "HANDICAPPED", "BPL", "DEFENSE"];

const RadioGroup = ({ options, value, onChange, labelFn }) => (
  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
    {options.map(opt => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(value === opt ? "" : opt)}
        style={{
          padding: "8px 18px",
          border: `1.5px solid ${value === opt ? "#091E64" : "#d0d0d0"}`,
          borderRadius: 4,
          background: value === opt ? "#e3f2fd" : "#fff",
          color: value === opt ? "#091E64" : "#555",
          fontWeight: value === opt ? 700 : 400,
          fontSize: 13,
          cursor: "pointer",
          outline: "none",
          display: "flex", alignItems: "center", gap: 6,
          transition: "border-color 0.15s, background 0.15s, color 0.15s",
        }}
      >
        {value === opt && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#091E64" strokeWidth="3" style={{ flexShrink: 0 }}>
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
        {labelFn(opt)}
      </button>
    ))}
  </div>
);

const emptyApplicant = () => ({
  mobile: "", name: "", gender: "", dob: "", email: "",
  fatherHusbandName: "", relationship: "", pan: "",
  correspondenceAddress: "", specialCategory: "",
});

const ApplicantDetails = ({ onNext, onBack }) => {
  const { t } = useTranslation();
  const [applicantType, setApplicantType] = useState("");
  const [applicantSubtype, setApplicantSubtype] = useState("");
  const [applicants, setApplicants] = useState([emptyApplicant()]);

  const subtypeOptions = APPLICANT_SUBTYPES[applicantType] || [];
  const isMultiple = applicantSubtype === "INDIVIDUAL.MULTIPLEOWNERS";

  const updateApplicant = (idx, field, value) =>
    setApplicants(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));

  const addApplicant = () => setApplicants(prev => [...prev, emptyApplicant()]);

  const removeApplicant = (idx) => setApplicants(prev => prev.filter((_, i) => i !== idx));

  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: "24px", marginBottom: 16, boxShadow: "0 2px 12px rgba(9,30,100,0.08)", borderTop: "3px solid #091E64" }}>
      <h3 style={sectionHeadStyle}>{t("FIRENOC_FORM_STEP_APPLICANT_DETAILS")}</h3>

      {/* Applicant Type & Subtype */}
      <div style={{ background: "#f0f3fa", border: "1px solid #d0d8f0", borderRadius: 8, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#091E64", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#091E64" strokeWidth="2.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          Applicant Classification
        </div>
        <div style={gridRow}>
          <div style={{ marginBottom: 0 }}>
            <label style={labelStyle}>{t("FIRENOC_FORM_APPLICANT_TYPE")} <span style={{ color: "#d32f2f" }}>*</span></label>
            <SelectBox value={applicantType} onChange={e => { setApplicantType(e.target.value); setApplicantSubtype(""); }}>
              <option value="" disabled hidden>{t("FIRENOC_FORM_SELECT_APPLICANT_TYPE")}</option>
              {APPLICANT_TYPES.map(type => (
                <option key={type} value={type}>{t(`FIRENOC_APPLICANT_TYPE_${type}`)}</option>
              ))}
            </SelectBox>
          </div>
          <div style={{ marginBottom: 0 }}>
            <label style={labelStyle}>{t("FIRENOC_FORM_APPLICANT_SUBTYPE")} <span style={{ color: "#d32f2f" }}>*</span></label>
            <SelectBox value={applicantSubtype} onChange={e => setApplicantSubtype(e.target.value)} disabled={!applicantType}>
              <option value="" disabled hidden>{t("FIRENOC_FORM_SELECT_APPLICANT_SUBTYPE")}</option>
              {subtypeOptions.map(sub => (
                <option key={sub} value={sub}>{t(`FIRENOC_APPLICANT_SUBTYPE_${toLocaleKey(sub)}`)}</option>
              ))}
            </SelectBox>
          </div>
        </div>
      </div>

      {/* Applicant Information sub-section — one card per applicant */}
      {applicants.map((a, idx) => (
        <div key={idx} style={{ border: "1px solid #d0d8f0", borderRadius: 8, marginBottom: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(9,30,100,0.07)" }}>
          {/* Card header */}
          <div style={{ background: "linear-gradient(90deg, #091E64 0%, #1a3a8c 100%)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)", color: "#fff", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {isMultiple ? idx + 1 : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", letterSpacing: "0.2px" }}>
                {isMultiple ? `${t("FIRENOC_FORM_APPLICANT_INFORMATION")} ${idx + 1}` : t("FIRENOC_FORM_APPLICANT_INFORMATION")}
              </div>
            </div>
            {isMultiple && applicants.length > 1 && (
              <button type="button" onClick={() => removeApplicant(idx)}
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 4, color: "#fff", fontSize: 12, fontWeight: 600, padding: "4px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                {t("FIRENOC_FORM_REMOVE_APPLICANT") || "Remove"}
              </button>
            )}
          </div>
          {/* Card body */}
          <div style={{ padding: "16px 16px 4px", background: "#fff" }}>
          <div style={gridRow}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t("FIRENOC_FORM_APPLICANT_NAME")}</label>
              <input type="text" value={a.name} onChange={e => updateApplicant(idx, "name", e.target.value)}
                placeholder={t("FIRENOC_FORM_PLACEHOLDER_APPLICANT_NAME")} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t("FIRENOC_FORM_MOBILE_NUMBER")} <span style={{ color: "#d32f2f" }}>*</span></label>
              <input type="tel" value={a.mobile} onChange={e => updateApplicant(idx, "mobile", e.target.value)}
                placeholder={t("FIRENOC_FORM_PLACEHOLDER_MOBILE_NUMBER")} style={inputStyle} />
            </div>
          </div>
          <div style={gridRow}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t("FIRENOC_FORM_EMAIL_ID")}</label>
              <input type="email" value={a.email} onChange={e => updateApplicant(idx, "email", e.target.value)}
                placeholder={t("FIRENOC_FORM_PLACEHOLDER_EMAIL_ID")} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t("FIRENOC_FORM_DATE_OF_BIRTH")} <span style={{ color: "#d32f2f" }}>*</span></label>
              <input type="date" value={a.dob} onChange={e => updateApplicant(idx, "dob", e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={gridRow}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t("FIRENOC_FORM_GENDER")}</label>
              <RadioGroup options={["MALE", "FEMALE", "TRANSGENDER"]} value={a.gender}
                onChange={v => updateApplicant(idx, "gender", v)} labelFn={opt => t(`FIRENOC_GENDER_${opt}`)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t("FIRENOC_FORM_RELATIONSHIP")} <span style={{ color: "#d32f2f" }}>*</span></label>
              <RadioGroup options={["FATHER", "HUSBAND"]} value={a.relationship}
                onChange={v => updateApplicant(idx, "relationship", v)} labelFn={opt => t(`FIRENOC_RELATIONSHIP_${opt}`)} />
            </div>
          </div>
          <div style={gridRow}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t("FIRENOC_FORM_FATHER_HUSBAND_NAME")} <span style={{ color: "#d32f2f" }}>*</span></label>
              <input type="text" value={a.fatherHusbandName} onChange={e => updateApplicant(idx, "fatherHusbandName", e.target.value)}
                placeholder={t("FIRENOC_FORM_PLACEHOLDER_FATHER_HUSBAND_NAME")} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t("FIRENOC_FORM_PAN_NUMBER")}</label>
              <input type="text" value={a.pan} onChange={e => updateApplicant(idx, "pan", e.target.value)}
                placeholder={t("FIRENOC_FORM_PLACEHOLDER_PAN_NUMBER")} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{t("FIRENOC_FORM_CORRESPONDENCE_ADDRESS")} <span style={{ color: "#d32f2f" }}>*</span></label>
            <input type="text" value={a.correspondenceAddress} onChange={e => updateApplicant(idx, "correspondenceAddress", e.target.value)}
              placeholder={t("FIRENOC_FORM_PLACEHOLDER_CORRESPONDENCE_ADDRESS")} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{t("FIRENOC_FORM_SPECIAL_APPLICANT_CATEGORY")} <span style={{ color: "#d32f2f" }}>*</span></label>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {SPECIAL_CATEGORIES.map(cat => (
                <button key={cat} type="button"
                  onClick={() => updateApplicant(idx, "specialCategory", a.specialCategory === cat ? "" : cat)}
                  style={{
                    padding: "8px 18px",
                    border: `1.5px solid ${a.specialCategory === cat ? "#091E64" : "#d0d0d0"}`,
                    borderRadius: 4,
                    background: a.specialCategory === cat ? "#e3f2fd" : "#fff",
                    color: a.specialCategory === cat ? "#091E64" : "#555",
                    fontWeight: a.specialCategory === cat ? 700 : 400,
                    fontSize: 13, cursor: "pointer", outline: "none",
                    display: "flex", alignItems: "center", gap: 6,
                    transition: "border-color 0.15s, background 0.15s, color 0.15s",
                  }}
                >
                  {a.specialCategory === cat && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#091E64" strokeWidth="3" style={{ flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                  {t(`FIRENOC_SPECIAL_CATEGORY_${cat}`)}
                </button>
              ))}
            </div>
          </div>
          </div>
        </div>
      ))}

      {/* Add Applicant button — only for Multiple Owners */}
      {isMultiple && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button type="button" onClick={addApplicant}
            style={{ display: "flex", alignItems: "center", gap: 6, color: "#091E64", background: "#eef1fa", border: "2px dashed #091E64", borderRadius: 6, padding: "10px 20px", cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "background 0.15s" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#091E64" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {t("FIRENOC_FORM_ADD_APPLICANT") || "+ Add Applicant"}
          </button>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button onClick={onBack} style={{ padding: "12px 28px", border: "1px solid #e0e0e0", background: "#fff", borderRadius: 4, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          {t("FIRENOC_FORM_BTN_PREVIOUS_STEP")}
        </button>
        <button
          onClick={() => onNext({ applicantType, applicantSubtype, applicants })}
          style={{ background: "#f47738", color: "#fff", border: "none", borderRadius: 4, padding: "12px 32px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 2px 8px rgba(244,119,56,0.35)" }}
        >
          {t("FIRENOC_FORM_BTN_NEXT_STEP")}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Step 4: Documents                                                   */
/* ------------------------------------------------------------------ */
const Documents = ({ onBack, formData }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [files, setFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Codes derived from Suda-MDMS/data/cg/firenoc/Documents.json
  const docList = [
    { code: "OWNER.IDENTITYPROOF",      required: true },
    { code: "OWNER.ADDRESSPROOF",       required: true },
    { code: "BUILDING.BUILDING_PLAN",   required: false },
    { code: "BUILDING.FIRE_FIGHTING_PLAN", required: false },
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const userInfo = window.Digit.UserService.getUser();
      const token = userInfo?.access_token;

      // Derive financial year: Apr–Mar boundary
      const now = new Date();
      const yr = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      const financialYear = `${yr}-${String(yr + 1).slice(-2)}`;

      const fd = formData;
      const buildings = (fd.buildings || []).map(b => ({
        name: b.buildingName,
        usageTypeMajor: b.usageType,
        usageTypeMinor: b.usageSubtype || undefined,
        noOfFloors: b.noOfFloors ? parseInt(b.noOfFloors, 10) : undefined,
        noOfBasements: b.noOfBasements !== "" ? parseInt(b.noOfBasements, 10) : undefined,
        plotSize: b.plotSize ? parseFloat(b.plotSize) : undefined,
        builtUpArea: b.groundFloorArea ? parseFloat(b.groundFloorArea) : undefined,
        heightOfBuilding: b.heightOfBuilding ? parseFloat(b.heightOfBuilding) : undefined,
      }));

      const payload = {
        RequestInfo: {
          apiId: "Rainmaker",
          ver: ".01",
          action: "",
          did: "1",
          key: "",
          msgId: `${Date.now()}|${window.Digit.StoreData?.getCurrentLanguage?.() || "en_IN"}`,
          authToken: token || null,
          userInfo: userInfo?.info || {},
        },
        FireNOCs: [
          {
            tenantId: fd.city,
            fireNOCDetails: {
              fireNOCType: fd.nocType || "NEW",
              noOfBuildings: buildings.length > 1 ? "MULTIPLE" : "SINGLE",
              action: "INITIATE",
              channel: "CITIZEN",
              financialYear,
              fireStationId: fd.fireStation || undefined,
              buildings,
              applicantDetails: {
                ownerShipMajorType: fd.applicantType?.split(".")?.[0] || fd.applicantType || "INDIVIDUAL",
                ownerShipType: fd.applicantSubtype || fd.applicantType || "INDIVIDUAL.SINGLEOWNER",
                additionalDetails: { documents: [] },
                owners: [
                  {
                    name: fd.name,
                    mobileNumber: fd.mobile,
                    emailId: fd.email || undefined,
                    gender: fd.gender || undefined,
                    dob: fd.dob || undefined,
                    fatherOrHusbandName: fd.fatherHusbandName || undefined,
                    relationship: fd.relationship || undefined,
                    pan: fd.pan || undefined,
                    correspondenceAddress: fd.correspondenceAddress || undefined,
                    specialApplicantCategory: fd.specialCategory || undefined,
                  },
                ],
              },
              propertyDetails: {
                propertyId: fd.propertyId || undefined,
                address: {
                  city: fd.city,
                  pincode: fd.pincode || undefined,
                  street: fd.streetName || undefined,
                  doorNo: fd.locBuildingName || undefined,
                  locality: fd.mohalla ? { code: fd.mohalla } : undefined,
                  plotNo: fd.plotSurveyNo || undefined,
                  ...(fd.gisCoords ? { latitude: fd.gisCoords.lat, longitude: fd.gisCoords.lng } : {}),
                },
              },
              additionalDetail: { documents: [] },
              ...(fd.nocType === "PROVISIONAL" ? { provisionalFireNOCNumber: fd.provisionalNo } : {}),
            },
          },
        ],
      };

      const response = await fetch("/firenoc-services/v1/_create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "auth-token": token } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.Errors?.[0]?.message || response.statusText);
      }

      const res = await response.json();
      const appNo = res?.FireNOCs?.[0]?.fireNOCDetails?.applicationNumber
        || res?.FireNOCs?.[0]?.fireNOCNumber
        || "—";

      history.push(`${history.location.pathname.replace("/apply", "/acknowledgement")}?applicationNumber=${appNo}`);
    } catch (err) {
      console.error("FireNOC create failed", err);
      alert("Submission failed: " + (err?.message || "Unknown error"));
      setSubmitting(false);
    }
  };

  // Group docs by section
  const docSections = [
    {
      sectionKey: "FIRENOC_DOCS_SECTION_OWNER",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      color: "#091E64", gradientEnd: "#1a3a8c", bgColor: "#eef1fa", borderColor: "#b0bcdb",
      subtitle: "Identity and address proof of the applicant",
      docs: [
        { code: "OWNER.IDENTITYPROOF", required: true },
        { code: "OWNER.ADDRESSPROOF",  required: true },
      ],
    },
    {
      sectionKey: "FIRENOC_DOCS_SECTION_BUILDING",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18"/></svg>,
      color: "#1b5e20", gradientEnd: "#2e7d32", bgColor: "#e8f5e9", borderColor: "#a5d6a7",
      subtitle: "Building plans and fire safety system documents",
      docs: [
        { code: "BUILDING.BUILDING_PLAN",      required: false },
        { code: "BUILDING.FIRE_FIGHTING_PLAN", required: false },
      ],
    },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: "24px", marginBottom: 16, boxShadow: "0 2px 12px rgba(9,30,100,0.08)", borderTop: "3px solid #091E64" }}>
      <h3 style={sectionHeadStyle}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#091E64" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        {t("FIRENOC_FORM_STEP_DOCUMENTS")}
      </h3>

      {/* Info note */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "#f0f3fa", border: "1px solid #d0d8f0", borderRadius: 8, padding: "12px 16px", marginBottom: 24 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#091E64" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span style={{ fontSize: 13, color: "#091E64", lineHeight: 1.5 }}>{t("FIRENOC_HOME_DOCS_READINESS_NOTE")}</span>
      </div>

      {docSections.map(section => (
        <div key={section.sectionKey} style={{ marginBottom: 28, border: "1px solid #d0d8f0", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(9,30,100,0.06)" }}>
          {/* Section header — gradient like BuildingCard */}
          <div style={{ background: `linear-gradient(90deg, ${section.color} 0%, ${section.gradientEnd} 100%)`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {section.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", letterSpacing: "0.2px" }}>{t(section.sectionKey)}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>{section.subtitle}</div>
            </div>
          </div>
          {/* Doc rows */}
          <div style={{ padding: "16px", background: "#fff", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {section.docs.map(({ code, required }) => {
              const fileKey = toLocaleKey(code);
              const uploaded = files[code];
              return (
                <div key={code}>
                  <label style={labelStyle}>
                    {t(`FIRENOC_DOCS_${fileKey}`)}
                    {required && <span style={{ color: "#d32f2f" }}> *</span>}
                  </label>
                  <div
                    onClick={() => !uploaded && document.getElementById(`file-${fileKey}`).click()}
                    style={{
                      marginTop: 6, display: "flex", alignItems: "center", gap: 12,
                      border: uploaded ? `1.5px solid ${section.color}` : "1.5px dashed #c0cce0",
                      borderRadius: 6, padding: "10px 14px", cursor: uploaded ? "default" : "pointer",
                      background: uploaded ? section.bgColor : "#f7f9ff",
                      transition: "border-color 0.2s, background 0.2s",
                    }}
                  >
                    {/* Left icon */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={uploaded ? section.color : "#b0bcdb"} style={{ flexShrink: 0 }}>
                      {uploaded
                        ? <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13zM9 13h6v1H9zm0 3h6v1H9zm0-6h2v1H9z"/>
                        : <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>}
                    </svg>
                    {/* Middle text */}
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      {uploaded ? (
                        <>
                          <div style={{ fontSize: 13, fontWeight: 600, color: section.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {uploaded.name}
                          </div>
                          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                            {(uploaded.size / 1024).toFixed(1)} KB
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>{t("FIRENOC_FORM_CLICK_TO_UPLOAD")}</div>
                          <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>PDF, JPG, PNG · Max 5MB</div>
                        </>
                      )}
                    </div>
                    {/* Right action button */}
                    <span
                      onClick={e => {
                        e.stopPropagation();
                        if (uploaded) {
                          setFiles(f => { const n = {...f}; delete n[code]; return n; });
                        } else {
                          document.getElementById(`file-${fileKey}`).click();
                        }
                      }}
                      style={{
                        fontSize: 12, fontWeight: 600, padding: "6px 14px", whiteSpace: "nowrap",
                        border: `1px solid ${uploaded ? "#c62828" : section.color}`,
                        borderRadius: 4, cursor: "pointer",
                        color: uploaded ? "#c62828" : section.color,
                        background: "#fff",
                      }}
                    >
                      {uploaded ? "Remove" : "Choose File"}
                    </span>
                    <input
                      id={`file-${fileKey}`}
                      type="file"
                      style={{ display: "none" }}
                      onChange={e => setFiles(f => ({ ...f, [code]: e.target.files[0] }))}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <button onClick={onBack} style={{ padding: "12px 28px", border: "1px solid #e0e0e0", background: "#fff", borderRadius: 4, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          {t("FIRENOC_FORM_BTN_PREVIOUS_STEP")}
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ background: submitting ? "#bbb" : "#f47738", color: "#fff", border: "none", borderRadius: 4, padding: "12px 32px", fontWeight: 700, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: submitting ? "none" : "0 2px 8px rgba(244,119,56,0.35)" }}
        >
          {submitting ? t("FIRENOC_FORM_SUBMITTING") : t("FIRENOC_FORM_BTN_SUBMIT")}
          {!submitting && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>}
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Acknowledgement                                                     */
/* ------------------------------------------------------------------ */
const Acknowledgement = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const appNo = params.get("applicationNumber") || "—";
  return (
    <div style={{ padding: "32px 16px 48px", display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", padding: "48px 40px", textAlign: "center", maxWidth: 480, width: "100%" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{ color: "#1b5e20", fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>{t("FIRENOC_ACKNOWLEDGEMENT_SUCCESS")}</h2>
        <div style={{ background: "#f5f5f5", borderRadius: 6, padding: "12px 20px", margin: "16px auto", display: "inline-block", minWidth: 220 }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{t("FIRENOC_ACKNOWLEDGEMENT_APP_NO")}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#f47738", letterSpacing: 1 }}>{appNo}</div>
        </div>
        <p style={{ color: "#777", fontSize: 13, margin: "12px 0 24px" }}>{t("FIRENOC_ACKNOWLEDGEMENT_SMS_NOTE")}</p>
        <button
          onClick={() => history.push("/suda-ui/citizen")}
          style={{ background: "#1f45a4", color: "#fff", border: "none", borderRadius: 4, padding: "12px 32px", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 2px 8px rgba(31,69,164,0.3)" }}
        >
          {t("FIRENOC_FORM_BTN_GO_HOME")}
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Apply: multi-step wrapper                                           */
/* ------------------------------------------------------------------ */
const ApplyPage = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const next = (data) => {
    setFormData((fd) => ({ ...fd, ...data }));
    setStep((s) => s + 1);
  };
  const back = () => setStep((s) => s - 1);

  return (
    <div style={{ padding: "0 16px 32px" }}>
      <div style={{ paddingTop: 20 }}><BackButton /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 4px", padding: "14px 18px", background: "#f0f3fa", borderRadius: 6, borderLeft: "4px solid #091E64" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#091E64" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#091E64", letterSpacing: "0.2px" }}>{t("FIRENOC_APPLICATION_TITLE")}</h2>
      </div>
      <Stepper active={step} />
      {step === 1 && <NocDetails onNext={next} />}
      {step === 2 && <PropertyDetails onNext={next} onBack={back} />}
      {step === 3 && <ApplicantDetails onNext={next} onBack={back} />}
      {step === 4 && <Documents onBack={back} formData={formData} />}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* My Applications                                                     */
/* ------------------------------------------------------------------ */
const MyApplications = () => {
  const { t } = useTranslation();
  const history = useHistory();
  return (
    <div style={{ padding: "24px" }}>
      <BackButton />
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "16px 0 24px" }}>{t("FIRENOC_MY_APPLICATIONS_TITLE")}</h2>
      <div style={{ textAlign: "center", padding: "48px 24px", color: "#888", border: "1px dashed #ccc", borderRadius: 4 }}>
        <p style={{ fontSize: 15 }}>{t("FIRENOC_NO_APPLICATIONS_FOUND")}</p>
        <button
          onClick={() => history.push(history.location.pathname.replace("/my-applications", "/apply"))}
          style={{ background: "#1f45a4", color: "#fff", border: "none", borderRadius: 4, padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 8 }}
        >
          {t("FIRENOC_FORM_BTN_APPLY_FIRENOC")}
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* FireNoc Service Hub — shown at module root                          */
/* ------------------------------------------------------------------ */
const FireNocServiceHub = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { path } = useRouteMatch();
  const cards = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="1.8">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
          <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      ),
      label: t("FIRENOC_COMMON_APPLY"),
      desc: t("FIRENOC_NOC_TYPE_NEW_SUBTITLE"),
      link: `${path}/apply`,
      bg: "#fff7f3",
      border: "#f47738",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#091E64" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="13" y2="16"/>
        </svg>
      ),
      label: t("FIRENOC_COMMON_MY_APPLICATIONS"),
      desc: t("FIRENOC_MY_APPLICATIONS_TITLE"),
      link: `${path}/my-applications`,
      bg: "#f0f3fa",
      border: "#091E64",
    },
  ];
  return (
    <div style={{ padding: "32px 28px" }}>
      <BackButton />
      <div style={{ background: "#f0f3fa", borderLeft: "4px solid #091E64", borderRadius: 8, padding: "16px 20px", marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#091E64" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#091E64" }}>{t("ACTION_TEST_FIRENOC")}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
        {cards.map((card, i) => (
          <div
            key={i}
            onClick={() => history.push(card.link)}
            style={{ background: card.bg, border: `2px solid ${card.border}`, borderRadius: 12, padding: "28px 24px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, boxShadow: "0 2px 8px rgba(9,30,100,0.07)", transition: "box-shadow 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(9,30,100,0.16)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(9,30,100,0.07)"}
          >
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px ${card.border}33` }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 13, color: "#666" }}>{card.desc}</div>
            </div>
            <div style={{ marginTop: "auto", fontSize: 13, fontWeight: 600, color: card.border, display: "flex", alignItems: "center", gap: 4 }}>
              {card.label} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={card.border} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* FireNocModule – registered in ComponentRegistryService             */
/* ------------------------------------------------------------------ */
const FireNocModule = ({ stateCode, userType, tenants }) => {
  const { path } = useRouteMatch();

  if (userType !== "citizen") {
    return <div style={{ padding: 24, color: "#888" }}>Employee view not implemented.</div>;
  }

  return (
    <Switch>
      <Route path={`${path}/apply`} component={ApplyPage} />
      <Route path={`${path}/my-applications`} component={MyApplications} />
      <Route path={`${path}/acknowledgement`} component={Acknowledgement} />
      <Route exact path={path} component={FireNocServiceHub} />
    </Switch>
  );
};

export default FireNocModule;
