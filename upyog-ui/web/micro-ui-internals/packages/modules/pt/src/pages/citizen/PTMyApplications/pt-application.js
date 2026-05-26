import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const statusConfig = {
  ACTIVE:             { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
  INACTIVE:           { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" },
  INWORKFLOW:         { bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
  PENDINGFORDOCUMENTVERIFICATION: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  PENDINGFORFIELDVERIFICATION:    { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  PENDINGFORAPPROVAL:             { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  APPROVED:           { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
  REJECTED:           { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
};

const PTApplication = ({ application, buttonLabel }) => {
  const { t } = useTranslation();
  const st = application?.status?.toUpperCase();
  const statusStyle = statusConfig[st] || { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" };
  const creationReason = application?.creationReason ? t(`PT.${application.creationReason}`) : t("CS_NA");

  return (
    <div style={{
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
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.75)", fontWeight: "600", letterSpacing: "0.6px", textTransform: "uppercase" }}>{t("PT_APPLICATION_NO_LABEL")}</div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: "800", marginTop: "2px", letterSpacing: "0.2px", wordBreak: "break-all" }}>{application?.acknowldgementNumber || t("CS_NA")}</div>
            </div>
          </div>
          <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "10px", fontWeight: "700", letterSpacing: "0.4px", background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, textTransform: "uppercase", flexShrink: 0, marginLeft: "8px" }}>
            {t(`PT_COMMON_${application?.status}`)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 20px 12px" }}>

        {[
          { label: t("PT_APPLICATION_CATEGORY"), value: t("PROPERTY_TAX"), icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" },
          { label: t("PT_SEARCHPROPERTY_TABEL_PTUID"), value: application?.propertyId || t("CS_NA"), icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
          { label: t("PT_COMMON_TABLE_COL_APP_TYPE"), value: creationReason, icon: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}/>
                  {item.icon.includes("9l9") && <polyline points="9 22 9 12 15 12 15 22"/>}
                  {item.icon.includes("14 2") && <g><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></g>}
                </svg>
              </div>
              <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px" }}>{item.label}</span>
            </div>
            <span style={{ fontSize: "13px", color: "#1a2b49", fontWeight: "700", textAlign: "right", maxWidth: "55%", wordBreak: "break-word" }}>{item.value}</span>
          </div>
        ))}

        {/* Status row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px" }}>{t("PT_COMMON_TABLE_COL_STATUS_LABEL")}</span>
          </div>
          <span style={{ padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
            {t(`PT_COMMON_${application?.status}`)}
          </span>
        </div>

      </div>

      {/* Footer */}
      <div style={{ padding: "0 20px 18px 20px" }}>
        <Link to={`/suda-ui/citizen/pt/property/application/${application?.acknowldgementNumber}/${application?.tenantId}`} style={{ textDecoration: "none", display: "block" }}>
          <button style={{ width: "100%", height: "42px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "10px", color: "#ffffff", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", boxShadow: "0 3px 10px rgba(244,119,56,0.35)", transition: "transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(244,119,56,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 10px rgba(244,119,56,0.35)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            {buttonLabel}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default PTApplication;
