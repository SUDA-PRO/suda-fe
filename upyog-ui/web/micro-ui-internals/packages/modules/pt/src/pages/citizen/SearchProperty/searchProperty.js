import { Dropdown, InfoBannerIcon, Loader, Localities, Toast } from "@upyog/digit-ui-react-components";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { Fragment, useEffect, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, Link } from "react-router-dom";

const SearchProperty = ({ config: propsConfig, onSelect }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { action = 0 } = Digit.Hooks.useQueryParams();
  const [searchData, setSearchData] = useState({});
  const [showToast, setShowToast] = useState(null);
  const allCities = Digit.Hooks.pt.useTenants()?.sort((a, b) => a?.i18nKey?.localeCompare?.(b?.i18nKey)) || [];
  const [cityCode, setCityCode] = useState();
  const [errorShown, seterrorShown] = useState(false);

  // Custom form field states
  const [formCity, setFormCity] = useState(null);
  const [formLocality, setFormLocality] = useState(null);
  const [formMobile, setFormMobile] = useState("");
  const [formPropertyId, setFormPropertyId] = useState("");
  const [formOldPropertyId, setFormOldPropertyId] = useState("");
  const [formDoorNo, setFormDoorNo] = useState("");
  const [formOwnerName, setFormOwnerName] = useState("");

  const { data: propertyData, isLoading: propertyDataLoading, error, isSuccess } = Digit.Hooks.pt.usePropertySearchWithDue({
    tenantId: searchData?.city,
    filters: searchData?.filters,
    auth: true,
    configs: { enabled: Object.keys(searchData).length > 0, retry: false, retryOnMount: false, staleTime: Infinity },
  });

  const isMobile = window.Digit.Utils.browser.isMobile();

  useEffect(() => {
    if (
      !(searchData?.filters?.mobileNumber && Object.keys(searchData?.filters)?.length == 1) &&
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
    const getActionBar = () => {
      let el = document.querySelector("div.action-bar-wrap");
      if (el) {
        el.style.position = "static";
        el.style.padding = "8px 0";
        el.style.boxShadow = "none";
        el.style.marginBottom = "16px";
        el.style.textAlign = "left";
      } else {
        setTimeout(getActionBar, 100);
      }
    };
    getActionBar();
  }, []);

  const { data: ptSearchConfig, isLoading } = Digit.Hooks.pt.useMDMS(Digit.ULBService.getStateId(), "DIGIT-UI", "HelpText", {
    select: (data) => data?.["DIGIT-UI"]?.["HelpText"]?.[0]?.PT,
  });

  const [mobileNumber, property, oldProperty, name, doorNo] = propsConfig.inputs;

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
      doorNo: formDoorNo,
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
      setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS" });
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

    let tempObject = Object.keys(data)
      .filter((k) => data[k])
      .reduce((acc, key) => ({ ...acc, [key]: typeof data[key] === "object" ? data[key].code : data[key] }), {});
    let city = tempObject.city;
    delete tempObject.city;
    if (action == 1 && tempObject?.oldPropertyId) {
      delete tempObject.oldPropertyId;
    }
    setSearchData({ city: city, filters: tempObject });
  };

  if (isLoading) return <Loader />;

  let validation =
    ptSearchConfig?.maxResultValidation && !(searchData?.filters?.mobileNumber && Object.keys(searchData?.filters)?.length == 1)
      ? propertyData?.Properties.length < ptSearchConfig?.maxPropertyResult && (showToast == null || (showToast !== null && !showToast?.error))
      : true;

  if (propertyData && !propertyDataLoading && !error && validation) {
    let qs = { ...searchData.filters, city: searchData.city };
    if (
      !(searchData?.filters?.mobileNumber && Object.keys(searchData?.filters)?.length == 1) &&
      ptSearchConfig?.ptSearchCount &&
      searchData?.filters?.locality &&
      propertyDataLoading &&
      propertyDataLoading?.Properties?.length &&
      propertyDataLoading.Properties.length > ptSearchConfig?.ptSearchCount
    ) {
      !showToast && setShowToast({ error: true, label: "PT_MODIFY_SEARCH_CRITERIA" });
    } else if (propsConfig.action === "MUTATION") {
      onSelect(propsConfig.key, qs, null, null, null, { queryParams: { ...qs } });
    } else {
      history.push(
        `/suda-ui/citizen/pt/property/search-results?${Object.keys(qs).map((key) => `${key}=${qs[key]}`).join("&")}`
      );
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

  const StepBadge = ({ n }) => (
    <span style={{ width: "22px", height: "22px", borderRadius: "7px", background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: "800", flexShrink: 0 }}>
      {n}
    </span>
  );

  const SectionHeader = ({ step, title, required }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "16px" }}>
      <StepBadge n={step} />
      <span style={{ fontSize: "13px", fontWeight: "700", color: "#374151", letterSpacing: "0.2px" }}>
        {title}
        {required && <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>}
      </span>
    </div>
  );

  const sectionCard = {
    background: "#fff",
    borderRadius: "14px",
    border: "1px solid #eaedf3",
    padding: "20px 24px",
    boxShadow: "0 1px 6px rgba(26,43,73,0.05)",
  };

  const currentAction = parseInt(action);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa" }}>

      {/* ── Top Hero Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #ff8c42 0%, #f47738 50%, #d44f0a 100%)",
        padding: isMobile ? "24px 20px 28px" : "28px 32px 32px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: "-60px", top: "-60px", width: "220px", height: "220px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "-50px", bottom: "-50px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(0,0,0,0.08)", pointerEvents: "none" }} />

        <div style={{ position: "relative", display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.28)", borderRadius: "16px", padding: "3px 10px", marginBottom: "10px" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span style={{ fontSize: "10px", fontWeight: "700", color: "#fff", letterSpacing: "0.7px", textTransform: "uppercase" }}>{t("ACTION_TEST_PROPERTY_TAX") || "Property Tax"}</span>
            </div>
            <div style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: "800", color: "#fff", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              {t("SEARCH_PROPERTY") || "Search Property"}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", marginTop: "4px" }}>
              {t("CS_PT_HOME_SEARCH_RESULTS_DESC") || "Find your property by ID, mobile number or owner details"}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["011-24643284", "011-24617543", "0771-2221955"].map((n) => (
              <a key={n} href={`tel:${n.replace(/-/g, "")}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 12px", background: "rgba(0,0,0,0.18)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.2)", fontSize: "12px", color: "#fff", fontWeight: "600", textDecoration: "none" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12 19.79 19.79 0 0 1 1.21 3.4 2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6.25 6.25l1.21-1.21a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                {n}
              </a>
            ))}
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[
            { svg: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, text: "Search by mobile, ID or owner name" },
            { svg: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>, text: "Pay instantly online" },
            { svg: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, text: "Download receipts & notices" },
          ].map((f, i) => (
            <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: "rgba(255,255,255,0.14)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.2)" }}>
              {f.svg}
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.92)", fontWeight: "500" }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form Body ── */}
      <div style={{ padding: isMobile ? "20px 16px 48px" : "24px 32px 56px" }}>

        {/* ── Step 0: Search Mode Toggle ── */}
        <div style={{ ...sectionCard, marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "12px" }}>
            {t("PT_HOME_SEARCH_PROPERTY_BY") || "Search Property By"}
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              {
                code: 0,
                label: t("PT_KNOW_PT_ID") || "Property ID / Mobile",
                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
              },
              {
                code: 1,
                label: t("PT_KNOW_PT_DETAIL") || "Owner / Address Details",
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

        {/* ── Step 1 & 2: City (+ Locality for mode 1) ── */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : currentAction === 1 ? "1fr 1fr" : "1fr", gap: "16px", marginBottom: "16px" }}>

          {/* City */}
          <div style={sectionCard}>
            <SectionHeader step="1" title={t("PT_SELECT_CITY") || "Select City"} required />
            <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "10px" }}>
              {t("CS_LOCATION_SUBTEXT") || "Select the city where your property is located"}
            </div>
            <Dropdown
              t={t}
              isMandatory
              option={allCities}
              optionKey="i18nKey"
              selected={formCity}
              optionCardStyles={{ maxHeight: "220px", overflowY: "auto", zIndex: 20 }}
              select={(d) => {
                Digit.LocalizationService.getLocale({
                  modules: [`rainmaker-${d?.code}`],
                  locale: Digit.StoreData.getCurrentLanguage(),
                  tenantId: `${d?.code}`,
                });
                if (d?.code !== cityCode) setFormLocality(null);
                setCityCode(d?.code);
                setFormCity(d);
              }}
            />
          </div>

          {/* Locality — mode 1 only */}
          {currentAction === 1 && (
            <div style={sectionCard}>
              <SectionHeader step="2" title={t("PT_SELECT_LOCALITY") || "Select Locality"} required />
              <Localities
                selectLocality={(d) => setFormLocality(d)}
                tenantId={cityCode}
                boundaryType="revenue"
                keepNull={false}
                optionCardStyles={{ maxHeight: "220px", overflowY: "auto", zIndex: 20 }}
                selected={formLocality}
                disable={!cityCode}
                disableLoader={true}
              />
            </div>
          )}
        </div>

        {/* ── Step 2/3: Additional fields ── */}
        <div style={{ ...sectionCard, marginBottom: "20px" }}>
          <SectionHeader
            step={currentAction === 1 ? "3" : "2"}
            title={t("PT_PROVIDE_ONE_MORE_PARAM") || "Enter at least one of the following"}
            required={false}
          />

          {currentAction === 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "18px" }}>
              {/* Mobile */}
              <div>
                <FieldLabel text={t(mobileNumber.label) || "Mobile Number"} />
                <input
                  type="tel"
                  value={formMobile}
                  onChange={(e) => setFormMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
              {/* Property ID */}
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.45px", marginBottom: "7px", display: "flex", alignItems: "center", gap: "6px" }}>
                  {t(property.label) || "Property ID"}
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
              <div>
                <FieldLabel text={t(oldProperty.label) || "Old Property ID"} />
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
                <FieldLabel text={t(doorNo.label) || "Door / House Number"} />
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
                <FieldLabel text={t(name.label) || "Owner Name"} />
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
            <span>{t("PT_COMMON_TABLE_COL_ACTION") || "Searching..."}</span>
          ) : (
            <>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              {t(propsConfig.texts.submitButtonLabel) || "Search Property"}
            </>
          )}
        </button>

        {/* ── Register Property Row ── */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eaedf3", padding: "14px 20px", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", boxShadow: "0 1px 8px rgba(26,43,73,0.05)" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "#fff5ef", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>{t("PT_REGISTER_NEW_PROPERTY_MSG") || "Don't have a registered property yet?"}</span>
            <span style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "6px" }}>{t("PT_HOME_NEW_APP_DESC") || "Register online in a few easy steps."}</span>
          </div>
          <Link to={"/suda-ui/citizen/pt/property/new-application/info"} style={{ textDecoration: "none", flexShrink: 0 }}>
            <button type="button" style={{ padding: "8px 16px", background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
              {t("PT_CREATE_PROPERTY") || "Register Now"}
            </button>
          </Link>
        </div>

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
