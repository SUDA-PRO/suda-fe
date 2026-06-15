import { Loader } from "@upyog/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const statusConfig = {
  APPROVED:                    { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0", label: "WF_NEWTL_APPROVED" },
  EXPIRED:                     { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db", label: "WF_NEWTL_EXPIRED" },
  CANCELLED:                   { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", label: "WF_NEWTL_CANCELLED" },
  REJECTED:                    { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", label: "WF_NEWTL_REJECTED" },
  PENDINGPAYMENT:              { bg: "#fffbeb", color: "#d97706", border: "#fcd34d", label: "WF_NEWTL_PENDINGPAYMENT" },
  INITIATED:                   { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", label: "WF_NEWTL_INITIATED" },
  PENDINGDOCVERIFICATION:      { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", label: "WF_NEWTL_PENDINGDOCVERIFICATION" },
  PENDINGFIELDVERIFICATION:    { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", label: "WF_NEWTL_PENDINGFIELDVERIFICATION" },
  FIELDINSPECTIONINITIATED:    { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", label: "WF_NEWTL_FIELDINSPECTIONINITIATED" },
  DOCUMENTVERIFICATIONINITIATED: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", label: "WF_NEWTL_DOCUMENTVERIFICATIONINITIATED" },
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

const TLApplicationCard = ({ application }) => {
  const { t } = useTranslation();
  const raw = application?.raw;
  const status = raw?.status?.toUpperCase();
  const statusStyle = statusConfig[status] || { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db", label: `WF_NEWTL_${status}` };

  const ownerName = application?.TL_COMMON_TABLE_COL_OWN_NAME;
  const ownerDisplay = Array.isArray(ownerName) ? ownerName[ownerName.length - 1] : ownerName;

  const address = raw?.tradeLicenseDetail?.address;
  const addressLine = [
    address?.doorNo ? `Door No. ${address.doorNo}` : null,
    address?.street || null,
    address?.locality?.name ? t(address.locality.name) : address?.locality?.code ? t(address.locality.code) : null,
    address?.city?.name ? t(address.city.name) : address?.city?.code ? t(address.city.code) : null,
    address?.pincode ? `- ${address.pincode}` : null,
  ].filter(Boolean).join(", ");

  const isPendingPayment = raw?.status === "PENDINGPAYMENT";
  const tradeUnits = raw?.tradeLicenseDetail?.tradeUnits || [];
  const tradeType = tradeUnits.length > 0 ? t(`TRADELICENSE_TRADETYPE_${tradeUnits[0]?.tradeType}`) : null;
  const financialYear = raw?.financialYear || null;
  const licenseNumber = raw?.licenseNumber || null;
  const mobileNumber = raw?.tradeLicenseDetail?.owners?.[0]?.mobileNumber || null;

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
      <div style={{ background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", padding: "16px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: "-20px", top: "-20px", width: "90px", height: "90px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "30px", bottom: "-30px", width: "70px", height: "70px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1 }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.75)", fontWeight: "600", letterSpacing: "0.6px", textTransform: "uppercase" }}>{t("TL_COMMON_TABLE_COL_APP_NO")}</div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: "800", letterSpacing: "0.2px", marginTop: "2px", wordBreak: "break-all" }}>{raw?.applicationNumber}</div>
            </div>
          </div>
          <span style={{ padding: "4px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "700", letterSpacing: "0.4px", background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, textTransform: "uppercase", flexShrink: 0, whiteSpace: "nowrap" }}>
            {t(statusStyle.label)}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "16px 20px 12px" }}>

        {/* Trade Name */}
        <InfoRow
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>}
          label={t("TL_COMMON_TABLE_COL_TRD_NAME")}
          value={application?.TL_COMMON_TABLE_COL_TRD_NAME}
        />

        {/* Owner Name */}
        <InfoRow
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          label={t("TL_COMMON_TABLE_COL_OWN_NAME")}
          value={ownerDisplay}
        />

        {/* Mobile */}
        {mobileNumber && (
          <InfoRow
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>}
            label={t("CORE_COMMON_MOBILE_NUMBER")}
            value={mobileNumber}
          />
        )}

        {/* Address */}
        {addressLine && (
          <InfoRow
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
            label={t("TL_ADDRESS_LABEL")}
            value={addressLine}
          />
        )}

        {/* Trade Type + Financial Year row */}
        {(tradeType || financialYear) && (
          <div style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
            {tradeType && (
              <div style={{ flex: 1, padding: "8px 12px", background: "#f8f9fb", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" }}>{t("TL_TRADE_TYPE_LABEL")}</div>
                <div style={{ fontSize: "12px", color: "#1a2b49", fontWeight: "700", marginTop: "2px", wordBreak: "break-word" }}>{tradeType}</div>
              </div>
            )}
            {financialYear && (
              <div style={{ flex: 1, padding: "8px 12px", background: "#f8f9fb", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" }}>{t("TL_FINANCIAL_YEAR_LABEL")}</div>
                <div style={{ fontSize: "13px", color: "#1a2b49", fontWeight: "700", marginTop: "2px" }}>{financialYear}</div>
              </div>
            )}
          </div>
        )}

        {/* License number (if approved) */}
        {licenseNumber && (
          <div style={{ padding: "8px 14px", background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)", borderRadius: "10px", border: "1px solid #a7f3d0", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <div>
              <div style={{ fontSize: "10px", color: "#065f46", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" }}>{t("TL_LICENSE_NO_LABEL") || "License No."}</div>
              <div style={{ fontSize: "12px", color: "#059669", fontWeight: "700", wordBreak: "break-all" }}>{licenseNumber}</div>
            </div>
          </div>
        )}

        {/* SLA */}
        {application?.TL_COMMON_TABLE_COL_SLA_NAME && application?.TL_COMMON_TABLE_COL_SLA_NAME !== "CS_NA" && (
          <div style={{ textAlign: "right", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "600", background: "#fffbeb", padding: "2px 8px", borderRadius: "6px", border: "1px solid #fcd34d" }}>
              {t("TL_SLA_LABEL") || "SLA"}: {t(application.TL_COMMON_TABLE_COL_SLA_NAME)}
            </span>
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div style={{ padding: "0 20px 18px 20px", display: "flex", gap: "10px" }}>
        <Link to={`/suda-ui/citizen/tl/tradelicence/application/${raw?.applicationNumber}/${raw?.tenantId}`} style={{ flex: 1, textDecoration: "none" }}>
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
        <Link
          to={{ pathname: `/suda-ui/citizen/payment/collect/${raw?.businessService}/${raw?.applicationNumber}` }}
          style={{ flex: 1, textDecoration: "none", opacity: isPendingPayment ? 1 : 0.45, pointerEvents: isPendingPayment ? "auto" : "none" }}
        >
          <button
            disabled={!isPendingPayment}
            style={{ width: "100%", height: "40px", background: isPendingPayment ? "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)" : "#f3f4f6", border: "none", borderRadius: "10px", color: isPendingPayment ? "#ffffff" : "#9ca3af", fontSize: "13px", fontWeight: "700", cursor: isPendingPayment ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: isPendingPayment ? "0 3px 10px rgba(244,119,56,0.35)" : "none", transition: "transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e => { if (isPendingPayment) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(244,119,56,0.45)"; } }}
            onMouseLeave={e => { if (isPendingPayment) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 10px rgba(244,119,56,0.35)"; } }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            {t("COMMON_MAKE_PAYMENT")}
          </button>
        </Link>
      </div>
    </div>
  );
};

const TLMyApplications = ({ view }) => {
  const { t } = useTranslation();
  const { mobileNumber, tenantId } = Digit.UserService.getUser()?.info || {};

  const { isLoading, data } =
    view === "bills"
      ? Digit.Hooks.tl.useFetchBill({
          params: { businessService: "TL", tenantId, mobileNumber },
          config: { enabled: view === "bills" },
        })
      : Digit.Hooks.tl.useTLSearchApplication({}, { enabled: view !== "bills" }, t);

  if (isLoading) return <Loader />;

  const count = data?.length || 0;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", padding: "24px 16px 40px" }}>

      {/* Page header */}
      <div style={{ margin: "0 0 28px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#1a2b49", letterSpacing: "-0.3px" }}>
              {t("TL_MY_APPLICATIONS_HEADER")}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
              {count > 0 ? `${count} ${t("TL_APPLICATIONS_FOUND") || "applications found"}` : t("TL_NO_APPLICATION_FOUND_MSG") || "No applications found"}
            </p>
          </div>
          {count > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 16px", background: "rgba(244,119,56,0.1)", borderRadius: "20px", border: "1px solid rgba(244,119,56,0.25)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
              </svg>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#f47738" }}>{count}</span>
            </div>
          )}
        </div>
      </div>

      {/* Application cards grid */}
      <div style={{ margin: "0" }}>
        {count > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {data.map((application, index) => (
              <TLApplicationCard key={application?.raw?.applicationNumber || index} application={application} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "20px", boxShadow: "0 2px 12px rgba(26,43,73,0.07)" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
              </svg>
            </div>
            <p style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "700", color: "#1a2b49" }}>{t("TL_NO_APPLICATION_FOUND_MSG") || "No Applications Found"}</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>{t("TL_APPLY_NEW_LICENSE_MSG") || "Apply for a new trade licence to get started"}</p>
          </div>
        )}

        {/* Apply new licence CTA */}
        <div style={{ marginTop: "32px", padding: "24px", background: "#ffffff", borderRadius: "16px", border: "2px dashed #e5e7eb", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <span style={{ fontSize: "14px", color: "#4b5563", fontWeight: "600" }}>{t("TL_TEXT_NOT_ABLE_TO_FIND_THE_APPLICATION") || "Not able to find your application?"}</span>
          </div>
          <Link to="/suda-ui/citizen/tl/tradelicence/new-application/info" style={{ textDecoration: "none" }}>
            <button
              style={{ padding: "10px 28px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 3px 12px rgba(244,119,56,0.35)", transition: "transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(244,119,56,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(244,119,56,0.35)"; }}
            >
              {t("TL_COMMON_CLICK_HERE_TO_APPLY_NEW_TL") || "Apply for New Trade Licence"}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TLMyApplications;
