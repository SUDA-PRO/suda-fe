import { Dropdown, FormComposer, InfoBannerIcon, Loader, Localities, RadioButtons, Toast } from "@upyog/digit-ui-react-components";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory ,Link } from "react-router-dom";

const PT_SEARCH_INPUT_STYLE = { width: "100%", height: "40px", padding: "0 12px", border: "1px solid #b1b4b6", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", background: "#fff", color: "#1a1a1a", outline: "none", fontFamily: "inherit" };
const PT_SEARCH_LABEL_STYLE = { display: "flex", alignItems: "center", minHeight: "22px", fontWeight: "600", fontSize: "13px", color: "#3d4f6b", marginBottom: "6px", letterSpacing: "0.2px" };
const PT_SEARCH_CARD_STYLE = { border: "1px solid #e8ecf0", borderRadius: "8px", background: "#f8fafc", padding: "16px 18px 18px", marginTop: "8px" };
const PT_SEARCH_SECTION_TITLE_STYLE = { fontSize: "13px", fontWeight: "700", color: "#1a2b49", marginBottom: "16px", paddingBottom: "8px", borderBottom: "2px solid #f47738", letterSpacing: "0.3px" };

const ParamRow0 = ({ formProps, t, mobileNumberLabel, propertyLabel, propertyDescription, oldPropertyLabel }) => {
  const isMobile = window.Digit.Utils.browser.isMobile();
  const [localValues, setLocalValues] = React.useState({ mobileNumber: "", propertyIds: "", oldPropertyId: "" });
  const handleChange = (fieldName, value) => {
    setLocalValues((prev) => ({ ...prev, [fieldName]: value }));
    formProps.setValue(fieldName, value);
  };
  return (
    <div style={PT_SEARCH_CARD_STYLE}>
      <div style={PT_SEARCH_SECTION_TITLE_STYLE}>{t("PT_PROVIDE_ONE_MORE_PARAM")}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: isMobile ? "0 0 100%" : "1 1 0", minWidth: "180px", boxSizing: "border-box" }}>
          <label style={PT_SEARCH_LABEL_STYLE}>{t(mobileNumberLabel)}</label>
          <input type="text" value={localValues.mobileNumber} onChange={(e) => handleChange("mobileNumber", e.target.value)} placeholder={t(mobileNumberLabel)} style={PT_SEARCH_INPUT_STYLE} maxLength={10} />
        </div>
        <div style={{ flex: isMobile ? "0 0 100%" : "1 1 0", minWidth: "180px", boxSizing: "border-box" }}>
          <label style={PT_SEARCH_LABEL_STYLE}>
            {t(propertyLabel)}
            <span className="tooltip" style={{ display: "inline-block", paddingLeft: "8px", marginBottom: "-3px" }}>
              <InfoBannerIcon fill="#0b0c0c" />
              <span className="tooltiptext" style={{ width: "150px", left: "230%", fontSize: "14px" }}>
                {t(propertyDescription) + " PG-PT-xxxx-xxxxxx"}
              </span>
            </span>
          </label>
          <input type="text" value={localValues.propertyIds} onChange={(e) => handleChange("propertyIds", e.target.value)} placeholder={t(propertyLabel)} style={PT_SEARCH_INPUT_STYLE} />
        </div>
        <div style={{ flex: isMobile ? "0 0 100%" : "1 1 0", minWidth: "180px", boxSizing: "border-box" }}>
          <label style={PT_SEARCH_LABEL_STYLE}>{t(oldPropertyLabel)}</label>
          <input type="text" value={localValues.oldPropertyId} onChange={(e) => handleChange("oldPropertyId", e.target.value)} placeholder={t(oldPropertyLabel)} style={PT_SEARCH_INPUT_STYLE} />
        </div>
      </div>
    </div>
  );
};

const ParamRow1 = ({ formProps, t, doorNoLabel, nameLabel }) => {
  const isMobile = window.Digit.Utils.browser.isMobile();
  const [localValues, setLocalValues] = React.useState({ doorNo: "", name: "" });
  const handleChange = (fieldName, value) => {
    setLocalValues((prev) => ({ ...prev, [fieldName]: value }));
    formProps.setValue(fieldName, value);
  };
  return (
    <div style={PT_SEARCH_CARD_STYLE}>
      <div style={PT_SEARCH_SECTION_TITLE_STYLE}>{t("PT_PROVIDE_ONE_MORE_PARAM")}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: isMobile ? "0 0 100%" : "1 1 0", minWidth: "180px", boxSizing: "border-box" }}>
          <label style={PT_SEARCH_LABEL_STYLE}>{t(doorNoLabel)}</label>
          <input type="text" value={localValues.doorNo} onChange={(e) => handleChange("doorNo", e.target.value)} placeholder={t(doorNoLabel)} style={PT_SEARCH_INPUT_STYLE} />
        </div>
        <div style={{ flex: isMobile ? "0 0 100%" : "1 1 0", minWidth: "180px", boxSizing: "border-box" }}>
          <label style={PT_SEARCH_LABEL_STYLE}>{t(nameLabel)}</label>
          <input type="text" value={localValues.name} onChange={(e) => handleChange("name", e.target.value)} placeholder={t(nameLabel)} style={PT_SEARCH_INPUT_STYLE} />
        </div>
      </div>
    </div>
  );
};

const CityLocalityRow = ({ formProps, t, allCities, cityCode, formValue, showLocality }) => {
  const isMobile = window.Digit.Utils.browser.isMobile();
  return (
    <div style={{ display: "flex", flexWrap: isMobile ? "wrap" : "nowrap", gap: "16px" }}>
      <div className="pt-search-city-dropdown" style={{ flex: "1 1 0", minWidth: "180px", maxWidth: showLocality ? undefined : "50%" }}>
        <label style={{ display: "block", fontWeight: "600", fontSize: "13px", color: "#3d4f6b", marginBottom: "6px", letterSpacing: "0.2px" }}>
          {t("PT_SELECT_CITY")}<span style={{ color: "#e54d42", marginLeft: "2px" }}>*</span>
        </label>
        <Dropdown
          t={t}
          isMandatory={true}
          option={allCities}
          optionKey="i18nKey"
          selected={formValue?.city || null}
          select={(d) => {
            Digit.LocalizationService.getLocale({
              modules: [`rainmaker-${cityCode}`],
              locale: Digit.StoreData.getCurrentLanguage(),
              tenantId: `${cityCode}`,
            });
            if (d.code !== cityCode) formProps.setValue("locality", null);
            formProps.setValue("city", d);
          }}
        />
      </div>
      {showLocality && (
        <div className="pt-search-locality-dropdown" style={{ flex: "1 1 0", minWidth: "180px" }}>
          <label style={{ display: "block", fontWeight: "600", fontSize: "13px", color: "#3d4f6b", marginBottom: "6px", letterSpacing: "0.2px" }}>
            {t("PT_SELECT_LOCALITY")}<span style={{ color: "#e54d42", marginLeft: "2px" }}>*</span>
          </label>
          <Localities
            selectLocality={(d) => { formProps.setValue("locality", d); }}
            tenantId={cityCode}
            boundaryType="revenue"
            keepNull={false}
            optionCardStyles={{ height: "220px", overflow: "auto", zIndex: "10" }}
            selected={formValue?.locality}
            disable={!cityCode}
            disableLoader={true}
          />
        </div>
      )}
    </div>
  );
};

const description = {
  description: "PT_SEARCH_OR_DESC",
  descriptionStyles: {
    fontWeight: "300  ",
    color: "#505A5F",
    marginTop: "0px",
    textAlign: "center",
    marginBottom: "20px",
    maxWidth: "540px",
  },
};

const SearchProperty = ({ config: propsConfig, onSelect }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { action = 0 } = Digit.Hooks.useQueryParams();
  const [searchData, setSearchData] = useState({});
  const [showToast, setShowToast] = useState(null);
  const allCities = Digit.Hooks.pt.useTenants()?.sort((a, b) => a?.i18nKey?.localeCompare?.(b?.i18nKey)) || [];
  const [cityCode, setCityCode] = useState();
  const [formValue, setFormValue] = useState();
  const [errorShown, seterrorShown] = useState(false);
  const { data: propertyData, isLoading: propertyDataLoading, error, isSuccess, billData } = Digit.Hooks.pt.usePropertySearchWithDue({
    tenantId: searchData?.city,
    filters: searchData?.filters,
    auth: true /*  to enable open search set false  */,
    configs: { enabled: Object.keys(searchData).length > 0, retry: false, retryOnMount: false, staleTime: Infinity },
  });

  const isMobile = window.Digit.Utils.browser.isMobile();

  useEffect(() => {
    if ( !(searchData?.filters?.mobileNumber && Object.keys(searchData?.filters)?.length == 1) && 
      propertyData?.Properties.length > 0 &&
      ptSearchConfig?.maxResultValidation &&
      propertyData?.Properties.length > ptSearchConfig?.maxPropertyResult &&
      !errorShown
    ) {
      setShowToast({ error: true, warning: true, label: "ERR_PLEASE_REFINED_UR_SEARCH" });
    }
  }, [propertyData]);

  useEffect(() => {
    showToast && showToast?.label !== "ERR_PLEASE_REFINED_UR_SEARCH" && setShowToast(null);
  }, [action, propertyDataLoading]);

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

  const [mobileNumber, property, oldProperty, name, doorNo] = propsConfig.inputs;

  const config = [
    {
      body: [
        {
          type: "custom",
          populators: {
            name: "addParam",
            defaultValue: { code: 0, name: "PT_KNOW_PT_ID" },
            customProps: {
              t,
              isMandatory: true,
              optionsKey: "name",
              options: [
                { code: 0, name: "PT_KNOW_PT_ID" },
                { code: 1, name: "PT_KNOW_PT_DETAIL" },
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
                  props?.setValue("doorNo", "");
                  props?.setValue("oldPropertyId", "");
                  props?.setValue("name", "");
                  history.replace(`${history.location.pathname}?action=${action == 0 ? 1 : 0}`);
                }}
              />
            ),
          },
        },
        {
          type: "custom",
          withoutLabel: true,
          populators: {
            name: "_cityRow",
            defaultValue: null,
            customProps: { t, allCities, cityCode, formValue },
            component: (props, customProps) => (
              <CityLocalityRow
                formProps={props}
                t={customProps.t}
                allCities={customProps.allCities}
                cityCode={customProps.cityCode}
                formValue={customProps.formValue}
                showLocality={false}
              />
            ),
          },
        },
        { type: "custom", withoutLabel: true, populators: { name: "city", defaultValue: null, component: () => null } },
        {
          type: "custom",
          withoutLabel: true,
          populators: {
            name: "_paramRow0",
            defaultValue: null,
            customProps: { t, mobileNumberLabel: mobileNumber.label, propertyLabel: property.label, propertyDescription: property.description, oldPropertyLabel: oldProperty.label },
            component: (props, customProps) => (
              <ParamRow0
                formProps={props}
                t={customProps.t}
                mobileNumberLabel={customProps.mobileNumberLabel}
                propertyLabel={customProps.propertyLabel}
                propertyDescription={customProps.propertyDescription}
                oldPropertyLabel={customProps.oldPropertyLabel}
              />
            ),
          },
        },
        // Hidden Controllers – register field names with react-hook-form so
        // handleSubmit includes values written by setValue() above.
        { type: "custom", withoutLabel: true, populators: { name: "mobileNumber", defaultValue: "", component: () => null } },
        { type: "custom", withoutLabel: true, populators: { name: "propertyIds", defaultValue: "", component: () => null } },
        { type: "custom", withoutLabel: true, populators: { name: "oldPropertyId", defaultValue: "", component: () => null } },
      ],
      body1: [
        {
          type: "custom",
          populators: {
            name: "addParam1",
            defaultValue: { code: 1, name: "PT_KNOW_PT_DETAIL" },
            customProps: {
              t,
              isMandatory: true,
              optionsKey: "name",
              options: [
                { code: 0, name: "PT_KNOW_PT_ID" },
                { code: 1, name: "PT_KNOW_PT_DETAIL" },
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
                  props?.setValue("doorNo", "");
                  props?.setValue("oldPropertyId", "");
                  props?.setValue("name", "");
                  history.replace(`${history.location.pathname}?action=${action == 0 ? 1 : 0}`);
                }}
              />
            ),
          },
        },
        {
          type: "custom",
          withoutLabel: true,
          populators: {
            name: "_cityLocalityRow",
            defaultValue: null,
            customProps: { t, allCities, cityCode, formValue },
            component: (props, customProps) => (
              <CityLocalityRow
                formProps={props}
                t={customProps.t}
                allCities={customProps.allCities}
                cityCode={customProps.cityCode}
                formValue={customProps.formValue}
                showLocality={true}
              />
            ),
          },
        },
        { type: "custom", withoutLabel: true, populators: { name: "city", defaultValue: null, component: () => null } },
        { type: "custom", withoutLabel: true, populators: { name: "locality", defaultValue: "", component: () => null } },
        {
          type: "custom",
          withoutLabel: true,
          populators: {
            name: "_paramRow1",
            defaultValue: null,
            customProps: { t, doorNoLabel: doorNo.label, nameLabel: name.label },
            component: (props, customProps) => (
              <ParamRow1
                formProps={props}
                t={customProps.t}
                doorNoLabel={customProps.doorNoLabel}
                nameLabel={customProps.nameLabel}
              />
            ),
          },
        },
        // Hidden Controllers – register field names with react-hook-form.
        { type: "custom", withoutLabel: true, populators: { name: "doorNo", defaultValue: "", component: () => null } },
        { type: "custom", withoutLabel: true, populators: { name: "name", defaultValue: "", component: () => null } },
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
      setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS"});
      return;
    }
    if (action == 0) {
      if (!(data?.mobileNumber || data?.propertyIds || data?.oldPropertyId)) {
        setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS" });
        return;
      }
      if (data?.mobileNumber && !data.mobileNumber?.match(mobileNumber?.validation?.pattern?.value)) {
        setShowToast({ warning: true, label: mobileNumber?.validation?.pattern?.message });
        return;
      }
      if (data?.propertyIds && !data.propertyIds?.match(property?.validation?.pattern?.value)) {
        setShowToast({ warning: true, label: property?.validation?.pattern?.message });
        return;
      }
      if (data?.oldPropertyId && !data.oldPropertyId?.match(oldProperty?.validation?.pattern?.value)) {
        setShowToast({ warning: true, label: oldProperty?.validation?.pattern?.message });
        return;
      }
    } else {
      if (!data?.locality?.code) {
        setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS" });
        return;
      }
      if (!(data?.doorNo || data?.name)) {
        setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS" });
        return;
      }

      if (data?.name && !data.name?.match(name?.validation?.pattern?.value)) {
        setShowToast({ warning: true, label: name?.validation?.pattern?.message });
        return;
      }
      if (data?.doorNo && !data.doorNo?.match(doorNo?.validation?.pattern?.value)) {
        setShowToast({ warning: true, label: doorNo?.validation?.pattern?.message });
        return;
      }
    }

    if (showToast?.label !== "ERR_PLEASE_REFINED_UR_SEARCH") setShowToast(null);
    if (data?.doorNo && data?.doorNo !== "" && data?.propertyIds !== "") {
      data["propertyIds"] = "";
    }

    let tempObject = Object.keys(data)
      .filter((k) => data[k])
      .reduce((acc, key) => ({ ...acc, [key]: typeof data[key] === "object" ? data[key].code : data[key] }), {});
    let city = tempObject.city;
    
    delete tempObject.addParam;
    delete tempObject.addParam1;
    delete tempObject._cityRow;
    delete tempObject._cityLocalityRow;
    delete tempObject._paramRow0;
    delete tempObject._paramRow1;
    delete tempObject.city;
    if(action == 1 && tempObject?.oldPropertyId){
      delete tempObject.oldPropertyId;
    }
    setSearchData({ city: city, filters: tempObject });
    return;
  };
  
  const onFormValueChange = (setValue, data, formState) => {
    if (data?.doorNo && data?.doorNo !== "" && data?.propertyIds !== "") {
      data["propertyIds"] = "";
    }
    const mobileNumberLength = data?.[mobileNumber.name]?.length;
    const oldPropId = data?.[oldProperty.name];
    const propId = data?.[property.name];
    const city = data?.city;
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

  let validation = ptSearchConfig?.maxResultValidation && !(searchData?.filters?.mobileNumber && Object.keys(searchData?.filters)?.length == 1)   ? propertyData?.Properties.length<ptSearchConfig?.maxPropertyResult && (showToast == null || (showToast !== null && !showToast?.error)) : true;

  if (propertyData && !propertyDataLoading && !error && validation ) {
    let qs = {};
    qs = { ...searchData.filters, city: searchData.city };

    if ( !(searchData?.filters?.mobileNumber && Object.keys(searchData?.filters)?.length == 1) && 
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
      history.push(
        `/suda-ui/citizen/pt/property/search-results?${Object.keys(qs)
          .map((key) => `${key}=${qs[key]}`)
          .join("&")}`
      );
    }
  }

  if (error) {
    !showToast && setShowToast({ error: true, label: error?.response?.data?.Errors?.[0]?.code || error });
  }
  if (action == 1) {
    config[0].body = [...config[0].body1];
  }

  return (
    <div style={{ marginTop: "16px", marginBottom: "16px", maxWidth: "960px" }}>
      <style>{`
        .pt-search-city-dropdown .select,
        .pt-search-city-dropdown .select-active,
        .pt-search-locality-dropdown .select,
        .pt-search-locality-dropdown .select-active {
          border: 1px solid #b1b4b6 !important;
          border-radius: 8px !important;
          height: 40px !important;
        }
        .pt-search-city-dropdown .select:hover,
        .pt-search-city-dropdown .select-active:hover,
        .pt-search-locality-dropdown .select:hover,
        .pt-search-locality-dropdown .select-active:hover {
          border: 1px solid #505a5f !important;
        }
        .pt-search-city-dropdown .select-wrap,
        .pt-search-city-dropdown .employee-select-wrap,
        .pt-search-locality-dropdown .select-wrap,
        .pt-search-locality-dropdown .employee-select-wrap {
          max-width: none !important;
          position: relative !important;
          overflow: visible !important;
        }
        .pt-search-city-dropdown .select-wrap .options-card,
        .pt-search-city-dropdown .employee-select-wrap .options-card,
        .pt-search-locality-dropdown .select-wrap .options-card,
        .pt-search-locality-dropdown .employee-select-wrap .options-card {
          position: absolute !important;
          top: 100% !important;
          bottom: auto !important;
          margin-top: 4px !important;
          max-height: 220px !important;
          overflow-y: auto !important;
          z-index: 9999 !important;
          width: 100% !important;
          background: #fff !important;
          border: 1px solid #b1b4b6 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          border-radius: 8px !important;
        }
      `}</style>

      {/* ── Hero Banner – matches create new property style ── */}
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
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{t(propsConfig.texts.header)}</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>{t(propsConfig.texts.text)}</p>
        </div>
      </div>

      {/* ── Search Form Card – matches create new property card style ── */}
      <div style={{
        background: "#ffffff",
        borderRadius: "10px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        border: "1px solid #e8ecf0",
        overflow: "hidden",
      }}>
        <FormComposer
          onSubmit={onPropertySearch}
          noBoxShadow
          inline
          config={config}
          label={propsConfig.texts.submitButtonLabel}
          heading={t(propsConfig.texts.header)}
          headingStyle={{
            fontSize: "15px",
            fontWeight: "700",
            color: "#1a2b49",
            marginBottom: "20px",
            paddingBottom: "10px",
            borderBottom: "2px solid #f47738",
            letterSpacing: "0.3px",
          }}
          onFormValueChange={onFormValueChange}
          cardStyle={{ marginBottom: "0" }}
        />
        <span className="link" style={{ display: "flex", justifyContent: isMobile ? "center" : "left", paddingBottom: "16px", paddingLeft: "24px", marginTop: "-24px" }}>
          <Link to={"/suda-ui/citizen/pt/property/new-application"}>{t("CPT_REG_NEW_PROPERTY")}</Link>
        </span>
      </div>

      {showToast && (
        <Toast
          error={showToast.error}
          isDleteBtn={true}
          warning={showToast.warning}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
            seterrorShown(false);
          }}
        />
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
