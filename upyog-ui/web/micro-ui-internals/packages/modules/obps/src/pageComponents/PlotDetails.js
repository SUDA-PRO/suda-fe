import { FormStep, TextInput, TextArea, StatusTable, Row, SubmitBar, Loader } from "@upyog/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Timeline from "../components/Timeline";

const PlotDetails = ({ formData, onSelect, config }) => {
  const { t } = useTranslation();
  const [holdingNumber, setHoldingNumber] = useState(formData?.holdingNumber||formData?.additionalDetails?.holdingNo||"");
  const [boundaryWallLength, setBoundaryWallLength] = useState("");
  const [registrationDetails, setRegistrationDetails] = useState(formData?.registrationDetails||formData?.additionalDetails?.registrationDetails||"");
  const [plotNo, setPlotNo] = useState(formData?.plotNo||formData?.additionalDetails?.plotNo||"");
  const [khataNo, setKhataNo] = useState(formData?.khataNo||formData?.additionalDetails?.khataNo||"");
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const checkingFlow = formData?.uiFlow?.flow ? formData?.uiFlow?.flow :formData?.selectedPlot||formData?.businessService==="BPA-PAP" ? "PRE_APPROVE":"";
  const state = Digit.ULBService.getStateId();
  const { data, isLoading } = Digit.Hooks.obps.useScrutinyDetails(state, formData?.data?.scrutinyNumber, {
    enabled:formData?.data?.scrutinyNumber.length!==8?true:false
  })
  
  const handleSubmit = (data) => {
    formData.plotNo=plotNo;
    formData.khataNo=khataNo;
    formData.holdingNumber=holdingNumber;
    formData.registrationDetails=registrationDetails;
    onSelect(config?.key, { ...data });
  }
  function selectRegistrationDetails(e) {
    setRegistrationDetails(e.target.value);
  }
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
  }
  const onSkip = () => onSelect();

  const cardStyle = { background: "#ffffff", borderRadius: "10px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: "24px 28px", marginBottom: "24px", border: "1px solid #e8ecf0" };
  const sectionTitleStyle = { fontSize: "15px", fontWeight: "700", color: "#1a2b49", marginBottom: "20px", paddingBottom: "10px", borderBottom: "2px solid #f47738", letterSpacing: "0.3px" };
  const labelStyle = { display: "block", fontWeight: "600", fontSize: "13px", color: "#3d4f6b", marginBottom: "6px", letterSpacing: "0.2px" };
  const requiredMark = { color: "#e54d42", marginLeft: "2px" };

  return (
    <div className="plot-details-page">
      <style>{".plot-details-page .card-caption, .plot-details-page .card-text { display: none !important; }"}</style>
      <Timeline currentStep={checkingFlow==="PRE_APPROVE" ? 3 : 1} flow={checkingFlow} />

      {/* Hero Banner */}
      <div style={{ background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)", borderRadius: "12px", padding: "28px 36px", marginBottom: "24px", color: "#fff", display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>
            {t("BPA_BUILDING_PERMIT") || "Building Permit"}
          </div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{t("BPA_PLOT_DETAILS_TITLE") || "Plot Details"}</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>
            {t("BPA_PLOT_DETAILS_SUBTEXT") || "Provide plot and registration information"}
          </p>
        </div>
        <div style={{ marginLeft: "auto", flexShrink: 0, background: "rgba(255,255,255,0.2)", borderRadius: "20px", padding: "6px 16px", fontSize: "12px", fontWeight: "700", color: "#fff", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>Step 1 of 3</div>
      </div>

      {formData?.selectedPlot || formData?.businessService==="BPA-PAP" ? (
        <FormStep config={config} onSelect={handleSubmit} childrenAtTheBottom={false} t={t} isDisabled={plotNo==="" || khataNo==="" || holdingNumber===""}>
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>{t("BPA_PLOT_DETAILS_SECTION") || "Plot Information"}</div>
            <label style={labelStyle}>{t("PLOT_NUMBER")}<span style={requiredMark}>*</span></label>
            <TextInput t={t} type="text" isMandatory={false} value={plotNo} onChange={handleInputChange(setPlotNo)} />
            <label style={labelStyle}>{t("KHATA_NUMBER")}<span style={requiredMark}>*</span></label>
            <TextInput t={t} type="text" isMandatory={false} value={khataNo} onChange={handleInputChange(setKhataNo)} />
            <label style={labelStyle}>{t("BPA_HOLDING_NUMBER_LABEL")}<span style={requiredMark}>*</span></label>
            <TextInput t={t} type="text" isMandatory={false} value={holdingNumber} onChange={handleInputChange(setHoldingNumber)} />
            <label style={labelStyle}>{t("BPA_BOUNDARY_LAND_REG_DETAIL_LABEL")}</label>
            <TextArea t={t} isMandatory={false} type={"text"} optionKey="i18nKey" name="RegistrationDetails" onChange={selectRegistrationDetails} value={registrationDetails} />
          </div>
        </FormStep>
      ) : (
        <FormStep config={config} onSelect={handleSubmit} childrenAtTheBottom={false} t={t} _defaultValues={formData?.data} onSkip={onSkip}>
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>{t("BPA_PLOT_DETAILS_SECTION") || "Plot Information"}</div>
            <StatusTable>
              <Row className="border-none" label={t("BPA_PLOT_NUMBER_LABEL")} text={data?.planDetail?.planInformation?.plotNo || "NA"} />
              <Row className="border-none" label={t("BPA_KHATHA_NUMBER_LABEL")} text={data?.planDetail?.planInformation?.khataNo || "NA"} />
            </StatusTable>
          </div>
        </FormStep>
      )}
    </div>
  );
};

export default PlotDetails;