import React, { useEffect, useState } from "react";
import { FormStep, TextInput, CardLabel, RadioButtons, LabelFieldPair, Dropdown, Menu, MobileNumber, CardLabelError } from "@upyog/digit-ui-react-components";
import { cardBodyStyle } from "../utils";
import { useLocation, useRouteMatch } from "react-router-dom";
import { stringReplaceAll } from "../utils";
import { Controller, useForm } from "react-hook-form";
import _ from "lodash";

const PropertyAssemblyDetails = ({ t, config, onSelect, userType, formData, formState, ownerIndex, setError, clearErrors }) => {  
  const [assemblyDetails, setAssemblyDetails] = React.useState({
    ...formData.assemblyDet,
    'BuildingType': formData?.PropertyType,
    'floorarea': formData?.landArea,
    'constructionArea': formData?.constructionArea,
    'usageCategoryMajor': formData?.usageCategoryMajor && formData?.usageCategoryMajor?.code === "NONRESIDENTIAL.OTHERS"
    ? { code: `${formData?.usageCategoryMajor?.code}`, i18nKey: `PROPERTYTAX_BILLING_SLAB_OTHERS` }
    : formData?.usageCategoryMajor
  });
  const [focusField, setFocusField] = React.useState("");
  const stateId = Digit.ULBService.getStateId();
  const [isErrors, setIsErrors] = useState(false);
  const isMobile = window.Digit.Utils.browser.isMobile();
  
  let proptype = [];

  const { data: Menu = {}, isLoading } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "PTPropertyType") || {};
  proptype = Menu?.PropertyTax?.PropertyType;

  const { data: Menu1 = {}, isLoading: menuLoading } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "UsageCategory") || {};
  let usagecat = [];
  usagecat = Menu1?.PropertyTax?.UsageCategory || [];

  // let index = 0;
  // let assemblyDet = formData.assemblyDet;
  // const assemblyDetStep = { ...assemblyDet, ...assemblyDetails };

  function getPropertyTypeMenu(proptype) {
    if (userType === "employee") {
      return proptype
        ?.filter((e) => e.code === "VACANT" || e.code.split(".").length > 1)
        ?.map((item) => ({ i18nKey: "COMMON_PROPTYPE_" + stringReplaceAll(item?.code, ".", "_"), code: item?.code }))
        ?.sort((a, b) => a.i18nKey.split("_").pop().localeCompare(b.i18nKey.split("_").pop()));
    } else {
      if (Array.isArray(proptype) && proptype.length > 0) {
        for (i = 0; i < proptype.length; i++) {
          if (i != 1 && i != 4 && Array.isArray(proptype) && proptype.length > 0)
            menu.push({ i18nKey: "COMMON_PROPTYPE_" + stringReplaceAll(proptype[i].code, ".", "_"), code: proptype[i].code });
        }
      }
      menu.sort((a, b) => a.i18nKey.split("_").pop().localeCompare(b.i18nKey.split("_").pop()));
      return menu;
    }
  }

  function usageCategoryMajorMenu(usagecat) {
    if (userType === "employee") {
      const catMenu = usagecat
        ?.filter((e) => e?.code.split(".").length <= 2 && e.code !== "NONRESIDENTIAL")
        ?.map((item) => {
          const arr = item?.code.split(".");
          if (arr.length == 2) return { i18nKey: "PROPERTYTAX_BILLING_SLAB_" + arr[1], code: item?.code };
          else return { i18nKey: "PROPERTYTAX_BILLING_SLAB_" + item?.code, code: item?.code };
        });
      return catMenu;
    } else {
      for (i = 0; i < 10; i++) {
        if (
          Array.isArray(usagecat) &&
          usagecat.length > 0 &&
          usagecat[i].code.split(".")[0] == "NONRESIDENTIAL" &&
          usagecat[i].code.split(".").length == 2
        ) {
          menu.push({ i18nKey: "PROPERTYTAX_BILLING_SLAB_" + usagecat[i].code.split(".")[1], code: usagecat[i].code });
        }
      }
      return menu;
    }
  }

  const { control, formState: { errors, touched }, trigger, watch, setError: setLocalError, clearErrors: clearLocalErrors, setValue, getValues } = useForm();
  const formValue = watch();
  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };

  React.useEffect(() => {
    let hasErrors = false;
    const part = {};

    Object.keys(assemblyDetails).forEach((key) => {
      part[key] = formValue?.[key];
    });

    if (!_.isEqual(part, assemblyDetails)) {
      Object.keys(assemblyDetails).forEach((key) => {
        if (assemblyDetails[key]) {
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
    onSelect(config?.key, assemblyDetails);
  }, [assemblyDetails]);

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
      <div style={ptSectionTitleStyle}>{t("PT_ASSEMBLY_DET") || "Property Assembly Details"}</div>

      {/* Row 1: Property Type + Total Land Area */}
      <div style={rowStyle}>
        <div style={col6}>
          <label style={labelStyle}>{t("PT_PROP_TYPE")}<span style={requiredMark}>*</span></label>
          <Controller
            name="BuildingType"
            control={control}
            defaultValue={assemblyDetails?.BuildingType}
            rules={{ required: t("REQUIRED_FIELD") }}
            key={config?.key}
            render={(props) => (
              <Dropdown
                selected={getPropertyTypeMenu(proptype)?.length === 1 ? getPropertyTypeMenu(proptype)[0] : assemblyDetails?.BuildingType}
                disable={getPropertyTypeMenu(proptype)?.length === 1}
                option={getPropertyTypeMenu(proptype)}
                autoFocus={focusField === "BuildingType"}
                select={(value) => {
                  props.onChange(value);
                  setAssemblyDetails({ ...assemblyDetails, ['BuildingType']: value });
                  setFocusField("BuildingType");
                }}
                optionKey="i18nKey"
                onBlur={props?.onBlur}
                t={t}
              />
            )}
          />
          <CardLabelError style={errorMsgStyle}>{touched?.BuildingType ? errors?.BuildingType?.message : ""}</CardLabelError>
        </div>

        <div style={col6}>
          <label style={labelStyle}>{t("PT_TOT_LAND_AREA")}<span style={requiredMark}>*</span></label>
          <Controller
            name="floorarea"
            control={control}
            defaultValue={assemblyDetails?.floorarea}
            rules={{
              required: t("REQUIRED_FIELD"),
              validate: (val) => /^([0-9]){0,8}$/i.test(val) ? true : t("PT_TOT_LAND_AREA_ERROR_MESSAGE"),
            }}
            key={config?.key}
            render={(props) => (
              <TextInput
                t={t}
                type={"number"}
                isMandatory={false}
                optionKey="i18nKey"
                name="totLandArea"
                value={props?.value}
                autoFocus={focusField === "floorarea"}
                onChange={(ev) => {
                  props?.onChange(ev.target.value);
                  setAssemblyDetails({ ...assemblyDetails, ['floorarea']: ev.target.value });
                  setFocusField("floorarea");
                }}
                onBlur={props?.onBlur}
              />
            )}
          />
          <CardLabelError style={errorMsgStyle}>{touched?.floorarea ? errors?.floorarea?.message : ""}</CardLabelError>
        </div>
      </div>

      {/* Row 2: Construction Area + Usage Category */}
      <div style={rowStyle}>
        <div style={col6}>
          <label style={labelStyle}>{t("PT_TOT_CONSTRUCTION_AREA")}<span style={requiredMark}>*</span></label>
          <Controller
            name="constructionArea"
            control={control}
            defaultValue={assemblyDetails?.constructionArea}
            key={config?.key}
            rules={{
              required: t("REQUIRED_FIELD"),
              validate: (val) =>
                /^([0-9]){0,8}$/i.test(val) && assemblyDetails?.floorarea && parseInt(val) <= parseInt(assemblyDetails?.floorarea)
                  ? true
                  : t("PT_TOT_CONSTRUCTION_AREA_ERROR_MESSAGE"),
            }}
            render={(props) => (
              <TextInput
                t={t}
                type={"number"}
                isMandatory={false}
                optionKey="i18nKey"
                name="totConstructionArea"
                value={props?.value}
                autoFocus={focusField === "constructionArea"}
                onChange={(ev) => {
                  props?.onChange(ev.target.value);
                  setFocusField("constructionArea");
                  setAssemblyDetails({ ...assemblyDetails, ['constructionArea']: ev.target.value });
                }}
                onBlur={props?.onBlur}
              />
            )}
          />
          <CardLabelError style={errorMsgStyle}>{touched?.constructionArea ? errors?.constructionArea?.message ? t("BUILTUP_AREA_MORE_THAN_TOTAL_AREA_ERROR") : "" : ""}</CardLabelError>
        </div>

        <div style={col6}>
          <label style={labelStyle}>{t("PT_ASSESMENT_INFO_USAGE_TYPE")}<span style={requiredMark}>*</span></label>
          <Controller
            name="usageCategoryMajor"
            defaultValue={assemblyDetails?.usageCategoryMajor}
            rules={{ required: t("REQUIRED_FIELD") }}
            control={control}
            key={config?.key}
            render={(props) => (
              <Dropdown
                selected={props?.value}
                disable={usageCategoryMajorMenu(usagecat)?.length === 1}
                option={usageCategoryMajorMenu(usagecat)}
                autoFocus={focusField === "usageCategoryMajor"}
                select={(value) => {
                  props?.onChange(value);
                  setFocusField("usageCategoryMajor");
                  setAssemblyDetails({ ...assemblyDetails, ['usageCategoryMajor']: value });
                }}
                optionKey="i18nKey"
                onBlur={props?.onBlur}
                t={t}
              />
            )}
          />
          <CardLabelError style={errorMsgStyle}>{touched?.usageCategoryMajor ? errors?.usageCategoryMajor?.message : ""}</CardLabelError>
        </div>
      </div>
    </div>
  );
};

export default PropertyAssemblyDetails;
