import React, { Fragment, useEffect } from "react";
import { Loader } from "@upyog/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

const StakeholderDocsRequired = ({ onSelect, onSkip, config }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const history = useHistory();
  const { data, isLoading } = Digit.Hooks.obps.useMDMS(stateId, "StakeholderRegistraition", "TradeTypetoRoleMapping");

  useEffect(() => {
    if (tenantId)
      Digit.LocalizationService.getLocale({ modules: [`rainmaker-bpareg`], locale: Digit.StoreData.getCurrentLanguage(), tenantId: `${tenantId}` });
  }, [tenantId]);

  if (isLoading) {
    return <Loader />;
  }

  const docs = data?.StakeholderRegistraition?.TradeTypetoRoleMapping?.[0]?.docTypes || [];

  return (
    <React.Fragment>
      <div style={{ maxWidth: "100%", fontFamily: "'Roboto', sans-serif" }}>

        {/* ── Hero Banner ── */}
        <div style={{
          background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)",
          borderRadius: "12px",
          padding: "32px 36px",
          marginBottom: "24px",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: "24px",
        }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-4 0v2"/>
              <line x1="12" y1="12" x2="12" y2="16"/>
              <line x1="10" y1="14" x2="14" y2="14"/>
            </svg>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700", letterSpacing: "0.3px" }}>
              {t("BPA_NEW_BUILDING_HEADER")}
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: "14px", opacity: 0.88 }}>
              {t("BPA_NEW_BUILDING_PERMIT_DESCRIPTION")}
            </p>
          </div>
        </div>

        {/* ── Info card ── */}
        <div style={{
          background: "#fff8f0",
          border: "1px solid #f4d0b0",
          borderLeft: "4px solid #f47738",
          borderRadius: "8px",
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          gap: "14px",
          alignItems: "flex-start",
        }}>
          <span style={{ fontSize: "22px", lineHeight: 1 }}>ℹ️</span>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "#5c3a1e", fontWeight: "600" }}>
              {t("OBPS_DOCS_FILE_SIZE")}
            </p>
          </div>
        </div>

        {/* ── Documents checklist card ── */}
        <div style={{
          background: "#ffffff",
          borderRadius: "10px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          padding: "24px 28px",
          marginBottom: "24px",
          border: "1px solid #e8ecf0",
        }}>
          <div style={{
            fontSize: "15px", fontWeight: "700", color: "#1a2b49",
            marginBottom: "20px", paddingBottom: "10px",
            borderBottom: "2px solid #f47738", letterSpacing: "0.3px",
          }}>
            📋 {t("BPA_DOCS_REQUIRED_LABEL") || t("CS_FILE_APPLICATION_INFO_LABEL")}
          </div>

          {docs.map((doc, index) => (
            <div key={index} style={{
              display: "flex", gap: "16px", marginBottom: "20px",
              paddingBottom: "20px",
              borderBottom: index < docs.length - 1 ? "1px dashed #e0e0e0" : "none",
            }}>
              {/* Number badge */}
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "#1a2b49", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", fontWeight: "700", flexShrink: 0, marginTop: "2px",
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a2b49", marginBottom: "8px" }}>
                  {t(`BPAREG_HEADER_${doc?.code?.replace(".", "_")}`)}
                </div>
                {doc?.info && (
                  <span style={{
                    background: "#f0f4ff",
                    border: "1px solid #c5d0f0",
                    borderRadius: "20px",
                    padding: "4px 14px",
                    fontSize: "12px",
                    color: "#3d4f6b",
                    fontWeight: "500",
                    display: "inline-flex", alignItems: "center", gap: "5px",
                  }}>
                    <span style={{ color: "#f47738", fontWeight: "bold" }}>✓</span>
                    {t(doc.info.replace(".", "_"))}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Action button ── */}
        <div style={{ marginBottom: "8px" }}>
          <button
            onClick={onSelect}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)",
              color: "#fff", border: "none",
              borderRadius: "8px", padding: "14px 28px",
              fontSize: "15px", fontWeight: "700",
              cursor: "pointer", letterSpacing: "0.3px",
              boxShadow: "0 4px 12px rgba(244,119,56,0.35)",
              transition: "all 0.2s",
            }}
          >
            {t("CS_COMMON_NEXT")} →
          </button>
        </div>

      </div>
    </React.Fragment>
  );
};

export default StakeholderDocsRequired; 