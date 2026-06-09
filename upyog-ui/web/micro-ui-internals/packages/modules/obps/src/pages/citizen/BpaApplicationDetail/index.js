import { CardHeader, Header, Toast, Card, StatusTable, Row, Loader, Menu, PDFSvg, SubmitBar, LinkButton, ActionBar, CheckBox, MultiLink, CardText, CardSubHeader } from "@upyog/digit-ui-react-components";
import React, { Fragment, useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";
import BPAApplicationTimeline from "./BPAApplicationTimeline";
import DocumentDetails from "../../../components/DocumentDetails";
import ActionModal from "./Modal";
import OBPSDocument from "../../../pageComponents/OBPSDocuments";
import SubOccupancyTable from "../../../../../templates/ApplicationDetails/components/SubOccupancyTable";
import InspectionReport from "../../../../../templates/ApplicationDetails/components/InspectionReport";
import { getBusinessServices, getCheckBoxLabelData, getBPAFormData, convertDateToEpoch, printPdf, downloadPdf, getOrderDocuments  } from "../../../utils";
import cloneDeep from "lodash/cloneDeep";
import DocumentsPreview from "../../../../../templates/ApplicationDetails/components/DocumentsPreview";
import ScruntinyDetails from "../../../../../templates/ApplicationDetails/components/ScruntinyDetails";
import { Link } from "react-router-dom";
import useBPADetailsPage from "../../../../../../libraries/src/hooks/obps/useBPADetailsPage";
const BpaApplicationDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateCode = Digit.ULBService.getStateId();
  const isMobile = window.Digit.Utils.browser.isMobile();
  const queryClient = useQueryClient();
  const [showToast, setShowToast] = useState(null);
  const [isTocAccepted, setIsTocAccepted] = useState(false); 
  const [displayMenu, setDisplayMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [checkBoxVisible, setCheckBoxVisible] = useState(false);
  const [isEnableLoader, setIsEnableLoader] = useState(false);
  const [viewTimeline, setViewTimeline]=useState(false);
  sessionStorage.removeItem("BPA_SUBMIT_APP");
  sessionStorage.setItem("isEDCRDisable", JSON.stringify(true));
  sessionStorage.setItem("BPA_IS_ALREADY_WENT_OFF_DETAILS", JSON.stringify(false));

  const history = useHistory();
  sessionStorage.setItem("bpaApplicationDetails", false);
  let isFromSendBack = false;
  const { data: stakeHolderDetails, isLoading: stakeHolderDetailsLoading } = Digit.Hooks.obps.useMDMS(stateCode, "StakeholderRegistraition", "TradeTypetoRoleMapping");
  const { isLoading: bpaDocsLoading, data: bpaDocs } = Digit.Hooks.obps.useMDMS(stateCode, "BPA", ["DocTypeMapping"]);
  const { data, isLoading } = useBPADetailsPage(tenantId, { applicationNo: id });
  const { isMdmsLoading, data: mdmsData } = Digit.Hooks.obps.useMDMS(stateCode, "BPA", ["RiskTypeComputation"]);
  const mutation = Digit.Hooks.obps.useObpsAPI(data?.applicationData?.tenantId, false);
  let workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: data?.applicationData?.tenantId,
    id: id,
    moduleCode: "OBPS",
    config: {
      enabled: !!data
    }
  });

  let businessService = [];

  if(data && data?.applicationData?.businessService === "BPA_LOW")
  {
    businessService = ["BPA.LOW_RISK_PERMIT_FEE"]
  }
  else if(data && data?.applicationData?.businessService === "BPA" && data?.applicationData?.riskType === "HIGH")
  {
    businessService = ["BPA.NC_APP_FEE","BPA.NC_SAN_FEE"];
  }
  else
  {
    businessService = ["BPA.NC_OC_APP_FEE","BPA.NC_OC_SAN_FEE"];
  }

  useEffect(() => {
    if(!bpaDocsLoading && !isLoading){
      let filtredBpaDocs = [];
      if (bpaDocs?.BPA?.DocTypeMapping) {
        filtredBpaDocs = bpaDocs?.BPA?.DocTypeMapping?.filter(ob => (ob.WFState == "INPROGRESS" && ob.RiskType == data?.applicationData?.riskType && ob.ServiceType == data?.applicationData?.additionalDetails?.serviceType && ob.applicationType == data?.applicationData?.additionalDetails?.applicationType))
        let documents = data?.applicationDetails?.filter((ob) => ob.title === "BPA_DOCUMENT_DETAILS_LABEL")[0]?.additionalDetails?.obpsDocuments?.[0]?.values;
        let RealignedDocument = [];
        filtredBpaDocs && filtredBpaDocs?.[0]?.docTypes && filtredBpaDocs?.[0]?.docTypes.map((ob) => {
            documents && documents.filter(x => ob.code === x.documentType.slice(0,x.documentType.lastIndexOf("."))).map((doc) => {
                RealignedDocument.push(doc);
            })
        })
        const newApplicationDetails = data?.applicationDetails.map((obj) => {
          if(obj.title === "BPA_DOCUMENT_DETAILS_LABEL")
          {
            return {...obj, additionalDetails:{obpsDocuments:[{title:"",values:RealignedDocument}]}}
          }
          return obj;
        })
        data.applicationDetails = [...newApplicationDetails];
    }
    }
  },[bpaDocs,data])


  useEffect(() => {
    if (data?.applicationData?.status == "CITIZEN_APPROVAL_INPROCESS" || data?.applicationData?.status == "INPROGRESS") setCheckBoxVisible(true);
    else setCheckBoxVisible(false);
  },[data]);

  const getTranslatedValues = (dataValue, isNotTranslated) => {
    if(dataValue) {
      return !isNotTranslated ? t(dataValue) : dataValue
    } else {
      return t("NA")
    }
  };


  async function getRecieptSearch({tenantId, payments, ...params}) {
    let response=null;
    if (payments?.fileStoreId ) {
       response = { filestoreIds: [payments?.fileStoreId] };      
    }
    else{
      const formattedStakeholderType=data?.applicationData?.additionalDetails?.typeOfArchitect
            const stakeholderType=formattedStakeholderType.charAt(0).toUpperCase()+formattedStakeholderType.slice(1).toLowerCase()
      const updatedpayments={
        ...payments,
       
            paymentDetails:[
              {
                ...payments.paymentDetails?.[0],
                additionalDetails:{
                  ...payments.paymentDetails[0].additionalDetails,
                  "propertyID":data?.applicationData?.additionalDetails?.propertyID,
                  "stakeholderType":stakeholderType,
                  "contact":data?.applicationData?.businessService==="BPA-PAP"? t("APPLICANT_CONTACT") : `${stakeholderType} Contact`,
                  "idType":data?.applicationData?.businessService==="BPA-PAP" ? t("APPLICATION_NUMBER"):`${stakeholderType} ID`,
                  "name":data?.applicationData?.businessService==="BPA-PAP" ? t("APPLICANT_NAME"):`${stakeholderType} Name`,
                },
              },
            ],  
         
      }
      response = await Digit.PaymentService.generatePdf(stateCode, { Payments: [{...updatedpayments}] }, "bpa-receipt");
    }
    const fileStore = await Digit.PaymentService.printReciept(stateCode, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response?.filestoreIds[0]], "_blank");
  }

  async function getPermitOccupancyOrderSearch({tenantId}, order, mode="download") {
    let currentDate = new Date();
    data.applicationData.additionalDetails.runDate = convertDateToEpoch(currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate());
    let requestData = {...data?.applicationData, edcrDetail:[{...data?.edcrDetails}]}
    let response = await Digit.PaymentService.generatePdf(tenantId, { Bpa: [requestData] }, order);
    const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response?.filestoreIds[0]], "_blank");
    requestData["applicationType"] = data?.applicationData?.additionalDetails?.applicationType;
    let edcrResponse = await Digit.OBPSService.edcr_report_download({BPA: {...requestData}});
    const responseStatus = parseInt(edcrResponse.status, 10);
    if (responseStatus === 201 || responseStatus === 200) {
      mode == "print"
        ? printPdf(new Blob([edcrResponse.data], { type: "application/pdf" }))
        : downloadPdf(new Blob([edcrResponse.data], { type: "application/pdf" }), `edcrReport.pdf`);
    }
  }

  async function getRevocationPDFSearch({tenantId, ...params}) {
    let requestData = {...data?.applicationData}
    let response = await Digit.PaymentService.generatePdf(tenantId, { Bpa: [requestData] }, "bpa-revocation");
    const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response?.filestoreIds[0]], "_blank");
  }

  useEffect(() => {
    const workflow = { action: selectedAction }
    switch (selectedAction) {
      case "APPROVE":
      case "SEND_TO_ARCHITECT":
      case "APPLY":
      case "SKIP_PAYMENT":
        setShowModal(true);
    }
  }, [selectedAction]);

  const closeToast = () => {
    setShowToast(null);
  };

  const downloadDiagram = (val) => {
    location.href = val;
  }

  const handleChange = () => {

  }

  const closeModal = () => {
    setSelectedAction(null);
    setShowModal(false);
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
  }

  function onActionSelect(action) {
    let path = data?.applicationData?.businessService == "BPA_OC" ? "ocbpa" : "bpa";
    if(action === "FORWARD") {
      history.replace(`/suda-ui/citizen/obps/sendbacktocitizen/ocbpa/${data?.applicationData?.tenantId}/${data?.applicationData?.applicationNo}/check`, { data: data?.applicationData, edcrDetails: data?.edcrDetails });
    }
    if (action === "PAY") {
      window.location.assign(`${window.location.origin}/suda-ui/citizen/payment/collect/${`${getBusinessServices(data?.businessService, data?.applicationStatus)}/${id}/${data?.tenantId}?tenantId=${data?.tenantId}`}`);
    }
    if (action === "SEND_TO_CITIZEN"){
      if (workflowDetails?.data?.processInstances?.length > 2) {
        window.location.replace(`/suda-ui/citizen/obps/editApplication/${path}/${data?.applicationData?.tenantId}/${data?.applicationData?.applicationNo}`)
      } else {
        getBPAFormData(data?.applicationData, mdmsData, history, t)
      }
    }
    setSelectedAction(action);
    setDisplayMenu(false);
  }

  function checkForSubmitDisable () {
    if(checkBoxVisible) return isFromSendBack ? !isFromSendBack : !isTocAccepted;
    else return false;
  }

  const submitAction = (workflow) => {
    setIsEnableLoader(true);
    mutation.mutate(
      { BPA: { ...data?.applicationData, workflow } },
      {
        onError: (error, variables) => {
          setIsEnableLoader(false);
          setShowModal(false);
          setShowToast({ key: "error", action: error?.response?.data?.Errors[0]?.message ? error?.response?.data?.Errors[0]?.message : error });
          setTimeout(closeToast, 5000);
        },
        onSuccess: (data, variables) => {
          setIsEnableLoader(false);
          history.replace(`/suda-ui/citizen/obps/response`, { data: data });
          setShowModal(false);
          setShowToast({ key: "success", action: selectedAction });
          setTimeout(closeToast, 5000);
          queryClient.invalidateQueries("BPA_DETAILS_PAGE");
          queryClient.invalidateQueries("workFlowDetails");
        },
      }
    );
  }

  if (workflowDetails?.data?.nextActions?.length > 0 && data?.applicationData?.status == "CITIZEN_APPROVAL_INPROCESS") {
    const userInfo = Digit.UserService.getUser();
    const rolearray = userInfo?.info?.roles;
    if (data?.applicationData?.status == "CITIZEN_APPROVAL_INPROCESS") {
      if (rolearray?.some(role => role?.code === "CITIZEN")) {
        workflowDetails.data.nextActions = workflowDetails?.data?.nextActions;
      } else {
        workflowDetails.data.nextActions = [];
      }
    }
     else if (data?.applicationData?.status == "INPROGRESS") {
      let isArchitect = false;
      stakeHolderDetails?.StakeholderRegistraition?.TradeTypetoRoleMapping?.map(type => {
        type?.role?.map(role => { roles.push(role); });
      });
      const uniqueRoles = roles.filter((item, i, ar) => ar.indexOf(item) === i);
      if (rolearray?.length > 1) {
        rolearray.forEach(role => {
          if (uniqueRoles.includes(role.code)) {
            isArchitect = true;
          }
        })
      }
      if (isArchitect) {
        workflowDetails.data.nextActions = workflowDetails?.data?.nextActions;
      } else {
        workflowDetails.data.nextActions = [];
      }
    }
  }


  if (workflowDetails?.data?.processInstances?.[0]?.action === "SEND_BACK_TO_CITIZEN") {
      if(isTocAccepted) setIsTocAccepted(true);
      isFromSendBack = true;
      const userInfo = Digit.UserService.getUser();
      const rolearray = userInfo?.info?.roles;
      if (rolearray?.some(role => role?.code === "CITIZEN")) {
        workflowDetails.data.nextActions = workflowDetails?.data?.nextActions;
      } else {
        workflowDetails.data.nextActions = [];
      }
  }

  if (isLoading || isEnableLoader) {
    return <Loader />
  }

  let dowloadOptions = [];

  if (data?.collectionBillDetails?.length > 0) {
    const bpaPayments = cloneDeep(data?.collectionBillDetails);
    bpaPayments.forEach(pay => {
      if (pay?.paymentDetails[0]?.businessService === "BPA.NC_OC_APP_FEE") {
        dowloadOptions.push({
          order: 1,
          label: t("BPA_APP_FEE_RECEIPT"),
          onClick: () => getRecieptSearch({ tenantId: data?.applicationData?.tenantId, payments: pay, consumerCodes: data?.applicationData?.applicationNo }),
        });
      }

      if (pay?.paymentDetails[0]?.businessService === "BPA.NC_OC_SAN_FEE") {
        dowloadOptions.push({
          order: 2,
          label: t("BPA_OC_DEV_PEN_RECEIPT"),
          onClick: () => getRecieptSearch({ tenantId: data?.applicationData?.tenantId, payments: pay, consumerCodes: data?.applicationData?.applicationNo }),
        });
      }

      if (pay?.paymentDetails[0]?.businessService === "BPA.LOW_RISK_PERMIT_FEE") {
        dowloadOptions.push({
          order: 1,
          label: t("BPA_FEE_RECEIPT"),
          onClick: () => getRecieptSearch({ tenantId: data?.applicationData?.tenantId, payments: pay, consumerCodes: data?.applicationData?.applicationNo }),
        });
      }

      if (pay?.paymentDetails[0]?.businessService === "BPA.NC_APP_FEE") {
        dowloadOptions.push({
          order: 1,
          label: t("BPA_APP_FEE_RECEIPT"),
          onClick: () => getRecieptSearch({ tenantId: data?.applicationData?.tenantId, payments: pay, consumerCodes: data?.applicationData?.applicationNo }),
        });
      }

      if (pay?.paymentDetails[0]?.businessService === "BPA.NC_SAN_FEE") {
        dowloadOptions.push({
          order: 2,
          label: t("BPA_SAN_FEE_RECEIPT"),
          onClick: () => getRecieptSearch({ tenantId: data?.applicationData?.tenantId, payments: pay, consumerCodes: data?.applicationData?.applicationNo }),
        });
      }
    })
  }


  if(data && data?.applicationData?.businessService === "BPA_LOW" && data?.collectionBillDetails?.length > 0) {
    !(data?.applicationData?.status.includes("REVOCATION")) && dowloadOptions.push({
      order: 3,
      label: t("BPA_PERMIT_ORDER"),
      onClick: () => getPermitOccupancyOrderSearch({tenantId: data?.applicationData?.tenantId},"buildingpermit-low"),
    });
    (data?.applicationData?.status.includes("REVOCATION")) && dowloadOptions.push({
      order: 3,
      label: t("BPA_REVOCATION_PDF_LABEL"),
      onClick: () => getRevocationPDFSearch({tenantId: data?.applicationData?.tenantId}),
    });
    
  } else if(data && (data?.applicationData?.businessService === "BPA"||data?.applicationData?.businessService === "BPA-PAP") && data?.collectionBillDetails?.length > 0) {
    if(data?.applicationData?.status==="APPROVED"){
    dowloadOptions.push({
      order: 3,
      label: t("BPA_PERMIT_ORDER"),
      onClick: () => getPermitOccupancyOrderSearch({tenantId: data?.applicationData?.tenantId},"buildingpermit"),
    });}
  } else {
    if(data?.applicationData?.status==="APPROVED"){
      dowloadOptions.push({
        order: 3,
        label: t("BPA_OC_CERTIFICATE"),
        onClick: () => getPermitOccupancyOrderSearch({tenantId: data?.applicationData?.tenantId},"occupancy-certificate"),
      });
    }
  }

  if(data?.comparisionReport){
    dowloadOptions.push({
      order: 4,
      label: t("BPA_COMPARISON_REPORT_LABEL"),
      onClick: () => window.open(data?.comparisionReport?.comparisonReport, "_blank"),
    });
  }

  dowloadOptions.sort(function (a, b) { return a.order - b.order; });

  if (workflowDetails?.data?.nextActions?.length > 0) {
    workflowDetails.data.nextActions = workflowDetails?.data?.nextActions?.filter(actn => actn.action !== "INITIATE");
    workflowDetails.data.nextActions = workflowDetails?.data?.nextActions?.filter(actn => actn.action !== "ADHOC");
    workflowDetails.data.nextActions = workflowDetails?.data?.nextActions?.filter(actn => actn.action !== "SKIP_PAYMENT");
  };

  if (data?.applicationDetails?.length > 0) {
    data.applicationDetails = data?.applicationDetails?.length > 0 && data?.applicationDetails?.filter(bpaData => Object.keys(bpaData).length !== 0);
  }


  const getCheckBoxLable = () => {
    return (
      <div>
        <span>{`${t("BPA_I_AGREE_THE_LABEL")} `}</span>
        <span style={{color: "#a82227", cursor: "pointer"}} onClick={() => setShowTermsModal(!showTermsModal)}>{t(`BPA_TERMS_AND_CONDITIONS_LABEL`)}</span>
      </div>
    )
  }
  const handleViewTimeline = () => {
    const timelineSection = document.getElementById("timeline");
    if (timelineSection) timelineSection.scrollIntoView({ behavior: "smooth" });
    setViewTimeline(true);
  };

  const bpaStatusConfig = {
    APPROVED:                   { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
    INPROGRESS:                 { bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
    PENDINGPAYMENT:             { bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
    CITIZEN_APPROVAL_INPROCESS: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    REJECTED:                   { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    REVOKED:                    { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    INITIATED:                  { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" },
  };
  const bpaStatus = data?.applicationData?.status?.toUpperCase();
  const statusStyle = bpaStatusConfig[bpaStatus] || { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" };

  const InfoRow = ({ label, value }) => (
    <div style={{ display: "flex", flexDirection: "column", padding: "10px 12px", borderRadius: "8px", marginBottom: "6px", background: "#fafbfc" }}>
      <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{label}</span>
      <span style={{ fontSize: "13px", color: "#1a2b49", fontWeight: "600", wordBreak: "break-word" }}>{value || t("CS_NA")}</span>
    </div>
  );

  const SectionCard = ({ title, icon, children }) => (
    <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(26,43,73,0.07)", marginBottom: "16px", overflow: "hidden", border: "1px solid #f0f2f5" }}>
      {title && (
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f5f6f8", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {icon || <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
          </div>
          <span style={{ fontSize: "14px", fontWeight: "700", color: "#1a2b49" }}>{title}</span>
        </div>
      )}
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );

  const filteredDetails = data?.applicationDetails?.filter(d => Object.keys(d).length > 0 && !d.isNotAllowed) || [];

  return (
    <Fragment>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", padding: "20px 16px 100px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>

          {/* ── Hero Card ── */}
          <div style={{ background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", borderRadius: "20px", padding: "22px 24px", marginBottom: "20px", position: "relative", overflow: "hidden", boxShadow: "0 6px 24px rgba(244,119,56,0.3)" }}>
            <div style={{ position: "absolute", right: "-30px", top: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: "40px", bottom: "-40px", width: "90px", height: "90px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", fontWeight: "600", letterSpacing: "0.6px", textTransform: "uppercase" }}>{t("BPA_APPLICATION_NUMBER_LABEL")}</div>
                  <div style={{ fontSize: "18px", color: "#fff", fontWeight: "800", marginTop: "2px", letterSpacing: "0.2px" }}>{id}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                {data?.applicationData?.status && (
                  <span style={{ padding: "5px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.4px", background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, textTransform: "uppercase", flexShrink: 0 }}>
                    {t(`WF_BPA_${data.applicationData.status}`)}
                  </span>
                )}
                <button onClick={handleViewTimeline} style={{ padding: "6px 14px", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                  {t("VIEW_TIMELINE")}
                </button>
              </div>
            </div>
            {dowloadOptions.length > 0 && (
              <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {dowloadOptions.map((opt, i) => (
                  <button key={i} onClick={opt.onClick} style={{ padding: "8px 14px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Detail Sections ── */}
          {filteredDetails.map((detail, index, arr) => {
            const simpleValues = [
              ...(detail.isCommon ? (detail.values || []).filter(v => !v.isLink) : []),
              ...(!detail.isFeeDetails ? (detail.additionalDetails?.values || []).filter(v => !v.isHeader) : []),
            ];
            const linkValues = detail.isCommon ? (detail.values || []).filter(v => v.isLink) : [];
            const headerValues = !detail.isFeeDetails ? (detail.additionalDetails?.values || []).filter(v => v.isHeader) : [];

            return (
              <div key={index}>
                <SectionCard title={!detail.isTitleVisible && detail.title ? t(detail.title) : null}>
                  {/* Sub-headers */}
                  {headerValues.map((v, i) => (
                    <div key={i} style={{ fontSize: "13px", fontWeight: "700", color: "#1a2b49", marginBottom: "8px", marginTop: i > 0 ? "12px" : "0" }}>{t(v.title)}</div>
                  ))}

                  {/* Key-value grid */}
                  {(simpleValues.length > 0 || linkValues.length > 0) && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0 16px" }}>
                      {simpleValues.map((v, i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", padding: "10px 12px", background: "#fafbfc", borderRadius: "8px", marginBottom: "6px" }}>
                          <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{t(v.title)}</span>
                          <span style={{ fontSize: "13px", color: "#1a2b49", fontWeight: "600", wordBreak: "break-word" }}>
                            {v.isUnit
                              ? (v.value ? `${getTranslatedValues(v.value, v.isNotTranslated)} ${t(v.isUnit)}` : t("CS_NA"))
                              : (getTranslatedValues(v.value, v.isNotTranslated) || t("CS_NA"))}
                          </span>
                        </div>
                      ))}
                      {linkValues.map((v, i) => (
                        <div key={`lnk${i}`} style={{ display: "flex", flexDirection: "column", padding: "10px 12px", background: "#fafbfc", borderRadius: "8px", marginBottom: "6px" }}>
                          <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{t(v.title)}</span>
                          <Link to={v.to}><span style={{ fontSize: "13px", color: "#f47738", fontWeight: "600" }}>{v.value}</span></Link>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Owner details */}
                  {detail.isOwnerDetails && detail.additionalDetails?.owners?.map((owner, oi) => (
                    <div key={oi} style={{ background: "#f8f9fb", borderRadius: "12px", padding: "14px 16px", border: "1px solid #e5e7eb", marginBottom: oi < detail.additionalDetails.owners.length - 1 ? "12px" : "0" }}>
                      {detail.additionalDetails.owners.length > 1 && (
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "#f47738", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>{t("Owner")} - {oi + 1}</div>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0 16px" }}>
                        {owner.values.map((v, vi) => (
                          <div key={vi} style={{ display: "flex", flexDirection: "column", padding: "10px 12px", background: "#fafbfc", borderRadius: "8px", marginBottom: "6px" }}>
                            <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{t(v.title)}</span>
                            <span style={{ fontSize: "13px", color: "#1a2b49", fontWeight: "600", wordBreak: "break-word" }}>{getTranslatedValues(v.value, v.isNotTranslated) || t("CS_NA")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Documents */}
                  {detail.isDocumentDetails && detail.additionalDetails?.obpsDocuments?.[0]?.values && (
                    <div style={{ marginTop: "4px" }}>
                      <DocumentsPreview documents={getOrderDocuments(detail.additionalDetails.obpsDocuments[0].values)} svgStyles={{}} isSendBackFlow={false} isHrLine={true} titleStyles={{ fontSize: "16px", fontWeight: 700, marginBottom: "10px" }} />
                    </div>
                  )}

                  {/* SubOccupancy */}
                  {detail.isSubOccupancyTable && detail.additionalDetails?.subOccupancyTableDetails && (
                    <SubOccupancyTable edcrDetails={detail.additionalDetails} applicationData={data?.applicationData} />
                  )}

                  {/* Scrutiny */}
                  {detail.isScrutinyDetails && detail.additionalDetails?.scruntinyDetails?.map((s, si) => (
                    <Fragment key={si}>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#1a2b49", marginBottom: "4px" }}>{t(s.title)}</div>
                      <LinkButton onClick={() => downloadDiagram(s.value)} label={<PDFSvg />} />
                      <p style={{ marginTop: "8px", marginBottom: "16px", fontSize: "14px", color: "#505A5F" }}>{t(s.text)}</p>
                    </Fragment>
                  ))}

                  {/* Field Inspection */}
                  {detail.isFieldInspection && data?.applicationData?.additionalDetails?.fieldinspection_pending?.length > 0 && (
                    <InspectionReport isCitizen={true} fiReport={data.applicationData.additionalDetails.fieldinspection_pending} />
                  )}

                  {/* NOC */}
                  {detail.additionalDetails?.noc?.map((nocob, ni) => (
                    <div key={ni} style={{ background: "#f8f9fb", borderRadius: "12px", padding: "14px 16px", border: "1px solid #e5e7eb", marginBottom: "12px" }}>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#1a2b49", marginBottom: "10px" }}>{t(`BPA_${detail.additionalDetails?.data?.nocType}_HEADER`)}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0 16px", marginBottom: "12px" }}>
                        {[0, 1, 2, 3, 4].filter(i => detail?.values?.[i]?.value).map(i => (
                          <div key={i} style={{ display: "flex", flexDirection: "column", padding: "10px 12px", background: "#fafbfc", borderRadius: "8px", marginBottom: "6px" }}>
                            <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{t(detail.values[i].title)}</span>
                            <span style={{ fontSize: "13px", color: "#1a2b49", fontWeight: "600" }}>{getTranslatedValues(detail.values[i].value, detail.values[i].isNotTranslated)}</span>
                          </div>
                        ))}
                      </div>
                      {nocob?.values ? (
                        <DocumentsPreview documents={getOrderDocuments(nocob.values, true)} svgStyles={{}} isSendBackFlow={false} isHrLine={true} titleStyles={{ fontSize: "16px", fontWeight: 700, marginBottom: "10px" }} />
                      ) : (
                        <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>{t("BPA_NO_DOCUMENTS_UPLOADED_LABEL")}</p>
                      )}
                    </div>
                  ))}

                  {/* Permit text */}
                  {!detail.isTitleVisible && detail.additionalDetails?.permit?.map((v, pi) => (
                    <p key={pi} style={{ margin: "0 0 8px", fontSize: "13px", color: "#505A5F" }}>{v.title}</p>
                  ))}

                  {/* Fee / Scrutiny report */}
                  {detail.additionalDetails?.inspectionReport && detail.isFeeDetails && (
                    <ScruntinyDetails scrutinyDetails={detail.additionalDetails} paymentsList={[]} />
                  )}
                </SectionCard>

                {/* Timeline after last detail */}
                {index === arr.length - 1 && (
                  <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(26,43,73,0.07)", marginBottom: "16px", overflow: "hidden", border: "1px solid #f0f2f5" }}>
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid #f5f6f8", display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#1a2b49" }}>{t("BPA_APPLICATION_TIMELINE_HEADER") || "Application Timeline"}</span>
                    </div>
                    <div style={{ padding: "16px 20px" }} id="timeline">
                      <BPAApplicationTimeline application={data?.applicationData} id={id} />
                      {!workflowDetails?.isLoading && workflowDetails?.data?.nextActions?.length > 0 && !isFromSendBack && checkBoxVisible && (
                        <CheckBox
                          styles={{ margin: "20px 0 40px", paddingTop: "10px" }}
                          checked={isTocAccepted}
                          label={getCheckBoxLable()}
                          onChange={() => { setIsTocAccepted(!isTocAccepted); isTocAccepted ? setDisplayMenu(!isTocAccepted) : ""; }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Action Buttons ── */}
          {!workflowDetails?.isLoading && workflowDetails?.data?.nextActions?.length > 0 && (
            <div style={{ position: "sticky", bottom: "20px", zIndex: 10 }}>
              {workflowDetails.data.nextActions.length > 1 && (
                <div style={{ position: "relative" }}>
                  {displayMenu && (
                    <div style={{ position: "absolute", bottom: "56px", left: 0, right: 0, background: "#fff", borderRadius: "12px", boxShadow: "0 8px 24px rgba(26,43,73,0.15)", overflow: "hidden", border: "1px solid #e5e7eb" }}>
                      {workflowDetails.data.nextActions.map((action, ai) => (
                        <button key={ai} onClick={() => onActionSelect(action.action)} style={{ width: "100%", padding: "14px 20px", background: "transparent", border: "none", borderBottom: ai < workflowDetails.data.nextActions.length - 1 ? "1px solid #f0f2f5" : "none", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#1a2b49", cursor: "pointer" }}>
                          {t(`WF_BPA_${action.action}`)}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    disabled={checkForSubmitDisable()}
                    onClick={() => setDisplayMenu(!displayMenu)}
                    style={{ width: "100%", height: "52px", background: checkForSubmitDisable() ? "#f3f4f6" : "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "14px", color: checkForSubmitDisable() ? "#9ca3af" : "#fff", fontSize: "16px", fontWeight: "700", cursor: checkForSubmitDisable() ? "not-allowed" : "pointer", boxShadow: checkForSubmitDisable() ? "none" : "0 4px 16px rgba(244,119,56,0.4)" }}
                  >
                    {t("ES_COMMON_TAKE_ACTION")}
                  </button>
                </div>
              )}
              {workflowDetails.data.nextActions.length === 1 && (
                <button
                  disabled={checkForSubmitDisable()}
                  name={workflowDetails.data.nextActions[0].action}
                  value={workflowDetails.data.nextActions[0].action}
                  onClick={e => onActionSelect(e.target.value)}
                  style={{ width: "100%", height: "52px", background: checkForSubmitDisable() ? "#f3f4f6" : "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "14px", color: checkForSubmitDisable() ? "#9ca3af" : "#fff", fontSize: "16px", fontWeight: "700", cursor: checkForSubmitDisable() ? "not-allowed" : "pointer", boxShadow: checkForSubmitDisable() ? "none" : "0 4px 16px rgba(244,119,56,0.4)" }}
                >
                  {t(`WF_BPA_${workflowDetails.data.nextActions[0].action}`)}
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {showTermsModal && (
        <ActionModal t={t} action={"TERMS_AND_CONDITIONS"} tenantId={tenantId} id={id} closeModal={closeTermsModal} submitAction={submitAction} applicationData={data?.applicationData || {}} />
      )}
      {showModal && (
        <ActionModal t={t} action={selectedAction} tenantId={tenantId} id={id} closeModal={closeModal} submitAction={submitAction} actionData={workflowDetails?.data?.timeline} />
      )}
      {showToast && (
        <Toast error={showToast.key === "error"} label={t(showToast.key === "success" ? `ES_OBPS_${showToast.action}_UPDATE_SUCCESS` : showToast.action)} onClose={closeToast} style={{ zIndex: "1000" }} />
      )}
    </Fragment>
  );
};

export default BpaApplicationDetail;