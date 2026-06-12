import { Loader } from "@upyog/digit-ui-react-components";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import TradeLicenseList from "./TradeLicenseList";

export const TLList = () => {
  const { t } = useTranslation();
  const userInfo = Digit.UserService.getUser();
  const tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code || userInfo?.info?.permanentCity;
  const { mobileNumber: mobileno, LicenseNumber: licenseno, tenantId: tenantID } = Digit.Hooks.useQueryParams();
  let filter1 = {};
  if (licenseno) filter1.licenseNumbers = licenseno;
  if (licenseno) filter1.tenantId = tenantID;
  if (!licenseno) filter1.mobileNumber = userInfo?.info?.mobileNumber;
  filter1 = { ...filter1, RenewalPending:true, tenantId: tenantId || tenantID, status: "APPROVED,CANCELLED,EXPIRED,MANUALEXPIRED" };
  const { isLoading, isError, error, data } = Digit.Hooks.tl.useTradeLicenseSearch({ filters: filter1 }, {});
  useEffect(() => {
    localStorage.setItem("TLAppSubmitEnabled", "true");
  }, []);
  if (isLoading) {
    return <Loader />;
  }
  let { Licenses: applicationsList } = data || {};
  let newapplicationlist = applicationsList;
  const count = newapplicationlist?.length || 0;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", padding: "24px 16px 40px" }}>

      {/* Page header */}
      <div style={{ maxWidth: "960px", margin: "0 auto 28px auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#1a2b49", letterSpacing: "-0.3px" }}>
              {t("TL_RENEW_TRADE_HEADER")}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
              {count > 0
                ? `${count} ${t("TL_LICENSES_FOUND") || "licences found"}`
                : t("TL_RENEW_TRADE_TEXT")}
            </p>
          </div>
          {count > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 16px", background: "rgba(244,119,56,0.1)", borderRadius: "20px", border: "1px solid rgba(244,119,56,0.25)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#f47738" }}>{count}</span>
            </div>
          )}
        </div>
      </div>

      {/* License cards */}
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        {count > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {newapplicationlist.map((application, index) => (
              <TradeLicenseList key={application?.applicationNumber || index} application={application} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "20px", boxShadow: "0 2px 12px rgba(26,43,73,0.07)" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </div>
            <p style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "700", color: "#1a2b49" }}>
              {t("PT_NO_APPLICATION_FOUND_MSG")}
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>
              {t("TL_NO_RENEWAL_FOUND_MSG") || "No licences pending renewal at this time"}
            </p>
          </div>
        )}

        {/* Search trade link */}
        <div style={{ marginTop: "28px", padding: "20px 24px", background: "#ffffff", borderRadius: "16px", border: "2px dashed #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <span style={{ fontSize: "14px", color: "#4b5563", fontWeight: "600" }}>
              {t("TL_NOT_ABLE_TO_FIND_TRADE_LICENSE") || "Can't find your trade licence?"}
            </span>
          </div>
          <Link to="/suda-ui/citizen/tl/tradelicence/trade-search" style={{ textDecoration: "none" }}>
            <button
              style={{ padding: "10px 22px", background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 3px 10px rgba(37,99,235,0.3)", transition: "transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 10px rgba(37,99,235,0.3)"; }}
            >
              {t("TL_SEARCH_TRADE_LICENSE") || "Search Trade Licence"}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
