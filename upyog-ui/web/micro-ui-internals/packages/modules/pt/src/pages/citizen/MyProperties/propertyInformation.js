import {
  Card,
  CardSubHeader,
  EditIcon,
  Header,
  LinkButton,
  Loader,
  PopUp,
  Row,
  StatusTable,
  SubmitBar,
  LinkLabel
} from "@upyog/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory, useParams } from "react-router-dom";
import PropertyDocument from "../../../pageComponents/PropertyDocument";
import { getCityLocale, getPropertyTypeLocale, stringReplaceAll } from "../../../utils";
import ActionModal from "../../../../../templates/ApplicationDetails/Modal/index"
import ArrearSummary from "../../../../../common/src/payments/citizen/bills/routes/bill-details/arrear-summary";
const setBillData = async (tenantId, propertyIds, updatefetchBillData, updateCanFetchBillData) => {
  const assessmentData = await Digit.PTService.assessmentSearch({ tenantId, filters: { propertyIds } });
  let billData = {};
  if (assessmentData?.Assessments?.length > 0) {
    billData = await Digit.PaymentService.fetchBill(tenantId, {
      businessService: "PT",
      consumerCode: propertyIds,
    });
  }
  updatefetchBillData(billData);
  updateCanFetchBillData({
    loading: false,
    loaded: true,
    canLoad: true,
  });
};

const getBillAmount = (fetchBillData = null) => {
  if (fetchBillData == null) return "CS_NA";
  return fetchBillData ? (fetchBillData?.Bill && fetchBillData.Bill[0] ? fetchBillData.Bill[0]?.totalAmount : "0") : "0";
};

const PropertyInformation = () => {
  const { t } = useTranslation();
  const { propertyIds } = useParams();
const [showModal,setshowModal] = useState(false)
  var isMobile = window.Digit.Utils.browser.isMobile();
  const [enableAudit, setEnableAudit] = useState(false);
const moduleCode="PT"
const history = useHistory();
const selectedAction =    {
  action: "ASSESS_PROPERTY",
  forcedName: "PT_ASSESS",
  showFinancialYearsModal: true,
  customFunctionToExecute: (data) => {
    //const history = useHistory();
    delete data.customFunctionToExecute;
    history.replace({ pathname: `/suda-ui/citizen/pt/assessment-details/${property.propertyId}`, state: { ...data } });
  },
  tenantId: Digit.ULBService.getStateId(),
}
const { id: applicationNumber } = useParams();
const [isEnableLoader, setIsEnableLoader] = useState(false);
const [isWarningPop, setWarningPopUp] = useState(false);
const businessService="PT"
const state = Digit.ULBService.getStateId();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data: UpdateNumberConfig } = Digit.Hooks.useCommonMDMSV2(Digit.ULBService.getStateId(),"PropertyTax",["UpdateNumber"],{
    select: (data) => {
      return data?.PropertyTax?.UpdateNumber?.[0];
    },
    retry:false,
    enable:false
  });

  const { isLoading, isError, error, data } = Digit.Hooks.pt.usePropertySearch({ filters: { propertyIds, tenantId } }, { filters: { propertyIds, tenantId } });

  const { isLoading: auditDataLoading, isError: isAuditError, data: auditData } = Digit.Hooks.pt.usePropertySearch(
    {
      tenantId,
      filters: { propertyIds, audit: true },
    },
    {
      enabled: enableAudit,
      select: (d) =>
        d.Properties.filter((e) => e.status === "ACTIVE")?.sort((a, b) => b.auditDetails.lastModifiedTime - a.auditDetails.lastModifiedTime),
    }
  );

  const [popup, showPopup] = useState(false);
  const [billData, updateCanFetchBillData] = useState({
    loading: false,
    loaded: false,
    canLoad: false,
  });

  const [fetchBillData, updatefetchBillData] = useState({});

  const [property, setProperty] = useState(() => data?.Properties[0] || " ");
  const mutation = Digit.Hooks.pt.usePropertyAPI(property?.tenantId, false);

  let specialCategoryDoc = [];
  property?.documents?.filter(ob => ob.documentType.includes("SPECIALCATEGORYPROOF"))?.map((doc) => {
      specialCategoryDoc.push(doc);
  })
  
  useEffect(() => {
    if (data) {
      setProperty(data?.Properties[0]);
      if (data?.Properties[0]?.status !== "ACTIVE") setEnableAudit(true);
    }
  }, [data]);

  useEffect(() => {
    if (auditData?.[0]) {
      const property = auditData?.[0] || {};
      property.owners = property?.owners?.filter((owner) => owner.status == "ACTIVE");
      setProperty(property);
    }
  }, [enableAudit, auditData]);
const handleClick=()=>{

  setshowModal(true)
}
  sessionStorage.setItem("pt-property", JSON.stringify(property));
  let docs = [];
  docs = property?.documents;
  let units = [];
  let owners = [];
  owners = property?.owners;
  units = property?.units;
  units &&
    units.sort((x, y) => {
      let a = x.floorNo,
        b = y.floorNo;
      if (x.floorNo < 0) {
        a = x.floorNo * -20;
      }
      if (y.floorNo < 0) {
        b = y.floorNo * -20;
      }
      if (a > b) {
        return 1;
      } else {
        return -1;
      }
    });

  if (isLoading) {
    return <Loader />;
  }

  if (property?.status == "ACTIVE" && !billData.loading && !billData.loaded && !billData.canLoad) {
    updateCanFetchBillData({
      loading: false,
      loaded: false,
      canLoad: true,
    });
  }
  if (billData?.canLoad && !billData.loading && !billData.loaded) {
    updateCanFetchBillData({
      loading: true,
      loaded: false,
      canLoad: true,
    });
    setBillData(property?.tenantId || tenantId, propertyIds, updatefetchBillData, updateCanFetchBillData);
  }

  let flrno,
    i = 0;
  flrno = units && units[0]?.floorNo;
  const ActionButton = ({ jumpTo, style }) => {
    const { t } = useTranslation();
    const history = useHistory();
    function routeTo() {
      history.push(jumpTo);
    }
    return <LinkButton style={style} label={t("PT_OWNER_HISTORY")} className="check-page-link-button" onClick={routeTo} />;
  };
  const UpdatePropertyNumberComponent = Digit?.ComponentRegistryService?.getComponent("UpdateNumber");
 
  const submitAction = async (data, nocData = false, isOBPS = {}) => {

      setIsEnableLoader(true);
      if (typeof data?.customFunctionToExecute === "function") {
        console.log("customFunctionToExecute")
       
        data?.customFunctionToExecute({ ...data });
       
      }
      if (nocData !== false && nocMutation) {
        const nocPrmomises = nocData?.map((noc) => {
          return nocMutation?.mutateAsync(noc);
        });
        try {
          setIsEnableLoader(true);
          const values = await Promise.all(nocPrmomises);
          values &&
            values.map((ob) => {
              Digit.SessionStorage.del(ob?.Noc?.[0]?.nocType);
            });
        } catch (err) {
          setIsEnableLoader(false);
          let errorValue = err?.response?.data?.Errors?.[0]?.code
            ? t(err?.response?.data?.Errors?.[0]?.code)
            : err?.response?.data?.Errors?.[0]?.message || err;
          closeModal();
          setShowToast({ key: "error", error: { message: errorValue } });
          setTimeout(closeToast, 5000);
          return;
        }
      }
      // if (mutate) {
      //   setIsEnableLoader(true);
      //   mutate(data, {
      //     onError: (error, variables) => {
      //       setIsEnableLoader(false);
      //       setShowToast({ key: "error", error });
      //       setTimeout(closeToast, 5000);
      //     },
      //     onSuccess: (data, variables) => {
      //       sessionStorage.removeItem("WS_SESSION_APPLICATION_DETAILS");
      //       setIsEnableLoader(false);
      //       if (isOBPS?.bpa) {
      //         data.selectedAction = selectedAction;
      //         history.replace(`/suda-ui/employee/obps/response`, { data: data });
      //       }
      //       if (isOBPS?.isStakeholder) {
      //         data.selectedAction = selectedAction;
      //         history.push(`/suda-ui/employee/obps/stakeholder-response`, { data: data });
      //       }
      //       if (isOBPS?.isNoc) {
      //         history.push(`/suda-ui/employee/noc/response`, { data: data });
      //       }
      //       if (data?.Amendments?.length > 0 ){
      //         //RAIN-6981 instead just show a toast here with appropriate message
      //       //show toast here and return 
      //         //history.push("/suda-ui/employee/ws/response-bill-amend", { status: true, state: data?.Amendments?.[0] })
              
      //         if(variables?.AmendmentUpdate?.workflow?.action.includes("SEND_BACK")){
      //           setShowToast({ key: "success", label: t("ES_MODIFYSWCONNECTION_SEND_BACK_UPDATE_SUCCESS")})
      //         } else if (variables?.AmendmentUpdate?.workflow?.action.includes("RE-SUBMIT")){
      //           setShowToast({ key: "success", label: t("ES_MODIFYSWCONNECTION_RE_SUBMIT_UPDATE_SUCCESS") })
      //         } else if (variables?.AmendmentUpdate?.workflow?.action.includes("APPROVE")){
      //           setShowToast({ key: "success", label: t("ES_MODIFYSWCONNECTION_APPROVE_UPDATE_SUCCESS") })
      //         }
      //         else if (variables?.AmendmentUpdate?.workflow?.action.includes("REJECT")){
      //           setShowToast({ key: "success", label: t("ES_MODIFYWSCONNECTION_REJECT_UPDATE_SUCCESS") })
      //         }            
      //         return
      //       }
      //       setShowToast({ key: "success", action: selectedAction });
      //       clearDataDetails && setTimeout(clearDataDetails, 3000);
      //       setTimeout(closeToast, 5000);
      //       queryClient.clear();
      //       queryClient.refetchQueries("APPLICATION_SEARCH");
      //       //push false status when reject
            
      //     },
      //   });
      // }
  
      closeModal();
 
  };
  if (isLoading || isEnableLoader) {
    return <Loader />;
  }
  const closeModal = () => {
    console.log("closeModal")
    setshowModal(false)
  };

  const closeWarningPopup = () => {
    setWarningPopUp(false);
  };
  const handleClickOnPtPgr=()=>{
  sessionStorage.setItem("type","PT" );
  sessionStorage.setItem("pincode", data.Properties[0].address.pincode);
  sessionStorage.setItem("tenantId", data.Properties[0].address.tenantId);
  sessionStorage.setItem("localityCode", data.Properties[0].address.locality.code);
  sessionStorage.setItem("landmark", data.Properties[0].address.landmark); 
  sessionStorage.setItem("propertyid",data.Properties[0].propertyId)  ;
  history.push(`/suda-ui/citizen/pgr/create-complaint/complaint-type?propertyId=${property.propertyId}`);
  }
  // Pre-group units by floor for clean rendering
  const floorGroups = [];
  (units || []).forEach(unit => {
    const last = floorGroups[floorGroups.length - 1];
    if (!last || last.floorNo !== unit.floorNo) {
      floorGroups.push({ floorNo: unit.floorNo, units: [unit] });
    } else {
      last.units.push(unit);
    }
  });

  const pageStatusConfig = {
    ACTIVE:             { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0", label: "PT_COMMON_ACTIVE" },
    INACTIVE:           { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db", label: "PT_COMMON_INACTIVE" },
    INWORKFLOW:         { bg: "#fffbeb", color: "#d97706", border: "#fcd34d", label: "PT_COMMON_INWORKFLOW" },
    MUTATIONINWORKFLOW: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", label: "PT_COMMON_MUTATIONINWORKFLOW" },
  };
  const st = property?.status?.toUpperCase();
  const pageStatusStyle = pageStatusConfig[st] || { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db", label: `PT_COMMON_${st}` };
  const totalDue = getBillAmount(fetchBillData);
  const sortedOwners = Array.isArray(owners)
    ? [...owners].sort((a, b) => (a?.additionalDetails?.ownerSequence || 0) - (b?.additionalDetails?.ownerSequence || 0))
    : [];

  const SectionCard = ({ title, icon, children }) => (
    <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(26,43,73,0.07)", marginBottom: "16px", overflow: "hidden", border: "1px solid #f0f2f5" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #f5f6f8", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
        <span style={{ fontSize: "14px", fontWeight: "700", color: "#1a2b49" }}>{title}</span>
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div style={{ display: "flex", flexDirection: "column", padding: "10px 12px", borderBottom: "1px solid #f0f2f5", background: "#fafbfc", borderRadius: "8px", marginBottom: "6px" }}>
      <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{label}</span>
      <span style={{ fontSize: "13px", color: "#1a2b49", fontWeight: "600", wordBreak: "break-word" }}>{value || t("CS_NA")}</span>
    </div>
  );

  return (
    <React.Fragment>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", padding: "20px 24px 60px" }}>
        <div style={{ width: "100%" }}>

          {/* ── Hero Card ── */}
          <div style={{ background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", borderRadius: "20px", padding: "22px 24px", marginBottom: "20px", position: "relative", overflow: "hidden", boxShadow: "0 6px 24px rgba(244,119,56,0.3)" }}>
            <div style={{ position: "absolute", right: "-30px", top: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: "40px", bottom: "-40px", width: "90px", height: "90px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", fontWeight: "600", letterSpacing: "0.6px", textTransform: "uppercase" }}>{t("PT_PROPERTY_PTUID")}</div>
                  <div style={{ fontSize: "18px", color: "#fff", fontWeight: "800", marginTop: "2px", letterSpacing: "0.2px" }}>{property?.propertyId || t("CS_NA")}</div>
                </div>
              </div>
              <span style={{ padding: "5px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.4px", background: pageStatusStyle.bg, color: pageStatusStyle.color, border: `1px solid ${pageStatusStyle.border}`, textTransform: "uppercase", flexShrink: 0 }}>
                {t(pageStatusStyle.label)}
              </span>
            </div>
            {/* Due amount + View Payment */}
            <div style={{ marginTop: "18px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.15)", borderRadius: "12px", padding: "12px 16px", position: "relative", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" }}>{t("CS_COMMON_TOTAL_AMOUNT_DUE")}</div>
                <div style={{ fontSize: "22px", color: "#fff", fontWeight: "800", marginTop: "3px" }}>
                  {totalDue !== "CS_NA" ? `₹ ${Number(totalDue || 0).toLocaleString("en-IN")}` : t("CS_NA")}
                </div>
              </div>
              <button
                onClick={() => history.push({ pathname: `/suda-ui/citizen/pt/payment-details/${property?.propertyId}` })}
                style={{ padding: "10px 18px", background: "#fff", border: "none", borderRadius: "10px", color: "#f47738", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                {t("PT_VIEW_PAYMENT")}
              </button>
            </div>
          </div>

          {/* ── Arrear Summary ── */}
          {fetchBillData?.Bill?.[0] && (
            <SectionCard title={t("PT_BILL_DETAILS") || "Bill Details"} icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            }>
              <ArrearSummary bill={fetchBillData.Bill?.[0]} />
            </SectionCard>
          )}

          {/* ── Address ── */}
          <SectionCard title={t("PT_PROPERTY_ADDRESS_SUB_HEADER")} icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          }>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0 16px" }}>
              <InfoRow label={t("PT_PROPERTY_ADDRESS_PINCODE")} value={property?.address?.pincode} />
              <InfoRow label={t("PT_COMMON_CITY")} value={t(getCityLocale(property?.tenantId))} />
              <InfoRow label={t("PT_COMMON_LOCALITY_OR_MOHALLA")} value={t(property?.address?.locality?.name)} />
              <InfoRow label={t("PT_PROPERTY_ADDRESS_STREET_NAME")} value={property?.address?.street} />
              <InfoRow label={t("PT_PROPERTY_ADDR_DOOR_HOUSE_NO")} value={property?.address?.doorNo} />
            </div>
          </SectionCard>

          {/* ── Assessment Details ── */}
          <SectionCard title={t("PT_PROPERTY_ASSESSMENT_DETAILS_HEADER")} icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          }>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0 16px" }}>
              <InfoRow label={t("PT_COMMON_PROPERTY_TYPE")} value={t(getPropertyTypeLocale(property?.propertyType))} />
              <InfoRow label={t("PT_ASSESMENT1_PLOT_SIZE")} value={property?.landArea ? `${property.landArea} sq.ft` : null} />
              <InfoRow label={t("PT_ASSESMENT_INFO_NO_OF_FLOOR")} value={property?.noOfFloors != null ? String(property.noOfFloors) : null} />
              <InfoRow label={t("PT_ASSESSMENT1_ELECTRICITY")} value={property?.additionalDetails?.electricity} />
              <InfoRow label={t("PT_ASSESSMENT1_UID")} value={property?.additionalDetails?.uid} />
            </div>
          </SectionCard>

          {/* ── Units & Floors ── */}
          {floorGroups.length > 0 && (
            <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(26,43,73,0.07)", marginBottom: "16px", overflow: "hidden", border: "1px solid #f0f2f5" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f5f6f8", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/>
                  </svg>
                </div>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#1a2b49" }}>{t("PT_PROPERTY_UNITS_HEADER") || "Units & Floors"}</span>
              </div>
              <div style={{ padding: "16px 20px" }}>
                {floorGroups.map((group, gi) => (
                  <div key={gi} style={{ marginBottom: gi < floorGroups.length - 1 ? "20px" : "0" }}>
                    {/* Floor divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ height: "1px", flex: 1, background: "#f0f2f5" }} />
                      <span style={{ padding: "3px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", color: "#fff" }}>
                        {t(`PROPERTYTAX_FLOOR_${group.floorNo}`)}
                      </span>
                      <div style={{ height: "1px", flex: 1, background: "#f0f2f5" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {group.units.map((unit, ui) => (
                        <div key={ui} style={{ background: "#f8f9fb", borderRadius: "12px", padding: "14px 16px", border: "1px solid #e5e7eb" }}>
                          <div style={{ fontSize: "11px", fontWeight: "700", color: "#f47738", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {t("ES_APPLICATION_DETAILS_UNIT")} {ui + 1}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0 12px" }}>
                            <InfoRow label={t("PT_ASSESSMENT_UNIT_USAGE_TYPE")} value={t((property.usageCategory !== "RESIDENTIAL" ? "COMMON_PROPUSGTYPE_NONRESIDENTIAL_" : "COMMON_PROPUSGTYPE_") + (property?.usageCategory?.split(".")[1] ? property?.usageCategory?.split(".")[1] : property.usageCategory))} />
                            <InfoRow label={t("PT_OCCUPANY_TYPE_LABEL")} value={t("PROPERTYTAX_OCCUPANCYTYPE_" + unit?.occupancyType)} />
                            <InfoRow label={t("PT_BUILTUP_AREA_LABEL")} value={unit?.constructionDetail?.builtUpArea ? `${unit.constructionDetail.builtUpArea} sq.ft` : null} />
                            {unit.occupancyType === "RENTED" && (
                              <InfoRow label={t("PT_FORM2_TOTAL_ANNUAL_RENT")} value={unit?.arv ? `₹${unit.arv}` : null} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Owners ── */}
          {sortedOwners.length > 0 && (
            <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(26,43,73,0.07)", marginBottom: "16px", overflow: "hidden", border: "1px solid #f0f2f5" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f5f6f8", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#1a2b49" }}>{t("PT_COMMON_PROPERTY_OWNERSHIP_DETAILS_HEADER")}</span>
              </div>
              <div style={{ padding: "16px 20px" }}>
                {sortedOwners.map((owner, index) => (
                  <div key={index} style={{ background: "#f8f9fb", borderRadius: "12px", padding: "14px 16px", border: "1px solid #e5e7eb", marginBottom: index < sortedOwners.length - 1 ? "12px" : "0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#f47738", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {sortedOwners.length > 1 ? `${t("PT_OWNER_SUB_HEADER")} ${index + 1}` : t("PT_OWNER_SUB_HEADER")}
                      </span>
                      <button
                        onClick={() => history.push(`/suda-ui/citizen/pt/property/owner-history/${property.tenantId}/${property.propertyId}`)}
                        style={{ background: "transparent", border: "1px solid #f47738", borderRadius: "8px", padding: "3px 10px", color: "#f47738", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                      >{t("PT_OWNER_HISTORY")}</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0 16px" }}>
                      {property?.institution?.name && <InfoRow label={t("PT_INSTITUTION_NAME")} value={property.institution.name} />}
                      {property?.institution?.type && <InfoRow label={t("PT_INSTITUTION_TYPE")} value={t(`COMMON_MASTERS_OWNERSHIPCATEGORY_${property.institution.type}`)} />}
                      <InfoRow label={t("PT_COMMON_APPLICANT_NAME_LABEL")} value={owner?.name} />
                      <InfoRow label={t("PT_COMMON_GENDER_LABEL")} value={owner?.gender ? owner.gender.charAt(0).toUpperCase() + owner.gender.slice(1).toLowerCase() : null} />
                      {property?.institution && <InfoRow label={t("PT_LANDLINE_NUMBER_FLOATING_LABEL")} value={owner?.altContactNumber} />}
                      {/* Mobile with edit icon */}
                      <div style={{ display: "flex", flexDirection: "column", padding: "10px 12px", background: "#fafbfc", borderRadius: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{t("PT_FORM3_MOBILE_NUMBER")}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "13px", color: "#1a2b49", fontWeight: "600" }}>{owner?.mobileNumber || t("CS_NA")}</span>
                          {property?.status === "ACTIVE" && owner?.mobileNumber && Digit.UserService.getUser()?.info?.mobileNumber && owner.mobileNumber === Digit.UserService.getUser()?.info?.mobileNumber && (
                            <div onClick={() => showPopup({ name: owner?.name, mobileNumber: owner?.mobileNumber, ownerIndex: index })} style={{ cursor: "pointer", display: "flex" }}>
                              <EditIcon />
                            </div>
                          )}
                        </div>
                      </div>
                      {property?.institution?.designation && <InfoRow label={t("Designation")} value={property.institution.designation} />}
                      <InfoRow label={t("PT_FORM3_GUARDIAN_NAME")} value={owner?.fatherOrHusbandName} />
                      <InfoRow label={t("PT_FORM3_OWNERSHIP_TYPE")} value={property?.ownershipCategory ? t(`PT_OWNERSHIP_${property.ownershipCategory}`) : null} />
                      <InfoRow label={t("PT_FORM3_RELATIONSHIP")} value={owner?.relationship} />
                      {specialCategoryDoc?.length > 0 && <InfoRow label={t("PT_SPL_CAT_DOC_TYPE")} value={t(stringReplaceAll(specialCategoryDoc[index]?.documentType, ".", "_"))} />}
                      {specialCategoryDoc?.length > 0 && <InfoRow label={t("PT_SPL_CAT_DOC_ID")} value={String(specialCategoryDoc[index]?.id || "")} />}
                      <InfoRow label={t("PT_MUTATION_AUTHORISED_EMAIL")} value={owner?.emailId} />
                      <InfoRow label={t("PT_OWNERSHIP_INFO_CORR_ADDR")} value={t(owner?.permanentAddress)} />
                      {specialCategoryDoc?.length === 0 && <InfoRow label={t("PT_SPL_CAT")} value={owner?.ownerType} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Documents ── */}
          <SectionCard title={t("PT_COMMON_DOCS")} icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          }>
            {Array.isArray(docs) && docs.length > 0 ? (
              <PropertyDocument property={property} />
            ) : (
              <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>{t("PT_NO_DOCUMENTS_MSG")}</p>
            )}
          </SectionCard>

          {/* ── Action Buttons ── */}
          {property?.status === "ACTIVE" && !enableAudit && (
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "4px" }}>
              <Link to={{ pathname: `/suda-ui/citizen/pt/property/edit-application/action=UPDATE/${property.propertyId}` }} style={{ flex: 1, minWidth: "140px", textDecoration: "none" }}>
                <button style={{ width: "100%", height: "48px", background: "#fff", border: "2px solid #1a2b49", borderRadius: "12px", color: "#1a2b49", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background 0.15s, color 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#1a2b49"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#1a2b49"; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  {t("PT_UPDATE_PROPERTY_BUTTON")}
                </button>
              </Link>
              <button
                onClick={handleClick}
                style={{ flex: 1, minWidth: "140px", height: "48px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 3px 12px rgba(244,119,56,0.35)", transition: "transform 0.15s, box-shadow 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(244,119,56,0.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(244,119,56,0.35)"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                {t("PT_SELF_ASSES_PROPERTY")}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── Modals ── */}
      {popup && (
        <PopUp className="updatenumber-warper-citizen">
          <UpdatePropertyNumberComponent
            showPopup={showPopup}
            name={popup?.name}
            UpdateNumberConfig={UpdateNumberConfig}
            mobileNumber={popup?.mobileNumber}
            t={t}
            onValidation={(data, showToast) => {
              let newProp = { ...property };
              newProp.owners[popup?.ownerIndex].mobileNumber = data.mobileNumber;
              newProp.creationReason = "UPDATE";
              newProp.workflow = null;
              mutation.mutate(
                { Property: newProp },
                {
                  onError: () => {},
                  onSuccess: async (successRes) => {
                    showToast();
                    setTimeout(() => { window.location.reload(); }, 3000);
                  },
                }
              );
            }}
          />
        </PopUp>
      )}
      {showModal && (
        <ActionModal
          t={t}
          action={selectedAction}
          tenantId={tenantId}
          state={state}
          id={property.propertyId}
          applicationDetails={property}
          applicationData={property}
          closeModal={closeModal}
          submitAction={submitAction}
          businessService={businessService}
          moduleCode={moduleCode}
        />
      )}
    </React.Fragment>
  );
};

export default PropertyInformation;
