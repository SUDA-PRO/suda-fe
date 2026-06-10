import React, { useEffect, useState } from "react";
import { fromUnixTime, format } from "date-fns";
import {
  Toast,
  StatusTable,
  TextInput,
  Row,
  SubmitBar,
  Loader,
  SearchIconSvg,
} from "@upyog/digit-ui-react-components";
import Timeline from "../components/Timeline";
import { useTranslation } from "react-i18next";
import { scrutinyDetailsData } from "../utils";

const BasicDetails = ({ formData, onSelect, config }) => {
  const [showToast, setShowToast] = useState(null);
  const [basicData, setBasicData] = useState(formData?.selectedPlot||formData?.data?.edcrDetails);
  const checkingFlow = formData?.uiFlow?.flow ? formData?.uiFlow?.flow :formData?.selectedPlot ? "PRE_APPROVE":"";
  
  const [scrutinyNumber, setScrutinyNumber] = useState(formData?.data?.scrutinyNumber || formData?.selectedPlot?.drawingNo);
  const [isDisabled, setIsDisabled] = useState(formData?.data?.scrutinyNumber || formData?.selectedPlot?.drawingNo ? true : false);
  const { t } = useTranslation();
  const stateCode = Digit.ULBService.getStateId();
  const _userInfo = Digit.UserService.getUser();
  const tenantIdForEdcr = _userInfo?.info?.permanentCity ||
    _userInfo?.info?.roles?.find(r => r.tenantId && r.tenantId !== stateCode)?.tenantId ||
    Digit.ULBService.getCurrentTenantId();
  const isMobile = window.Digit.Utils.browser.isMobile();
  const { isMdmsLoading, data: mdmsData } = Digit.Hooks.obps.useMDMS(stateCode, "BPA", ["RiskTypeComputation"]);
  const riskType = Digit.Utils.obps.calculateRiskType(
    mdmsData?.BPA?.RiskTypeComputation,
    basicData?.planDetail?.plot?.area,
    basicData?.planDetail?.blocks
  ) || "LOW";
  let user = Digit.SessionStorage.get("User")?.info?.name;
  

  const handleKeyPress = async (event) => {
    if (event.key === "Enter") {
      if (!scrutinyNumber?.edcrNumber) return;
      const details = await scrutinyDetailsData(scrutinyNumber?.edcrNumber, tenantIdForEdcr);
      if (details?.type == "ERROR") {
        setShowToast({ message: details?.message });
        setBasicData(null);
      }
      if (details?.edcrNumber) {
        setBasicData(details);
        setShowToast(null);
      }
    }
  };

  const closeToast = () => {
    setShowToast(null);
  };

  const handleSearch = async (event) => {
    const details = await scrutinyDetailsData(scrutinyNumber?.edcrNumber, tenantIdForEdcr);
    if (details?.type == "ERROR") {
      setShowToast({ message: details?.message });
      setBasicData(null);
    }
    if (details?.edcrNumber) {
      setBasicData(details);
      setShowToast(null);
    }
  };

  const handleSubmit = (event) => {
    onSelect(config?.key, {
      scrutinyNumber,
      applicantName: basicData?.planDetail?.planInformation?.applicantName || user,
      occupancyType: basicData?.planDetail?.planInformation?.occupancy || basicData?.drawingDetail?.occupancy,
      applicationType: basicData?.drawingDetail?.applicationType||basicData?.appliactionType,
      serviceType: basicData?.applicationSubType || basicData?.drawingDetail?.serviceType,
      applicationDate: basicData?.applicationDate||format(new Date(), "dd/MM/yyyy"),
      riskType: Digit.Utils.obps.calculateRiskType(
        mdmsData?.BPA?.RiskTypeComputation,
        basicData?.planDetail?.plot?.area,
        basicData?.planDetail?.blocks
      ) || "LOW",
      edcrDetails: basicData,
    });
  };

  let disableVlaue = sessionStorage.getItem("isEDCRDisable");
  disableVlaue = disableVlaue?JSON.parse(disableVlaue):true;

  const getDetails = async () => {
    const details = await scrutinyDetailsData(scrutinyNumber?.edcrNumber||scrutinyNumber, tenantIdForEdcr);
    if (details?.type == "ERROR") {
      setShowToast({ message: details?.message });
      setBasicData(null);
    }
    if (details?.edcrNumber) {
      setBasicData(details||formData?.selectedPlot);
      setShowToast(null);
    }
  };

  if (disableVlaue) {
    let edcrApi = sessionStorage.getItem("isEDCRAPIType");
    edcrApi = edcrApi ? JSON.parse(edcrApi) : false;
    if (!edcrApi || !basicData) {
      sessionStorage.setItem("isEDCRAPIType", JSON.stringify(true));
      getDetails();
    }
  }

  const cardStyle = { background: "#ffffff", borderRadius: "10px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: "24px 28px", marginBottom: "24px", border: "1px solid #e8ecf0" };
  const sectionTitleStyle = { fontSize: "15px", fontWeight: "700", color: "#1a2b49", marginBottom: "20px", paddingBottom: "10px", borderBottom: "2px solid #f47738", letterSpacing: "0.3px" };
  const labelStyle = { display: "block", fontWeight: "600", fontSize: "13px", color: "#3d4f6b", marginBottom: "6px", letterSpacing: "0.2px" };
  const rowLabelStyle = { fontWeight: "600", fontSize: "13px", color: "#3d4f6b", minWidth: "180px" };
  const rowValueStyle = { fontSize: "13px", color: "#1a2b49", fontWeight: "500" };

  return (
    <div>
      {showToast && <Toast error={true} label={t(`${showToast?.message}`)} onClose={closeToast} isDleteBtn={true} />}
      <Timeline currentStep={checkingFlow==="PRE_APPROVE" ? 2 : 1} flow={checkingFlow} />

      {/* Hero Banner */}
      <div style={{ background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)", borderRadius: "12px", padding: "28px 36px", marginBottom: "24px", color: "#fff", display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>
            {t("BPA_BUILDING_PERMIT") || "Building Permit"}
          </div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{t("BPA_BASIC_DETAILS_TITLE") || "Basic Details"}</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>
            {t("BPA_BASIC_DETAILS_SUBTEXT") || "Enter your scrutiny number to fetch application details"}
          </p>
        </div>
        <div style={{ marginLeft: "auto", flexShrink: 0, background: "rgba(255,255,255,0.2)", borderRadius: "20px", padding: "6px 16px", fontSize: "12px", fontWeight: "700", color: "#fff", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>Step 1 of 3</div>
      </div>

      {/* Search Card */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>{t("BPA_SCRUTINY_SEARCH_HEADER") || "Find Application"}</div>
        <label style={labelStyle}>
          {scrutinyNumber?.edcrNumber && !scrutinyNumber?.edcrNumber.includes("PAP") ? t("OBPS_SEARCH_EDCR_NUMBER") : t("DRAWING_NUMBER")}
        </label>
        <TextInput
          className="searchInput"
          onKeyPress={handleKeyPress}
          onChange={event => setScrutinyNumber({ edcrNumber: event.target.value || formData?.selectedPlot?.drawingNo })}
          value={scrutinyNumber?.edcrNumber || scrutinyNumber}
          signature={true}
          signatureImg={!disableVlaue && !formData?.selectedPlot && <SearchIconSvg className="signature-img" onClick={!disableVlaue && scrutinyNumber?.edcrNumber ? () => handleSearch() : null} />}
          disable={disableVlaue}
          style={{ marginBottom: "10px" }}
        />
      </div>

      {/* Details Card */}
      {basicData && (
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>{t("BPA_BASIC_DETAILS_TITLE") || "Basic Details"}</div>
          <StatusTable>
            <Row className="border-none" label={t("BPA_BASIC_DETAILS_APP_DATE_LABEL")} text={basicData?.applicationDate ? format(new Date(basicData?.applicationDate), "dd/MM/yyyy") : format(new Date(), "dd/MM/yyyy")} />
            <Row className="border-none" label={t("BPA_BASIC_DETAILS_APPLICATION_TYPE_LABEL")} text={t(basicData?.drawingDetail?.applicationType || `WF_BPA_${basicData?.appliactionType}`)} />
            <Row className="border-none" label={t("BPA_BASIC_DETAILS_SERVICE_TYPE_LABEL")} text={t(basicData?.applicationSubType || basicData?.drawingDetail?.serviceType)} />
            <Row className="border-none" label={t("BPA_BASIC_DETAILS_OCCUPANCY_LABEL")} text={basicData?.planDetail?.planInformation?.occupancy || basicData?.drawingDetail?.occupancy} />
            <Row className="border-none" label={t("BPA_BASIC_DETAILS_RISK_TYPE_LABEL")} text={t(`WF_BPA_${riskType}` || "Low")} />
            <Row className="border-none" label={t("BPA_BASIC_DETAILS_APPLICATION_NAME_LABEL")} text={basicData?.planDetail?.planInformation?.applicantName || user} />
          </StatusTable>
          {riskType ? <SubmitBar label={t("CS_COMMON_NEXT")} onSubmit={handleSubmit} disabled={!scrutinyNumber} /> : <Loader />}
        </div>
      )}
    </div>
  );
};

export default BasicDetails;
