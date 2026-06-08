
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import ApplicationDetailsTemplate from "../../../../templates/ApplicationDetails";
import { newConfigMutate } from "../../config/Mutate/config";
import TransfererDetails from "../../pageComponents/Mutate/TransfererDetails";
import MutationApplicationDetails from "./MutationApplicatinDetails";
import getPTAcknowledgementData from "../../getPTAcknowledgementData";


const ApplicationDetails = () => {
  const { t } = useTranslation();
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { tenants } = storeData || {};
  const { id: propertyId } = useParams();
  const [showToast, setShowToast] = useState(null);
  const [appDetailsToShow, setAppDetailsToShow] = useState({});
  const [enableAudit, setEnableAudit] = useState(false);
  const [businessService, setBusinessService] = useState("PT.CREATE");
  sessionStorage.setItem("applicationNoinAppDetails",propertyId);
  const [viewTimeline, setViewTimeline]=useState(false);
  const { isLoading, isError, data: applicationDetails, error } = Digit.Hooks.pt.useApplicationDetail(t, tenantId, propertyId);

  const {
    isLoading: updatingApplication,
    isError: updateApplicationError,
    data: updateResponse,
    error: updateError,
    mutate,
  } = Digit.Hooks.pt.useApplicationActions(tenantId);

  let workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: applicationDetails?.tenantId || tenantId,
    id: applicationDetails?.applicationData?.acknowldgementNumber,
    moduleCode: businessService,
    role: "PT_CEMP",
  });

  const { isLoading: auditDataLoading, isError: isAuditError, data: auditData } = Digit.Hooks.pt.usePropertySearch(
    {
      tenantId,
      filters: { acknowledgementIds: propertyId, audit: true },
    },
    { enabled: enableAudit, select: (data) => data.Properties?.filter((e) => e.status === "ACTIVE") }
  );

  const showTransfererDetails = React.useCallback(() => {
    if (
      auditData &&
      Object.keys(appDetailsToShow).length &&
      applicationDetails?.applicationData?.status !== "ACTIVE" &&
      applicationDetails?.applicationData?.creationReason === "MUTATION" &&
      !appDetailsToShow?.applicationDetails.find((e) => e.title === "PT_MUTATION_TRANSFEROR_DETAILS")
    ) {
      let applicationDetails = appDetailsToShow.applicationDetails?.filter((e) => e.title === "PT_OWNERSHIP_INFO_SUB_HEADER");
      let compConfig = newConfigMutate.reduce((acc, el) => [...acc, ...el.body], []).find((e) => e.component === "TransfererDetails");
      applicationDetails.unshift({
        title: "PT_MUTATION_TRANSFEROR_DETAILS",
        belowComponent: () => <TransfererDetails userType="employee" formData={{ originalData: auditData[0] }} config={compConfig} />,
      });
      setAppDetailsToShow({ ...appDetailsToShow, applicationDetails });
    }
  },[setAppDetailsToShow,appDetailsToShow,auditData,applicationDetails,auditData,newConfigMutate]);

  const closeToast = () => {
    setShowToast(null);
  };

  useEffect(() => {
    if (applicationDetails) {
      appDetailsToShow?.applicationData?.owners.sort((item, item2) => { return item?.additionalDetails?.ownerSequence - item2?.additionalDetails?.ownerSequence })
      setAppDetailsToShow(_.cloneDeep(applicationDetails));
      if (applicationDetails?.applicationData?.status !== "ACTIVE" && applicationDetails?.applicationData?.creationReason === "MUTATION") {
        setEnableAudit(true);
      }
    }
  }, [applicationDetails]);

  useEffect(() => {
    showTransfererDetails();
    if (appDetailsToShow?.applicationData?.status === "ACTIVE" && PT_CEMP&&businessService=="PT.CREATE") {
       setBusinessService("PT.UPDATE");
      }
  }, [auditData, applicationDetails, appDetailsToShow]);

  useEffect(() => {
    if (workflowDetails?.data?.applicationBusinessService && !(workflowDetails?.data?.applicationBusinessService === "PT.CREATE" && businessService === "PT.UPDATE")) {
      setBusinessService(workflowDetails?.data?.applicationBusinessService);
    }
  }, [workflowDetails.data]);

  const PT_CEMP = Digit.UserService.hasAccess(["PT_CEMP"]) || false;

  if (appDetailsToShow?.applicationData?.status === "ACTIVE" && PT_CEMP) {
    workflowDetails = {
      ...workflowDetails,
      data: {
        ...workflowDetails?.data,
        actionState: {
          nextActions: [
            {
              action: "VIEW_DETAILS",
              redirectionUrl: {
                pathname: `/suda-ui/employee/pt/property-details/${appDetailsToShow?.applicationData?.propertyId}`,
              },
              tenantId: Digit.ULBService.getStateId(),
            },
          ],
        },
      },
    };
  }

  if (
    PT_CEMP &&
    workflowDetails?.data?.actionState?.isStateUpdatable &&
    !workflowDetails?.data?.actionState?.nextActions?.find((e) => e.action === "UPDATE")
  ) {
    if (!workflowDetails?.data?.actionState?.nextActions) workflowDetails.data.actionState.nextActions = [];
    workflowDetails?.data?.actionState?.nextActions.push({
      action: "UPDATE",
      redirectionUrl: {
        pathname: `/suda-ui/employee/pt/modify-application/${propertyId}`,
        state: { workflow: { action: "REOPEN", moduleName: "PT", businessService } },
      },
      tenantId: Digit.ULBService.getStateId(),
    });
  }

  if (!(appDetailsToShow?.applicationDetails?.[0]?.values?.[0].title === "PT_PROPERTY_APPLICATION_NO")) {
    appDetailsToShow?.applicationDetails?.unshift({
      values: [
        { title: "PT_PROPERTY_APPLICATION_NO", value: appDetailsToShow?.applicationData?.acknowldgementNumber },
        { title: "PT_SEARCHPROPERTY_TABEL_PTUID", value: appDetailsToShow?.applicationData?.propertyId || t("PT_PROPERTY_ID_PENDING_APPROVAL") },
        { title: "ES_APPLICATION_CHANNEL", value: `ES_APPLICATION_DETAILS_APPLICATION_CHANNEL_${appDetailsToShow?.applicationData?.channel}` },
      ],
    });
  }

  if (
    PT_CEMP &&
    workflowDetails?.data?.applicationBusinessService === "PT.MUTATION" &&
    workflowDetails?.data?.actionState?.nextActions?.find((act) => act.action === "PAY")
  ) {
    workflowDetails.data.actionState.nextActions = workflowDetails?.data?.actionState?.nextActions.map((act) => {
      if (act.action === "PAY") {
        return {
          action: "PAY",
          forcedName: "WF_EMPLOYEE_PT.MUTATION_PAY",
          redirectionUrl: { pathname: `/suda-ui/employee/payment/collect/PT.MUTATION/${appDetailsToShow?.applicationData?.acknowldgementNumber}` },
        };
      }
      return act;
    });
  }

  const wfDocs = workflowDetails.data?.timeline?.reduce((acc, { wfDocuments }) => {
    return wfDocuments ? [...acc, ...wfDocuments] : acc;
  }, []);
  let appdetailsDocuments = appDetailsToShow?.applicationDetails?.find((e) => e.title === "PT_OWNERSHIP_INFO_SUB_HEADER")?.additionalDetails
    ?.documents;

  if (appdetailsDocuments && wfDocs?.length && !appdetailsDocuments?.find((e) => e.title === "PT_WORKFLOW_DOCS")) {
    appDetailsToShow.applicationDetails.find((e) => e.title === "PT_OWNERSHIP_INFO_SUB_HEADER").additionalDetails.documents = [
      ...appdetailsDocuments,
      {
        title: "PT_WORKFLOW_DOCS",
        values: wfDocs?.map?.((e) => ({ ...e, title: e.documentType })),
      },
    ];
  }
  const handleDownloadPdf = async () => {
    const Property = appDetailsToShow?.applicationData ;
    const tenantInfo  = tenants.find((tenant) => tenant.code === Property.tenantId);

    const data = await getPTAcknowledgementData(Property, tenantInfo, t);
    Digit.Utils.pdf.generate(data);
  };

  const handleViewTimeline=()=>{
    setViewTimeline(true);
      const timelineSection=document.getElementById('timeline');
      if(timelineSection){
        timelineSection.scrollIntoView({behavior: 'smooth'});
      } 
  };
 if (applicationDetails?.applicationData?.creationReason === "MUTATION"){  
   return(
    <MutationApplicationDetails 
      propertyId = {propertyId}
      acknowledgementIds={appDetailsToShow?.applicationData?.acknowldgementNumber}
      workflowDetails={workflowDetails}
      mutate={mutate}
      showToast={showToast}
      setShowToast={setShowToast}
      closeToast={closeToast}
    />
   )
 } 
  if (applicationDetails?.applicationDetails[1].title == "PT_ASSESMENT_INFO_SUB_HEADER") {
    if (applicationDetails?.applicationDetails[1].values.length == 4) {
      let obj = {
        "title": "PT_ASSESMENT_ELECTRICITY",
        "value": applicationDetails?.additionalDetails?.electricity || "NA"
      }
      applicationDetails?.applicationDetails[1].values.push(obj)
    }
    if (applicationDetails?.applicationDetails[1].values.length == 5) {
      let obj = {
        "title": "PT_ASSESMENT_ELECTRICITY_UID",
        "value": applicationDetails?.additionalDetails?.uid || "NA"
      }
      applicationDetails?.applicationDetails[1].values.push(obj)
    }
  }

  const reversedOwners= Array.isArray(appDetailsToShow?.applicationData?.owners) ? appDetailsToShow?.applicationData?.owners.slice().reverse(): [];
  if (appDetailsToShow?.applicationData) {
    appDetailsToShow?.applicationDetails?.[3]?.additionalDetails?.owners.sort(() => { return appDetailsToShow?.applicationDetails?.[3]?.additionalDetails?.owners})
  }
  const statusColor = () => {
    const s = appDetailsToShow?.applicationData?.status;
    if (!s) return { bg: "#e8f5e9", color: "#2e7d32" };
    const upper = s.toUpperCase();
    if (upper.includes("ACTIVE")) return { bg: "#e8f5e9", color: "#2e7d32" };
    if (upper.includes("APPROVED")) return { bg: "#e8f5e9", color: "#2e7d32" };
    if (upper.includes("PENDING")) return { bg: "#fff8e1", color: "#e65100" };
    if (upper.includes("REJECT")) return { bg: "#fdecea", color: "#c62828" };
    return { bg: "#e3f2fd", color: "#1565c0" };
  };
  const sc = statusColor();
  const appStatus = appDetailsToShow?.applicationData?.status;
  const ackNo = appDetailsToShow?.applicationData?.acknowldgementNumber;
  const propId = appDetailsToShow?.applicationData?.propertyId;

  return (
    <div style={{ background: "#f5f6fa", minHeight: "100vh" }}>

      {/* ── Beautiful Page Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)",
        borderRadius: "0 0 20px 20px",
        padding: "28px 32px 32px",
        marginBottom: "24px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(212,79,10,0.18)",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", right: "-40px", top: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "60px", bottom: "-60px", width: "220px", height: "220px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.75)", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "4px" }}>
                {t("PT_PROPERTY_TAX") || "Property Tax"}
              </div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#fff", lineHeight: "1.2" }}>
                {t("PT_APPLICATION_TITLE") || "Application Details"}
              </h1>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={handleViewTimeline}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {t("VIEW_TIMELINE") || "View Timeline"}
            </button>
            <button
              onClick={handleDownloadPdf}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {t("PT_DOWNLOAD_APPLICATION") || "Download Application"}
            </button>
          </div>
        </div>

        {/* Info chips row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px", position: "relative" }}>
          {ackNo && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", borderRadius: "8px", padding: "6px 12px" }}>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", fontWeight: "500" }}>{t("PT_PROPERTY_APPLICATION_NO") || "Application No"}</span>
              <span style={{ fontSize: "13px", color: "#fff", fontWeight: "700" }}>{ackNo}</span>
            </div>
          )}
          {propId && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", borderRadius: "8px", padding: "6px 12px" }}>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", fontWeight: "500" }}>{t("PT_SEARCHPROPERTY_TABEL_PTUID") || "Property ID"}</span>
              <span style={{ fontSize: "13px", color: "#fff", fontWeight: "700" }}>{propId}</span>
            </div>
          )}
          {appStatus && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: sc.bg, borderRadius: "8px", padding: "6px 12px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: sc.color, display: "inline-block" }} />
              <span style={{ fontSize: "12px", color: sc.color, fontWeight: "700", letterSpacing: "0.3px" }}>{t(`ES_PT_COMMON_STATUS_${appStatus}`) || appStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "0 16px 32px" }} className="pt-app-details-body">
      <ApplicationDetailsTemplate
        applicationDetails={appDetailsToShow}
        isLoading={isLoading}
        isDataLoading={isLoading}
        applicationData={appDetailsToShow?.applicationData}
        mutate={mutate}
        id={"timeline"}
        workflowDetails={workflowDetails}
        businessService={businessService}
        moduleCode="PT"
        showToast={showToast}
        setShowToast={setShowToast}
        closeToast={closeToast}
        timelineStatusPrefix={"ES_PT_COMMON_STATUS_"}
        forcedActionPrefix={"WF_EMPLOYEE_PT.CREATE"}
        statusAttribute={"state"}
        MenuStyle={{ color: "#FFFFFF", fontSize: "18px" }}
      />
      </div>
    </div>
  );
};

export default React.memo(ApplicationDetails);
