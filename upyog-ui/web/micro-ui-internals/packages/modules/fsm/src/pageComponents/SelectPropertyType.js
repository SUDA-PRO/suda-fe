import React, { useEffect, useState } from "react";
import { CitizenInfoLabel, Loader, Dropdown, FormStep, CardLabel, RadioOrSelect } from "@upyog/digit-ui-react-components";
import Timeline from "../components/TLTimelineInFSM";
import { useLocation } from "react-router-dom";

const SelectPropertyType = ({ config, onSelect, t, userType, formData }) => {
  const { pathname: url } = useLocation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const select = (items) => items.map((item) => ({ ...item, i18nKey: t(item.i18nKey) }));

  const propertyTypesData = Digit.Hooks.fsm.useMDMS(stateId, "FSM", "PropertyType", { select });

  //const usageType=formData?.cpt!=="undefined"? (formData?.cpt?.details?.usageCategory==="RESIDENTIAL" ? formData?.cpt?.details?.usageCategory: formData?.cpt?.details?.usageCategory.split('.')[1]):""
  //const property = JSON.parse(sessionStorage?.getItem("Digit_FSM_PT")|| "{}")
  let property = sessionStorage?.getItem("Digit_FSM_PT")
if (property !== "undefined")
{
  property = JSON.parse(sessionStorage?.getItem("Digit_FSM_PT"))
}
const usageType = property?.propertyDetails?.usageCategory
? property?.propertyDetails?.usageCategory.includes("INSTITUTIONAL") || property?.propertyDetails?.usageCategory.includes("COMMERCIAL")
  ? property?.propertyDetails?.usageCategory.split('.')[1] 
  : property?.propertyDetails?.usageCategory 
: property?.usageCategory
? property?.usageCategory.includes("INSTITUTIONAL") || property?.usageCategory.includes("COMMERCIAL")
  ? property?.usageCategory.split('.')[1] 
  : property?.usageCategory 
: property?.propertyDetails?.usageCategory || property?.usageCategory;
  
  const [propertyType, setPropertyType] = useState(formData?.propertyType || "" );
  formData.propertyType = propertyType
  
useEffect(()=>{
 if(userType === "employee" && property && propertyTypesData.data)
    {
      
      let propertyType = []
      
      propertyType = propertyTypesData?.data.filter((city) => {
          return city.code == formData?.propertyType
        })

        if(propertyType.length >0)
        {
          onSelect(config.key, propertyType[0].code)
          setPropertyType(propertyType[0])
        }
     
    }
    if(property){
      
      if(property?.propertyDetails?.usageCategory == "COMMERCIAL" || property?.propertyDetails?.usageCategory == 
      "RESIDENTIAL")
      {
        setPropertyType(usageType)
      }
      // else if(property?.propertyDetails?.usageCategory == "INSTITUTIONAL" || property?.propertyDetails?.usageCategory == "COMMERCIAL"){
      //   let type = property?.propertyDetails?.usageCategory.split('.')[1];
      //   setPropertyType(type);
      // }
      // else{
      //   setPropertyType("")
      // }
     
    }
},[propertyTypesData.isLoading])
  useEffect(() => {
    
    if (!propertyTypesData.isLoading && propertyTypesData.data && usageType) {
      const preFilledPropertyType = propertyTypesData.data.filter(
        (propertyType) => propertyType.code === (usageType||formData?.propertyType?.code || formData?.propertyType)
      )[0];

      if(preFilledPropertyType !== undefined)
      {
        setPropertyType(preFilledPropertyType);
      }
      else if(usageType==="COMMERCIAL" || usageType==="INSTITUTIONAL"){
        setPropertyType(usageType)
      }
     
    }
  }, [property, formData?.propertyType, propertyTypesData.data]);

  const goNext = () => {
    sessionStorage.removeItem("Digit.total_amount");
    onSelect(config.key, propertyType);
  };
  function selectedValue(value) {

    setPropertyType(value);
  }
  function selectedType(value) {
    setPropertyType(value)
    onSelect(config.key, value.code);
  }

  const getInfoContent = () => {
    let content = t("CS_DEFAULT_INFO_TEXT");
    if (formData && formData.selectPaymentPreference && formData.selectPaymentPreference.code === "PRE_PAY") {
      content = t("CS_CHECK_INFO_PAY_NOW");
    } else {
      content = t("CS_CHECK_INFO_PAY_LATER");
    }
    return content;
  };

  if (propertyTypesData.isLoading) {
    return <Loader />;
  }
  if (userType === "employee") {
    const employeeSelectedType =
      typeof propertyType === "string"
        ? (propertyTypesData.data || []).find((p) => p.code === propertyType) || null
        : propertyType;
    const isDisabled = !(url.includes("/modify-application/") || (url.includes("/new-application") && propertyType !== undefined));
    const ptIcons = {
      RESIDENTIAL: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>),
      COMMERCIAL: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="1"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>),
      INSTITUTIONAL: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L2 7h20L12 2z"/><rect x="4" y="7" width="16" height="13"/><rect x="9" y="12" width="6" height="8"/></svg>),
      INDUSTRIAL: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="10" width="20" height="11"/><path d="M6 10V6l4 4V6l4 4V6l4 4"/></svg>),
    };
    return (
      <div className="fsm-fullwidth fsm-center-field" style={{ display: "flex", flexWrap: "wrap", gap: "12px", opacity: isDisabled ? 0.7 : 1 }}>
        {(propertyTypesData.data?.sort((a, b) => a.name.localeCompare(b.name)) || []).map((opt) => {
          const selected = employeeSelectedType?.code === opt.code;
          const icon = ptIcons[opt.code?.toUpperCase()] || (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
          );
          return (
            <div
              key={opt.code}
              onClick={() => { if (!isDisabled) selectedType(opt); }}
              style={{
                position: "relative",
                flex: "1 1 120px", minWidth: "110px", maxWidth: "180px",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: "10px", padding: "16px 12px",
                borderRadius: "12px", cursor: isDisabled ? "not-allowed" : "pointer",
                border: selected ? "2px solid #f47738" : "1.5px solid #e5e7eb",
                background: selected ? "#fff8f3" : "#fff",
                boxShadow: selected ? "0 0 0 3px rgba(244,119,56,0.15)" : "0 1px 3px rgba(0,0,0,0.06)",
                color: selected ? "#f47738" : "#4b5563",
                transition: "all 0.15s",
                userSelect: "none",
              }}
              onMouseEnter={(e) => { if (!selected && !isDisabled) e.currentTarget.style.borderColor = "#f47738"; }}
              onMouseLeave={(e) => { if (!selected) e.currentTarget.style.borderColor = "#e5e7eb"; }}
            >
              <div style={{ color: selected ? "#f47738" : "#6b7280" }}>{icon}</div>
              <span style={{ fontSize: "13px", fontWeight: selected ? "700" : "500", textAlign: "center", lineHeight: "1.3" }}>
                {opt.i18nKey}
              </span>
              {selected && (
                <div style={{ position: "absolute", top: "8px", right: "8px", width: "18px", height: "18px", borderRadius: "50%", background: "#f47738", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  } else {
    return (
      <React.Fragment>
        <Timeline currentStep={1} flow="APPLY" />
        <FormStep config={config} onSelect={goNext} isDisabled={!propertyType} t={t}>
          <CardLabel>{`${t("CS_FILE_APPLICATION_PROPERTY_LABEL")}`}<span className="check-page-link-button"> *</span></CardLabel>
          <RadioOrSelect
            options={propertyTypesData.data?.sort((a, b) => a.name.localeCompare(b.name))}
            selectedOption={propertyType}
            optionKey="i18nKey"
            onSelect={selectedValue}
            t={t}
          />
        </FormStep>
        {propertyType && (
          <CitizenInfoLabel
            info={t("CS_FILE_APPLICATION_INFO_LABEL")}
            text={t("CS_FILE_APPLICATION_INFO_TEXT", { content: t("CS_DEFAULT_INFO_TEXT"), ...propertyType })}
          />
        )}
      </React.Fragment>
    );
  }
};

export default SelectPropertyType;
