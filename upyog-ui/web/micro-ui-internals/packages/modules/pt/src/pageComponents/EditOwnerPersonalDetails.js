import React, { useState, useEffect } from "react";
import { CardLabel, CardLabelError, Dropdown, LabelFieldPair } from "@upyog/digit-ui-react-components";

const EditOwnerPersonalDetails = ({ t, config, onSelect, userType, formData }) => {
  const stateId = Digit.ULBService.getStateId();

  const { data: genderMDMS } = Digit.Hooks.pt.useGenderMDMS(stateId, "common-masters", "GenderType") || {};
  const genderOptions = (genderMDMS || []).map((g) => ({
    i18nKey: `PT_COMMON_GENDER_${g.code}`,
    code: g.code,
    value: g.code,
  }));

  const firstOwner = Array.isArray(formData?.owners) ? formData.owners[0] : formData?.owners;

  const [gender, setGender] = useState(null);
  const [mobileNumber, setMobileNumber] = useState(firstOwner?.mobileNumber || "");
  const [mobileError, setMobileError] = useState("");

  /* Pre-fill gender once options load */
  useEffect(() => {
    if (genderOptions.length > 0 && firstOwner?.gender) {
      const src = firstOwner.gender;
      const code = typeof src === "object" ? src?.code : src;
      const matched = genderOptions.find((o) => o.code === code);
      if (matched) setGender(matched);
    }
  }, [genderOptions.length]);

  function pushUpdate(newGender, newMobile) {
    const owners = (Array.isArray(formData?.owners) ? formData.owners : [firstOwner]).map((owner, idx) => {
      if (idx === 0) {
        return {
          ...owner,
          gender: newGender || gender,
          mobileNumber: newMobile !== undefined ? newMobile : mobileNumber,
        };
      }
      return owner;
    });
    onSelect(config.key, owners);
  }

  function handleGenderChange(val) {
    setGender(val);
    pushUpdate(val, undefined);
  }

  function handleMobileChange(e) {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setMobileNumber(val);
    if (val.length > 0 && val.length !== 10) {
      setMobileError(t("CORE_COMMON_MOBILE_ERROR"));
    } else {
      setMobileError("");
    }
    pushUpdate(undefined, val);
  }

  if (userType !== "employee") return null;

  return (
    <React.Fragment>
      {/* Gender */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("PT_FORM3_GENDER_LABEL")}
        </CardLabel>
        <Dropdown
          className="form-field"
          selected={gender}
          option={genderOptions}
          select={handleGenderChange}
          optionKey="i18nKey"
          t={t}
        />
      </LabelFieldPair>

      {/* Mobile No */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("PT_FORM3_MOBILE_NO")}
        </CardLabel>
        <div className="field">
          <input
            className="employee-card-input"
            type="tel"
            value={mobileNumber}
            onChange={handleMobileChange}
            maxLength={10}
            placeholder="10-digit mobile number"
          />
          {mobileError && (
            <CardLabelError style={{ fontSize: "11px", marginTop: "2px" }}>
              {mobileError}
            </CardLabelError>
          )}
        </div>
      </LabelFieldPair>
    </React.Fragment>
  );
};

export default EditOwnerPersonalDetails;
