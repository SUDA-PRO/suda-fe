import { InfoBannerIcon, Loader, Localities, RadioButtons, Toast } from "@upyog/digit-ui-react-components";
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

const SearchProperty = ({ config: propsConfig, onSelect, onSkip, redirectToUrl }) => {
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
  allCities = allCities?.length ? allCities : Digit.Hooks.tl.useTenants()?.sort((a, b) => a?.i18nKey?.localeCompare?.(b?.i18nKey));
  // if called from fsm module get tenants from fsm usetenants
  allCities = allCities?.length ? allCities : Digit.Hooks.fsm.useTenants()?.sort((a, b) => a?.i18nKey?.localeCompare?.(b?.i18nKey));
  allCities = allCities || [];

  if(window.location.href.includes("obps") )
  {
    allCities = Digit.SessionStorage.get("OBPS_TENANTS") || [];
  }
  const [cityCode, setCityCode] = useState();
  const [errorShown, seterrorShown] = useState(false);
  const [formCity, setFormCity] = useState(null);
  const [formLocality, setFormLocality] = useState(null);
  const [formMobile, setFormMobile] = useState("");
  const [formPropertyId, setFormPropertyId] = useState("");
  const [formOldPropertyId, setFormOldPropertyId] = useState("");
  const [formDoorNo, setFormDoorNo] = useState("");
  const [formOwnerName, setFormOwnerName] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [localityOpen, setLocalityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [localitySearch, setLocalitySearch] = useState("");


  const [localityList, setLocalityList] = useState([]);
  const [isLocalityLoading, setIsLocalityLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    if (!cityCode) { setLocalityList([]); return; }
    setIsLocalityLoading(true);
    Digit.LocationService.getRevenueLocalities(cityCode)
      .then((res) => {
        if (cancelled) return;
        const tenantBoundary = res?.TenantBoundary?.[0];
        if (!tenantBoundary) { setLocalityList([]); return; }
        const adminCode = tenantBoundary.tenantId.replace(".", "_").toUpperCase() + "_" + tenantBoundary.hierarchyType?.code;
        const localities = (tenantBoundary.boundary || [])
          .filter((b) => b.code)
          .map((b) => ({ ...b, i18nkey: adminCode + "_" + b.code }))
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setLocalityList(localities);
      })
      .catch(() => { if (!cancelled) setLocalityList([]); })
      .finally(() => { if (!cancelled) setIsLocalityLoading(false); });
    return () => { cancelled = true; };
  }, [cityCode]);
  let isMobile = window.Digit.Utils.browser.isMobile();
  const { data: propertyData, isLoading: propertyDataLoading, error, isSuccess, billData } = Digit.Hooks.pt.usePropertySearchWithDue({
    tenantId: searchData?.city,
    filters: searchData?.filters,
    auth: true,
    configs: {
      enabled: Object.keys(searchData).length > 0 && !!searchData?.city && !!searchData?.filters && Object.values(searchData?.filters || {}).some(v => !!v),
      retry: false, retryOnMount: false, staleTime: Infinity
    },
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
    if(!propertyDataLoading && propertyData && searchData && Object.keys(searchData).length > 0 && propertyData?.Properties?.length <= 0)
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
            maxLength: 10,
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

  const handleModeChange = (newMode) => {
    setFormCity(null);
    setFormLocality(null);
    setCityCode(undefined);
    setFormMobile("");
    setFormPropertyId("");
    setFormOldPropertyId("");
    setFormDoorNo("");
    setFormOwnerName("");
    history.replace(`${history.location.pathname}?action=${newMode}`);
  };

  const handleSubmit = () => {
    onPropertySearch({
      city: formCity,
      locality: formLocality,
      mobileNumber: formMobile,
      propertyIds: formPropertyId,
      oldPropertyId: formOldPropertyId,
      doorNumber: formDoorNo,
      name: formOwnerName,
    });
  };

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
      if(redirectToUrl || window.location.href.includes("suda-ui/citizen/commonpt/property/citizen-search")) {
        history.push(
          `/suda-ui/citizen/commonPt/property/search-results?${Object.keys(qs)
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

  // ── Reusable styled input ──
  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "9px",
    fontSize: "14px",
    color: "#1a2b49",
    background: "#fafbfc",
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };
  const inputFocus = (e) => {
    e.target.style.borderColor = "#f47738";
    e.target.style.boxShadow = "0 0 0 3px rgba(244,119,56,0.10)";
    e.target.style.background = "#fff";
  };
  const inputBlur = (e) => {
    e.target.style.borderColor = "#e5e7eb";
    e.target.style.boxShadow = "none";
    e.target.style.background = "#fafbfc";
  };

  const FieldLabel = ({ text }) => (
    <div style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.45px", marginBottom: "7px" }}>
      {text}
    </div>
  );

  const cardStyle = {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e8edf5",
    boxShadow: "0 2px 12px rgba(9,30,100,0.07)",
    marginBottom: "16px",
    overflow: "hidden",
  };

  const CardHeader = ({ icon, title }) => (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "14px 20px",
      background: "linear-gradient(135deg,#f8faff 0%,#f0f4ff 100%)",
      borderBottom: "1px solid #e8edf5",
    }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "8px",
        background: "#f4773820",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: "14px", fontWeight: "700", color: "#091E64" }}>{title}</span>
    </div>
  );

  const sectionCard = {
    padding: "18px 20px",
  };

  const currentAction = parseInt(action);

  const getBottomLink = () => {
    if (window.location.href.includes("/obps/bpa/") && onSkip) {
      return (
        <button type="button" onClick={() => onSkip()}
          style={{ padding: "8px 16px", background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
          {t("CORE_COMMON_SKIP_CONTINUE")}
        </button>
      );
    }
    if (window.location.href.includes("/obps/bpa/")) {
      return (
        <Link to={"/suda-ui/citizen/obps/bpa/building_plan_scrutiny/new_construction/location"} style={{ textDecoration: "none" }}>
          <button type="button" style={{ padding: "8px 16px", background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
            {t("CORE_COMMON_SKIP_CONTINUE")}
          </button>
        </Link>
      );
    }
    if (window.location.href.includes("/fsm/new-application/")) {
      return (
        <Link to={"/suda-ui/citizen/fsm/new-application/fsm-property-details"} style={{ textDecoration: "none" }}>
          <button type="button" style={{ padding: "8px 16px", background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
            {t("CORE_COMMON_SKIP_CONTINUE")}
          </button>
        </Link>
      );
    }
    const registerPath = "/suda-ui/citizen/pt/property/new-application/info";
    return (
      <Link to={registerPath} style={{ textDecoration: "none", flexShrink: 0 }}>
        <button type="button" style={{ padding: "8px 16px", background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
          {t("CPT_REG_NEW_PROPERTY")}
        </button>
      </Link>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa" }}>

      {/* ── Hero Banner ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "14px",
        padding: isMobile ? "18px 16px" : "18px 22px",
        background: "linear-gradient(135deg,#091e64 0%,#1a3a8f 100%)",
        boxShadow: "0 6px 24px rgba(9,30,100,0.18)",
        marginBottom: "0",
      }}>
        <div style={{
          flexShrink: 0, width: "48px", height: "48px", borderRadius: "12px",
          background: "rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.25)",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff", marginBottom: "2px" }}>
            {t("SEARCH_PROPERTY") || "Search Property"}
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)", lineHeight: "1.5" }}>
            {t("CS_PT_HOME_SEARCH_RESULTS_DESC") || "Provide at least one search parameter to find your property."}
          </div>
        </div>
      </div>

      {/* ── Form Body ── */}
      <div style={{ padding: isMobile ? "16px 16px 48px" : "20px 24px 56px" }}>

        {/* ── Search Mode Toggle ── */}
        <div style={{ ...cardStyle, marginBottom: "16px" }}>
          <CardHeader
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
              </svg>
            }
            title={t("PT_HOME_SEARCH_PROPERTY_BY") || "Search Property By"}
          />
          <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              {
                code: 0,
                label: t("PT_KNOW_PTID"),
                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
              },
              {
                code: 1,
                label: t("PT_SEARCH_DOOR_NO"),
                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
              },
            ].map((opt) => {
              const isActive = currentAction === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => { if (!isActive) handleModeChange(opt.code); }}
                  style={{
                    flex: 1,
                    minWidth: "160px",
                    padding: "13px 20px",
                    borderRadius: "10px",
                    border: isActive ? "2px solid #f47738" : "2px solid #e5e7eb",
                    background: isActive ? "linear-gradient(135deg, #fff8f4 0%, #fff3ec 100%)" : "#f9fafb",
                    color: isActive ? "#d44f0a" : "#6b7280",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.15s",
                    boxShadow: isActive ? "0 2px 10px rgba(244,119,56,0.18)" : "none",
                  }}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              );
            })}
          </div>
          </div>
        </div>

        {/* ── City (+ Locality for mode 1) ── */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : currentAction === 1 ? "1fr 1fr" : "1fr", gap: "16px", marginBottom: "16px" }}>

          {/* City */}
          <div style={{ ...cardStyle, overflow: "visible" }}>
            <CardHeader
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
              title={t("PT_SELECT_CITY") || "Select City"}
            />
            <div style={sectionCard}>
              {/* Custom city dropdown — in-field search */}
              <div style={{ position: "relative" }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type="text"
                    value={cityOpen ? citySearch : (formCity ? (formCity.name || t(formCity.i18nKey)) : "")}
                    placeholder={formCity ? (formCity.name || t(formCity.i18nKey)) : "Select City"}
                    onChange={(e) => { setCitySearch(e.target.value); }}
                    onFocus={() => { setCityOpen(true); setCitySearch(""); }}
                    onBlur={() => setTimeout(() => { setCityOpen(false); setCitySearch(""); }, 200)}
                    readOnly={!cityOpen}
                    style={{
                      width: "100%", padding: "11px 36px 11px 14px",
                      borderRadius: "10px",
                      border: cityOpen ? "1.5px solid #f47738" : "1.5px solid #e2e8f0",
                      fontSize: "14px",
                      color: formCity ? "#111827" : "#9ca3af",
                      fontWeight: formCity ? "500" : "400",
                      background: "#fafbfc",
                      outline: "none",
                      cursor: cityOpen ? "text" : "pointer",
                      boxShadow: cityOpen ? "0 0 0 3px rgba(244,119,56,0.10)" : "0 1px 3px rgba(0,0,0,0.04)",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                      boxSizing: "border-box",
                    }}
                  />
                  <svg
                    width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ position: "absolute", right: "12px", pointerEvents: "none", transition: "transform 0.18s", transform: cityOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>

                {cityOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1.5px solid #f47738",
                    boxShadow: "0 8px 28px rgba(9,30,100,0.13)",
                    zIndex: 100,
                    overflow: "hidden",
                    maxHeight: "220px", overflowY: "auto",
                  }}>
                    {(allCities || []).filter((c) => !citySearch || (c.name || "").toLowerCase().includes(citySearch.toLowerCase())).map((city, idx, arr) => (
                      <button
                        key={city.code}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          if (city.code !== cityCode) setFormLocality(null);
                          setCityCode(city.code);
                          setFormCity(city);
                          setCityOpen(false);
                          setCitySearch("");
                        }}
                        style={{
                          width: "100%", padding: "10px 16px",
                          textAlign: "left", border: "none",
                          borderBottom: idx < (arr.length - 1) ? "1px solid #f3f4f6" : "none",
                          background: formCity?.code === city.code ? "linear-gradient(135deg,#fff8f4 0%,#fff3ec 100%)" : "#fff",
                          color: formCity?.code === city.code ? "#d44f0a" : "#111827",
                          fontWeight: formCity?.code === city.code ? "700" : "400",
                          fontSize: "14px", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) => { if (formCity?.code !== city.code) e.currentTarget.style.background = "#f9fafb"; }}
                        onMouseLeave={(e) => { if (formCity?.code !== city.code) e.currentTarget.style.background = "#fff"; }}
                      >
                        {city.name || t(city.i18nKey)}
                        {formCity?.code === city.code && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </button>
                    ))}
                    {(allCities || []).filter((c) => !citySearch || (c.name || "").toLowerCase().includes(citySearch.toLowerCase())).length === 0 && (
                      <div style={{ padding: "12px 16px", fontSize: "13px", color: "#9ca3af" }}>No cities found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Locality — mode 1 only */}
          {currentAction === 1 && (
            <div style={{ ...cardStyle, overflow: "visible" }}>
              <CardHeader
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>}
                title={t("PT_SELECT_LOCALITY") || "Select Locality"}
              />
              <div style={sectionCard}>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      type="text"
                      value={localityOpen ? localitySearch : (formLocality ? (formLocality.name || t(formLocality.i18nkey)) : "")}
                      placeholder={formLocality ? (formLocality.name || t(formLocality.i18nkey)) : "Select Locality"}
                      onChange={(e) => { setLocalitySearch(e.target.value); }}
                      onFocus={() => { if (cityCode) { setLocalityOpen(true); setLocalitySearch(""); } }}
                      onBlur={() => setTimeout(() => { setLocalityOpen(false); setLocalitySearch(""); }, 200)}
                      readOnly={!localityOpen}
                      disabled={!cityCode}
                      style={{
                        width: "100%", padding: "11px 36px 11px 14px",
                        borderRadius: "10px",
                        border: localityOpen ? "1.5px solid #f47738" : "1.5px solid #e2e8f0",
                        fontSize: "14px",
                        color: !cityCode ? "#c0c0c0" : formLocality ? "#111827" : "#9ca3af",
                        fontWeight: formLocality ? "500" : "400",
                        background: !cityCode ? "#f5f5f5" : "#fafbfc",
                        outline: "none",
                        cursor: !cityCode ? "not-allowed" : localityOpen ? "text" : "pointer",
                        boxShadow: localityOpen ? "0 0 0 3px rgba(244,119,56,0.10)" : "0 1px 3px rgba(0,0,0,0.04)",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                        boxSizing: "border-box",
                      }}
                    />
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ position: "absolute", right: "12px", pointerEvents: "none", transition: "transform 0.18s", transform: localityOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                  {localityOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                      background: "#fff", borderRadius: "12px",
                      border: "1.5px solid #f47738",
                      boxShadow: "0 8px 28px rgba(9,30,100,0.13)",
                      zIndex: 100, overflow: "hidden",
                      maxHeight: "220px", overflowY: "auto",
                    }}>
                      {isLocalityLoading ? (
                        <div style={{ padding: "12px 16px", fontSize: "13px", color: "#9ca3af" }}>Loading...</div>
                      ) : (() => {
                        const filtered = localityList.filter((l) => !localitySearch || (l.name || "").toLowerCase().includes(localitySearch.toLowerCase()));
                        return filtered.length === 0 ? (
                          <div style={{ padding: "12px 16px", fontSize: "13px", color: "#9ca3af" }}>No localities found</div>
                        ) : filtered.map((loc, idx, arr) => (
                          <button
                            key={loc.code}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setFormLocality(loc);
                              setLocalityOpen(false);
                              setLocalitySearch("");
                            }}
                            style={{
                              width: "100%", padding: "10px 16px",
                              textAlign: "left", border: "none",
                              borderBottom: idx < arr.length - 1 ? "1px solid #f3f4f6" : "none",
                              background: formLocality?.code === loc.code ? "linear-gradient(135deg,#fff8f4 0%,#fff3ec 100%)" : "#fff",
                              color: formLocality?.code === loc.code ? "#d44f0a" : "#111827",
                              fontWeight: formLocality?.code === loc.code ? "700" : "400",
                              fontSize: "14px", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                            }}
                            onMouseEnter={(e) => { if (formLocality?.code !== loc.code) e.currentTarget.style.background = "#f9fafb"; }}
                            onMouseLeave={(e) => { if (formLocality?.code !== loc.code) e.currentTarget.style.background = "#fff"; }}
                          >
                            {loc.name || t(loc.i18nkey)}
                            {formLocality?.code === loc.code && (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Additional fields ── */}
        <div style={{ ...cardStyle, marginBottom: "20px" }}>
          <CardHeader
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="18" y2="18"/></svg>}
            title={t("PT_PROVIDE_ONE_MORE_PARAM") || "Provide Search Parameters"}
          />
          <div style={sectionCard}>

          {currentAction === 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "18px", alignItems: "end" }}>
              {/* Mobile */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <FieldLabel text={t(mobileNumber.label)} />
                <input
                  type="tel"
                  value={formMobile}
                  onChange={(e) => setFormMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
              {/* Property ID */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.45px", marginBottom: "7px", display: "flex", alignItems: "center", gap: "6px" }}>
                  {t(property.label)}
                  <div className="tooltip" style={{ display: "inline-flex", cursor: "help" }}>
                    <InfoBannerIcon fill="#9ca3af" />
                    <span className="tooltiptext" style={{ width: "160px", fontSize: "12px" }}>
                      {t(property.description) + " PG-PT-xxxx-xxxxxx"}
                    </span>
                  </div>
                </div>
                <input
                  type="text"
                  value={formPropertyId}
                  onChange={(e) => setFormPropertyId(e.target.value)}
                  placeholder="PG-PT-2024-01-01-000001"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
              {/* Old Property ID */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <FieldLabel text={t(oldProperty.label)} />
                <input
                  type="text"
                  value={formOldPropertyId}
                  onChange={(e) => setFormOldPropertyId(e.target.value)}
                  placeholder=""
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "18px" }}>
              {/* Door No */}
              <div>
                <FieldLabel text={t(doorNumber.label)} />
                <input
                  type="text"
                  value={formDoorNo}
                  onChange={(e) => setFormDoorNo(e.target.value)}
                  placeholder=""
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
              {/* Owner Name */}
              <div>
                <FieldLabel text={t(name.label)} />
                <input
                  type="text"
                  value={formOwnerName}
                  onChange={(e) => setFormOwnerName(e.target.value)}
                  placeholder=""
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
            </div>
          )}
          </div>
          </div>

        {/* ── Search Button ── */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={propertyDataLoading}
          style={{
            width: "100%",
            padding: "15px 32px",
            background: propertyDataLoading
              ? "#d1d5db"
              : "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)",
            border: "none",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "15px",
            fontWeight: "700",
            cursor: propertyDataLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: propertyDataLoading ? "none" : "0 4px 20px rgba(244,119,56,0.35)",
            marginBottom: "20px",
            letterSpacing: "0.3px",
            transition: "opacity 0.15s",
          }}
        >
          {propertyDataLoading ? (
            <span>{t("PT_COMMON_TABLE_COL_ACTION")}</span>
          ) : (
            <React.Fragment>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              {t(propsConfig.texts.submitButtonLabel)}
            </React.Fragment>
          )}
        </button>

        {/* ── Register / Skip Row ── */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {getBottomLink()}
        </div>

      </div>

      {showToast && (
        <Toast isDleteBtn="true" error={showToast.error} warning={showToast.warning} label={t(showToast.label)} onClose={() => setShowToast(null)} />
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