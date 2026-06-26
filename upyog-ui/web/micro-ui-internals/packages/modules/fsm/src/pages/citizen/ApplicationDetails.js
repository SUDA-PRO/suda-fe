import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyNote, Loader } from "@upyog/digit-ui-react-components";
import { useHistory, useLocation, useParams } from "react-router-dom";
import getPDFData from "../../getPDFData";
import { getVehicleType } from "../../utils";
import { ApplicationTimeline } from "../../components/ApplicationTimeline";

const ApplicationDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const history = useHistory();
  const { state: locState } = useLocation();
  const tenantId = locState?.tenantId || Digit.ULBService.getCurrentTenantId();
  const state = Digit.ULBService.getStateId();
  const [viewTimeline, setViewTimeline]=useState(false);
  const [showReceiptOptions, setShowReceiptOptions]=useState(false);
  const isMobile = window.Digit.Utils.browser.isMobile();
  const { isLoading, isError, error, data: application, error: errorApplication } = Digit.Hooks.fsm.useApplicationDetail(
    t,
    tenantId,
    id,
    {},
    "CITIZEN"
  );

  const { data: paymentsHistory } = Digit.Hooks.fsm.usePaymentHistory(tenantId, id);
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  const [showOptions, setShowOptions] = useState(false);

  if (isLoading || !application) {
    return <Loader />;
  }

  if (application?.applicationDetails?.length === 0) {
    history.goBack();
  }

  const handleDownloadPdf = async () => {
    const tenantInfo = tenants.find((tenant) => tenant.code === application?.tenantId);
    const data = getPDFData({ ...application?.pdfData }, tenantInfo, t);
    Digit.Utils.pdf.generate(data);
    setShowOptions(false);
  };

  const downloadFinalPaymentReceipt = async () => {
    const receiptFile = { filestoreIds: [paymentsHistory.Payments[0]?.fileStoreId] };

    if (!receiptFile?.filestoreIds?.[0]) {
      const newResponse = await Digit.PaymentService.generatePdf(state, { Payments: [paymentsHistory.Payments[0]] }, "fsm-receipt");
      const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: newResponse.filestoreIds[0] });
      window.open(fileStore[newResponse.filestoreIds[0]], "_blank");
      setShowOptions(false);
    } else {
      const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: receiptFile.filestoreIds[0] });
      window.open(fileStore[receiptFile.filestoreIds[0]], "_blank");
      setShowOptions(false);
    }
  };
  const downloadAdvancePaymentReceipt = async () => {
    const paymemntIndex= paymentsHistory.Payments.length===1  ? 0 : 1;
    const receiptFile = {
      filestoreIds: [paymentsHistory.Payments[paymemntIndex]?.fileStoreId],
    };
    if (!receiptFile?.fileStoreIds?.[0]) {
      const newResponse = await Digit.PaymentService.generatePdf(state, { Payments: [paymentsHistory.Payments[paymemntIndex]] }, "fsm-receipt");
      const fileStore = await Digit.PaymentService.printReciept(state, {
        fileStoreIds: newResponse.filestoreIds[0],
      });
      window.open(fileStore[newResponse.filestoreIds[0]], "_blank");
      setShowOptions(false);
    } else {
      const fileStore = await Digit.PaymentService.printReciept(state, {
        fileStoreIds: receiptFile.filestoreIds[0],
      });
      window.open(fileStore[receiptFile.filestoreIds[0]], "_blank");
      setShowOptions(false);
    }
  };
  const handleViewTimeline=()=>{ 
    const timelineSection=document.getElementById('timeline');
      if(timelineSection){
        timelineSection.scrollIntoView({behavior: 'smooth'});
      } 
      setViewTimeline(true);   
  };

  const dowloadOptions =
    paymentsHistory?.Payments?.length > 0
      ? [
          {
            label: t("CS_COMMON_APPLICATION_ACKNOWLEDGEMENT"),
            onClick: handleDownloadPdf,
          },
          {
            label: t("CS_COMMON_PAYMENT_RECEIPT"),
            onClick: ()=> {
              setShowReceiptOptions(true),
              setShowOptions(false)
            }
          },
        ]
      : [
          {
            label: t("CS_COMMON_APPLICATION_ACKNOWLEDGEMENT"),
            onClick: handleDownloadPdf,
          },
        ];
        const receiptOptions= paymentsHistory?.Payments.length > 1 ?
        [
          {
            label : t("ADVANCE_PAYMENT_RECEIPT"),
            onClick:downloadAdvancePaymentReceipt
          },
          {
            label : t("FINAL_PAYMENT_RECEIPT"),
            onClick:downloadFinalPaymentReceipt
          }
        ]:[
          {
            label : t("ADVANCE_PAYMENT_RECEIPT"),
            onClick:downloadAdvancePaymentReceipt
          },
        ]

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "28px 24px 48px" }}>
      <div style={{ background: "#ffffff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(26,43,73,0.10)", overflow: "hidden", border: "1px solid #e9edf2" }}>

        {/* Combined header */}
        <div style={{ background: "#ffffff", borderBottom: "1px solid #e9edf2", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#fff5f0", border: "1px solid #fddec8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.3px" }}>
                Application Details
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: "12px", fontWeight: "700", color: "#ffffff", background: "#22394d", display: "inline-block", padding: "2px 10px", borderRadius: "4px", borderLeft: "3px solid #f47738" }}>
                {id}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {/* View Timeline button */}
            <button
              onClick={handleViewTimeline}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", background: "#ffffff", border: "1px solid #22394d", borderRadius: "10px", color: "#22394d", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {t("VIEW_TIMELINE")}
            </button>

            {/* Download dropdown */}
            {dowloadOptions && dowloadOptions.length > 0 && !showReceiptOptions && (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "10px", color: "#ffffff", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 2px 8px rgba(244,119,56,0.35)" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(244,119,56,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(244,119,56,0.35)"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  {t("CS_COMMON_DOWNLOAD")}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {showOptions && (
                  <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100, minWidth: "200px", overflow: "hidden" }}>
                    {dowloadOptions.map((opt, i) => (
                      <button key={i} onClick={opt.onClick} style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", background: "none", border: "none", fontSize: "13px", fontWeight: "600", color: "#1e293b", cursor: "pointer", borderBottom: i < dowloadOptions.length - 1 ? "1px solid #f1f5f9" : "none" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Receipt dropdown */}
            {receiptOptions && receiptOptions.length > 0 && showReceiptOptions && (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowReceiptOptions(!showReceiptOptions)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "10px", color: "#ffffff", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 2px 8px rgba(244,119,56,0.35)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  {t("CS_COMMON_RECEIPT")}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {showReceiptOptions && (
                  <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100, minWidth: "200px", overflow: "hidden" }}>
                    {receiptOptions.map((opt, i) => (
                      <button key={i} onClick={opt.onClick} style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", background: "none", border: "none", fontSize: "13px", fontWeight: "600", color: "#1e293b", cursor: "pointer", borderBottom: i < receiptOptions.length - 1 ? "1px solid #f1f5f9" : "none" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div style={{ padding: "8px 24px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {application?.applicationDetails?.map(({ title, value, child, caption, map }, index) => (
              <div key={index} style={{ padding: "14px 16px", background: index % 2 === 0 ? "#f8fafc" : "#ffffff", borderRadius: "8px", margin: "4px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#22394d", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "5px" }}>
                  {t(title)}
                </div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", wordBreak: "break-word" }}>
                  {child && typeof child === "object"
                    ? React.createElement(child.element, { ...child })
                    : (child || t(value) || ((!map) && "N/A"))}
                </div>
                {caption && (
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px" }}>{t(caption)}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline section */}
        <div id="timeline" style={{ borderTop: "3px solid #f47738" }}>
          {/* Section header */}
          <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#fff5f0", border: "1px solid #fddec8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
              Application Timeline
            </h2>
          </div>
          <div style={{ padding: "8px 24px 28px 74px" }}>
            <ApplicationTimeline application={application?.pdfData} id={id} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ApplicationDetails;
