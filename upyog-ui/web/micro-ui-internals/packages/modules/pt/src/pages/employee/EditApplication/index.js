import React from "react";
import { useTranslation } from "react-i18next";
import { useParams, useLocation } from "react-router-dom";
import EditForm from "./EditForm";
import { Loader } from "@upyog/digit-ui-react-components";

const StatusBadge = ({ status }) => {
  const colors = {
    ACTIVE:     { bg: "#E6F4EA", color: "#137333", border: "#34A853" },
    INWORKFLOW: { bg: "#FEF7E0", color: "#B45309", border: "#F59E0B" },
    INACTIVE:   { bg: "#FCE8E6", color: "#C5221F", border: "#EA4335" },
  };
  const s = colors[status] || { bg: "#F1F3F4", color: "#5F6368", border: "#9AA0A6" };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: "12px", padding: "3px 14px", fontSize: "12px",
      fontWeight: "600", letterSpacing: "0.3px",
    }}>
      {status}
    </span>
  );
};

const EditApplication = () => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { t } = useTranslation();
  let { id: applicationNumber } = useParams();
  const { search } = useLocation();
  const fromScreen = new URLSearchParams(search).get("from");

  const { isLoading, data: applicationDetails } = Digit.Hooks.pt.useApplicationDetail(t, tenantId, applicationNumber);

  if (isLoading) return <Loader />;
  if (!applicationDetails) return null;

  const appData = applicationDetails?.applicationData;

  const activeOwners = (appData?.owners || [])
    .filter((o) => o.status === "ACTIVE")
    .sort((a, b) => (a.additionalDetails?.ownerSequence || 0) - (b.additionalDetails?.ownerSequence || 0));

  const ownerNames = activeOwners.map((o) => o.name).join(", ");

  const localityKey = appData?.address?.locality?.code
    ? `${appData.tenantId?.toUpperCase()?.split(".")?.join("_")}_REVENUE_${appData.address.locality.code}`
    : null;

  const isOwnerUpdate = fromScreen === "PT_UPDATE_OWNER_PROFILE";

  return (
    <div style={{ padding: "0 4px", fontFamily: "'Roboto', sans-serif" }}>

      {/* ── Hero Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #f47738 0%, #e05a1a 60%, #bf4210 100%)",
        borderRadius: "14px",
        padding: "24px 28px",
        marginBottom: "24px",
        color: "#fff",
        boxShadow: "0 4px 20px rgba(191,66,16,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "12px",
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {isOwnerUpdate ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M3 9.5L12 3L21 9.5V21H15V15H9V21H3V9.5Z" fill="white" fillOpacity="0.95"/>
              </svg>
            )}
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}>
                {t(isOwnerUpdate ? "PT_UPDATE_OWNER_PROFILE" : "PT_UPDATE_PROPERTY")}
              </span>
              {appData?.status && <StatusBadge status={appData.status} />}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", marginTop: "4px" }}>
              {appData?.propertyId}
            </div>
          </div>
        </div>

        {/* Summary row */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "28px",
          marginTop: "20px", paddingTop: "18px",
          borderTop: "1px solid rgba(255,255,255,0.15)",
        }}>
          {ownerNames && (
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                {t("PT_FORM3_OWNER_NAME")}
              </span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>{ownerNames}</span>
            </div>
          )}
          {appData?.address?.city && (
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                {t("PT_PROPERTY_ADDRESS_CITY")}
              </span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>{appData.address.city}</span>
            </div>
          )}
          {localityKey && (
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                {t("PT_PROPERTY_ADDRESS_MOHALLA")}
              </span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>{t(localityKey)}</span>
            </div>
          )}
          {appData?.propertyType && (
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                {t("PT_ASSESMENT1_PROPERTY_TYPE")}
              </span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>
                {t(`COMMON_PROPTYPE_${appData.propertyType}`)}
              </span>
            </div>
          )}
          {appData?.usageCategory && (
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                {t("PT_ASSESMENT_INFO_USAGE_TYPE")}
              </span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>
                {t(`PROPERTYTAX_BILLING_SLAB_${appData.usageCategory}`)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Info notice ── */}
      <div style={{
        background: "#fff8f0", border: "1px solid #f4d0b0",
        borderLeft: "4px solid #f47738", borderRadius: "8px",
        padding: "14px 18px", marginBottom: "20px",
        display: "flex", gap: "12px", alignItems: "flex-start",
      }}>
        <span style={{ fontSize: "20px", lineHeight: 1 }}>ℹ️</span>
        <p style={{ margin: 0, fontSize: "13px", color: "#5c3a1e", fontWeight: "600" }}>
          {t(isOwnerUpdate ? "PT_UPDATE_OWNER_PROFILE_INFO" : "PT_UPDATE_PROPERTY_INFO")}
        </p>
      </div>

      {/* ── Edit Form Card ── */}
      <div style={{
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
        border: "1px solid #e8ecf0",
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "14px 20px",
          borderBottom: "1px solid #f0f0f0",
          background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)",
        }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff", textTransform: "uppercase", letterSpacing: "0.6px" }}>
            {t(isOwnerUpdate ? "PT_UPDATE_OWNER_FORM_HEADER" : "PT_UPDATE_PROPERTY_FORM_HEADER")}
          </span>
        </div>
        <div style={{ padding: "4px 0" }}>
          <EditForm applicationData={appData} tenantId={tenantId} fromScreen={fromScreen} />
        </div>
      </div>

    </div>
  );
};
export default EditApplication;
