import React, { useState, useEffect, useMemo, useCallback } from "react";
import { CardLabel, LabelFieldPair, Dropdown, TextInput, LinkButton, CardLabelError, MobileNumber, DatePicker, Loader, CardSectionHeader } from "@upyog/digit-ui-react-components";
import { useForm, Controller, useWatch } from "react-hook-form";
import * as func from "../pages/employee/Utils/Category";
import { sortDropdownNames } from "../pages/employee/Utils/Sortbyname";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { useLocation } from "react-router-dom";
import { getUniqueItemsFromArray, commonTransform, stringReplaceAll,getPattern, convertEpochToDate } from "../utils";

const createConsumerDetails = () => ({
  ConsumerName: "",
  mobileNumber: "",
  emailId:"",
  // key: Date.now(),
});

const ConsumerDetails = ({ config, onSelect, userType, formData, setError, formState, clearErrors }) => {
  if(window.location.href.includes("modify-challan") && sessionStorage.getItem("mcollectEditObject"))
  {
    formData = JSON.parse(sessionStorage.getItem("mcollectEditObject"))
  }
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isEdit = pathname.includes("/modify-challan/");
  const [consumerDetails, setconsumerDetails] = useState(formData?.consomerDetails1 || [createConsumerDetails()]);
  const [focusIndex, setFocusIndex] = useState({ index: -1, type: "" });
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const [isErrors, setIsErrors] = useState(false);
  const stateCode = window?.globalConfigs?.getConfig("STATE_LEVEL_TENANT_ID");
  const data = Digit.Hooks.mcollect.useCommonMDMS(stateCode, "common-masters", ["HierarchyType"]);
  const type = data &&  data.data &&  data.data[`common-masters`] && data.data[`common-masters`]["HierarchyType"] && data.data[`common-masters`]["HierarchyType"][0];





  const selectCity = async (city) => {
    return;
  };


  useEffect(() => {
    const data = consumerDetails.map((e) => {
      return e;
    });
    onSelect(config?.key, data);
  }, [consumerDetails]);


  const commonProps = {
    focusIndex,
    allOwners: consumerDetails,
    setFocusIndex,
    formData,
    formState,
    t,
    setError,
    clearErrors,
    config,
    setconsumerDetails,
    isEdit,
    setIsErrors,
    isErrors,
    consumerDetails,
  };

  return (
    <React.Fragment>
      {consumerDetails.map((consumerdetail, index) => (
        <OwnerForm1 key={consumerdetail.key} index={index} consumerdetail={consumerdetail} {...commonProps} />
      ))}
    </React.Fragment>
  );
};

const OwnerForm1 = (_props) => {
  const {
    consumerdetail,
    index,
    focusIndex,
    allOwners,
    setFocusIndex,
    t,
    formData,
    config,
    setError,
    clearErrors,
    formState,
    setconsumerDetails,
    isEdit,
    consumerDetails,
    setIsErrors,
    isErrors,
  } = _props;

  const { control, formState: localFormState, watch, setError: setLocalError, clearErrors: clearLocalErrors, setValue, trigger, getValues } = useForm();
  const formValue = watch();
  const { errors, touchedFields } = localFormState;
  const submitAttempted = sessionStorage.getItem("mcollectSubmitAttempted") === "true";
const fieldGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  columnGap: "24px",
  rowGap: "20px",
};
const stackedPairStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
};

const labelStyle = {
  marginBottom: "6px",
  whiteSpace: "nowrap",
  textAlign: "left",     // ✅ FIX
  width: "100%",         // ✅ IMPORTANT
};

  

  useEffect(() => {
    trigger();
  }, []);

  useEffect(() => {
    if (formState?.submitCount > 0 || formState?.isSubmitted) {
      trigger();
    }
  }, [formState?.submitCount, formState?.isSubmitted]);

  useEffect(() => {
    if(Object.entries(formValue).length>0){
    const keys = Object.keys(formValue);
    const part = {};
    keys.forEach((key) => (part[key] = consumerdetail[key]));
    if (!_.isEqual(formValue, part)) {
      Object.keys(formValue).map(data => {
        if (data != "key" && formValue[data] != undefined && formValue[data] != "" && formValue[data] != null && !isErrors) {
          setIsErrors(true);
        }
      });
      let ob =[{...formValue}];
      let mcollectFormValue = JSON.parse(sessionStorage.getItem("mcollectFormData"));
      mcollectFormValue = {...mcollectFormValue,...ob[0]}
      sessionStorage.setItem("mcollectFormData",JSON.stringify(mcollectFormValue));
      setconsumerDetails(ob);
      trigger();
    }
    }
  }, [formValue]);


  useEffect(() => {
    if (Object.keys(errors).length && !_.isEqual(formState.errors[config.key]?.type || {}, errors)) {
      setError(config.key, { type: errors });
    }
    else if (!Object.keys(errors).length && formState.errors[config.key] && isErrors) {
      clearErrors(config.key);
    }
  }, [errors]);

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };
  return (
  <div>

    <CardSectionHeader>{t("UC_CONSUMER_DETAILS")}</CardSectionHeader>

    <div style={fieldGridStyle}>

      {/* Consumer Name */}
      <div>
        <LabelFieldPair style={stackedPairStyle}>
          <CardLabel style={labelStyle}>
            {t("UC_CONS_NAME_LABEL")} <span style={{ color: "red" }}>*</span>
          </CardLabel>


<div style={{ width: "100%" }}>
             <Controller
              control={control}
              name="ConsumerName"
              defaultValue={consumerdetail?.ConsumerName}
              rules={{
                required: t("REQUIRED_FIELD"),
                validate: {
                  pattern: (val) =>
                    /^[a-zA-Z ]*$/.test(val)
                      ? true
                      : t("CS_ADDCOMPLAINT_NAME_ERROR"),
                },
              }}
              render={(props) => (
                <TextInput
                
  style={{ height: "40px" }}   // ✅ reduce height

                  value={props.value}
                  onChange={(e) => props.onChange(e.target.value)}
                  disable={isEdit}
                />
              )}
            />
          </div>
        </LabelFieldPair>

        <CardLabelError style={{ fontSize: "12px" }}>
          {(submitAttempted || formState?.submitCount > 0) &&
            errors?.ConsumerName?.message}
        </CardLabelError>
      </div>

      {/* Mobile Number */}
      <div>
        <LabelFieldPair style={stackedPairStyle}>
          <CardLabel style={labelStyle}>
            {t("UC_MOBILE_NUMBER")} <span style={{ color: "red" }}>*</span>
          </CardLabel>


<div style={{ width: "100%" }}>
        <Controller
              control={control}
              name="mobileNumber"
              defaultValue={consumerdetail?.mobileNumber}
              rules={{
                required: t("REQUIRED_FIELD"),
                validate: (v) =>
                  /^[6789]\d{9}$/.test(v)
                    ? true
                    : t("CORE_COMMON_MOBILE_ERROR"),
              }}
              render={(props) => (
                <MobileNumber
                
  style={{ height: "40px" }}   // ✅ reduce height

                  value={props.value}
                  onChange={(e) => props.onChange(e)}
                  disable={isEdit}
                />
              )}
            />
          </div>
        </LabelFieldPair>

        <CardLabelError style={{ fontSize: "12px" }}>
          {(submitAttempted || formState?.submitCount > 0) &&
            errors?.mobileNumber?.message}
        </CardLabelError>
      </div>

      {/* Email */}
      <div>
        <LabelFieldPair style={stackedPairStyle}>
          <CardLabel style={labelStyle}>
            {t("UC_EMAIL_ID")}
          </CardLabel>


<div style={{ width: "100%" }}>
        <Controller
              control={control}
              name="emailId"
              defaultValue={consumerdetail?.emailId}
              rules={{
                validate: {
                  pattern: (val) =>
                    !val || /^[a-zA-Z0-9._%+-]+@[a-z.-]+\.(com|org|in)$/.test(val)
                      ? true
                      : t("CS_ADDCOMPLAINT_EMAIL_ERROR"),
                },
              }}
              render={(props) => (
                <TextInput
                
  style={{ height: "40px" }}   // ✅ reduce height

                  value={props.value}
                  onChange={(e) => props.onChange(e.target.value)}
                  disable={isEdit}
                />
              )}
            />
          </div>
        </LabelFieldPair>

        {errors?.emailId && (touchedFields?.emailId || submitAttempted || formState?.submitCount > 0) && (
          <CardLabelError style={{ fontSize: "12px" }}>
            {errors.emailId.message}
          </CardLabelError>
        )}
      </div>

    </div>

  </div>
);

};
export default ConsumerDetails;