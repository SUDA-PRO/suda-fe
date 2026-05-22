import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const statusConfig = {
  ACTIVE:             { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0", label: "PT_COMMON_ACTIVE" },
  INACTIVE:           { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db", label: "PT_COMMON_INACTIVE" },
  INWORKFLOW:         { bg: "#fffbeb", color: "#d97706", border: "#fcd34d", label: "PT_COMMON_INWORKFLOW" },
  MUTATIONINWORKFLOW: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", label: "PT_COMMON_MUTATIONINWORKFLOW" },
};

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
    <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
      {icon}
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "13px", color: "#1a2b49", fontWeight: "600", wordBreak: "break-word" }}>{value || "â€”"}</div>
    </div>
  </div>
);

const MyProperty = ({ application }) => {
  const { t } = useTranslation();
  const address = application?.address;
  const owners = application?.owners;
  const [billData, setBillData] = useState(null);

  const fetchBillData = async () => {
    try {
      const result = await Digit.PaymentService.fetchBill(application.tenantId, {
        businessService: "PT",
        consumerCode: application.propertyId,
      });
      setBillData(result);
    } catch (e) {}
  };

  useEffect(() => {
    fetchBillData();
    sessionStorage.removeItem("type");
    sessionStorage.removeItem("pincode");
    sessionStorage.removeItem("tenantId");
    sessionStorage.removeItem("localityCode");
    sessionStorage.removeItem("landmark");
    sessionStorage.removeItem("propertyid");
  }, [application.tenantId, application.propertyId]);

  const sortedOwners = owners?.additionalDetails !== null
    ? [...(owners || [])].sort((a, b) => a?.additionalDetails?.ownerSequence - b?.additionalDetails?.ownerSequence)
    : owners || [];

  const primaryOwner = sortedOwners[0];
  const ownerNames = sortedOwners.map(o => o?.name).filter(Boolean).join(", ");
  const mobileNo = primaryOwner?.mobileNumber;
  const addressLine = [
    address?.doorNo ? `Door No. ${address.doorNo}` : null,
    address?.street || null,
    address?.locality?.name ? t(address.locality.name) : null,
    address?.city ? t(address.city) : null,
    address?.pincode ? `- ${address.pincode}` : null,
  ].filter(Boolean).join(", ");

  const status = application?.status?.toUpperCase();
  const statusStyle = statusConfig[status] || { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db", label: `PT_COMMON_${status}` };
  const hasBill = billData?.Bill?.length > 0;
  const dueAmount = hasBill ? billData.Bill[0]?.totalAmount : null;

  const propertyType = application?.propertyType ? t(`PROPERTYTYPE_MASTERS_${application.propertyType}`) : null;
  const usageCategory = application?.usageCategory ? t(`PROPERTYTAX_BILLING_SLAB_${application.usageCategory}`) : null;
  const noOfFloors = application?.noOfFloors != null ? application.noOfFloors : null;
  const landArea = application?.landArea || application?.superBuiltUpArea || null;
  const financialYear = application?.financialYear || null;
  const assessmentNumber = application?.assessmentNumber || null;
  const createdDate = application?.auditDetails?.createdTime
    ? new Date(application.auditDetails.createdTime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : null;

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
      {/* â”€â”€ Orange header â”€â”€ */}
      <div style={{ background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", padding: "16px 20px", position: "relative", overflow: "hidden" }}>
        {/* decorative circle */}
        <div style={{ position: "absolute", right: "-20px", top: "-20px", width: "90px", height: "90px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "30px", bottom: "-30px", width: "70px", height: "70px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.75)", fontWeight: "600", letterSpacing: "0.6px", textTransform: "uppercase" }}>{t("PT_COMMON_TABLE_COL_PT_ID")}</div>
              <div style={{ fontSize: "15px", color: "#ffffff", fontWeight: "800", letterSpacing: "0.2px", marginTop: "2px" }}>{application.propertyId}</div>
            </div>
          </div>
          <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.4px", background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, textTransform: "uppercase", flexShrink: 0 }}>
            {t(statusStyle.label)}
          </span>
        </div>

      </div>

      {/* â”€â”€ Card body â”€â”€ */}
      <div style={{ padding: "16px 20px 12px" }}>

        {/* Owner */}
        <InfoRow
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          label={t("PT_COMMON_TABLE_COL_OWNER_NAME")}
          value={ownerNames}
        />

        {/* Mobile */}
        {mobileNo && (
          <InfoRow
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>}
            label={t("CORE_COMMON_MOBILE_NUMBER") || "Mobile"}
            value={mobileNo}
          />
        )}

        {/* Address */}
        <InfoRow
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
          label={t("PT_COMMON_COL_ADDRESS")}
          value={addressLine}
        />

        {/* Area + Assessment row */}
        {(landArea != null || assessmentNumber) && (
          <div style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
            {landArea != null && (
              <div style={{ flex: 1, padding: "8px 12px", background: "#f8f9fb", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" }}>{t("PT_FORM2_PLOT_SIZE") || "Plot Area"}</div>
                <div style={{ fontSize: "16px", color: "#1a2b49", fontWeight: "800", marginTop: "2px" }}>{landArea} <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "500" }}>sq.ft</span></div>
              </div>
            )}
            {assessmentNumber && (
              <div style={{ flex: 2, padding: "8px 12px", background: "#f8f9fb", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" }}>{t("PT_ASSESSMENT_NO") || "Assessment No."}</div>
                <div style={{ fontSize: "12px", color: "#1a2b49", fontWeight: "700", marginTop: "2px", wordBreak: "break-all" }}>{assessmentNumber}</div>
              </div>
            )}
          </div>
        )}

        {/* Due Amount banner */}
        {hasBill && (
          <div style={{ padding: "10px 14px", background: "linear-gradient(135deg, #fff7ed 0%, #fff3e6 100%)", borderRadius: "10px", border: "1px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <span style={{ fontSize: "12px", color: "#92400e", fontWeight: "600" }}>{t("PT_TOTAL_DUE_AMOUNT") || "Total Due"}</span>
            </div>
            <span style={{ fontSize: "16px", color: "#c2410c", fontWeight: "800" }}>â‚¹ {Number(dueAmount || 0).toLocaleString("en-IN")}</span>
          </div>
        )}

        {/* Created date */}
        {createdDate && (
          <div style={{ textAlign: "right", marginTop: "6px" }}>
            <span style={{ fontSize: "11px", color: "#c4c9d4", fontWeight: "500" }}>
              {t("PT_REGISTERED_ON") || "Registered on"}: {createdDate}
            </span>
          </div>
        )}
      </div>

      {/* â”€â”€ Footer buttons â”€â”€ */}
      <div style={{ padding: "0 20px 18px 20px", display: "flex", gap: "10px" }}>
        <Link to={`/suda-ui/citizen/pt/property/properties/${application.propertyId}`} style={{ flex: 1, textDecoration: "none" }}>
          <button style={{ width: "100%", height: "40px", background: "transparent", border: "2px solid #f47738", borderRadius: "10px", color: "#f47738", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "background 0.15s, color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f47738"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#f47738"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            {t("PT_VIEW_DETAILS")}
          </button>
        </Link>
        {hasBill && (
          <Link to={`/suda-ui/citizen/payment/my-bills/PT/${application?.propertyId}`} style={{ flex: 1, textDecoration: "none" }}>
            <button style={{ width: "100%", height: "40px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "10px", color: "#ffffff", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 3px 10px rgba(244,119,56,0.35)", transition: "transform 0.15s, box-shadow 0.15s" }}
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

export default MyProperty;
