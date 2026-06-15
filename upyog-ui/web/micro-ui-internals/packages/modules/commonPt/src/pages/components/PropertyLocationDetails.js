import { CardLabel, CardLabelError, Dropdown, LabelFieldPair, Localities, TextInput } from "@upyog/digit-ui-react-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

const PropertyLocationDetails = ({ t, config, onSelect, userType, formData, formState, ownerIndex, setError, clearErrors }) => {
  let validation = {};
  let allCities = Digit.Hooks.pt.useTenants() ? Digit.Hooks.pt.useTenants() : Digit.Hooks.tl.useTenants();
  if(window.location.href.includes("obps"))
  {
    allCities = Digit.SessionStorage.get("OBPS_TENANTS")

  }
  if(window.location.href.includes("fsm"))
  {
    allCities = Digit.SessionStorage.get("FSM_TENANTS")
    console.log("allc", allCities)
  }
  // if called from tl module get tenants from tl usetenants
  const userInfo = Digit.UserService.getUser()?.info;
  userType = userInfo?.type == "EMPLOYEE" ? "employee" : "citizen";
  const cityId = userInfo?.tenantId;
  const cityName = 'TENANT_TENANTS_' + userInfo?.tenantId.replace('.', '_').toUpperCase();
  const cityObj = userType === 'employee' ? { code: cityId, name: t(cityName), i18nKey: cityName } : null;

  const [locationDetails, setLocationDetails] = React.useState({
    ...formData?.locationDet,
    cityCode: cityObj,
    locality: formData?.locality,
    houseDoorNo: formData?.houseDoorNo,
    buildingColonyName: formData?.buildingColonyName,
    landmarkName: formData?.landmarkName
  });
  const [isErrors, setIsErrors] = React.useState(false);

  const { control, formState: { errors, touched }, trigger, watch, setError: setLocalError, clearErrors: clearLocalErrors, setValue, getValues } = useForm();
  const formValue = watch();

  React.useEffect(() => {
    let hasErrors = false;
    const part = {};

    Object.keys(locationDetails).forEach((key) => {
      part[key] = formValue?.[key];
    });

    if (!_.isEqual(part, locationDetails)) {
      Object.keys(locationDetails).forEach((key) => {
        if (locationDetails[key]) {
          hasErrors = false;
          clearLocalErrors(key);
        } else {
          hasErrors = true;
        }
      });
    }

    if (hasErrors) {
      setError(config?.key, { type: errors })
    } else {
      clearErrors(config?.key);
    }

    trigger();
    setIsErrors(hasErrors);
    onSelect(config?.key, locationDetails);
  }, [locationDetails]);

  React.useEffect(() => {
    if (Object.keys(errors).length && !_.isEqual(formState.errors[config.key]?.type || {}, errors)) {
      setError(config.key, { type: errors });
    } else if (!Object.keys(errors).length && formState.errors[config.key] && isErrors) {
      clearErrors(config.key);
    }
  }, [errors]);

  /* ── Shared grid styles (matches SelectCombinedTradeDetails) ── */
  const ptCardStyle = {
    background: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    padding: "24px 28px",
    marginBottom: "24px",
    border: "1px solid #e8ecf0",
  };
  const ptSectionTitleStyle = {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1a2b49",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "2px solid #f47738",
    letterSpacing: "0.3px",
  };
  const rowStyle = {
    display: "flex",
    flexWrap: "wrap",
    marginLeft: "-10px",
    marginRight: "-10px",
  };
  const col6 = {
    flex: "0 0 50%",
    maxWidth: "50%",
    padding: "0 10px",
    marginBottom: "18px",
    boxSizing: "border-box",
  };
  const col12 = {
    flex: "0 0 100%",
    maxWidth: "100%",
    padding: "0 10px",
    marginBottom: "18px",
    boxSizing: "border-box",
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
  const errorMsgStyle = { fontSize: "12px", color: "#e54d42", marginTop: "4px" };

  return (
    <div style={ptCardStyle}>
      <div style={ptSectionTitleStyle}>{t("PT_PROP_LOCATION_DET") || "Property Location Details"}</div>

      {/* Row 1: City + Locality */}
      <div style={rowStyle}>
        <div style={col6}>
          <label style={labelStyle}>{t("PT_PROP_CITY")}<span style={requiredMark}>*</span></label>
          <Controller
            name=""
            defaultValue={locationDetails?.cityCode}
            control={control}
            rules={{ required: t("REQUIRED_FIELD") }}
            render={({ value, onBlur, onChange }) => (
              <Dropdown
                className="form-field"
                selected={value}
                disable={userType === "employee"}
                option={allCities.sort((a, b) => (a.name > b.name) ? 1 : (b.name > a.name) ? -1 : 0)}
                select={(value) => {
                  onChange(value);
                  setLocationDetails({ ...locationDetails, cityCode: value });
                }}
                optionKey="code"
                onBlur={onBlur}
                t={t}
              />
            )}
          />
          <CardLabelError style={errorMsgStyle}>{touched?.cityCode ? errors?.cityCode?.message : ""}</CardLabelError>
        </div>

        <div style={col6}>
          <label style={labelStyle}>{t("PT_PROP_LOCALITY")}<span style={requiredMark}>*</span></label>
          <Controller
            name="locality"
            defaultValue={locationDetails?.locality}
            control={control}
            rules={{ required: t("REQUIRED_FIELD") }}
            render={({ value, onBlur, onChange }) => (
              <Localities
                selectLocality={(value) => {
                  onChange(value);
                  setLocationDetails({ ...locationDetails, locality: value });
                }}
                tenantId={locationDetails?.cityCode?.code}
                boundaryType="revenue"
                keepNull={false}
                optionCardStyles={{ height: "600px", overflow: "auto", zIndex: "10" }}
                selected={value}
                disable={!locationDetails?.cityCode?.code}
                disableLoader={true}
                onBlur={onBlur}
              />
            )}
          />
          <CardLabelError style={errorMsgStyle}>{touched?.locality ? errors?.locality?.message : ""}</CardLabelError>
        </div>
      </div>

      {/* Row 2: House/Door No + Street/Colony Name */}
      <div style={rowStyle}>
        <div style={col6}>
          <label style={labelStyle}>{t("PT_HOUSE_DOOR_NO")}<span style={requiredMark}>*</span></label>
          <Controller
            name="houseDoorNo"
            defaultValue={locationDetails?.houseDoorNo}
            control={control}
            rules={{
              required: t("REQUIRED_FIELD"),
              validate: (value) => /^([a-zA-Z0-9 !@#$%^&*()_+\-={};':\\\\|,.<>/?]){1,64}$/i.test(value) ? true : t("PT_HOUSE_DOOR_NO_ERROR_MESSAGE"),
            }}
            render={({ value, onBlur, onChange }) => (
              <TextInput
                t={t}
                type={"text"}
                isMandatory={false}
                optionKey="i18nKey"
                name="houseDoorNo"
                value={value}
                onChange={(ev) => {
                  onChange(ev.target.value);
                  setLocationDetails({ ...locationDetails, houseDoorNo: ev.target.value });
                }}
                onBlur={onBlur}
                {...(validation = { pattern: "^([a-zA-Z0-9 !@#$%^&*()_+\\-={};':\\\\|,.<>/?]){1,64}$", title: t("PT_HOUSE_DOOR_NO_ERROR_MESSAGE") })}
              />
            )}
          />
          <CardLabelError style={errorMsgStyle}>{touched?.houseDoorNo ? errors?.houseDoorNo?.message : ""}</CardLabelError>
        </div>

        <div style={col6}>
          <label style={labelStyle}>{t("PT_PROPERTY_ADDRESS_STREET_NAME")}<span style={requiredMark}>*</span></label>
          <Controller
            name="buildingColonyName"
            defaultValue={locationDetails?.buildingColonyName}
            control={control}
            rules={{ required: t("REQUIRED_FIELD") }}
            render={({ value, onChange, onBlur }) => (
              <TextInput
                t={t}
                type={"text"}
                isMandatory={false}
                optionKey="i18nKey"
                name="buildingColonyName"
                value={value}
                onChange={(ev) => {
                  onChange(ev.target.value);
                  setLocationDetails({ ...locationDetails, buildingColonyName: ev.target.value });
                }}
                onBlur={onBlur}
              />
            )}
          />
          <CardLabelError style={errorMsgStyle}>{touched?.buildingColonyName ? errors?.buildingColonyName?.message : ""}</CardLabelError>
        </div>
      </div>

      {/* Row 3: Landmark (full width, optional) */}
      <div style={rowStyle}>
        <div style={col12}>
          <label style={labelStyle}>{t("PT_LANDMARK_NAME")}</label>
          <Controller
            name="landmarkName"
            defaultValue={locationDetails?.landmarkName}
            control={control}
            rules={{}}
            render={({ value, onChange, onBlur }) => (
              <TextInput
                t={t}
                type={"text"}
                isMandatory={false}
                optionKey="i18nKey"
                name="landmarkName"
                value={value}
                onChange={(ev) => {
                  onChange(ev.target.value);
                  setLocationDetails({ ...locationDetails, landmarkName: ev.target.value });
                }}
                onBlur={onBlur}
              />
            )}
          />
          <CardLabelError style={errorMsgStyle}>{touched?.landmarkName ? errors?.landmarkName?.message : ""}</CardLabelError>
        </div>
      </div>
    </div>
  );
};

export default PropertyLocationDetails;
