import {
  Loader,
  MultiLink,
  LinkButton,
} from  "@upyog/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory, useParams } from "react-router-dom";
import getPDFData from "../../../utils/getTLAcknowledgementData";
import TLWFApplicationTimeline from "../../../pageComponents/TLWFApplicationTimeline";
import TLDocument from "../../../pageComponents/TLDocumets";

const getAddress = (address, t) => {
  return `${address?.doorNo ? `${address?.doorNo}, ` : ""} ${address?.street ? `${address?.street}, ` : ""}${
    address?.landmark ? `${address?.landmark}, ` : ""
  }${t(address?.locality?.code)}, ${t(address?.city?.code)},${t(address?.pincode) ? `${address?.pincode}` : " "}`;
};

const statusConfig = {
  APPROVED:                      { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
  EXPIRED:                       { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" },
  CANCELLED:                     { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
  REJECTED:                      { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
  PENDINGPAYMENT:                { bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
  INITIATED:                     { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  PENDINGDOCVERIFICATION:        { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  PENDINGFIELDVERIFICATION:      { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  FIELDINSPECTIONINITIATED:      { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  DOCUMENTVERIFICATIONINITIATED: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  CITIZENACTIONREQUIRED:         { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  MANUALEXPIRED:                 { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
};

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
      {icon}
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "13px", color: "#1a2b49", fontWeight: "600", wordBreak: "break-word" }}>{value || "-"}</div>
    </div>
  </div>
);

const SectionCard = ({ title, icon, children }) => (
  <div style={{ background: "#ffffff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(26,43,73,0.07)", border: "1px solid #f0f2f5", marginBottom: "16px", overflow: "hidden" }}>
    <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f2f5", display: "flex", alignItems: "center", gap: "10px", background: "linear-gradient(135deg, #f8faff 0%, #fff7f0 100%)" }}>
      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ fontSize: "13px", fontWeight: "700", color: "#1a2b49", letterSpacing: "0.2px" }}>{title}</span>
    </div>
    <div style={{ padding: "16px 20px" }}>{children}</div>
  </div>
);

const TLApplicationDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { tenantId } = useParams();
  const history = useHistory();
  const [bill, setBill] = useState(null);
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const [mutationHappened, setMutationHappened, clear] = Digit.Hooks.useSessionStorage("CITIZEN_TL_MUTATION_HAPPENED", false);
  const { tenants } = storeData || {};
  const isMobile = window.Digit.Utils.browser.isMobile();
  const [viewTimeline, setViewTimeline]=useState(false);
  const stateId = Digit.ULBService.getStateId();

  const { isLoading, isError, error, data: application, error: errorApplication } = Digit.Hooks.tl.useTLApplicationDetails({
    tenantId: tenantId,
    applicationNumber: id,
  });
  const { isLoading: PTLoading, isError: isPTError, data: PTData } = Digit.Hooks.pt.usePropertySearch(
    {
      tenantId,
      filters: { propertyIds: application?.[0]?.tradeLicenseDetail?.additionalDetail?.propertyId },
    },
    { enabled: application?.[0]?.tradeLicenseDetail?.additionalDetail?.propertyId ? true : false }
  );

  useEffect(() => {
    localStorage.setItem("TLAppSubmitEnabled", "true");
    setMutationHappened(false);
  }, []);

  const { data: paymentsHistory } = Digit.Hooks.tl.useTLPaymentHistory(tenantId, id);
  useEffect(() => {
    if (application) {
      Digit.PaymentService.fetchBill(tenantId, {
        consumerCode: application[0]?.applicationNumber,
        businessService: application[0]?.businessService,
      }).then((res) => {
        setBill(res?.Bill[0]);
      });
    }
  }, [application]);
  const [showOptions, setShowOptions] = useState(false);
  useEffect(() => {}, [application, errorApplication]);

  const businessService = application?.[0]?.businessService;
  const { isLoading: iswfLoading, data: wfdata } = Digit.Hooks.useWorkflowDetails({
    tenantId: application?.[0]?.tenantId,
    id: id,
    moduleCode: businessService,
  });
  
  let workflowDocs = [];
  if (wfdata) {
    wfdata?.timeline?.map((ob) => {
      if (ob?.wfDocuments?.length > 0)
      {
        ob?.wfDocuments?.map((doc) => {
          workflowDocs.push(doc)
        })
      }
    });
  }
  
  const handleViewTimeline=()=>{ 
    const timelineSection=document.getElementById('timeline');
      if(timelineSection){
        timelineSection.scrollIntoView({behavior: 'smooth'});
      } 
      setViewTimeline(true);   
  };

  if (isLoading || iswfLoading) {
    return <Loader />;
  }

  if (application?.applicationDetails?.length === 0) {
    history.goBack();
  }

  const handleDownloadPdf = async () => {
    const tenantInfo = tenants.find((tenant) => tenant.code === application[0]?.tenantId);
    let res = application[0];
    const data = getPDFData({ ...res }, tenantInfo, t);
    data.then((ress) => Digit.Utils.pdf.generate(ress));
    setShowOptions(false);
  };

  const downloadPaymentReceipt = async () => {
    const receiptFile = { filestoreIds: [paymentsHistory.Payments[0]?.fileStoreId] };
     if (receiptFile?.filestoreIds[0]!==null) {
      const fileStore = await Digit.PaymentService.printReciept(stateId, { fileStoreIds: receiptFile.filestoreIds[0] });
      window.open(fileStore[receiptFile.filestoreIds[0]], "_blank");
      setShowOptions(false);      
    } else {
      const newResponse = await Digit.PaymentService.generatePdf(stateId, { Payments: [paymentsHistory.Payments[0]] }, "tradelicense-receipt");
      const fileStore = await Digit.PaymentService.printReciept(stateId, { fileStoreIds: newResponse.filestoreIds[0] });
      window.open(fileStore[newResponse.filestoreIds[0]], "_blank");
      setShowOptions(false);
    }
  };

  const downloadTLcertificate = async () => {
    const TLcertificatefile = await Digit.PaymentService.generatePdf(tenantId, { Licenses: application }, "tlcertificate");
    const receiptFile = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: TLcertificatefile.filestoreIds[0] });
    window.open(receiptFile[TLcertificatefile.filestoreIds[0]], "_blank");
    setShowOptions(false);
  };

  let propertyAddress = "";
  if (PTData && PTData?.Properties?.length) {
    propertyAddress = getAddress(PTData?.Properties[0]?.address, t);
  }

  const dowloadOptions =
    paymentsHistory?.Payments?.length > 0 && application?.[0]?.status !== "EXPIRED" && application?.[0]?.status !== "CANCELLED" && application?.[0]?.status !== "PENDINGPAYMENT"
    && application?.[0]?.status !=="MANUALEXPIRED"
      ? [
          { label: t("TL_CERTIFICATE"), onClick: downloadTLcertificate },
          { label: t("CS_COMMON_PAYMENT_RECEIPT"), onClick: downloadPaymentReceipt },
          { label: t("TL_APPLICATION"), onClick: handleDownloadPdf },
        ]
      : [
          { label: t("TL_APPLICATION"), onClick: handleDownloadPdf },
        ];

  const ownersSequences = Array.isArray(application?.[0]?.tradeLicenseDetail?.owners)
    ? application[0].tradeLicenseDetail.owners.slice().sort((a, b) => (a?.additionalDetails?.ownerSequence || 0) - (b?.additionalDetails?.ownerSequence || 0))
    : [];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", padding: "0 0 40px" }}>
      {application?.map((app, index) => {
        const statusKey = app?.status?.toUpperCase();
        const statusStyle = statusConfig[statusKey] || { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" };
        const isPendingPayment = app?.status === "PENDINGPAYMENT";
        const isCitizenAction = app?.status === "CITIZENACTIONREQUIRED";
        const slaText = app?.SLA ? `${Math.round(app.SLA / (1000 * 60 * 60 * 24))} ${t("TL_SLA_DAYS")}` : null;

        return (
          <div key={index}>
            {/* Hero header */}
            <div style={{ background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)", padding: "20px 20px 20px", position: "relative" }}>
              <div style={{ position: "absolute", right: "-40px", top: "-40px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", right: "40px", bottom: "-60px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
              <div style={{ maxWidth: "960px", margin: "0 auto", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", fontWeight: "600", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "6px" }}>
                      {t("CS_TITLE_APPLICATION_DETAILS")}
                    </div>
                    <div style={{ fontSize: "20px", color: "#ffffff", fontWeight: "800", wordBreak: "break-word", marginBottom: "8px" }}>
                      {app?.applicationNumber}
                    </div>
                    {app?.licenseNumber && (
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", fontWeight: "600" }}>
                        {t("TL_COMMON_TABLE_COL_LICENSE_NO")}: {app.licenseNumber}
                      </div>
                    )}
                    <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.4px", background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, textTransform: "uppercase" }}>
                        {t(`WF_NEWTL_${app?.status}`)}
                      </span>
                      {slaText && (
                        <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
                          SLA: {slaText}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, position: "relative", zIndex: 100 }}>
                    <LinkButton label={t("VIEW_TIMELINE")} style={{ color: "rgba(255,255,255,0.9)", fontSize: "12px", fontWeight: "600", background: "rgba(255,255,255,0.15)", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer" }} onClick={handleViewTimeline} />
                    <MultiLink
                      className="multilinkWrapper"
                      onHeadClick={() => setShowOptions(!showOptions)}
                      displayOptions={showOptions}
                      options={dowloadOptions}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: "960px", margin: "0 auto", padding: "16px 16px 0", position: "relative" }}>

              {/* Trade Details */}
              <SectionCard
                title={t("TL_TRADE_DETAILS_HEADER") || "Trade Details"}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>}
              >
                <InfoRow
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>}
                  label={t("TL_COMMON_TABLE_COL_TRD_NAME")}
                  value={app?.tradeName}
                />
                <InfoRow
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>}
                  label={t("TL_APPLICATION_CATEGORY")}
                  value={t("ACTION_TEST_TRADE_LICENSE")}
                />
                {app?.tradeLicenseDetail?.additionalDetail?.tradeGstNo || app?.tradeLicenseDetail?.additionalDetail?.gstNo ? (
                  <InfoRow
                    icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                    label={t("TL_TRADE_GST_NO")}
                    value={app?.tradeLicenseDetail?.additionalDetail?.tradeGstNo || app?.tradeLicenseDetail?.additionalDetail?.gstNo}
                  />
                ) : null}
                {app?.tradeLicenseDetail?.operationalArea ? (
                  <InfoRow
                    icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>}
                    label={t("TL_OPERATIONAL_AREA")}
                    value={app?.tradeLicenseDetail?.operationalArea}
                  />
                ) : null}
                {app?.tradeLicenseDetail?.noOfEmployees ? (
                  <InfoRow
                    icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                    label={t("TL_NO_OF_EMPLOYEES")}
                    value={app?.tradeLicenseDetail?.noOfEmployees}
                  />
                ) : null}
              </SectionCard>

              {/* Ownership Details */}
              <SectionCard
                title={t("TL_OWNERSHIP_DETAILS_HEADER")}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              >
                {ownersSequences.map((ele, idx) => (
                  <div key={idx} style={{ padding: "12px 16px", background: "#f8f9fb", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: idx < ownersSequences.length - 1 ? "12px" : 0 }}>
                    <div style={{ fontSize: "11px", color: "#f47738", fontWeight: "700", letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: "10px" }}>
                      {t("TL_PAYMENT_PAID_BY_PLACEHOLDER")} – {idx + 1}
                    </div>
                    {app?.tradeLicenseDetail?.subOwnerShipCategory?.includes("INSTITUTIONAL") ? (
                      <React.Fragment>
                        <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>} label={t("TL_INSTITUTION_NAME_LABEL")} value={t(app?.tradeLicenseDetail?.institution?.instituionName)} />
                        <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>} label={t("TL_INSTITUTION_TYPE_LABEL")} value={t(`TL_${app?.tradeLicenseDetail?.subOwnerShipCategory}`)} />
                        <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>} label={t("TL_MOBILE_NUMBER_LABEL")} value={t(ele.mobileNumber)} />
                        <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 1.21 3.4 2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6.25 6.25l1.21-1.21a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>} label={t("TL_TELEPHONE_NUMBER_LABEL")} value={t(app?.tradeLicenseDetail?.institution?.contactNo || t("CS_NA"))} />
                        <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} label={t("TL_LOCALIZATION_OWNER_NAME")} value={t(ele.fatherOrHusbandName || app?.tradeLicenseDetail?.institution?.name)} />
                        <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} label={t("TL_LOCALIZATION_EMAIL_ID")} value={t(ele.emailId || t("CS_NA"))} />
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} label={t("TL_COMMON_TABLE_COL_OWN_NAME")} value={t(ele.name)} />
                        <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>} label={t("TL_NEW_OWNER_DETAILS_GENDER_LABEL")} value={t(ele.gender)} />
                        <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>} label={t("TL_MOBILE_NUMBER_LABEL")} value={t(ele.mobileNumber)} />
                        <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} label={t("TL_EMAIL_ID_LABEL")} value={t(ele.emailId || t("CS_NA"))} />
                        <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} label={t("TL_GUARDIAN_S_NAME_LABEL")} value={t(ele.fatherOrHusbandName)} />
                        <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>} label={t("TL_RELATIONSHIP_WITH_GUARDIAN_LABEL")} value={t(ele.relationship)} />
                        <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>} label={t("TL_COMMON_TABLE_COL_OWN_CATEGORY_SHIP")} value={t(app?.tradeLicenseDetail?.subOwnerShipCategory)} />
                      </React.Fragment>
                    )}
                  </div>
                ))}
              </SectionCard>

              {/* Trade Units */}
              <SectionCard
                title={t("TL_TRADE_UNITS_HEADER")}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
              >
                {app?.tradeLicenseDetail?.tradeUnits?.map((ele, idx) => (
                  <div key={idx} style={{ padding: "12px 16px", background: "#f8f9fb", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: idx < app.tradeLicenseDetail.tradeUnits.length - 1 ? "12px" : 0 }}>
                    <div style={{ fontSize: "11px", color: "#f47738", fontWeight: "700", letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: "10px" }}>
                      {t("TL_UNIT_HEADER")} {idx + 1}
                    </div>
                    <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>} label={t("TL_NEW_TRADE_DETAILS_TRADE_CAT_LABEL")} value={t(`TRADELICENSE_TRADETYPE_${ele?.tradeType.split(".")[0]}`)} />
                    <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>} label={t("TL_NEW_TRADE_DETAILS_TRADE_TYPE_LABEL")} value={t(`TRADELICENSE_TRADETYPE_${ele?.tradeType.split(".")[1]}`)} />
                    <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>} label={t("TL_NEW_TRADE_DETAILS_TRADE_SUBTYPE_LABEL")} value={t(`TL_${ele?.tradeType}`)} />
                  </div>
                ))}
              </SectionCard>

              {/* Accessories */}
              {Array.isArray(app?.tradeLicenseDetail?.accessories) && app?.tradeLicenseDetail?.accessories.length > 0 && (
                <SectionCard
                  title={t("TL_NEW_TRADE_DETAILS_HEADER_ACC")}
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M14 20.9V22m0-20V.1M20.9 14H22M2 14H.1M19.07 19.07l-1.41-1.41M5.34 5.34L3.93 3.93"/></svg>}
                >
                  {app?.tradeLicenseDetail?.accessories?.map((ele, idx) => (
                    <div key={idx} style={{ padding: "12px 16px", background: "#f8f9fb", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: idx < app.tradeLicenseDetail.accessories.length - 1 ? "12px" : 0 }}>
                      <div style={{ fontSize: "11px", color: "#f47738", fontWeight: "700", letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: "10px" }}>
                        {t("TL_ACCESSORY_LABEL")} {idx + 1}
                      </div>
                      <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>} label={t("TL_REVIEWACCESSORY_TYPE_LABEL")} value={t(`TL_${ele?.accessoryCategory.split("-").join("_")}`)} />
                      <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>} label={t("TL_NEW_TRADE_ACCESSORY_COUNT_LABEL")} value={ele?.count} />
                      <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>} label={t("TL_NEW_TRADE_ACCESSORY_UOM_LABEL")} value={ele?.uom} />
                      <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>} label={t("TL_NEW_TRADE_ACCESSORY_UOMVALUE_LABEL")} value={ele?.uomValue} />
                    </div>
                  ))}
                </SectionCard>
              )}

              {/* Property Details */}
              {PTData?.Properties && PTData?.Properties.length > 0 ? (
                <SectionCard
                  title={t("PT_DETAILS")}
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
                >
                  <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>} label={t("TL_PROPERTY_ID")} value={PTData?.Properties?.[0]?.propertyId} />
                  <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} label={t("PT_OWNER_NAME")} value={PTData?.Properties?.[0]?.owners[0]?.name} />
                  <InfoRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>} label={t("PROPERTY_ADDRESS")} value={propertyAddress} />
                  <button
                    onClick={() => history.push(`/suda-ui/citizen/commonpt/view-property?propertyId=${PTData?.Properties?.[0]?.propertyId}&tenantId=${PTData?.Properties?.[0]?.tenantId}`)}
                    style={{ marginTop: "4px", padding: "8px 18px", background: "transparent", border: "2px solid #f47738", borderRadius: "8px", color: "#f47738", fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "background 0.15s, color 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#f47738"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#f47738"; }}
                  >
                    {t("TL_VIEW_PROPERTY_DETAIL")}
                  </button>
                </SectionCard>
              ) : (
                /* Trade Address */
                <SectionCard
                  title={t("TL_NEW_TRADE_ADDRESS_LABEL")}
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                >
                  <InfoRow
                    icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                    label={t("TL_NEW_TRADE_ADDRESS_LABEL")}
                    value={`${app?.tradeLicenseDetail?.address?.doorNo?.trim() ? `${app?.tradeLicenseDetail?.address?.doorNo?.trim()}, ` : ""}${app?.tradeLicenseDetail?.address?.street?.trim() ? `${app?.tradeLicenseDetail?.address?.street?.trim()}, ` : ""}${t(app?.tradeLicenseDetail?.address?.locality?.name)}, ${t(app?.tradeLicenseDetail?.address?.city)}${app?.tradeLicenseDetail?.address?.pincode?.trim() ? `, ${app?.tradeLicenseDetail?.address?.pincode?.trim()}` : ""}`}
                  />
                </SectionCard>
              )}

              {/* Documents */}
              <SectionCard
                title={t("TL_COMMON_DOCS")}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
              >
                {app?.tradeLicenseDetail?.applicationDocuments?.length > 0 ? (
                  <TLDocument value={{ ...app }} />
                ) : (
                  <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af", fontStyle: "italic" }}>{t("TL_NO_DOCUMENTS_MSG")}</p>
                )}
              </SectionCard>

              {/* Workflow Documents */}
              {workflowDocs?.length > 0 && (
                <SectionCard
                  title={t("TL_TIMELINE_DOCS")}
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>}
                >
                  <TLDocument value={{ workflowDocs }} />
                </SectionCard>
              )}

              {/* Timeline */}
              <div id="timeline" style={{ background: "#ffffff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(26,43,73,0.07)", border: "1px solid #f0f2f5", marginBottom: "16px", padding: "16px 20px" }}>
                <TLWFApplicationTimeline application={app} id={id} />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
                {isCitizenAction && (
                  <Link
                    to={{ pathname: `/suda-ui/citizen/tl/tradelicence/edit-application/${app?.applicationNumber}/${app?.tenantId}`, state: {} }}
                    style={{ flex: 1, textDecoration: "none", minWidth: "140px" }}
                  >
                    <button style={{ width: "100%", height: "44px", background: "transparent", border: "2px solid #f47738", borderRadius: "10px", color: "#f47738", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "background 0.15s, color 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#f47738"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#f47738"; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      {t("COMMON_EDIT")}
                    </button>
                  </Link>
                )}
                {isPendingPayment && (
                  <Link
                    to={{ pathname: `/suda-ui/citizen/payment/collect/${app?.businessService}/${app?.applicationNumber}`, state: { bill, tenantId } }}
                    style={{ flex: 1, textDecoration: "none", minWidth: "140px" }}
                  >
                    <button style={{ width: "100%", height: "44px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 3px 12px rgba(244,119,56,0.35)", transition: "transform 0.15s, box-shadow 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(244,119,56,0.45)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(244,119,56,0.35)"; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                      {t("COMMON_MAKE_PAYMENT")}
                    </button>
                  </Link>
                )}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TLApplicationDetails;

