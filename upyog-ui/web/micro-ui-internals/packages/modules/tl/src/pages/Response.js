import React, { useState, useEffect } from "react";
import { useLocation, Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import getPTAcknowledgementData from "../utils/getTLAcknowledgementData";
import * as func from "../utils";


const Response = (props) => {
  const location = useLocation();
  const { state } = props.location;
  const [params, setParams] = useState({});
  const { isEdit } = Digit.Hooks.useQueryParams();
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};

  useEffect(() => {
    setParams(func.getQueryStringParams(location.search));
  }, [location]);
  const { t } = useTranslation();

  const applicationNumber = state?.data?.[0]?.applicationNumber;
  const isPendingPayment = state?.data?.[0]?.status === "PENDINGPAYMENT";

  const printReciept = async () => {
    const Licenses = state?.data || [];
    const license = (Licenses && Licenses[0]) || {};
    const tenantInfo = tenants.find((tenant) => tenant.code === license.tenantId);
    const data = await getPTAcknowledgementData({ ...license }, tenantInfo, t);
    Digit.Utils.pdf.generate(data);
  };

  const routeToPaymentScreen = async () => {
    window.location.assign(`${window.location.origin}/suda-ui/employee/payment/collect/TL/${state?.data?.[0]?.applicationNumber}/${state?.data?.[0]?.tenantId}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 16px 48px" }}>
      <div style={{ width: "100%", maxWidth: "520px" }}>

        {/* Success card */}
        <div style={{ background: "#ffffff", borderRadius: "24px", boxShadow: "0 8px 40px rgba(26,43,73,0.12)", overflow: "hidden", border: "1px solid #f0f2f5" }}>

          {/* Gradient header */}
          <div style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)", padding: "32px 24px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: "-30px", top: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", left: "-20px", bottom: "-40px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
            {/* Checkmark icon */}
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", position: "relative" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.3px" }}>
              {t("TL_APPLICATION_SUCCESS_MESSAGE_MAIN")}
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
              {t("TL_NEW_SUCESS_RESPONSE_NOTIFICATION_LABEL")}
            </p>
          </div>

          {/* Application number */}
          {applicationNumber && (
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f2f5", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #a7f3d0" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "3px" }}>
                  {t("TL_REF_NO_LABEL")}
                </div>
                <div style={{ fontSize: "16px", fontWeight: "800", color: "#1a2b49", letterSpacing: "0.2px" }}>
                  {applicationNumber}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ padding: "20px 24px" }}>
            {/* Print button */}
            <button
              onClick={printReciept}
              style={{ width: "100%", height: "44px", background: "transparent", border: "2px solid #1a2b49", borderRadius: "10px", color: "#1a2b49", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px", transition: "background 0.15s, color 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1a2b49"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1a2b49"; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
              </svg>
              {t("TL_PRINT_APPLICATION_LABEL")}
            </button>

            {/* Go to Home / Make Payment */}
            {!isPendingPayment ? (
              <Link to="/suda-ui/employee" style={{ textDecoration: "none", display: "block" }} onClick={() => sessionStorage.removeItem("isCreateEnabled")}>
                <button
                  style={{ width: "100%", height: "44px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 3px 12px rgba(244,119,56,0.35)", transition: "transform 0.15s, box-shadow 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(244,119,56,0.45)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(244,119,56,0.35)"; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  {t("CORE_COMMON_GO_TO_HOME")}
                </button>
              </Link>
            ) : (
              <button
                onClick={routeToPaymentScreen}
                style={{ width: "100%", height: "44px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 3px 12px rgba(244,119,56,0.35)", transition: "transform 0.15s, box-shadow 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(244,119,56,0.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(244,119,56,0.35)"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                {t("TL_COLLECT_PAYMENT")}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default Response;
