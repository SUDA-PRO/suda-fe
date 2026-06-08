import { LinkButton, SubmitBar, Toast } from "@upyog/digit-ui-react-components";
import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* ── shared styles ───────────────────────────────────────────────────── */
const WHITE = "#ffffff";
const DARK_NAVY = "#1a2b49";

const detailCard = {
  background: WHITE,
  borderRadius: "12px",
  border: "1px solid #ddd",
  boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
  padding: "20px 24px",
  marginBottom: "16px",
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  borderBottom: "1px solid #f0f0f0",
  fontSize: "14px",
};

const labelStyle = { color: "#505a5f", fontWeight: "600" };
const valueStyle = { color: DARK_NAVY, fontWeight: "700", textAlign: "right" };

/* ── full-width banner ───────────────────────────────────────────────── */
const SuccessBanner = ({ title, subtitle, icon }) => (
  <div style={{
    background: "linear-gradient(135deg, #1a6e3c 0%, #28a745 100%)",
    borderRadius: "14px",
    padding: "32px 36px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 4px 18px rgba(26,110,60,0.25)",
    width: "100%",
  }}>
    <div style={{
      width: "60px", height: "60px", borderRadius: "50%",
      background: "rgba(255,255,255,0.2)", display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: WHITE, lineHeight: 1.3 }}>{title}</h2>
      {subtitle && <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.85)" }}>{subtitle}</p>}
    </div>
  </div>
);

const ErrorBanner = ({ title }) => (
  <div style={{
    background: "linear-gradient(135deg, #8b0000 0%, #c0392b 100%)",
    borderRadius: "14px",
    padding: "32px 36px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 4px 18px rgba(139,0,0,0.25)",
    width: "100%",
  }}>
    <div style={{
      width: "60px", height: "60px", borderRadius: "50%",
      background: "rgba(255,255,255,0.2)", display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    </div>
    <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: WHITE, lineHeight: 1.3 }}>{title}</h2>
  </div>
);

const EDCRAcknowledgement = (props) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [bpaLinks, setBpaLinks] = useState({});
  const state = Digit.ULBService.getStateId();
  const { data: homePageUrlLinks, isLoading: homePageUrlLinksLoading } = Digit.Hooks.obps.useMDMS(state, "BPA", ["homePageUrlLinks"]);
  const { isMdmsLoading, data: mdmsData } = Digit.Hooks.obps.useMDMS(state, "BPA", ["RiskTypeComputation"]);

  useEffect(() => {
    if (props?.data?.type == "ERROR" && !showToast) setShowToast(true);
  }, [props?.data?.data]);

  useEffect(() => {
    if (!homePageUrlLinksLoading && homePageUrlLinks?.BPA?.homePageUrlLinks?.length > 0) {
      const edcrData = props?.data?.[0];
      homePageUrlLinks?.BPA?.homePageUrlLinks?.map(linkData => {
        if (linkData?.applicationType === edcrData?.appliactionType && linkData?.serviceType === edcrData?.applicationSubType) {
          setBpaLinks({ linkData, edcrNumber: edcrData?.edcrNumber });
        }
      });
    }
  }, [homePageUrlLinksLoading, homePageUrlLinks]);

  if (props?.data?.type == "ERROR") {
    return (
      <div style={{ width: "100%" }}>
        <ErrorBanner title={t("CS_BPA_APPLICATION_FAILED")} />
        <div style={detailCard}>
          <Link to={`/suda-ui/citizen`}>
            <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
          </Link>
        </div>
        {showToast ? <Toast error={"error"} label={t(props?.data?.data)} onClose={() => setShowToast(null)} isDleteBtn={true} /> : null}
      </div>
    );
  }

  sessionStorage.setItem("isPermitApplication", true);
  sessionStorage.setItem("isEDCRDisable", JSON.stringify(true));
  const edcrData = props?.data?.[0];

  const printReciept = () => {
    try {
      let fileUrl = edcrData?.planReport;
      if (!fileUrl) return;
      if (fileUrl.startsWith("http://")) fileUrl = fileUrl.replace(/^http:\/\//i, "https://");
      const win = window.open(fileUrl, "_blank", "noopener,noreferrer");
      if (win) win.focus();
    } catch (e) {
      console.error("EDCR download failed", e);
    }
  };

  const isAccepted = edcrData?.status == "Accepted";

  return (
    <div style={{ width: "100%" }}>
      {isAccepted ? (
        <React.Fragment>
          <SuccessBanner
            title={t("EDCR_ACKNOWLEDGEMENT_SUCCESS_MESSAGE_LABEL")}
            subtitle={`${t("EDCR_SCRUTINY_NUMBER_LABEL")}: ${edcrData?.edcrNumber}`}
            icon={
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            }
          />

          {/* Details card */}
          <div style={detailCard}>
            <div style={{ fontWeight: "700", fontSize: "15px", color: DARK_NAVY, marginBottom: "12px", paddingBottom: "8px", borderBottom: "2px solid #f47738" }}>
              {t("EDCR_SCRUTINY_DETAILS") || "Scrutiny Details"}
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>{t("EDCR_SCRUTINY_NUMBER_LABEL")}</span>
              <span style={valueStyle}>{edcrData?.edcrNumber}</span>
            </div>
            <div style={{ ...rowStyle, borderBottom: "none" }}>
              <span style={labelStyle}>{t("PDF_STATIC_LABEL_CONSOLIDATED_BILL_CONSUMER_ID_TL")}</span>
              <span style={valueStyle}>{edcrData?.applicationNumber}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={detailCard}>
            {/* Download report */}
            <div
              onClick={printReciept}
              style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "16px", color: "#f47738", fontWeight: "700", fontSize: "14px" }}
            >
              <svg width="20" height="23" viewBox="0 0 20 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.3334 8H14V0H6.00002V8H0.666687L10 17.3333L19.3334 8ZM0.666687 20V22.6667H19.3334V20H0.666687Z" fill="#f47738" />
              </svg>
              {t("EDCR_DOWNLOAD_SCRUTINY_REPORT_LABEL")}
            </div>

            {/* Apply for BPA */}
            <Link
              to={{ pathname: `/suda-ui/citizen/obps/${bpaLinks?.linkData?.flow?.toLowerCase()}/${edcrData?.appliactionType?.toLowerCase()}/${edcrData?.applicationSubType?.toLowerCase()}/docs-required`, state: bpaLinks }}
              replace
            >
              <SubmitBar label={t("BPA_APPLY_FOR_BPA_LABEL")} onSubmit={() => sessionStorage.setItem("clickOnBPAApplyAfterEDCR", true)} />
              <div style={{ fontSize: "13px", textAlign: "center", marginTop: "6px", color: "#505a5f" }}>
                {t("BPA_FOR_NEW_CONSTRUCTION_LABEL")}
              </div>
            </Link>

            <div style={{ marginTop: "16px" }}>
              <Link to={`/suda-ui/citizen`}>
                <LinkButton label={t("CORE_COMMON_GO_TO_HOME")} />
              </Link>
            </div>
          </div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <ErrorBanner title={t("EDCR_ACKNOWLEDGEMENT_REJECTED_MESSAGE_LABEL")} />
          <div style={detailCard}>
            <p style={{ color: "#505a5f", fontSize: "14px", marginBottom: "12px" }}>{t("EDCR_ACKNOWLEDGEMENT_REJECTED_MESSAGE_TEXT_LABEL")}</p>
            <div style={rowStyle}>
              <span style={labelStyle}>{t("PDF_STATIC_LABEL_CONSOLIDATED_BILL_CONSUMER_ID_TL")}</span>
              <span style={valueStyle}>{edcrData?.applicationNumber}</span>
            </div>
            <div
              onClick={printReciept}
              style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", margin: "16px 0", color: "#f47738", fontWeight: "700", fontSize: "14px" }}
            >
              <svg width="20" height="23" viewBox="0 0 20 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.3334 8H14V0H6.00002V8H0.666687L10 17.3333L19.3334 8ZM0.666687 20V22.6667H19.3334V20H0.666687Z" fill="#f47738" />
              </svg>
              {t("EDCR_DOWNLOAD_SCRUTINY_REPORT_LABEL")}
            </div>
            <Link to={`/suda-ui/citizen`}>
              <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
            </Link>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default EDCRAcknowledgement;
