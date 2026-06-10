import { Dropdown, Localities, Loader, Toast } from "@upyog/digit-ui-react-components";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * BPASearchProperty — PT-style search UI for BPA search-property step.
 * Registered as "CPTSearchProperty" in the OBPS component registry.
 */
const BPASearchProperty = ({ config, onSelect, onSkip }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateCode = Digit.ULBService.getStateId();
  const isMobile = window.Digit.Utils.browser.isMobile();

  const obpsTenants = Digit.SessionStorage.get("OBPS_TENANTS");
  const ptTenants = Digit.Hooks.pt.useTenants()?.sort((a, b) => a?.i18nKey?.localeCompare?.(b?.i18nKey));
  const allCities = (obpsTenants && obpsTenants.length > 0 ? obpsTenants : ptTenants) || [];

  const [searchMode, setSearchMode] = useState(0); // 0 = ID/Mobile, 1 = Owner/Address
  const [cityCode, setCityCode] = useState(undefined);
  const [formCity, setFormCity] = useState(null);
  const [formLocality, setFormLocality] = useState(null);
  const [formMobile, setFormMobile] = useState("");
  const [formPropertyId, setFormPropertyId] = useState("");
  const [formDoorNo, setFormDoorNo] = useState("");
  const [formOwnerName, setFormOwnerName] = useState("");
  const [showToast, setShowToast] = useState(null);
  const [searchData, setSearchData] = useState({});

  const searchEnabled = Object.keys(searchData).length > 0;

  const { data: propertyData, isLoading: propertyDataLoading, error } = Digit.Hooks.pt.usePropertySearchWithDue({
    tenantId: searchData?.city,
    filters: searchData?.filters,
    auth: true,
    configs: { enabled: searchEnabled, retry: false, retryOnMount: false, staleTime: 0 },
  });

  useEffect(() => {
    if (!searchEnabled) return;
    if (propertyDataLoading) return;
    if (error) {
      setShowToast({ error: true, label: error?.response?.data?.Errors?.[0]?.code || "PT_MUTATION_ERROR_KEY" });
      return;
    }
    if (propertyData) {
      if (propertyData?.Properties?.length > 0) {
        // Pass search params to formData.cptSearchQuery — CPTSearchResults reads this key
        const searchParams = searchMode === 0
          ? { city: searchData.city, mobileNumber: searchData.filters?.mobileNumber || "", propertyIds: searchData.filters?.propertyIds || "", oldPropertyIds: "", locality: "", doorNo: "", name: "" }
          : { city: searchData.city, locality: searchData.filters?.locality || "", doorNo: searchData.filters?.doorNo || "", name: searchData.filters?.name || "", mobileNumber: "", propertyIds: "", oldPropertyIds: "" };
        onSelect(config?.key, searchParams);
      } else {
        setShowToast({ error: true, label: "PT_NO_RECORDS_FOUND" });
      }
    }
  }, [propertyData, propertyDataLoading, error, searchEnabled, searchMode]);

  const handleModeChange = (mode) => {
    setSearchMode(mode);
    setFormCity(null); setFormLocality(null); setCityCode(undefined);
    setFormMobile(""); setFormPropertyId(""); setFormDoorNo(""); setFormOwnerName("");
    setSearchData({});
  };

  const handleSubmit = () => {
    if (!formCity?.code) {
      setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS" });
      return;
    }
    if (searchMode === 0 && !(formMobile || formPropertyId)) {
      setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS" });
      return;
    }
    if (searchMode === 1 && !formLocality?.code) {
      setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS" });
      return;
    }
    if (searchMode === 1 && !(formDoorNo || formOwnerName)) {
      setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS" });
      return;
    }
    setShowToast(null);
    setSearchData({}); // reset first so the hook disables/re-enables cleanly
    const filters = {};
    if (searchMode === 0) {
      if (formMobile) filters.mobileNumber = formMobile;
      if (formPropertyId) filters.propertyIds = formPropertyId;
    } else {
      if (formLocality?.code) filters.locality = formLocality.code;
      if (formDoorNo) filters.doorNo = formDoorNo;
      if (formOwnerName) filters.name = formOwnerName;
    }
    setTimeout(() => setSearchData({ city: formCity.code, filters }), 0);
    console.log("[BPASearchProperty] search params →", { tenantId: formCity.code, filters });
  };

  /* ── styles ────────────────────────────────────────────────── */
  const sectionCard = { background: "#fff", borderRadius: "14px", border: "1px solid #eaedf3", padding: "20px 24px", boxShadow: "0 1px 6px rgba(26,43,73,0.05)", marginBottom: "16px" };
  const inputStyle = { width: "100%", padding: "11px 14px", border: "1.5px solid #e5e7eb", borderRadius: "9px", fontSize: "14px", color: "#1a2b49", background: "#fafbfc", boxSizing: "border-box", outline: "none", fontFamily: "inherit" };
  const inputFocus = (e) => { e.target.style.borderColor = "#f47738"; e.target.style.boxShadow = "0 0 0 3px rgba(244,119,56,0.10)"; e.target.style.background = "#fff"; };
  const inputBlur = (e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; e.target.style.background = "#fafbfc"; };
  const FieldLabel = ({ text }) => (
    <div style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.45px", marginBottom: "7px" }}>{text}</div>
  );
  const SectionHeader = ({ step, title, required }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "16px" }}>
      <span style={{ width: "22px", height: "22px", borderRadius: "7px", background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: "800", flexShrink: 0 }}>{step}</span>
      <span style={{ fontSize: "13px", fontWeight: "700", color: "#374151" }}>{title}{required && <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>}</span>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa" }}>

      {/* ── Hero Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)",
        padding: isMobile ? "24px 20px 28px" : "28px 32px 32px",
        position: "relative", overflow: "hidden", marginBottom: "0",
      }}>
        <div style={{ position: "absolute", right: "-60px", top: "-60px", width: "220px", height: "220px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", marginBottom: "4px" }}>
              {t("BPA_BUILDING_PERMIT") || "Building Permit"}
            </div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#fff", lineHeight: 1.2 }}>
              {t("SEARCH_PROPERTY") || "Search Property"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>
              {t("CS_PT_HOME_SEARCH_RESULTS_DESC") || "Find your property to link with this building application"}
            </p>
          </div>
          <div style={{ flexShrink: 0, background: "rgba(255,255,255,0.2)", borderRadius: "20px", padding: "6px 16px", fontSize: "12px", fontWeight: "700", color: "#fff", whiteSpace: "nowrap" }}>
            Step 1 of 3
          </div>
        </div>
        {/* feature chips */}
        <div style={{ position: "relative", display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>
          {[
            { icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, text: "Search by mobile or property ID" },
            { icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, text: "Or search by owner details" },
          ].map((f, i) => (
            <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: "rgba(255,255,255,0.14)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.2)" }}>
              {f.icon}
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.92)", fontWeight: "500" }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form Body ── */}
      <div style={{ padding: isMobile ? "20px 16px 48px" : "24px 32px 56px" }}>

        {/* Search Mode Toggle */}
        <div style={{ ...sectionCard }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "12px" }}>
            {t("PT_HOME_SEARCH_PROPERTY_BY") || "Search Property By"}
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { code: 0, label: t("PT_KNOW_PT_ID") || "Property ID / Mobile", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
              { code: 1, label: t("PT_KNOW_PT_DETAIL") || "Owner / Address Details", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
            ].map((opt) => {
              const isActive = searchMode === opt.code;
              return (
                <button key={opt.code} type="button" onClick={() => handleModeChange(opt.code)} style={{ flex: 1, minWidth: "160px", padding: "13px 20px", borderRadius: "10px", border: isActive ? "2px solid #f47738" : "2px solid #e5e7eb", background: isActive ? "linear-gradient(135deg, #fff8f4 0%, #fff3ec 100%)" : "#f9fafb", color: isActive ? "#d44f0a" : "#6b7280", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: isActive ? "0 2px 10px rgba(244,119,56,0.18)" : "none" }}>
                  {opt.icon}{opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* City + (Locality if mode 1) */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : searchMode === 1 ? "1fr 1fr" : "1fr", gap: "16px", marginBottom: "16px" }}>
          <div style={sectionCard}>
            <SectionHeader step="1" title={t("PT_SELECT_CITY") || "Select City"} required />
            <Dropdown
              t={t}
              isMandatory
              option={allCities}
              optionKey="i18nKey"
              selected={formCity}
              optionCardStyles={{ maxHeight: "220px", overflowY: "auto", zIndex: 20 }}
              select={(d) => {
                Digit.LocalizationService.getLocale({ modules: [`rainmaker-${d?.code}`], locale: Digit.StoreData.getCurrentLanguage(), tenantId: `${d?.code}` });
                if (d?.code !== cityCode) setFormLocality(null);
                setCityCode(d?.code);
                setFormCity(d);
              }}
            />
          </div>
          {searchMode === 1 && (
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

        {/* Additional fields */}
        <div style={{ ...sectionCard, marginBottom: "20px" }}>
          <SectionHeader step={searchMode === 1 ? "3" : "2"} title={t("PT_PROVIDE_ONE_MORE_PARAM") || "Enter at least one of the following"} />
          {searchMode === 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "18px" }}>
              <div>
                <FieldLabel text={t("PT_HOME_SEARCH_RESULTS_OWN_MOB_LABEL") || "Mobile Number"} />
                <input type="tel" value={formMobile} onChange={(e) => setFormMobile(e.target.value)} placeholder="e.g. 9876543210" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div>
                <FieldLabel text={t("PT_PROPERTY_UNIQUE_ID") || "Property ID"} />
                <input type="text" value={formPropertyId} onChange={(e) => setFormPropertyId(e.target.value)} placeholder="e.g. UP-PT-2024-01-01-000001" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "18px" }}>
              <div>
                <FieldLabel text={t("PT_SEARCHPROPERTY_TABEL_DOOR_NO") || "Door / House Number"} />
                <input type="text" value={formDoorNo} onChange={(e) => setFormDoorNo(e.target.value)} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div>
                <FieldLabel text={t("PT_SEARCHPROPERTY_TABEL_OWNERNAME") || "Owner Name"} />
                <input type="text" value={formOwnerName} onChange={(e) => setFormOwnerName(e.target.value)} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={propertyDataLoading}
          style={{ width: "100%", padding: "15px 32px", background: propertyDataLoading ? "#d1d5db" : "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "15px", fontWeight: "700", cursor: propertyDataLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: propertyDataLoading ? "none" : "0 4px 20px rgba(244,119,56,0.35)", marginBottom: "16px", letterSpacing: "0.3px" }}
        >
          {propertyDataLoading ? (
            <Fragment><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>{t("CS_COMMON_SEARCHING") || "Searching..."}</Fragment>
          ) : (
            <Fragment>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              {t("PT_HOME_SEARCH_RESULTS_BUTTON_SEARCH") || "Search Property"}
            </Fragment>
          )}
        </button>

        {/* Skip link */}
        {onSkip && (
          <div style={{ textAlign: "center" }}>
            <button type="button" onClick={onSkip} style={{ background: "none", border: "none", color: "#f47738", fontSize: "13px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>
              {t("CORE_COMMON_SKIP_CONTINUE") || "Skip & Continue without property"}
            </button>
          </div>
        )}
      </div>

      {showToast && (
        <Toast error={showToast.error} warning={showToast.warning} isDleteBtn={true} label={t(showToast.label)} onClose={() => setShowToast(null)} />
      )}
    </div>
  );
};

export default BPASearchProperty;
