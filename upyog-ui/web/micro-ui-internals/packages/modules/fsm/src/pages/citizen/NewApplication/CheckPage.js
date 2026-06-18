import React from "react";
import { SubmitBar } from "@upyog/digit-ui-react-components";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Timeline from "../../../components/TLTimelineInFSM";

const PROPERTY_STEP = "/suda-ui/citizen/fsm/new-application/fsm-property-details";
const PAYMENT_STEP  = "/suda-ui/citizen/fsm/new-application/select-payment-preference";

/* ── Shared styles ── */
const cardStyle = {
  background: "#fff",
  borderRadius: "16px",
  border: "1px solid #e8edf5",
  boxShadow: "0 2px 12px rgba(9,30,100,0.07)",
  marginBottom: "16px",
  overflow: "hidden",
};
const sectionHeaderStyle = {
  display: "flex", alignItems: "center", gap: "10px",
  padding: "14px 20px",
  background: "linear-gradient(135deg,#f8faff 0%,#f0f4ff 100%)",
  borderBottom: "1px solid #e8edf5",
};
const rowStyle = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "13px 20px", borderBottom: "1px solid #f3f4f6",
};
const labelStyle = { fontSize: "13px", color: "#6b7280", fontWeight: "500", flex: "0 0 45%" };
const valueStyle = { fontSize: "14px", color: "#111827", fontWeight: "600", flex: 1, textAlign: "right" };

const SectionIcon = ({ path, color = "#6366f1" }) => (
  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: color + "18",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"><path d={path}/></svg>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div style={rowStyle}>
    <span style={labelStyle}>{label}</span>
    <span style={valueStyle}>{value || "—"}</span>
  </div>
);

const CheckPage = ({ onSubmit, value }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { address, propertyType, subtype, pitType, selectPaymentPreference, roadWidth } = value;

  const getLocationDisplay = (address) => {
    if (!address) return "—";
    if (address.propertyLocation?.code === "WITHIN_ULB_LIMITS") {
      const loc = address.locality;
      if (!loc) return "—";
      if (loc.i18nkey && !/^[A-Z0-9_]+$/.test(loc.i18nkey)) return loc.i18nkey;
      return loc.name || "—";
    }
    const gp = address.gramPanchayat;
    if (!gp) return "—";
    const gpName = (gp.i18nkey && !/^[A-Z0-9_]+$/.test(gp.i18nkey)) ? gp.i18nkey : (gp.name || "—");
    const village = address.village;
    const villageName = village ? ((village.i18nkey && !/^[A-Z0-9_]+$/.test(village.i18nkey)) ? village.i18nkey : (village.name || "")) : "";
    return [gpName, villageName].filter(Boolean).join(", ");
  };

  const totalAmount  = Digit.SessionStorage.get("total_amount");
  const advanceMin   = Digit.SessionStorage.get("advance_amount");

  return (
    <React.Fragment>
      <button
        className="back-btn2"
        onClick={() => history.goBack()}
        style={{ marginBottom: "8px" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        <p>{t("CS_COMMON_BACK", { defaultValue: "Back" })}</p>
      </button>
      <Timeline currentStep={4} flow="APPLY" />
      <div style={{ padding: "0 0 24px", maxWidth: "900px" }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#091E64", marginBottom: "6px" }}>
            {t("CS_CHECK_CHECK_YOUR_ANSWERS")}
          </div>
          <div style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6" }}>
            {t("CS_CHECK_CHECK_YOUR_ANSWERS_TEXT")}
          </div>
        </div>

        {/* ── Section 1: Application Details ── */}
        <div style={cardStyle}>
          <div style={sectionHeaderStyle}>
            <SectionIcon color="#f47738" path="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10"/>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#091E64" }}>
              {t("ES_TITLE_APPLICATION_DETAILS")}
            </span>
          </div>
          <InfoRow label={t("CS_CHECK_PROPERTY_TYPE")}
            value={propertyType ? t(propertyType.i18nKey, { defaultValue: propertyType.name || propertyType.code }) : "—"} />
          <InfoRow label={t("CS_CHECK_PROPERTY_SUB_TYPE")}
            value={subtype ? t(subtype.i18nKey, { defaultValue: subtype.name || subtype.code }) : "—"} />
        </div>

        {/* ── Section 2: Location Details ── */}
        <div style={cardStyle}>
          <div style={sectionHeaderStyle}>
            <SectionIcon color="#0ea5e9" path="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10 a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#091E64" }}>
              {t("ES_NEW_APPLICATION_LOCATION_DETAILS")}
            </span>
          </div>
          <InfoRow label={t("MYCITY_CODE_LABEL")}
            value={address?.city?.name || (address?.city ? t(address.city.i18nKey, { defaultValue: address.city.code }) : "—")} />
          <InfoRow label={t("CS_PROPERTY_LOCATION", { defaultValue: "Property Location" })}
            value={address?.propertyLocation ? t(address.propertyLocation.i18nKey, { defaultValue: address.propertyLocation.name }) : "—"} />
          <InfoRow
            label={address?.propertyLocation?.code === "WITHIN_ULB_LIMITS" ? t("CS_CREATECOMPLAINT_MOHALLA") : t("CS_GRAM_PANCHAYAT")}
            value={getLocationDisplay(address)} />
          {address?.village && (
            <InfoRow label={t("CS_VILLAGE_NAME")}
              value={(address.village.i18nkey && !/^[A-Z0-9_]+$/.test(address.village.i18nkey)) ? address.village.i18nkey : (address.village.name || "—")} />
          )}
          {address?.slumArea !== null && address?.slumArea !== undefined && (
            <InfoRow label={t("ES_NEW_APPLICATION_SLUM_CHECK", { defaultValue: "Slum Area?" })}
              value={address.slumArea?.code === true ? t("CS_COMMON_YES") : t("CS_COMMON_NO")} />
          )}
          {address?.slumData && (
            <InfoRow label={t("CS_NEW_APPLICATION_SLUM_NAME")}
              value={t(address.slumData.i18nKey, { defaultValue: address.slumData.name || address.slumData.code })} />
          )}
        </div>

        {/* ── Section 3: Property Address ── */}
        <div style={cardStyle}>
          <div style={sectionHeaderStyle}>
            <SectionIcon color="#10b981" path="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#091E64" }}>
              {t("ES_NEW_APPLICATION_PROVIDE_PROPERTY_ADDRESS", { defaultValue: "Property Address" })}
            </span>
          </div>
          <InfoRow label={t("CORE_COMMON_PINCODE")} value={address?.pincode?.trim() || "—"} />
          <InfoRow label={t("PT_PROPERTY_ADDRESS_HOUSE_NO")} value={address?.doorNo?.trim() || "—"} />
          <InfoRow label={t("PT_PROPERTY_ADDRESS_STREET_NAME")} value={address?.street?.trim() || "—"} />
          <InfoRow label={t("CS_FILE_APPLICATION_PROPERTY_LOCATION_LANDMARK_LABEL")} value={address?.landmark?.trim() || "—"} />
          {address?.geoLocation?.latitude && (
            <InfoRow label={t("CS_MAP_PIN_LOCATION", { defaultValue: "Map Location" })}
              value={`${Number(address.geoLocation.latitude).toFixed(5)}, ${Number(address.geoLocation.longitude).toFixed(5)}`} />
          )}
        </div>

        {/* ── Section 4: Pit / Septic Tank Details ── */}
        <div style={cardStyle}>
          <div style={sectionHeaderStyle}>
            <SectionIcon color="#8b5cf6" path="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 6v6l4 2"/>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#091E64" }}>
              {t("CS_CHECK_PIT_SEPTIC_TANK_DETAILS", { defaultValue: "Pit / Septic Tank Details" })}
            </span>
          </div>
          <InfoRow label={t("CS_CHECK_PIT_TYPE")}
            value={pitType ? t(pitType.i18nKey, { defaultValue: pitType.name || pitType.code }) : "—"} />
          <InfoRow label={t("CS_CHECK_ROAD_WIDTH")}
            value={roadWidth?.roadWidth ? `${roadWidth.roadWidth} m` : "—"} />
          <InfoRow label={t("CS_CHECK_DISTANCE_FROM_ROAD")}
            value={roadWidth?.distancefromroad ? `${roadWidth.distancefromroad} m` : "—"} />
        </div>

        {/* ── Section 5: Payment ── */}
        <div style={cardStyle}>
          <div style={sectionHeaderStyle}>
            <SectionIcon color="#f59e0b" path="M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#091E64" }}>
              {t("ES_TITLE_PAYMENT_DETAILS", { defaultValue: "Payment Details" })}
            </span>
          </div>
          <InfoRow label={t("ADV_TOTAL_AMOUNT") + " (₹)"} value={totalAmount || "N/A"} />
          <InfoRow label={t("FSM_ADV_MIN_PAY") + " (₹)"} value={advanceMin ? Math.ceil(advanceMin) : "—"} />
          {selectPaymentPreference?.advanceAmount !== null && selectPaymentPreference?.advanceAmount !== undefined && (
            <div style={{ ...rowStyle, background: "#fff8f3", borderBottom: "none" }}>
              <span style={{ ...labelStyle, color: "#f47738", fontWeight: "600" }}>{t("ADV_AMOUNT") + " (₹)"}</span>
              <span style={{ ...valueStyle, color: "#f47738", fontSize: "16px" }}>
                ₹ {Math.ceil(selectPaymentPreference.advanceAmount)}
              </span>
            </div>
          )}
        </div>

        {/* ── Submit ── */}
        <div style={{ marginTop: "8px" }}>
          <SubmitBar label={t("CS_COMMON_SUBMIT")} onSubmit={onSubmit} />
        </div>

        {propertyType && (
          <div style={{
            marginTop: "20px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #fffbf5 0%, #fff3e0 100%)",
            border: "1px solid #ffe0b2",
            padding: "18px 20px",
            display: "flex",
            gap: "14px",
            alignItems: "flex-start",
            boxShadow: "0 2px 10px rgba(244,119,56,0.08)"
          }}>
            <div style={{
              flexShrink: 0,
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f47738, #e85d00)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(244,119,56,0.35)"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                <path d="M12 8v4m0 4h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#e65c00", marginBottom: "6px", letterSpacing: "0.3px" }}>
                {t("CS_FILE_APPLICATION_INFO_LABEL", { defaultValue: "Info" })}
              </div>
              <div style={{ fontSize: "13px", color: "#7a4000", lineHeight: "1.6" }}>
                {t("CS_FILE_APPLICATION_INFO_TEXT", { content: t("CS_DEFAULT_INFO_TEXT"), ...propertyType })}
              </div>
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default CheckPage;

