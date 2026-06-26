import React, { useState, useEffect } from "react";
import { FormStep, Dropdown, Loader, CardLabel, RadioButtons, RadioOrSelect } from "@upyog/digit-ui-react-components";
import Timeline from "../components/TLTimelineInFSM";

const SelectPitType = ({ t, formData, config, onSelect, userType }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  const [pitType, setPitType] = useState(formData?.pitType);
  const { data: sanitationMenu, isLoading } = Digit.Hooks.fsm.useMDMS(stateId, "FSM", "PitType");

  const selectPitType = (value) => {
    setPitType(value);
    if (userType === "employee") {
      onSelect(config.key, value);
      onSelect("pitDetail", null);
    }
  };

  const onSkip = () => {
    onSelect();
  };

  const onSubmit = () => {
    onSelect(config.key, pitType);
  };

  if (isLoading) {
    return <Loader />;
  }
  if (userType === "employee") {
    return (
      <div className="fsm-fullwidth fsm-center-field" style={{ width: "100%" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {(sanitationMenu?.sort((a, b) => a.name.localeCompare(b.name)) || []).map((pt) => {
            const sel = pitType?.code === pt.code;
            return (
              <button
                key={pt.code}
                type="button"
                onClick={() => selectPitType(pt)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 18px", borderRadius: "10px",
                  border: sel ? "2px solid #f47738" : "2px solid #e5e7eb",
                  background: sel ? "#fff8f3" : "#fafbff",
                  color: sel ? "#f47738" : "#374151",
                  fontWeight: sel ? "700" : "500", fontSize: "14px",
                  cursor: "pointer", transition: "all 0.15s",
                  boxShadow: sel ? "0 2px 8px rgba(244,119,56,0.15)" : "none",
                }}
              >
                {sel && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                )}
                {t(pt.i18nKey, { defaultValue: pt.name || pt.code })}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <React.Fragment>
      <Timeline currentStep={1} flow="APPLY" />
      <FormStep config={config} onSelect={onSubmit} onSkip={onSkip} isDisabled={!pitType} t={t}>
        <CardLabel>{t("CS_FILE_APPLICATION_PIT_TYPE_LABEL")}<span className="check-page-link-button"> *</span></CardLabel>
        <RadioOrSelect
          isMandatory={config.isMandatory}
          options={sanitationMenu?.sort((a, b) => a.name.localeCompare(b.name))}
          selectedOption={pitType}
          optionKey="i18nKey"
          onSelect={selectPitType}
          t={t}
        />
      </FormStep>
    </React.Fragment>
  );
};

export default SelectPitType;
