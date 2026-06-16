import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Loader } from "@upyog/digit-ui-react-components";
import MutationForm from "./mutationForm";

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

const MutateProperty = () => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { t } = useTranslation();
  let { id: applicationNumber } = useParams();
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
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}>
                {t("ES_TITLE_MUTATE_PROPERTY")}
              </span>
              {appData?.status && <StatusBadge status={appData.status} />}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", marginTop: "4px" }}>
              {appData?.propertyId}
            </div>
          </div>
        </div>

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
          {t("PT_MUTATION_VERIFY_TRANSFEROR_DETAILS")}
        </p>
      </div>

      {/* ── Mutation Form ── */}
      <MutationForm applicationData={appData} tenantId={tenantId} />

    </div>
  );
};
export default MutateProperty;
