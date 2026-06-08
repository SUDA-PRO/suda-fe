import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getAddress } from "../../../utils/index";

const statusConfig = {
  ACTIVE:              { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0", label: "WS_COMMON_ACTIVE" },
  INACTIVE:            { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db", label: "WS_COMMON_INACTIVE" },
  INWORKFLOW:          { bg: "#fffbeb", color: "#d97706", border: "#fcd34d", label: "WS_COMMON_INWORKFLOW" },
  DISCONNECTED:        { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "WS_COMMON_DISCONNECTED" },
  PENDINGAPPROVAL:     { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", label: "WS_COMMON_PENDINGAPPROVAL" },
};

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
    <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
      {icon}
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "13px", color: "#1a2b49", fontWeight: "600", wordBreak: "break-word" }}>{value || "-"}</div>
    </div>
  </div>
);

const WSConnection = ({ application }) => {
  const { t } = useTranslation();
  let encodeApplicationNo = encodeURI(application.applicationNo);

  const status = application?.status?.toUpperCase();
  const statusStyle = statusConfig[status] || { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db", label: application?.status };

  const ownerNames =
    application?.connectionHolders?.map((o) => o.name).join(", ") ||
    application?.property?.owners
      ?.sort((a, b) => a?.additionalDetails?.ownerSequence - b?.additionalDetails?.ownerSequence)
      ?.map((o) => o.name)
      .join(", ");

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        boxShadow: "0 2px 14px rgba(26,43,73,0.09), 0 1px 3px rgba(26,43,73,0.05)",
        overflow: "hidden",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        border: "1px solid #f0f2f5",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 10px 32px rgba(244,119,56,0.15)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 14px rgba(26,43,73,0.09)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", padding: "16px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: "-20px", top: "-20px", width: "90px", height: "90px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "30px", bottom: "-30px", width: "70px", height: "70px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1 }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.75)", fontWeight: "600", letterSpacing: "0.6px", textTransform: "uppercase" }}>{t("WS_MYCONNECTIONS_CONSUMER_NO")}</div>
              <div style={{ fontSize: "15px", color: "#ffffff", fontWeight: "800", letterSpacing: "0.2px", marginTop: "2px" }}>{application?.connectionNo || application?.applicationNo || "-"}</div>
            </div>
          </div>
          <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.4px", background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, textTransform: "uppercase", flexShrink: 0 }}>
            {t(statusStyle.label)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 20px 12px" }}>
        <InfoRow
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          label={t("WS_SERVICE_NAME_LABEL")}
          value={t(`WS_APPLICATION_TYPE_${application?.applicationType}`)}
        />
        <InfoRow
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          label={t("WS_CONSUMER_NAME")}
          value={ownerNames}
        />
        <InfoRow
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
          label={t("WS_MYCONNECTION_ADDRESS")}
          value={getAddress(application?.property?.address, t)}
        />
      </div>

      {/* Footer */}
      <div style={{ padding: "0 20px 18px 20px" }}>
        <Link to={{ pathname: `/suda-ui/citizen/ws/connection/details/${encodeApplicationNo}`, state: { ...application } }} style={{ textDecoration: "none" }}>
          <button
            style={{ width: "100%", height: "40px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 3px 10px rgba(244,119,56,0.35)", transition: "transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(244,119,56,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 10px rgba(244,119,56,0.35)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            {t("WS_VIEW_DETAILS_LABEL")}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default WSConnection;
