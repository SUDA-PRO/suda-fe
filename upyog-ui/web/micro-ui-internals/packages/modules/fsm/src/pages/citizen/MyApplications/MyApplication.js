import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const statusConfig = {
  APPLICATION_CREATED:        { bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
  PENDING_APPL_FEE_PAYMENT:   { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  ASSIGN_DSO:                 { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  DSO_INPROGRESS:             { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  COMPLETED:                  { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
  REJECTED:                   { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
  CANCELLED:                  { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" },
};

const MyApplication = ({ application }) => {
  const { t } = useTranslation();
  const st = application?.applicationStatus?.toUpperCase().replace(/ /g, "_");
  const statusStyle = statusConfig[st] || { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" };

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        boxShadow: "0 2px 14px rgba(26,43,73,0.09), 0 1px 3px rgba(26,43,73,0.05)",
        overflow: "hidden",
        border: "1px solid #f0f2f5",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 10px 32px rgba(244,119,56,0.15)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 14px rgba(26,43,73,0.09)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Navy accent bar */}
      <div style={{ height: "5px", background: "linear-gradient(90deg, #22394d 0%, #2e4e68 100%)" }} />
      {/* Header */}
      <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e9edf2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "600", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "3px" }}>
            {t("CS_FSM_APPLICATION_APPLICATION_NO")}
          </div>
          <div style={{ fontSize: "13px", color: "#22394d", fontWeight: "800", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {application.applicationNo}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 20px 12px" }}>
        {[
          {
            label: t("CS_FSM_APPLICATION_SERVICE_CATEGORY"),
            value: application.serviceCategory || t("CS_TITLE_FSM"),
            icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
          },
          {
            label: t("CS_FSM_APPLICATION_DETAIL_STATUS"),
            value: t("CS_COMMON_" + application.applicationStatus),
            icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14",
            isStatus: true,
          },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i === 0 ? "1px solid #f3f4f6" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e9edf2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}/>
                  {item.icon.includes("9l9") && <polyline points="9 22 9 12 15 12 15 22"/>}
                  {item.icon.includes("22 11") && <polyline points="22 4 12 14.01 9 11.01"/>}
                </svg>
              </div>
              <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px" }}>{item.label}</span>
            </div>
            {item.isStatus ? (
              <span style={{ padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
                {item.value}
              </span>
            ) : (
              <span style={{ fontSize: "13px", color: "#1a2b49", fontWeight: "700", textAlign: "right", maxWidth: "55%", wordBreak: "break-word" }}>{item.value}</span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: "0 20px 18px 20px" }}>
        <Link to={{ pathname: `/suda-ui/citizen/fsm/application-details/${application.applicationNo}`, state: { tenantId: application.tenantId } }} style={{ textDecoration: "none", display: "block" }}>
          <button
            style={{ width: "100%", height: "42px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "10px", color: "#ffffff", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", boxShadow: "0 3px 10px rgba(244,119,56,0.35)", transition: "transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(244,119,56,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 10px rgba(244,119,56,0.35)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            {t("CS_COMMON_VIEW")}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default MyApplication;
