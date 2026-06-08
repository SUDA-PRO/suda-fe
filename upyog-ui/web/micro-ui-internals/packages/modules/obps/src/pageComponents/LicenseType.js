import { Dropdown, FormStep, RadioOrSelect, TextInput, BackButton } from "@upyog/digit-ui-react-components";
import React, { useState } from "react";
import Timeline from "../components/Timeline";

const LicenseType = ({ t, config, onSelect, userType, formData }) => {
  if (JSON.parse(sessionStorage.getItem("BPAREGintermediateValue")) !== null) {
    formData = JSON.parse(sessionStorage.getItem("BPAREGintermediateValue"));
    sessionStorage.setItem("BPAREGintermediateValue", null);
  }

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const [LicenseType, setLicenseType] = useState(formData?.LicneseType?.LicenseType || formData?.formData?.LicneseType?.LicenseType || "");
  const [ArchitectNo, setArchitectNo] = useState(formData?.LicneseType?.ArchitectNo || formData?.formData?.LicneseType?.ArchitectNo || null);
  const [selectedCity, setSelectedCity] = useState(formData?.LicneseType?.selectedCity || formData?.formData?.LicneseType?.selectedCity || null);

  const allTenants = Digit.SessionStorage.get("OBPS_TENANTS") || [];
  const cityTenants = allTenants.filter((t) => t?.code && t.code.includes(".")).map((t) => ({
    code: t.code,
    name: t.city?.name || t.name || t.code,
    i18nKey: `TENANT_TENANTS_${t.code.replace(/\./g, "_").toUpperCase()}`,
  }));

  const { data } = Digit.Hooks.obps.useMDMS(stateId, "StakeholderRegistraition", "TradeTypetoRoleMapping");
  let isopenlink = window.location.href.includes("/openlink/");

  if (isopenlink)
    window.onunload = function () {
      sessionStorage.removeItem("Digit.BUILDING_PERMIT");
    };

  function getLicenseType() {
    let list = [];
    let found = false;
    data?.StakeholderRegistraition?.TradeTypetoRoleMapping.map((ob) => {
      found = list.some((el) => el.i18nKey.includes(ob.tradeType.split(".")[0]));
      if (!found) list.push({ role: ob.role, i18nKey: `TRADELICENSE_TRADETYPE_${ob.tradeType.split(".")[0]}`, tradeType: ob.tradeType });
    });
    return list;
  }

  const onSkip = () => onSelect();

  function selectLicenseType(value) {
    setLicenseType(value);
  }

  function selectArchitectNo(e) {
    setArchitectNo(e.target.value);
  }

  function goNext() {
    if (!(formData?.result && formData?.result?.Licenses[0]?.id))
      onSelect(config.key, { LicenseType, ArchitectNo, selectedCity });
    else {
      let data = formData?.formData;
      data.LicneseType.LicenseType = LicenseType;
      data.LicneseType.ArchitectNo = ArchitectNo;
      data.LicneseType.selectedCity = selectedCity;
      onSelect("", formData);
    }
  }

  const isNextDisabled = !selectedCity || (LicenseType && LicenseType?.i18nKey.includes("ARCHITECT") ? !LicenseType || !ArchitectNo : !LicenseType);

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
  const rowStyle = { display: "flex", flexWrap: "wrap", marginLeft: "-10px", marginRight: "-10px" };
  const col6 = { flex: "0 0 50%", maxWidth: "50%", padding: "0 10px", marginBottom: "18px", boxSizing: "border-box" };
  const col12 = { flex: "0 0 100%", maxWidth: "100%", padding: "0 10px", marginBottom: "18px", boxSizing: "border-box" };

  return (
    <div className="license-type-page">
      <style>{`.license-type-page .card-caption, .license-type-page .card-text { display: none !important; }`}</style>
      <div className={isopenlink ? "OpenlinkContainer" : ""}>
        {isopenlink && <BackButton style={{ border: "none" }}>{t("CS_COMMON_BACK")}</BackButton>}
        <Timeline currentStep={1} flow="STAKEHOLDER" />

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
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>
              {t("BPA_STEP_1_OF_3") || "Step 1 of 3"}
            </div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
              {t("BPA_LICENSE_TYPE") || "License Type"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>
              {t("BPA_LICENSE_TYPE_TEXT") || "Select your license type and city"}
            </p>
          </div>
        </div>

        <FormStep t={t} config={config} onSelect={goNext} onSkip={onSkip} isDisabled={isNextDisabled}>
          <div style={{ maxWidth: "100%", width: "100%" }}>

            {/* Card 1 – City */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>{t("BPA_CITY_DETAILS_HEADER") || "City Details"}</div>
              <div style={rowStyle}>
                <div style={col6}>
                  <label style={labelStyle}>{t("BPA_CITY_LABEL")}<span style={requiredMark}>*</span></label>
                  <Dropdown
                    t={t}
                    optionKey="name"
                    isMandatory={true}
                    option={cityTenants}
                    selected={selectedCity}
                    select={setSelectedCity}
                    placeholder={t("BPA_SELECT_CITY_PLACEHOLDER")}
                  />
                
                </div>
                <div style={col12}>
                  <label style={labelStyle}>{t("BPA_LICENSE_TYPE")}<span style={requiredMark}>*</span></label>
                  <div className="form-pt-dropdown-only">
                    {data && (
                      <RadioOrSelect
                        t={t}
                        optionKey="i18nKey"
                        isMandatory={config.isMandatory}
                        options={getLicenseType() || {}}
                        selectedOption={LicenseType}
                        onSelect={selectLicenseType}
                      />
                    )}
                  </div>
                </div>

                {LicenseType && LicenseType?.i18nKey.includes("ARCHITECT") && (
                  <div style={col6}>
                    <label style={labelStyle}>{t("BPA_COUNCIL_NUMBER")}<span style={requiredMark}>*</span></label>
                    <TextInput
                      t={t}
                      type="text"
                      isMandatory={false}
                      optionKey="i18nKey"
                      name="ArchitectNo"
                      value={ArchitectNo}
                      onChange={selectArchitectNo}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Card 2 – License Type */}
            
          </div>
        </FormStep>
      </div>
    </div>
  );
};

export default LicenseType;
