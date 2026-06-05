import { Dropdown, FormComposer, InfoBannerIcon, Loader, Localities, RadioButtons, Toast } from "@upyog/digit-ui-react-components";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory ,Link} from "react-router-dom";

const description = {
  description: "PT_SEARCH_OR_DESC",
  descriptionStyles: {
    fontWeight: "300",
    color: "#505A5F",
    marginTop: "0px",
    textAlign: "center",
    marginBottom: "20px",
    maxWidth: "540px",
  },
};

const SearchProperty = ({ config: propsConfig, onSelect, redirectToUrl }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { action = 0 } = Digit.Hooks.useQueryParams();
  const [searchData, setSearchData] = useState({});
  const [showToast, setShowToast] = useState(null);
  const [uiCity, setUiCity] = useState(null);
  const [uiLocality, setUiLocality] = useState(null);
  const [uiCityCode, setUiCityCode] = useState(undefined);
  const [uiMobile, setUiMobile] = useState("");
  const [uiPropertyId, setUiPropertyId] = useState("");
  const [uiOldPropertyId, setUiOldPropertyId] = useState("");
  const [uiDoorNo, setUiDoorNo] = useState("");
  const [uiOwnerName, setUiOwnerName] = useState("");
  sessionStorage.setItem("VisitedCommonPTSearch",true);
  sessionStorage.setItem("VisitedLightCreate",false);
  let allCities = Digit.Hooks.pt.useTenants()?.sort((a, b) => a?.i18nKey?.localeCompare?.(b?.i18nKey));
  // if called from tl module get tenants from tl usetenants
  allCities = allCities ? allCities : Digit.Hooks.tl.useTenants()?.sort((a, b) => a?.i18nKey?.localeCompare?.(b?.i18nKey));  
  
  if(window.location.href.includes("obps") )
  {
    allCities = Digit.SessionStorage.get("OBPS_TENANTS")
  }
  else if(window.location.href.includes("fsm") )
  {
    allCities = [
      {
          "i18nKey": "TENANT_TENANTS_PG_CITYA",
          "code": "pg.citya",
          "name": "City A",
          "description": "City A",
          "pincode": [
              143001,
              143002,
              143003,
              143004,
              143005
          ],
          "logoId": "https://in-egov-assets.s3.ap-south-1.amazonaws.com/in.citya/logo.png",
          "imageId": null,
          "domainUrl": "https://www.upyog.niua.org",
          "type": "CITY",
          "twitterUrl": null,
          "facebookUrl": null,
          "emailId": "citya@gmail.com",
          "OfficeTimings": {
              "Mon - Fri": "9.00 AM - 6.00 PM"
          },
          "city": {
              "name": "City A",
              "localName": null,
              "districtCode": "CITYA",
              "districtName": null,
              "districtTenantCode": "pg.citya",
              "regionName": null,
              "ulbGrade": "Municipal Corporation",
              "longitude": 75.5761829,
              "latitude": 31.3260152,
              "shapeFileLocation": null,
              "captcha": null,
              "code": "1013",
              "ddrName": "DDR A"
          },
          "address": "City A Municipal Corporation",
          "contactNumber": "001-2345876"
      },
      {
          "i18nKey": "TENANT_TENANTS_PG_CITYB",
          "code": "pg.cityb",
          "name": "City B",
          "description": null,
          "pincode": [
              143006,
              143007,
              143008,
              143009,
              143010
          ],
          "logoId": "https://in-egov-assets.s3.ap-south-1.amazonaws.com/in.citya/logo.png",
          "imageId": null,
          "domainUrl": "https://www.upyog.niua.org",
          "type": "CITY",
          "twitterUrl": null,
          "facebookUrl": null,
          "emailId": "cityb@gmail.com",
          "OfficeTimings": {
              "Mon - Fri": "9.00 AM - 6.00 PM",
              "Sat": "9.00 AM - 12.00 PM"
          },
          "city": {
              "name": "City B",
              "localName": null,
              "districtCode": "CITYB",
              "districtName": null,
              "districtTenantCode": "pg.cityb",
              "regionName": null,
              "ulbGrade": "Municipal Corporation",
              "longitude": 74.8722642,
              "latitude": 31.6339793,
              "shapeFileLocation": null,
              "captcha": null,
              "code": "107",
              "ddrName": "DDR B"
          },
          "address": "City B Municipal Corporation Address",
          "contactNumber": "0978-7645345",
          "helpLineNumber": "0654-8734567"
      },
      {
          "i18nKey": "TENANT_TENANTS_PG_CITYC",
          "code": "pg.cityc",
          "name": "City C",
          "description": null,
          "logoId": "https://in-egov-assets.s3.ap-south-1.amazonaws.com/in.citya/logo.png",
          "imageId": null,
          "domainUrl": "https://www.upyog.niua.org",
          "type": "CITY",
          "twitterUrl": null,
          "facebookUrl": null,
          "emailId": "cityc@gmail.com",
          "OfficeTimings": {
              "Mon - Fri": "9.00 AM - 6.00 PM",
              "Sat": "9.00 AM - 12.00 PM"
          },
          "city": {
              "name": "City C",
              "localName": null,
              "districtCode": "CITYC",
              "districtName": null,
              "districtTenantCode": "pg.cityc",
              "regionName": null,
              "ulbGrade": "Municipal Corporation",
              "longitude": 73.8722642,
              "latitude": 31.6339793,
              "shapeFileLocation": null,
              "captcha": null,
              "code": "108",
              "ddrName": "DDR C"
          },
          "address": "City C Municipal Corporation Address",
          "contactNumber": "0978-7645345",
          "helpLineNumber": "0654-8734567"
      }
  ]
    
  }
  console.log("allCities",allCities)
  const [cityCode, setCityCode] = useState();
  const [formValue, setFormValue] = useState();
  const [errorShown, seterrorShown] = useState(false);
  let isMobile = window.Digit.Utils.browser.isMobile();
  const { data: propertyData, isLoading: propertyDataLoading, error, isSuccess, billData } = Digit.Hooks.pt.usePropertySearchWithDue({
    tenantId: searchData?.city,
    filters: searchData?.filters,
    auth: true /*  to enable open search set false  */,
    configs: { enabled: Object.keys(searchData).length > 0, retry: false, retryOnMount: false, staleTime: Infinity },
  });

  useEffect(() => {
    if ( !(searchData?.filters?.mobileNumber && Object.values(searchData?.filters)?.filter(ob => ob !== undefined)?.length == 1) && 
      propertyData?.Properties.length > 0 &&
      ptSearchConfig?.maxResultValidation &&
      propertyData?.Properties.length > ptSearchConfig?.maxPropertyResult &&
      !errorShown
    ) {
      setShowToast({ error: true, warning: true, label: "ERR_PLEASE_REFINED_UR_SEARCH" });
    }
  }, [propertyData]);

  useEffect(() => {
    showToast && showToast?.label !== "ERR_PLEASE_REFINED_UR_SEARCH" && showToast?.label !== "NO_PROPERTIES_FOUND" && setShowToast(null);
  }, [action, propertyDataLoading]);

  useEffect(() => {
    if(!propertyDataLoading && propertyData && searchData && propertyData?.Properties?.length <= 0)
    {
      setShowToast({ error: true, warning: true, label: "NO_PROPERTIES_FOUND" });
    }
  },[propertyData?.Properties?.[0]?.propertyId, propertyDataLoading])

  useLayoutEffect(() => {
    //Why do we need this? !!!!!
    const getActionBar = () => {
      let el = document.querySelector("div.action-bar-wrap");
      if (el) {
        el.style.position = "static";
        el.style.padding = "8px 0";
        el.style.boxShadow = "none";
        el.style.marginBottom = "16px";
        el.style.textAlign = "left";
        el.style.zIndex = "0";
      } else {
        setTimeout(() => {
          getActionBar();
        }, 100);
      }
    };
    getActionBar();
  }, []);

  const { data: ptSearchConfig, isLoading } = Digit.Hooks.pt.useMDMS(Digit.ULBService.getStateId(), "DIGIT-UI", "HelpText", {
    select: (data) => {
      return data?.["DIGIT-UI"]?.["HelpText"]?.[0]?.PT;
    },
  });

  const [mobileNumber, property, oldProperty, name, doorNumber] = propsConfig.inputs;

  const config = [
    {
      body: [
        {
          type: "custom",
          populators: {
            name: "addParam",
            defaultValue: { code: 0, name: t('PT_KNOW_PTID') },
            customProps: {
              t,
              isMandatory: true,
              optionsKey: "name",
              options: [
                { code: 0, name: t('PT_KNOW_PTID') },
                { code: 1, name: t('PT_SEARCH_DOOR_NO') },
              ],
            },
            component: (props, customProps) => (
              <RadioButtons
                {...customProps}
                selectedOption={props.value}
                onSelect={(d) => {
                  props?.setValue("city", {});
                  props?.setValue("locality", {});
                  props?.setValue("mobileNumber", "");
                  props?.setValue("propertyIds", "");
                  props?.setValue("doorNumber", "");
                  props?.setValue("oldPropertyId", "");
                  props?.setValue("name", "");
                  history.replace(`${history.location.pathname}?action=${action == 0 ? 1 : 0}`);
                }}
              />
            ),
          },
        },
        {
          label: "PT_SELECT_CITY",
          isMandatory: true,
          type: "custom",
          populators: {
            name: "city",
            defaultValue: null,
            rules: { required: true },
            customProps: { t, isMandatory: true, option: [...allCities], optionKey: "i18nKey" },
            component: (props, customProps) => (
              <Dropdown
                {...customProps}
                selected={props.value}
                select={(d) => {
                  "pg.citya"              
                  if (d.code !== cityCode) props.setValue("locality", null);
                  props.onChange(d);
                }}
              />
            ),
          },
        },
        {
          label: t("PT_PROVIDE_ONE_MORE_PARAM"),
          isInsideBox: true,
          placementinbox: 0,
          isSectionText : true,
        },
        {
          label: mobileNumber.label,
          type: mobileNumber.type,
          populators: {
            defaultValue: "",
            name: mobileNumber.name,
            validation: mobileNumber?.validation,
          },
          ...description,
          isMandatory: false,
          isInsideBox: true,
          placementinbox: 1
        },
        {
          label: "",
          labelChildren: (
            <div className="tooltip" /* style={{position:"relative"}} */>
              <div style={{display: "flex", /* alignItems: "center", */ gap: "0 4px"}}>
              <h2>{t(property.label)}</h2>
              <InfoBannerIcon fill="#0b0c0c" />
              <span className="tooltiptext" style={{ position:"absolute",width:"72%", marginLeft:"50%", fontSize:"medium" }}>
              {t(property.description) + " " + "PG-PT-xxxx-xxxxxx"}
              </span>
              </div>
            </div>
          ),
          type: property.type,
          populators: {
            name: property.name,
            defaultValue: "",
            validation: property?.validation,
          },
          ...description,
          isMandatory: false,
          isInsideBox: true,
          placementinbox: 1
        },
        {
          label: oldProperty.label,
          type: oldProperty.type,
          populators: {
            name: oldProperty.name,
            defaultValue: "",
            validation: oldProperty?.validation,
          },
          isMandatory: false,
          isInsideBox: true,
          placementinbox: 2
        },
      ],
      body1: [
        {
          type: "custom",
          populators: {
            name: "addParam1",
            defaultValue: { code: 1, name: t('PT_SEARCH_DOOR_NO') },
            customProps: {
              t,
              isMandatory: true,
              optionsKey: "name",
              options: [
                { code: 0, name: t('PT_KNOW_PTID') },
                { code: 1, name: t('PT_SEARCH_DOOR_NO') },
              ],
            },
            component: (props, customProps) => (
              <RadioButtons
                {...customProps}
                selectedOption={props.value}
                onSelect={(d) => {
                  props?.setValue("city", {});
                  props?.setValue("locality", {});
                  props?.setValue("mobileNumber", "");
                  props?.setValue("propertyIds", "");
                  props?.setValue("doorNumber", "");
                  props?.setValue("oldPropertyId", "");
                  props?.setValue("name", "");
                  history.replace(`${history.location.pathname}?action=${action == 0 ? 1 : 0}`);
                }}
              />
            ),
          },
        },
        {
          label: "PT_SELECT_CITY",
          isMandatory: true,
          type: "custom",
          populators: {
            name: "city",
            defaultValue: null,
            rules: { required: true },
            customProps: { t, isMandatory: true, option: [...allCities], optionKey: "i18nKey" },
            component: (props, customProps) => (
              <Dropdown
                {...customProps}
                selected={props.value}
                select={(d) => {
                  Digit.LocalizationService.getLocale({
                    modules: [`rainmaker-${props?.value?.code}`],
                    locale: Digit.StoreData.getCurrentLanguage(),
                    tenantId: `${props?.value?.code}`,
                  });
                  if (d.code !== cityCode) props.setValue("locality", null);
                  props.onChange(d);
                }}
              />
            ),
          },
        },
        {
          label: "PT_SELECT_LOCALITY",
          type: "custom",
          isMandatory: true,
          populators: {
            name: "locality",
            defaultValue: "",
            rules: { required: true },
            customProps: {},
            component: (props, customProps) => (
              <Localities
                selectLocality={(d) => {
                  props.onChange(d);
                }}
                tenantId={cityCode}
                boundaryType="revenue"
                keepNull={false}
                optionCardStyles={{ height: "600px", overflow: "auto", zIndex: "10", maxHeight: "300px" }}
                selected={formValue?.locality}
                disable={!cityCode}
                disableLoader={true}
              />
            ),
          },
        },
        {
          label: t("PT_PROVIDE_ONE_MORE_PARAM"),
          isInsideBox: true,
          placementinbox: 0,
          isSectionText : true,
        },
        {
          label: doorNumber.label,
          type: doorNumber.type,
          populators: {
            defaultValue: "",
            name: doorNumber.name,
            validation: doorNumber?.validation,
          },
          isMandatory: false,
          isInsideBox: true,
          placementinbox: 1,
        },
        {
          label: name.label,
          type: name.type,
          populators: {
            defaultValue: "",
            name: name.name,
            validation: name?.validation,
          },
          isMandatory: false,
          isInsideBox: true,
          placementinbox: 2,
        },
      ],
    },
  ];

  const onPropertySearch = async (data) => {
    if (
      ptSearchConfig?.maxResultValidation &&
      propertyData?.Properties.length > 0 &&
      propertyData?.Properties.length > ptSearchConfig?.maxPropertyResult &&
      errorShown
    ) {
      seterrorShown(true);
      return;
    }
    if (!data?.city?.code) {
      setShowToast({ error: true, label: "ERR_PT_FILL_VALID_FIELDS" });
      return;
    }
   
    if (action == 0) {
      if (!(data?.mobileNumber || data?.propertyIds || data?.oldPropertyId)) {
        setShowToast({ error: true, label: "ERR_PT_FILL_VALID_FIELDS" });
        return;
      }
      if (data?.mobileNumber && !data.mobileNumber?.match(mobileNumber?.validation?.pattern?.value)) {
        setShowToast({ error: true, label: mobileNumber?.validation?.pattern?.message });
        return;
      }
      if (data?.propertyIds && !data.propertyIds?.match(property?.validation?.pattern?.value)) {
        setShowToast({ error: true, label: property?.validation?.pattern?.message });
        return;
      }
      if (data?.oldPropertyId && !data.oldPropertyId?.match(oldProperty?.validation?.pattern?.value)) {
        setShowToast({ error: true, label: oldProperty?.validation?.pattern?.message });
        return;
      }
    } else {
      if (!data?.locality?.code) {
        setShowToast({ error: true, label: "ERR_PT_FILL_VALID_FIELDS" });
        return;
      }
      if (!(data?.doorNumber || data?.name)) {
        setShowToast({ error: true, label: "ERR_PT_FILL_VALID_FIELDS" });
        return;
      }

      if (data?.name && !data.name?.match(name?.validation?.pattern?.value)) {
        setShowToast({ error: true, label: name?.validation?.pattern?.message });
        return;
      }
      if (data?.doorNumber && !data.doorNumber?.match(doorNumber?.validation?.pattern?.value)) {
        setShowToast({ error: true, label: doorNumber?.validation?.pattern?.message });
        return;
      }
    }


    if (showToast?.label !== "ERR_PLEASE_REFINED_UR_SEARCH" || showToast?.label !== "NO_PROPERTIES_FOUND") setShowToast(null);
    if (data?.doorNumber && data?.doorNumber !== "" && data?.propertyIds !== "") {
      data["propertyIds"] = "";
    }

    let tempObject = Object.keys(data)
      .filter((k) => data[k])
      .reduce((acc, key) => ({ ...acc, [key]: typeof data[key] === "object" ? data[key].code : data[key] }), {});
    let city = tempObject.city;
    tempObject.doorNo = tempObject.doorNumber || tempObject?.doorNo;
    delete tempObject.addParam;
    delete tempObject.addParam1;
    delete tempObject.city;
    if(action === "0")
    {
      tempObject = { 
        oldPropertyId : tempObject?.oldPropertyId,
        mobileNumber : tempObject?.mobileNumber,
        propertyIds : tempObject?.propertyIds,
      }
    }
    else if(action === "1")
    {
      tempObject = {
        name : tempObject?.name,
        doorNo : tempObject?.doorNumber || tempObject?.doorNo,
        locality : tempObject?.locality,
      }
    }
    setSearchData({ city: city, filters: tempObject });

    return;
  };
 const onFormValueChange = (setValue, data, formState) => {
    const mobileNumberLength = data?.[mobileNumber.name]?.length;
    const oldPropId = data?.[oldProperty.name];
    const propId = data?.[property.name];
    const city = data?.city || allCities[0];
console.log("citycity",city)
setCityCode(city.code);
    // if ((city!=null && Object.keys(city).length !=0) && !(mobileNumberLength > 0 || oldPropId!="" || propId!="")){
    //   setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS" });
    // }

    // if (mobileNumberLength > 0 || oldPropId!="" || propId!="") {
    // setShowToast(null);
    // }
    // if (city!=null && Object.keys(city).length !=0 && (mobileNumberLength > 0 || oldPropId!="" || propId!="")){
    //   setShowToast(null)
    // }
    const locality = data?.locality;
    if (city?.code !== cityCode) {
      setCityCode(city?.code);
    }

    if (!_.isEqual(data, formValue)) {
      setFormValue(data);
    }

    if (!locality || !city) {
      return;
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  let validation = ptSearchConfig?.maxResultValidation && !(searchData?.filters?.mobileNumber && Object.values(searchData?.filters)?.filter(ob => ob !== undefined)?.length == 1)   ? propertyData?.Properties.length<ptSearchConfig?.maxPropertyResult && (showToast == null || (showToast !== null && !showToast?.error)) : true;

  if (propertyData && !propertyDataLoading && !error && validation) {
    let qs = {};
    qs = { ...searchData.filters, city: searchData.city };

    if ( !(searchData?.filters?.mobileNumber && Object.values(searchData?.filters)?.filter(ob => ob !== undefined)?.length == 1) && 
      ptSearchConfig?.ptSearchCount &&
      searchData?.filters?.locality &&
      propertyDataLoading &&
      propertyDataLoading?.Properties?.length &&
      propertyDataLoading.Properties.length > ptSearchConfig?.ptSearchCount
    ) {
      !showToast && setShowToast({ error: true, label: "PT_MODIFY_SEARCH_CRITERIA" });
    } else if (propsConfig.action === "MUTATION") {
      onSelect(propsConfig.key, qs, null, null, null, {
        queryParams: { ...qs },
      });
    } else {
      // beacuse of this commit 
      // https://github.com/egovernments/DIGIT-Dev/commit/2bae1c36dd1f8242bca30366da80c88d46b6aaaa#diff-3c34510e8b422f53eb9633d014f50024496ad79f952849e1b42fd61877562c4cR385
      // am adding one more condtion for this. 
      if(redirectToUrl || window.location.href.includes("digit-ui/citizen/commonpt/property/citizen-search")) {
        history.push(
          `/digit-ui/citizen/commonPt/property/search-results?${Object.keys(qs)
            .map((key) => `${key}=${qs[key]}`)
            .join("&")}${redirectToUrl ? `&redirectToUrl=${redirectToUrl}` : ''}`
        );
      } else {
        let SearchParams = {};
        if(action == 0)
        SearchParams = {
            city : qs?.city,
            mobileNumber : qs?.mobileNumber || "",
            propertyIds : qs?.propertyIds || "",
            oldPropertyIds : qs?.oldPropertyIds || "", 
            locality : "",
            doorNo : "",
            name : "",
        }
        else
        SearchParams = {
          city : qs?.city,
          locality : qs?.locality || "",
          doorNo : qs?.doorNumber || qs?.doorNo || "",
          name : qs?.name || "",
          mobileNumber : "",
          propertyIds : "",
          oldPropertyIds : "", 
        }
        //onSelect('cptSearchQuery',{...SearchParams});
        !propertyDataLoading && propertyData?.Properties?.length > 0 && onSelect('cptSearchQuery', SearchParams, null, null, null, {
          queryParams: { ...SearchParams },
        });
      }
    }
  }

  if (error) {
    !showToast && setShowToast({ error: true, label: error?.response?.data?.Errors?.[0]?.code || error });
  }
  if (action == 1) {
    config[0].body = [...config[0].body1];
  }

  /* ── styles ────────────────────────────────────────────────── */
  const sectionCard = { background: "#fff", borderRadius: "14px", border: "1px solid #eaedf3", padding: "20px 24px", boxShadow: "0 1px 6px rgba(26,43,73,0.05)", marginBottom: "16px" };
  const inputStyle = { width: "100%", padding: "11px 14px", border: "1.5px solid #e5e7eb", borderRadius: "9px", fontSize: "14px", color: "#1a2b49", background: "#fafbfc", boxSizing: "border-box", outline: "none", fontFamily: "inherit" };
  const onInputFocus = (e) => { e.target.style.borderColor = "#f47738"; e.target.style.boxShadow = "0 0 0 3px rgba(244,119,56,0.10)"; e.target.style.background = "#fff"; };
  const onInputBlur = (e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; e.target.style.background = "#fafbfc"; };
  const FieldLabel = ({ text }) => (
    <div style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.45px", marginBottom: "7px" }}>{text}</div>
  );
  const SectionHeader = ({ step, title, required }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "16px" }}>
      <span style={{ width: "22px", height: "22px", borderRadius: "7px", background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: "800", flexShrink: 0 }}>{step}</span>
      <span style={{ fontSize: "13px", fontWeight: "700", color: "#374151" }}>{title}{required && <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>}</span>
    </div>
  );

  const currentAction = parseInt(action);

  const handleModeChange = (mode) => {
    setUiCity(null); setUiLocality(null); setUiCityCode(undefined);
    setUiMobile(""); setUiPropertyId(""); setUiOldPropertyId(""); setUiDoorNo(""); setUiOwnerName("");
    history.replace(`${history.location.pathname}?action=${mode}`);
  };

  const handleNewSubmit = () => {
    const data = {
      city: uiCity, locality: uiLocality, mobileNumber: uiMobile,
      propertyIds: uiPropertyId, oldPropertyId: uiOldPropertyId, doorNumber: uiDoorNo, name: uiOwnerName,
    };
    onPropertySearch(data);
  };

  const isOBPS = window.location.href.includes("/obps/bpa/");

  return (
    <div style={{ minHeight: "60vh", background: "#f5f6fa" }}>
      {/* ── Hero Banner ── */}
      <div style={{ background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)", borderRadius: "12px", padding: isMobile ? "24px 20px 28px" : "28px 32px 32px", marginBottom: "0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: "-60px", top: "-60px", width: "220px", height: "220px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", marginBottom: "4px" }}>
              {isOBPS ? (t("BPA_BUILDING_PERMIT") || "Building Permit") : (t("ACTION_TEST_PROPERTY_TAX") || "Property Tax")}
            </div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#fff", lineHeight: 1.2 }}>{t(propsConfig.texts.header) || "Search Property"}</h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>{t(propsConfig.texts.text) || "Find your property to link with this application"}</p>
          </div>
          {isOBPS && <div style={{ flexShrink: 0, background: "rgba(255,255,255,0.2)", borderRadius: "20px", padding: "6px 16px", fontSize: "12px", fontWeight: "700", color: "#fff", whiteSpace: "nowrap" }}>Step 1 of 3</div>}
        </div>
      </div>

      {/* ── Form Body ── */}
      <div style={{ padding: isMobile ? "20px 16px 48px" : "24px 32px 56px" }}>
        {/* Mode Toggle */}
        <div style={sectionCard}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "12px" }}>{t("PT_HOME_SEARCH_PROPERTY_BY") || "Search Property By"}</div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { code: 0, label: t("PT_KNOW_PT_ID") || "Property ID / Mobile", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
              { code: 1, label: t("PT_KNOW_PT_DETAIL") || "Owner / Address Details", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
            ].map((opt) => {
              const isActive = currentAction === opt.code;
              return (
                <button key={opt.code} type="button" onClick={() => handleModeChange(opt.code)} style={{ flex: 1, minWidth: "160px", padding: "13px 20px", borderRadius: "10px", border: isActive ? "2px solid #f47738" : "2px solid #e5e7eb", background: isActive ? "linear-gradient(135deg, #fff8f4 0%, #fff3ec 100%)" : "#f9fafb", color: isActive ? "#d44f0a" : "#6b7280", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: isActive ? "0 2px 10px rgba(244,119,56,0.18)" : "none" }}>
                  {opt.icon}{opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* City + Locality */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : currentAction === 1 ? "1fr 1fr" : "1fr", gap: "16px", marginBottom: "16px" }}>
          <div style={sectionCard}>
            <SectionHeader step="1" title={t("PT_SELECT_CITY") || "Select City"} required />
            <Dropdown t={t} isMandatory option={allCities} optionKey="i18nKey" selected={uiCity} optionCardStyles={{ maxHeight: "220px", overflowY: "auto", zIndex: 20 }}
              select={(d) => {
                Digit.LocalizationService.getLocale({ modules: [`rainmaker-${d?.code}`], locale: Digit.StoreData.getCurrentLanguage(), tenantId: `${d?.code}` });
                if (d?.code !== uiCityCode) setUiLocality(null);
                setUiCityCode(d?.code); setUiCity(d); setCityCode(d?.code);
              }}
            />
          </div>
          {currentAction === 1 && (
            <div style={sectionCard}>
              <SectionHeader step="2" title={t("PT_SELECT_LOCALITY") || "Select Locality"} required />
              <Localities selectLocality={(d) => setUiLocality(d)} tenantId={uiCityCode} boundaryType="revenue" keepNull={false} optionCardStyles={{ maxHeight: "220px", overflowY: "auto", zIndex: 20 }} selected={uiLocality} disable={!uiCityCode} disableLoader={true} />
            </div>
          )}
        </div>

        {/* Additional fields */}
        <div style={{ ...sectionCard, marginBottom: "20px" }}>
          <SectionHeader step={currentAction === 1 ? "3" : "2"} title={t("PT_PROVIDE_ONE_MORE_PARAM") || "Enter at least one of the following"} />
          {currentAction === 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "18px" }}>
              <div><FieldLabel text={t(mobileNumber.label) || "Mobile Number"} /><input type="tel" value={uiMobile} onChange={(e) => setUiMobile(e.target.value)} placeholder="e.g. 9876543210" style={inputStyle} onFocus={onInputFocus} onBlur={onInputBlur} /></div>
              <div><FieldLabel text={t(property.label) || "Property ID"} /><input type="text" value={uiPropertyId} onChange={(e) => setUiPropertyId(e.target.value)} style={inputStyle} onFocus={onInputFocus} onBlur={onInputBlur} /></div>
              <div><FieldLabel text={t(oldProperty.label) || "Old Property ID"} /><input type="text" value={uiOldPropertyId} onChange={(e) => setUiOldPropertyId(e.target.value)} style={inputStyle} onFocus={onInputFocus} onBlur={onInputBlur} /></div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "18px" }}>
              <div><FieldLabel text={t(doorNumber.label) || "Door / House Number"} /><input type="text" value={uiDoorNo} onChange={(e) => setUiDoorNo(e.target.value)} style={inputStyle} onFocus={onInputFocus} onBlur={onInputBlur} /></div>
              <div><FieldLabel text={t(name.label) || "Owner Name"} /><input type="text" value={uiOwnerName} onChange={(e) => setUiOwnerName(e.target.value)} style={inputStyle} onFocus={onInputFocus} onBlur={onInputBlur} /></div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button type="button" onClick={handleNewSubmit} disabled={propertyDataLoading}
          style={{ width: "100%", padding: "15px 32px", background: propertyDataLoading ? "#d1d5db" : "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "15px", fontWeight: "700", cursor: propertyDataLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: propertyDataLoading ? "none" : "0 4px 20px rgba(244,119,56,0.35)", marginBottom: "16px" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          {propertyDataLoading ? (t("CS_COMMON_SEARCHING") || "Searching...") : (t(propsConfig.texts.submitButtonLabel) || "Search Property")}
        </button>

        {isOBPS && onSkip && (
          <div style={{ textAlign: "center" }}>
            <button type="button" onClick={onSkip} style={{ background: "none", border: "none", color: "#f47738", fontSize: "13px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>{t("CORE_COMMON_SKIP_CONTINUE") || "Skip & Continue"}</button>
          </div>
        )}
        {isOBPS && !onSkip && (
          <div style={{ textAlign: "center" }}>
            <Link to="/digit-ui/citizen/obps/bpa/building_plan_scrutiny/new_construction/location" style={{ color: "#f47738", fontSize: "13px", fontWeight: "700" }}>{t("CORE_COMMON_SKIP_CONTINUE")}</Link>
          </div>
        )}
      </div>

      {showToast && (
        <Toast isDleteBtn={true} error={showToast.error} warning={showToast.warning} label={t(showToast.label)} onClose={() => setShowToast(null)} />
      )}
    </div>
  );
};

SearchProperty.propTypes = {
  loginParams: PropTypes.any,
};

SearchProperty.defaultProps = {
  loginParams: null,
};

export default SearchProperty;