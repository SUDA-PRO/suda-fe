import { FormStep, TextArea, BackButton } from "@upyog/digit-ui-react-components";
import React, { useState } from "react";
import Timeline from "../components/Timeline";

const PermanentAddress = ({ t, config, onSelect, value, userType, formData }) => {
  const onSkip = () => onSelect();
  const [PermanentAddress, setPermanentAddress] = useState(formData?.LicneseDetails?.PermanentAddress || formData?.formData?.LicneseDetails?.PermanentAddress);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  let isopenlink = window.location.href.includes("/openlink/");

  if (isopenlink)
    window.onunload = function () {
      sessionStorage.removeItem("Digit.BUILDING_PERMIT");
    };

  function selectPermanentAddress(e) {
    setPermanentAddress(e.target.value);
  }

  const goNext = () => {
    if (!(formData?.result && formData?.result?.Licenses[0]?.id))
      onSelect(config.key, { PermanentAddress: PermanentAddress });
    else {
      let data = formData?.formData;
      data.LicneseDetails.PermanentAddress = PermanentAddress;
      onSelect("", formData);
    }
  };

  /* ── Layout styles ── */
  const cardStyle = {
    background: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    padding: "24px 28px",
    marginBottom: "24px",
    border: "1px solid #e8ecf0",
  };
  const sectionTitleStyle = {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1a2b49",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "2px solid #f47738",
    letterSpacing: "0.3px",
  };
  const labelStyle = {
    display: "block",
    fontWeight: "600",
    fontSize: "13px",
    color: "#3d4f6b",
    marginBottom: "6px",
    letterSpacing: "0.2px",
  };
  const requiredMark = { color: "#e54d42", marginLeft: "2px" };

  return (
    <div className="permanent-address-page">
      <style>{`.permanent-address-page .card-caption, .permanent-address-page .card-text { display: none !important; }`}</style>
      <div className={isopenlink ? "OpenlinkContainer" : ""}>
        {isopenlink && <BackButton style={{ border: "none" }}>{t("CS_COMMON_BACK")}</BackButton>}
        <Timeline currentStep={2} flow="STAKEHOLDER" />

        {/* Hero Banner */}
        <div style={{
          background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)",
          borderRadius: "12px",
          padding: "28px 36px",
          marginBottom: "24px",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>
              {t("BPA_STEP_2_OF_3") || "Step 2 of 3"}
            </div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
              {t("BPA_PERMANENT_ADDRESS_HEADER") || "Permanent Address"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>
              {t("BPA_PERMANENT_ADDRESS_SUBTEXT") || "Enter your permanent residential address"}
            </p>
          </div>
        </div>

        <FormStep config={config} onSelect={goNext} onSkip={onSkip} t={t} isDisabled={!PermanentAddress}>
          <div style={{ maxWidth: "100%", width: "100%" }}>
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>{t("BPA_ADDRESS_DETAILS_HEADER") || "Address Details"}</div>
              <label style={labelStyle}>
                {t("BPA_PERMANANT_ADDRESS_LABEL")}<span style={requiredMark}>*</span>
              </label>
              <TextArea
                t={t}
                isMandatory={false}
                type={"text"}
                optionKey="i18nKey"
                name="PermanentAddress"
                onChange={selectPermanentAddress}
                value={PermanentAddress}
              />
            </div>
          </div>
        </FormStep>
      </div>
    </div>
  );
};

export default PermanentAddress;