import { Loader } from "@upyog/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getAddress } from "../../../utils/index";
import _ from "lodash";
import { stringReplaceAll } from "../../../utils";

const statusConfig = {
  PENDING_FOR_PAYMENT:              { bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
  PENDING_FOR_DOCUMENT_VERIFICATION: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  PENDING_FOR_FIELD_INSPECTION:     { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  PENDING_FOR_APPROVAL:             { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  APPROVED:                         { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
  CONNECTION_ACTIVATED:             { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
  REJECTED:                         { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
  INITIATED:                       { bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
};

const WSApplication = ({ application }) => {
  const { t } = useTranslation();
  let encodeApplicationNo = encodeURI(application.applicationNo);

  let filter1 = { tenantId: application.tenantId, applicationNumber: application.applicationNo };
  const { isLoading, data } = Digit.Hooks.ws.useMyApplicationSearch(
    { filters: filter1, BusinessService: application.applicationNo?.includes("SW") ? "SW" : "WS" },
    { filters: filter1, privacy: Digit.Utils.getPrivacyObject() }
  );
  const { isLoading: isPTLoading, data: PTData } = Digit.Hooks.pt.usePropertySearch(
    { filters: { propertyIds: application?.propertyId } },
    { filters: { propertyIds: application?.propertyId }, privacy: Digit.Utils.getPrivacyObject() }
  );

  const isReconnection = application?.applicationType?.includes("RECONNECT");
  const isSWApplication = application?.applicationNo?.includes("SW");
  const businessService = isReconnection
    ? isSWApplication ? "SWReconnection" : "WSReconnection"
    : isSWApplication
      ? application?.applicationNo?.includes("DC") ? "SW" : "SW.ONE_TIME_FEE"
      : application?.applicationNo?.includes("DC") ? "WS" : "WS.ONE_TIME_FEE";

  const consumerName =
    application?.connectionHolders?.map((o) => o.name).join(", ") ||
    application?.property?.owners
      ?.sort((a, b) => a?.additionalDetails?.ownerSequence - b?.additionalDetails?.ownerSequence)
      .map((o) => o.name)
      .join(", ") ||
    t("CS_NA");

  const address = getAddress(application?.property?.address, t);
  const slaText = Math.round(application?.sla / (24 * 60 * 60 * 1000))
    ? `${Math.round(application?.sla / (24 * 60 * 60 * 1000))} ${t("WS_DAYS")}`
    : t("CS_NA");

  const st = application?.applicationStatus?.toUpperCase();
  const statusStyle = statusConfig[st] || { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" };
  const isPendingPayment = application?.applicationStatus === "PENDING_FOR_PAYMENT";

  if (isLoading || isPTLoading) return <Loader />;

  const paymentPath = `/suda-ui/citizen/payment/my-bills/${businessService}/${
    application?.applicationNo?.includes("DC")
      ? stringReplaceAll(application?.connectionNo, "/", "+")
      : stringReplaceAll(application?.applicationNo, "/", "+")
  }?workflow=WNS&tenantId=${application?.tenantId}&ConsumerName=${
    application?.connectionHolders?.map((o) => o.name).join(",") ||
    PTData?.Properties?.[0]?.owners?.map((o) => o.name).join(",") ||
    ""
  }&isDisoconnectFlow=${application?.applicationNo?.includes("DC") ? true : false}`;

  const rowItems = [
    {
      label: t("WS_SERVICE_NAME"),
      value: t(`WS_APPLICATION_TYPE_${application?.applicationType}`),
      icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    },
    {
      label: t("WS_CONSUMER_NAME"),
      value: consumerName,
      icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2",
    },
    {
      label: t("WS_PROPERTY_ID"),
      value: application?.propertyId || t("CS_NA"),
      icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    },
    {
      label: t("WS_SLA"),
      value: slaText,
      icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    },
  ];

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        boxShadow: "0 2px 14px rgba(26,43,73,0.09), 0 1px 3px rgba(26,43,73,0.05)",
        overflow: "hidden",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        border: "1px solid #f0f2f5",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 10px 32px rgba(244,119,56,0.15)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 14px rgba(26,43,73,0.09)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Card header */}
      <div style={{ background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", padding: "16px 20px", position: "relative", overflow: "hidden", minHeight: "88px", boxSizing: "border-box" }}>
        <div style={{ position: "absolute", right: "-20px", top: "-20px", width: "90px", height: "90px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "30px", bottom: "-30px", width: "70px", height: "70px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.75)", fontWeight: "600", letterSpacing: "0.6px", textTransform: "uppercase" }}>{t("WS_MYCONNECTIONS_APPLICATION_NO")}</div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: "800", marginTop: "2px", letterSpacing: "0.2px", wordBreak: "break-all" }}>{application?.applicationNo || t("CS_NA")}</div>
            </div>
          </div>
          <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "10px", fontWeight: "700", letterSpacing: "0.4px", background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, textTransform: "uppercase", flexShrink: 0, marginLeft: "8px" }}>
            {t(`CS_${application?.applicationStatus}`) || application?.applicationStatus}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "14px 20px 12px", flex: 1 }}>
        {rowItems.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                  {item.icon.includes("9l9") && <polyline points="9 22 9 12 15 12 15 22" />}
                  {item.icon.includes("20 21") && <circle cx="12" cy="7" r="4" />}
                </svg>
              </div>
              <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px" }}>{item.label}</span>
            </div>
            <span style={{ fontSize: "13px", color: "#1a2b49", fontWeight: "700", textAlign: "right", maxWidth: "55%", wordBreak: "break-word" }}>{item.value}</span>
          </div>
        ))}

        {/* Address row */}
        <div style={{ padding: "10px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ display: "block", fontSize: "12px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "4px" }}>{t("WS_PROPERTY_ADDRESS")}</span>
              <span style={{ fontSize: "13px", color: "#1a2b49", fontWeight: "700", wordBreak: "break-word" }}>{address || t("CS_NA")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div style={{ padding: "0 20px 18px 20px", display: "flex", flexDirection: "column", gap: "10px", marginTop: "auto" }}>
        <Link to={`/suda-ui/citizen/ws/connection/application/${encodeApplicationNo}`} style={{ textDecoration: "none", display: "block" }}>
          <button
            style={{ width: "100%", height: "42px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "10px", color: "#ffffff", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", boxShadow: "0 3px 10px rgba(244,119,56,0.35)", transition: "transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(244,119,56,0.45)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 10px rgba(244,119,56,0.35)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {t("WS_VIEW_DETAILS_LABEL")}
          </button>
        </Link>

        {isPendingPayment && (
          <Link to={{ pathname: paymentPath, state: {} }} style={{ textDecoration: "none", display: "block" }}>
            <button
              style={{ width: "100%", height: "42px", background: "transparent", border: "2px solid #059669", borderRadius: "10px", color: "#059669", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", transition: "background 0.15s, color 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#059669"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#059669"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              {t("MAKE_PAYMENT")}
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default WSApplication;
