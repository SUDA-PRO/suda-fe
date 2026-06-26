import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  BreakLine,
  Card,
  CardSubHeader,
  StatusTable,
  Row,
  SubmitBar,
  Loader,
  CardSectionHeader,
  ConnectingCheckPoints,
  CheckPoint,
  ActionBar,
  Menu,
  LinkButton,
  Toast,
  Rating,
  ActionLinks,
  Header,
  ImageViewer,
  MultiLink,
} from "@upyog/digit-ui-react-components";

import ActionModal from "./Modal";
import TLCaption from "../../../components/TLCaption";

import { useQueryClient } from "react-query";

import { Link, useHistory, useParams } from "react-router-dom";
import { ViewImages } from "../../../components/ViewImages";
import getPDFData from "../../../getPDFData";

const ApplicationDetails = (props) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const state = Digit.ULBService.getStateId();
  const { t } = useTranslation();
  const history = useHistory();
  const queryClient = useQueryClient();
  let { id: applicationNumber } = useParams();
  const [displayMenu, setDisplayMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [config, setCurrentConfig] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [imageZoom, setImageZoom] = useState(null);
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const [viewTimeline, setViewTimeline] = useState(false);
  const DSO = Digit.UserService.hasAccess(["FSM_DSO"]) || false;
  const [showOptions, setShowOptions] = useState(false);
  const [showReceiptOptions, setShowReceiptOptions]=useState(false);
  const isMobile = window.Digit.Utils.browser.isMobile();
  const [shownDownloadOptions, setShoowDownloadOptions]=useState(false)
  const { data: storeData } = Digit.Hooks.useStore.getInitData();

  const { tenants } = storeData || {};

  const { data: paymentsHistory } = Digit.Hooks.fsm.usePaymentHistory(tenantId, applicationNumber);

  const { isLoading, isError, data: applicationDetails, error } = Digit.Hooks.fsm.useApplicationDetail(
    t,
    tenantId,
    applicationNumber,
    {},
    "EMPLOYEE"
  );
  const { isLoading: isDataLoading, isSuccess, data: applicationData } = Digit.Hooks.fsm.useSearch(
    tenantId,
    { applicationNos: applicationNumber },
    { staleTime: Infinity }
  );

  const {
    isLoading: updatingApplication,
    isError: updateApplicationError,
    data: updateResponse,
    error: updateError,
    mutate,
  } = Digit.Hooks.fsm.useApplicationActions(tenantId);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: applicationDetails?.tenantId || tenantId,
    id: applicationNumber,
    moduleCode:
      applicationData?.paymentPreference === "POST_PAY"
        ? "FSM_POST_PAY_SERVICE"
        : applicationData?.advanceAmount === 0
          ? "PAY_LATER_SERVICE"
          : applicationData?.advanceAmount > 0
            ? "FSM_ADVANCE_PAY_SERVICE"
            : applicationData?.paymentPreference === null &&
              applicationData?.additionalDetails?.tripAmount === 0 &&
              applicationData?.advanceAmount === null
              ? "FSM_ZERO_PAY_SERVICE"
              : "FSM",
    role: "FSM_EMPLOYEE",
    serviceData: applicationDetails,
    getTripData: true,
  });

  useEffect(() => {
    if (showToast) {
      workflowDetails.revalidate();
    }
  }, [showToast]);

  function onActionSelect(action) {
    setSelectedAction(action);
    setDisplayMenu(false);
  }

  useEffect(() => {
    switch (selectedAction) {
      case "SCHEDULE":
      case "DSO_ACCEPT":
      case "ACCEPT":
      case "ASSIGN":
      case "GENERATE_DEMAND":
      case "FSM_GENERATE_DEMAND":
      case "REASSIGN":
      case "COMPLETE":
      case "COMPLETED":
      case "CANCEL":
      case "SENDBACK":
      case "DSO_REJECT":
      case "REJECT":
      case "DECLINE":
      case "REASSING":
      case "UPDATE":
        return setShowModal(true);
      case "SUBMIT":
      case "FSM_SUBMIT":
        // case !DSO && "SCHEDULE":
        return history.push("/suda-ui/employee/fsm/modify-application/" + applicationNumber);
      case "PAY":
      case "FSM_PAY":
      case "ADDITIONAL_PAY_REQUEST":
        return history.push(`/suda-ui/employee/payment/collect/FSM.TRIP_CHARGES/${applicationNumber}?workflow=FSM`);
      default:
        break;
    }
  }, [selectedAction]);

  const closeModal = () => {
    setSelectedAction(null);
    setShowModal(false);
  };

  const closeToast = () => {
    setShowToast(null);
  };

  const handleViewTimeline = () => {
    const timelineSection = document.getElementById('timeline');
    if (timelineSection) {
      timelineSection.scrollIntoView({ behavior: 'smooth' });
    }
    setViewTimeline(true);
  };
  const submitAction = (data) => {
    mutate(data, {
      onError: (error, variables) => {
        setShowToast({ key: "error", action: error });
        setTimeout(closeToast, 5000);
      },
      onSuccess: (data, variables) => {
        setShowToast({ key: "success", action: selectedAction });
        setTimeout(closeToast, 5000);
        queryClient.invalidateQueries("FSM_CITIZEN_SEARCH");
        const inbox = queryClient.getQueryData("FUNCTION_RESET_INBOX");
        inbox?.revalidate();
      },
    });
    closeModal();
  };

  function zoomImageWrapper(imageSource, index) {
    setImageZoom(imageSource);
  }

  function onCloseImageZoom() {
    setImageZoom(null);
  }

  const getTimelineCaptions = (checkpoint) => {
    const __comment = checkpoint?.comment?.split("~");
    const reason = __comment ? __comment[0] : null;
    const reason_comment = __comment ? __comment[1] : null;
    if (checkpoint.status === "CREATED") {
      const caption = {
        date: checkpoint?.auditDetails?.created,
        name: checkpoint?.assigner,
        mobileNumber: applicationData?.citizen?.mobileNumber,
        emailId: applicationData?.citizen?.emailId,
        source: applicationData?.source || "",
      };
      return <TLCaption data={caption} />;
    } else if (
      checkpoint.status === "PENDING_APPL_FEE_PAYMENT" ||
      checkpoint.status === "DSO_REJECTED" ||
      checkpoint.status === "CANCELED" ||
      checkpoint.status === "REJECTED"
    ) {
      const caption = {
        date: checkpoint?.auditDetails?.created,
        name: checkpoint?.assigner,
        comment: reason ? t(`ES_ACTION_REASON_${reason}`) : null,
        otherComment: reason_comment ? reason_comment : null,
      };
      return <TLCaption data={caption} />;
    } else if (checkpoint.status === "DSO_INPROGRESS") {
      const caption = {
        name: checkpoint?.assigner,
        mobileNumber: checkpoint?.assigner?.mobileNumber,
        date: `${t("CS_FSM_EXPECTED_DATE")} ${Digit.DateUtils.ConvertTimestampToDate(applicationData?.possibleServiceDate)}`,
      };
      return <TLCaption data={caption} />;
    } else if (checkpoint.status === "COMPLETED") {
      return (
        <div>
          <Rating withText={true} text={t(`ES_FSM_YOU_RATED`)} currentRating={checkpoint.rating} />
          <Link to={`/suda-ui/employee/fsm/rate-view/${applicationNumber}`}>
            <ActionLinks>{t("CS_FSM_RATE_VIEW")}</ActionLinks>
          </Link>
        </div>
      );
    } else if (
      checkpoint.status === "WAITING_FOR_DISPOSAL" ||
      checkpoint.status === "DISPOSAL_IN_PROGRESS" ||
      checkpoint.status === "DISPOSED" ||
      checkpoint.status === "CITIZEN_FEEDBACK_PENDING"
    ) {
      const caption = {
        date: checkpoint?.auditDetails?.created,
        name: checkpoint?.assigner,
        mobileNumber: checkpoint?.assigner?.mobileNumber,
      };
      if (checkpoint?.numberOfTrips) caption.comment = `${t("NUMBER_OF_TRIPS")}: ${checkpoint?.numberOfTrips}`;
      return <TLCaption data={caption} />;
    }
  };

  const handleDownloadPdf = async () => {
    const tenantInfo = tenants.find((tenant) => tenant.code === applicationDetails?.tenantId);
    const data = getPDFData({ ...applicationData }, tenantInfo, t);
    Digit.Utils.pdf.generate(data);
    setShowOptions(false);
  };

  const downloadFinalPaymentReceipt = async () => {
    const receiptFile = {
      filestoreIds: [paymentsHistory.Payments[0]?.fileStoreId],
    };

    if (!receiptFile?.fileStoreIds?.[0]) {
      const newResponse = await Digit.PaymentService.generatePdf(state, { Payments: [paymentsHistory.Payments[0]] }, "fsm-receipt");
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
  const [isDisplayDownloadMenu, setIsDisplayDownloadMenu] = useState(false);

  let dowloadOptions =
    paymentsHistory?.Payments?.length > 0
      ? [
        {
          label: t("CS_COMMON_APPLICATION_ACKNOWLEDGEMENT"),
          onClick: handleDownloadPdf,
        },
        {
          label: t("CS_DOWNLOAD_RECEIPT"),
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
      const receiptOptions=paymentsHistory?.Payments.length>1 ? [
        
        {
          label : t("ADVANCE_PAYMENT_RECEIPT"),
          onClick:downloadAdvancePaymentReceipt
        },
        {
          label : t("FINAL_PAYMENT_RECEIPT"),
          onClick:downloadFinalPaymentReceipt
        }
      
      
      ]:
      [
        {
          label : t("ADVANCE_PAYMENT_RECEIPT"),
          onClick:downloadAdvancePaymentReceipt
        },
      ]

  if (isLoading) {
    return <Loader />;
  }

  const toggleTimeline = () => {
    setShowAllTimeline((prev) => !prev);
  };

  // ── Design tokens ──────────────────────────────────────────
  const NAVY   = "#1a2b49";
  const ACCENT = "#B54708";
  const ORANGE = "#f47738";

  // ── Section colour map (by detail title key) ────────────────
  const sectionStyle = (title) => {
    const map = {
      "CS_FSM_APPLICATION_DETAIL_TITLE_APPLICATION_DETAILS": { hdr: "#1a2b49", light: "#eef2ff" },
      "ES_FSM_APPLICATION_DETAILS_APPLICANT_DETAILS":        { hdr: "#065f46", light: "#ecfdf5" },
      "CS_CHECK_PROPERTY_DETAILS":                           { hdr: "#1d4ed8", light: "#eff6ff" },
      "ES_NEW_APPLICATION_LOCATION_DETAILS":                 { hdr: "#4338ca", light: "#eef2ff" },
      "CS_CHECK_PIT_SEPTIC_TANK_DETAILS":                    { hdr: "#92400e", light: "#fff7ed" },
      "CS_FSM_PAYMENT_SUBTITLE":                             { hdr: "#065f46", light: "#ecfdf5" },
      "ES_TITLE_DSO_DETAILS":                                { hdr: "#7c3aed", light: "#f5f3ff" },
    };
    return map[title] || { hdr: NAVY, light: "#f8f9fc" };
  };

  return (
    <React.Fragment>
      {!isLoading ? (
        <div className="fsm-appdetails-root">

          {/* ══════════════════════════════════════
              BANNER
          ══════════════════════════════════════ */}
          <div style={{
            background: `linear-gradient(135deg, ${NAVY} 0%, #274080 60%, ${ACCENT}cc 100%)`,
            padding: "18px 32px 22px",
            display: "flex", flexDirection: "column",
            position: "relative",
          }}>
            <div style={{ position: "absolute", top: "-40px", right: "160px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

            {/* Breadcrumb inside banner */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "12px", zIndex: 1 }}>
              <a href="/suda-ui/employee" style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", fontWeight: "500", textDecoration: "none" }}>
                {t("ES_COMMON_HOME")}
              </a>
              <span style={{ color: "rgba(255,255,255,0.30)", fontSize: "11px" }}>›</span>
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", fontWeight: "500" }}>FSM</span>
              <span style={{ color: "rgba(255,255,255,0.30)", fontSize: "11px" }}>›</span>
              <a href="/suda-ui/employee/fsm/inbox" style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", fontWeight: "500", textDecoration: "none" }}>
                {t("ES_COMMON_INBOX")}
              </a>
              <span style={{ color: "rgba(255,255,255,0.30)", fontSize: "11px" }}>›</span>
              <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: "600" }}>
                {t("ES_TITLE_APPLICATION_DETAILS")}
              </span>
            </div>

            {/* Title row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 1, width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                  🚿
                </div>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "2px" }}>
                    {t("ES_TITLE_FAECAL_SLUDGE_MGMT")}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#ffffff", fontSize: "18px", fontWeight: "800" }}>{applicationNumber}</span>
                    {applicationData?.applicationStatus && (
                      <span style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: "600", color: "#ffffff" }}>
                        {t(`CS_COMMON_FSM_${applicationData.applicationStatus}`)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, zIndex: 10 }}>
                <button
                  onClick={handleViewTimeline}
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: "8px", padding: "8px 16px", color: "#ffffff", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  📋 {t("VIEW_TIMELINE")}
                </button>

                {/* Custom Download dropdown */}
                {dowloadOptions && dowloadOptions.length > 0 && !showReceiptOptions && (
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setShowOptions(!showOptions)}
                      style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: "8px", padding: "8px 16px", color: "#ffffff", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      ⬇ {t("CS_COMMON_DOWNLOAD")} ▾
                    </button>
                    {showOptions && (
                      <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#ffffff", border: "1px solid #e8edf5", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.18)", minWidth: "230px", zIndex: 200, overflow: "hidden" }}>
                        {dowloadOptions.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => { opt.onClick(); setShowOptions(false); }}
                            style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", background: "none", border: "none", borderBottom: i < dowloadOptions.length - 1 ? "1px solid #f0f2f7" : "none", fontSize: "13px", fontWeight: "500", color: "#1a2b49", cursor: "pointer" }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Custom Receipt dropdown */}
                {receiptOptions && receiptOptions.length > 0 && showReceiptOptions && (
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setShowReceiptOptions(!showReceiptOptions)}
                      style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: "8px", padding: "8px 16px", color: "#ffffff", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      🧾 {t("CS_DOWNLOAD_RECEIPT")} ▾
                    </button>
                    {showReceiptOptions && (
                      <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#ffffff", border: "1px solid #e8edf5", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.18)", minWidth: "230px", zIndex: 200, overflow: "hidden" }}>
                        {receiptOptions.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => { opt.onClick(); setShowReceiptOptions(false); }}
                            style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", background: "none", border: "none", borderBottom: i < receiptOptions.length - 1 ? "1px solid #f0f2f7" : "none", fontSize: "13px", fontWeight: "500", color: "#1a2b49", cursor: "pointer" }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════
              DETAIL SECTIONS
          ══════════════════════════════════════ */}
          <div style={{ padding: "24px 32px 40px", background: "#f0f2f7" }}>

            {applicationDetails?.applicationDetails.map((detail, sIdx) => {
              const { hdr, light } = sectionStyle(detail.title);
              return (
                <div key={sIdx} style={{ background: "#ffffff", borderRadius: "14px", boxShadow: "0 2px 12px rgba(26,43,73,0.09)", border: "1px solid #e8edf5", marginBottom: "20px", overflow: "hidden" }}>
                  {/* Section header */}
                  <div style={{ background: `linear-gradient(135deg, ${hdr} 0%, ${hdr}cc 100%)`, padding: "12px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: "700", letterSpacing: "0.2px" }}>{t(detail.title)}</span>
                  </div>
                  {/* Rows grid */}
                  <div style={{ padding: "4px 0" }}>
                    {detail?.values?.map((value, vIdx) => {
                      if (value === null) return null;
                      const isEven = vIdx % 2 === 0;
                      if (value.map === true && value.value !== "N/A") {
                        return (
                          <div key={vIdx} style={{ display: "flex", padding: "11px 20px", borderBottom: vIdx < detail.values.length - 1 ? "1px solid #f3f4f6" : "none", background: isEven ? "#ffffff" : "#fafbfd" }}>
                            <div style={{ width: "46%", color: "#6b7280", fontSize: "13px", fontWeight: "500", paddingRight: "12px", flexShrink: 0 }}>{t(value.title)}</div>
                            <div style={{ flex: 1, color: "#111827", fontSize: "13px", fontWeight: "400" }}><img src={t(value.value)} alt="" style={{ maxWidth: "100%", borderRadius: "6px" }} /></div>
                          </div>
                        );
                      }
                      const displayVal = t(value.value) || "N/A";
                      const isNA = displayVal === "N/A" || displayVal === "NA";
                      const isAmount = typeof displayVal === "string" && displayVal.startsWith("₹");
                      return (
                        <div key={vIdx} style={{ display: "flex", alignItems: "flex-start", padding: "11px 20px", borderBottom: vIdx < detail.values.length - 1 ? "1px solid #f3f4f6" : "none", background: isEven ? "#ffffff" : "#fafbfd" }}>
                          <div style={{ width: "46%", color: "#6b7280", fontSize: "13px", fontWeight: "500", paddingRight: "12px", flexShrink: 0, lineHeight: "1.5" }}>{t(value.title)}</div>
                          <div style={{ flex: 1, color: isNA ? "#9ca3af" : isAmount ? ACCENT : "#111827", fontSize: "13px", fontWeight: isAmount ? "700" : "400", lineHeight: "1.5" }}>{displayVal}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Uploads */}
            {applicationData?.pitDetail?.additionalDetails?.fileStoreId?.CITIZEN?.length && (
              <div style={{ background: "#ffffff", borderRadius: "14px", boxShadow: "0 2px 12px rgba(26,43,73,0.09)", border: "1px solid #e8edf5", marginBottom: "20px", overflow: "hidden" }}>
                <div style={{ background: `linear-gradient(135deg, #0e7490 0%, #0e7490cc 100%)`, padding: "12px 20px" }}>
                  <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: "700" }}>{t("ES_FSM_SUB_HEADING_CITIZEN_UPLOADS")}</span>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <ViewImages fileStoreIds={applicationData.pitDetail.additionalDetails.fileStoreId.CITIZEN} tenantId={state} onClick={(source, index) => zoomImageWrapper(source, index)} />
                </div>
              </div>
            )}
            {applicationData?.pitDetail?.additionalDetails?.fileStoreId?.FSM_DSO?.length && (
              <div style={{ background: "#ffffff", borderRadius: "14px", boxShadow: "0 2px 12px rgba(26,43,73,0.09)", border: "1px solid #e8edf5", marginBottom: "20px", overflow: "hidden" }}>
                <div style={{ background: `linear-gradient(135deg, #7c3aed 0%, #7c3aedcc 100%)`, padding: "12px 20px" }}>
                  <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: "700" }}>{t("ES_FSM_SUB_HEADING_DSO_UPLOADS")}</span>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <ViewImages fileStoreIds={applicationData.pitDetail.additionalDetails.fileStoreId.FSM_DSO} tenantId={tenantId} onClick={(source, index) => zoomImageWrapper(source, index)} />
                </div>
              </div>
            )}
            {imageZoom ? <ImageViewer imageSrc={imageZoom} onClose={onCloseImageZoom} /> : null}

            {/* ── Timeline ───────────────────────────────── */}
            {(workflowDetails?.isLoading || isDataLoading) && <Loader />}
            {!workflowDetails?.isLoading && !isDataLoading && (
              <div id="timeline" style={{ background: "#ffffff", borderRadius: "14px", boxShadow: "0 2px 12px rgba(26,43,73,0.09)", border: "1px solid #e8edf5", overflow: "hidden" }}>
                <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #274080 100%)`, padding: "12px 20px" }}>
                  <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: "700" }}>{t("ES_APPLICATION_DETAILS_APPLICATION_TIMELINE")}</span>
                </div>
                <div style={{ padding: "20px 24px" }}>
                  {workflowDetails?.data?.timeline?.map((checkpoint, index, arr) => {
                    if (!showAllTimeline && index >= 2) return null;
                    const isFirst = index === 0;
                    const isLast = index === arr.length - 1;
                    return (
                      <div key={index} style={{ display: "flex", gap: "16px", position: "relative" }}>
                        {/* Connector line */}
                        {!isLast && (
                          <div style={{ position: "absolute", left: "13px", top: "28px", bottom: "-4px", width: "2px", background: "#e5e7eb", zIndex: 0 }} />
                        )}
                        {/* Dot */}
                        <div style={{ flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%", background: isFirst ? ORANGE : "#e5e7eb", border: `3px solid ${isFirst ? ORANGE : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, marginTop: "2px" }}>
                          {isFirst && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ffffff", display: "block" }} />}
                        </div>
                        {/* Content */}
                        <div style={{ flex: 1, paddingBottom: isLast ? "0" : "20px" }}>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: isFirst ? ACCENT : "#374151", marginBottom: "4px" }}>
                            {t("CS_COMMON_FSM_" + `${checkpoint.performedAction === "UPDATE" ? "UPDATE_" : ""}` + checkpoint.status)}
                          </div>
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>
                            {getTimelineCaptions(checkpoint)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {workflowDetails?.data?.timeline?.length > 2 && (
                    <button
                      onClick={toggleTimeline}
                      style={{ marginTop: "8px", marginLeft: "44px", background: "none", border: "none", color: ORANGE, fontSize: "12px", fontWeight: "600", cursor: "pointer", padding: "0", textDecoration: "underline" }}
                    >
                      {showAllTimeline ? t("COLLAPSE") : t("VIEW_TIMELINE")}
                    </button>
                  )}
                </div>
              </div>
            )}
            {/* ── Inline Action Button (below timeline) ── */}
            {!workflowDetails?.isLoading && workflowDetails?.data?.nextActions?.length > 0 && workflowDetails?.data?.nextActions?.[0]?.action !== "RATE" && (
              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                {workflowDetails?.data?.nextActions?.length === 1 ? (
                  <button
                    onClick={() => onActionSelect(workflowDetails?.data?.nextActions[0].action)}
                    style={{ background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", color: "#ffffff", border: "none", borderRadius: "10px", padding: "0 40px", height: "48px", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 14px rgba(244,119,56,0.40)", letterSpacing: "0.3px" }}
                  >
                    {t(`ES_FSM_${workflowDetails?.data?.nextActions[0].action}`)}
                  </button>
                ) : (
                  <div style={{ position: "relative" }}>
                    {displayMenu && workflowDetails?.data?.nextActions && (
                      <div style={{ position: "absolute", bottom: "56px", right: 0, background: "#ffffff", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", border: "1px solid #e8edf5", overflow: "hidden", minWidth: "200px", zIndex: 20 }}>
                        {workflowDetails?.data?.nextActions.map((action, i) => (
                          <button key={i} onClick={() => onActionSelect(action.action)} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 18px", background: "none", border: "none", fontSize: "13px", fontWeight: "500", color: "#1a2b49", cursor: "pointer", borderBottom: i < workflowDetails.data.nextActions.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                            {t(`ES_FSM_${action.action}`)}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => setDisplayMenu(!displayMenu)}
                      style={{ background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", color: "#ffffff", border: "none", borderRadius: "10px", padding: "0 40px", height: "48px", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 14px rgba(244,119,56,0.40)", letterSpacing: "0.3px" }}
                    >
                      {t("ES_COMMON_TAKE_ACTION")} ▾
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modals / Toasts */}
          {showModal && (
            <ActionModal
              t={t}
              action={selectedAction}
              tenantId={tenantId}
              state={state}
              id={applicationNumber}
              closeModal={closeModal}
              submitAction={submitAction}
              actionData={workflowDetails?.data?.timeline}
              module={workflowDetails?.data?.applicationBusinessService}
              applicationDetails={applicationDetails}
            />
          )}
          {showToast && (
            <Toast
              error={showToast.key === "error" ? true : false}
              label={t(showToast.key === "success" ? `ES_FSM_${showToast.action}_UPDATE_SUCCESS` : showToast.action)}
              onClose={closeToast}
            />
          )}
        </div>
      ) : (
        <Loader />
      )}
    </React.Fragment>
  );
};

export default ApplicationDetails;
