import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const statusStyleMap = {
  APPROVED:       { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
  PENDINGPAYMENT: { bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
  REJECTED:       { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  REVOKED:        { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  INITIATED:      { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
};

const getStatusStyle = (status) =>
  statusStyleMap[status?.toUpperCase()] || { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" };

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

const MyApplicationCard = ({ application, labelMessage, onCompleteWorkflow }) => {
  const { t } = useTranslation();
  const isBPAREG = application.type === "BPAREG";

  const appNumber = isBPAREG ? application?.applicationNumber : application?.applicationNo;
  const statusLabel = isBPAREG ? `WF_ARCHITECT_${application?.status}` : `WF_BPA_${application?.state}`;
  const statusStyle = getStatusStyle(application?.status);

  const isPendingPayment = application?.status === "PENDINGPAYMENT";
  const isInitiated = application?.status === "INITIATED";

  const viewLink = isBPAREG
    ? `/suda-ui/citizen/obps/stakeholder/${appNumber}`
    : `/suda-ui/citizen/obps/bpa/${appNumber}`;

  const bpaShowView = !isBPAREG && (application?.action === "SEND_TO_ARCHITECT" || application?.status !== "INITIATED");
  const showViewBtn = isBPAREG ? !isInitiated : bpaShowView;
  const showViewAsLabel = !isBPAREG && isInitiated && labelMessage && !bpaShowView;
  const showCompleteBtn = isBPAREG ? isInitiated : isInitiated && !labelMessage && !bpaShowView;

  const modifiedDate = application?.modifiedTime
    ? new Date(application.modifiedTime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : null;

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
      {/* Orange gradient header */}
      <div style={{ background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", padding: "16px 28px 16px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: "-20px", top: "-20px", width: "90px", height: "90px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "30px", bottom: "-30px", width: "70px", height: "70px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1, minWidth: 0 }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
              {isBPAREG ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.75)", fontWeight: "600", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                {t("BPA_APPLICATION_NUMBER_LABEL")}
              </div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: "800", letterSpacing: "0.2px", marginTop: "2px", wordBreak: "break-all" }}>{appNumber}</div>
            </div>
          </div>
          <span style={{ padding: "4px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "700", letterSpacing: "0.4px", background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, textTransform: "uppercase", flexShrink: 0, whiteSpace: "nowrap" }}>
            {t(statusLabel)}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "16px 20px 12px" }}>
        {isBPAREG ? (
          <Fragment>
            <InfoRow
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
              label={t("BPA_LICENSE_TYPE")}
              value={t(`TRADELICENSE_TRADETYPE_${application?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0]}`)}
            />
            <InfoRow
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              label={t("BPA_APPLICANT_NAME_LABEL")}
              value={application?.tradeLicenseDetail?.owners?.[0]?.name}
            />
            {application?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.includes("ARCHITECT") && (
              <InfoRow
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>}
                label={t("BPA_COUNCIL_OF_ARCH_NO_LABEL")}
                value={application?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo}
              />
            )}
          </Fragment>
        ) : (
          <Fragment>
            <InfoRow
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
              label={t("BPA_BASIC_DETAILS_APPLICATION_TYPE_LABEL")}
              value={application?.businessService !== "BPA_OC" ? t("WF_BPA_BUILDING_PLAN_SCRUTINY") : t("WF_BPA_BUILDING_OC_PLAN_SCRUTINY")}
            />
            <InfoRow
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
              label={t("BPA_IS_PREAPPROVED")}
              value={t(String(application?.additionalDetails?.isPreApproved != null ? application?.additionalDetails?.isPreApproved : application?.businessService === "BPA-PAP" ? true : false))}
            />
            <InfoRow
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              label={t("BPA_COMMON_SLA")}
              value={typeof application?.sla === "string" && application?.sla?.includes("NA") ? t("CS_NA") : application?.sla}
            />
            <InfoRow
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
              label={t("BPA_COMMON_SERVICE")}
              value={t("BPA_SERVICETYPE_NEW_CONSTRUCTION")}
            />
          </Fragment>
        )}

        {modifiedDate && (
          <div style={{ textAlign: "right", marginTop: "4px" }}>
            <span style={{ fontSize: "11px", color: "#c4c9d4", fontWeight: "500" }}>
              {t("BPA_LAST_MODIFIED") || "Last modified"}: {modifiedDate}
            </span>
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div style={{ padding: "0 20px 18px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {(showViewBtn || showViewAsLabel) && (
          <Link to={{ pathname: viewLink, state: { tenantId: "" } }} style={{ textDecoration: "none" }}>
            <button
              style={{ width: "100%", height: "40px", background: "transparent", border: "2px solid #f47738", borderRadius: "10px", color: "#f47738", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "background 0.15s, color 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f47738"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#f47738"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              {t("TL_VIEW_DETAILS")}
            </button>
          </Link>
        )}
        {showCompleteBtn && (
          <button
            style={{ width: "100%", height: "40px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 3px 10px rgba(244,119,56,0.35)", transition: "transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(244,119,56,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 10px rgba(244,119,56,0.35)"; }}
            onClick={() => onCompleteWorkflow(application)}
          >
            {t("BPA_COMP_WORKFLOW")}
          </button>
        )}
        {isPendingPayment && (
          <Link
            to={{ pathname: `/suda-ui/citizen/payment/collect/${application?.businessService}/${application?.applicationNumber}` }}
            style={{ textDecoration: "none" }}
          >
            <button
              style={{ width: "100%", height: "40px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 3px 10px rgba(244,119,56,0.35)", transition: "transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(244,119,56,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 10px rgba(244,119,56,0.35)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              {t("COMMON_MAKE_PAYMENT")}
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default MyApplicationCard;
