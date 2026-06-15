import React, { useState } from "react";
import { RadioButtons } from "@upyog/digit-ui-react-components";
import Timeline from "../../components/CPTTimeline";
import FormStep from "../../../../../react-components/src/molecules/FormStep"

const KnowYourProperty = ({ t, config, onSelect, userType, formData }) => {
  const [KnowProperty, setKnowProperty] = useState(formData?.PropDetails?.KnowProperty);
  if(window.location.href.includes("/tl/tradelicence/edit-application/") || window.location.href.includes("/renew-trade/") )
  {
    let EditformData = JSON.parse(sessionStorage.getItem("EditFormData"));
    formData = {...formData,...EditformData};
  }
 
  const menu = [
    { i18nKey: "TL_COMMON_YES", code: "YES" },
    { i18nKey: "TL_COMMON_NO", code: "NO" },
  ];

  const onSkip = () => onSelect();

  function selectKnowProperty(value) {
    setKnowProperty(value);
  }

  function goNext() {
    sessionStorage.setItem("KnowProperty", KnowProperty.i18nKey);
    onSelect(config.key, { KnowProperty });
  }

  // Suppress the FormStep's built-in header — we render our own banner
  const configWithoutHeader = { ...config, texts: { ...(config.texts || {}), header: "" } };
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
    marginBottom: "12px",
    letterSpacing: "0.2px",
  };

  return (
    <React.Fragment>
      {window.location.href.includes("/citizen") ? <Timeline /> : null}

      {/* PT-style hero banner (matches PTAllPropertyDetails dark-navy → orange) */}
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
          fontSize: "26px",
        }}>🏠</div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>Step 2 of 3</div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{t("PT_DO_YOU_KNOW_YOUR_PROPERTY")}</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>{t("TL_KNOW_PROPERTY_SUBTITLE") || "Link your property to this trade licence"}</p>
        </div>
      </div>

      <FormStep t={t} config={configWithoutHeader} onSelect={goNext} onSkip={onSkip} isDisabled={!KnowProperty}>
        <div style={{ maxWidth: "100%", width: "100%" }}>
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>{t("PT_DO_YOU_KNOW_YOUR_PROPERTY")}</div>
            <label style={labelStyle}>{t("TL_SELECT_OPTION") || "Please select an option"}</label>
            <RadioButtons
              t={t}
              optionsKey="i18nKey"
              isMandatory={config.isMandatory}
              options={menu}
              selectedOption={KnowProperty}
              onSelect={selectKnowProperty}
            />
          </div>
        </div>
      </FormStep>
    </React.Fragment>
  );
};
export default KnowYourProperty;
