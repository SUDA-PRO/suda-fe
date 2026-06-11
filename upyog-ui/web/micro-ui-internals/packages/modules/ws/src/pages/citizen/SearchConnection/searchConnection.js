import React, { Fragment, useState, useEffect } from "react";
import { Loader, Localities, InfoBannerIcon, Dropdown, Toast } from "@upyog/digit-ui-react-components";
import PropTypes from "prop-types";
import { useHistory, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SearchConnection = ({ config: propsConfig, formData }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const logginedUser = Digit.UserService.getUser();
  const [mobileNumber, setMobileNumber] = useState(formData?.mobileNumber || "");
  const [consumerNumber, setconsumerNumber] = useState(formData?.consumerNumber || "");
  const [oldconsumerNumber, setoldconsumerNumber] = useState(formData?.oldconsumerNumber || "");
  const [doorNumber, setdoorNumber] = useState(formData?.doorNumber || "");
  const [propertyId, setpropertyId] = useState(formData?.propertyId || "");
  const [consumerName, setconsumerName] = useState(formData?.consumerName || "");
  const [city, setcity] = useState(formData?.city || null);
  const [showToast, setShowToast] = useState(null);
  const [locality, setLocality] = useState(formData?.locality || "");
  const [searchType, setSearchType] = useState(formData?.searchType || { code: "CONSUMER_NUMBER", i18nKey: "WS_CONSUMER_NUMBER_SEARCH" });
  const [isSearching, setIsSearching] = useState(false);
  const allCities = Digit.Hooks.ws.usewsTenants()?.sort((a, b) => a?.i18nKey?.localeCompare?.(b?.i18nKey));

  const { data: ptSearchConfig } = Digit.Hooks.pt.useMDMS(Digit.ULBService.getStateId(), "DIGIT-UI", "HelpText", {
    select: (data) => data?.["DIGIT-UI"]?.["HelpText"]?.[0]?.PT,
  });

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  const SearchTypes = [
    { code: "CONSUMER_NUMBER", i18nKey: "WS_CONSUMER_NUMBER_SEARCH" },
    { code: "CONNECTION_DETAILS", i18nKey: "WS_CONNECTION_DETAILS_SEARCH" },
  ];

  const onConnectionSearch = async () => {
    if (searchType.code === "CONSUMER_NUMBER") {
      if (!city?.code) {
        setShowToast({ key: true, label: "WS_PLEASE_PROVIDE_CITY" });
        return;
      }
      if (!mobileNumber && !consumerNumber && !oldconsumerNumber && !propertyId) {
        setShowToast({ key: true, label: "WS_HOME_SEARCH_CONN_RESULTS_DESC" });
        return;
      }
      history.push(
        `/suda-ui/citizen/ws/search-results?mobileNumber=${mobileNumber}&consumerNumber=${consumerNumber}&oldconsumerNumber=${oldconsumerNumber}&propertyId=${propertyId}&tenantId=${city.code}&locality=${undefined}`
      );
    } else {
      if (!city?.code) {
        setShowToast({ key: true, label: "WS_PLEASE_PROVIDE_CITY" });
        return;
      }
      if (logginedUser == null && !locality) {
        setShowToast({ key: true, label: "WS_PLEASE_PROVIDE_LOCALITY" });
        return;
      }
      if (!doorNumber && !consumerName) {
        setShowToast({ key: true, label: "WS_HOME_SEARCH_CONN_RESULTS_DESC" });
        return;
      }
      setIsSearching(true);
      let filters = {};
      if (locality !== "undefined") filters.locality = locality?.code;
      if (doorNumber) filters.doorNo = doorNumber;
      if (consumerName) filters.ownerName = consumerName;
      filters = { ...filters, searchType: "CONNECTION" };
      const response = await Digit.WSService.search({ tenantId: city?.code, filters: { ...filters }, businessService: "WS" });
      const SWresponse = await Digit.WSService.search({ tenantId: city?.code, filters: { ...filters }, businessService: "SW" });
      setIsSearching(false);
      let totalResponse = response?.TotalCount + SWresponse?.TotalCount;
      if (ptSearchConfig?.maxResultValidation && totalResponse > ptSearchConfig?.maxPropertyResult) {
        setShowToast({ key: true, label: "Refine your search" });
      } else {
        history.push(
          `/suda-ui/citizen/ws/search-results?doorNumber=${doorNumber}&consumerName=${consumerName}&tenantId=${city.code}&locality=${locality.code}`
        );
      }
    }
  };

  // ── Shared styles ──
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
    <span
      style={{
        width: "22px",
        height: "22px",
        borderRadius: "7px",
        background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: "11px",
        fontWeight: "800",
        flexShrink: 0,
      }}
    >
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
    borderRadius: isMobile ? "10px" : "14px",
    border: "1px solid #eaedf3",
    padding: isMobile ? "14px 16px" : isTablet ? "18px 20px" : "20px 24px",
    boxShadow: "0 1px 6px rgba(26,43,73,0.05)",
  };

  const isConsumerMode = searchType.code === "CONSUMER_NUMBER";

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa" }}>
      {/* ── Top Hero Banner ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #ff8c42 0%, #f47738 50%, #d44f0a 100%)",
          padding: isMobile ? "20px 16px 24px" : isTablet ? "24px 24px 28px" : "28px 32px 32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-60px",
            top: "-60px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "-50px",
            bottom: "-50px",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "rgba(0,0,0,0.08)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: isMobile ? "flex-start" : isTablet ? "flex-start" : "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.28)",
                borderRadius: "16px",
                padding: "3px 10px",
                marginBottom: "10px",
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span style={{ fontSize: "10px", fontWeight: "700", color: "#fff", letterSpacing: "0.7px", textTransform: "uppercase" }}>
                {t("ACTION_TEST_WS")}
              </span>
            </div>
            <div style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: "800", color: "#fff", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              {t("WS_SEARCH_CONNECTION_HEADER")}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", marginTop: "4px" }}>
              {t("WS_HOME_SEARCH_CONN_RESULTS_DESC")}
            </div>
          </div>
          <div style={{ display: isMobile ? "none" : "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              {
                svg: (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                ),
                text: t("WS_SEARCH_BY_CONSUMER_NO"),
              },
              {
                svg: (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                ),
                text: t("WS_PAY_INSTANTLY"),
              },
              {
                svg: (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                ),
                text: t("WS_DOWNLOAD_RECEIPTS"),
              },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  background: "rgba(255,255,255,0.14)",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                {f.svg}
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.92)", fontWeight: "500" }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form Body ── */}
      <div style={{ padding: isMobile ? "16px 12px 48px" : isTablet ? "20px 20px 48px" : "24px 32px 56px" }}>
        {/* ── Step 0: Search Type Toggle ── */}
        <div style={{ ...sectionCard, marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              marginBottom: "12px",
            }}
          >
            {t("WS_SEARCH_CONNECTION_BY")}
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              {
                code: "CONSUMER_NUMBER",
                label: t("CONSUMER_NUMBER"),
                icon: (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                ),
              },
              {
                code: "CONNECTION_DETAILS",
                label: t("CONNECTION_DETAILS"),
                icon: (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                ),
              },
            ].map((opt) => {
              const isActive = searchType.code === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    if (!isActive) {
                      setSearchType(SearchTypes.find((s) => s.code === opt.code));
                      setMobileNumber("");
                      setconsumerNumber("");
                      setoldconsumerNumber("");
                      setpropertyId("");
                      setdoorNumber("");
                      setconsumerName("");
                      setLocality("");
                    }
                  }}
                  style={{
                    flex: isMobile ? "1 1 100%" : "1",
                    minWidth: isMobile ? "100%" : "160px",
                    padding: isMobile ? "11px 16px" : "13px 20px",
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

        {/* ── Step 1 & 2: City (+ Locality for CONNECTION_DETAILS) ── */}
        <div
          style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : (!isConsumerMode && isDesktop) ? "1fr 1fr" : (!isConsumerMode && isTablet) ? "1fr 1fr" : "1fr", gap: isMobile ? "12px" : "16px", marginBottom: isMobile ? "12px" : "16px" }}
        >
          {/* City */}
          <div style={sectionCard}>
            <SectionHeader step="1" title={t("WS_PROP_DETAIL_CITY")} required />
            <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "10px" }}>
              {t("CS_LOCATION_SUBTEXT")}
            </div>
            <Dropdown
              t={t}
              isMandatory
              option={allCities}
              optionKey="i18nKey"
              selected={city}
              optionCardStyles={{ maxHeight: "220px", overflowY: "auto", zIndex: 20 }}
              select={(d) => {
                Digit.LocalizationService.getLocale({
                  modules: [`rainmaker-${d?.code}`],
                  locale: Digit.StoreData.getCurrentLanguage(),
                  tenantId: `${d?.code}`,
                });
                setcity(d);
                setLocality("");
              }}
            />
          </div>

          {/* Locality — CONNECTION_DETAILS mode only */}
          {!isConsumerMode && (
            <div style={sectionCard}>
              <SectionHeader step="2" title={t("WS_PROP_DETAIL_LOCALITY_LABEL")} required />
              <div style={{ marginBottom: "5px" }}>
                <br/>
              </div>
              <Localities
                selectLocality={(d) => setLocality(d)}
                tenantId={city?.code}
                boundaryType="revenue"
                keepNull={false}
                optionCardStyles={{ maxHeight: "220px", overflowY: "auto", zIndex: 20 }}
                selected={locality}
                disable={!city?.code}
                disableLoader={true}
              />
            </div>
          )}
        </div>

        {/* ── Step 2/3: Search Fields ── */}
        <div style={{ ...sectionCard, marginBottom: "20px" }}>
          <SectionHeader step={!isConsumerMode ? "3" : "2"} title={t("WS_SEARCH_TEXT")} required={false} />

          {isConsumerMode ? (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr", gap: isMobile ? "14px" : "18px" }}>
              {/* Mobile Number */}
              <div>
                <FieldLabel text={t("WS_CONSUMER_NUMBER_LABEL")} />
                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "center",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "9px",
                    background: "#fafbfc",
                    overflow: "hidden",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#f47738";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(244,119,56,0.10)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span
                    style={{
                      padding: "11px 10px 11px 14px",
                      fontSize: "14px",
                      color: "#6b7280",
                      fontWeight: "600",
                      borderRight: "1px solid #e5e7eb",
                      background: "#f3f4f6",
                      whiteSpace: "nowrap",
                    }}
                  >
                    +91
                  </span>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    style={{
                      flex: 1,
                      padding: "11px 14px",
                      border: "none",
                      outline: "none",
                      fontSize: "14px",
                      color: "#1a2b49",
                      background: "transparent",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              {/* Consumer Number */}
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.45px",
                    marginBottom: "7px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {t("WS_MYCONNECTIONS_CONSUMER_NO")}
                  <div className="tooltip" style={{ display: "inline-flex", cursor: "help" }}>
                    <InfoBannerIcon fill="#9ca3af" />
                    <span className="tooltiptext" style={{ width: "160px", fontSize: "12px" }}>
                      {t("WS_CONSUMER_NO_DESCRIPTION") + " " + t("WS_CONSUMER_NO_FORMAT")}
                    </span>
                  </div>
                </div>
                <input
                  type="text"
                  value={consumerNumber}
                  onChange={(e) => setconsumerNumber(e.target.value)}
                  placeholder=""
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              {/* Old Consumer Number */}
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.45px",
                    marginBottom: "7px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {t("WS_SEARCH_CONNNECTION_OLD_CONSUMER_LABEL")}
                  <div className="tooltip" style={{ display: "inline-flex", cursor: "help" }}>
                    <InfoBannerIcon fill="#9ca3af" />
                    <span className="tooltiptext" style={{ width: "160px", fontSize: "12px" }}>
                      {t("WS_CONSUMER_NO_DESCRIPTION") + " " + t("WS_CONSUMER_NO_FORMAT")}
                    </span>
                  </div>
                </div>
                <input
                  type="text"
                  value={oldconsumerNumber}
                  onChange={(e) => setoldconsumerNumber(e.target.value)}
                  placeholder=""
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              {/* Property ID */}
              <div>
                <FieldLabel text={t("WS_PROPERTY_ID_LABEL")} />
                <input
                  type="text"
                  value={propertyId}
                  onChange={(e) => setpropertyId(e.target.value)}
                  placeholder=""
                  style={{ ...inputStyle, marginTop: "4px" }}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr", gap: isMobile ? "14px" : "18px" }}>
              {/* Door Number */}
              <div>
                <FieldLabel text={t("WS_DOOR_NO_LABEL")} />
                <input
                  type="text"
                  value={doorNumber}
                  onChange={(e) => setdoorNumber(e.target.value)}
                  placeholder=""
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
              {/* Consumer / Owner Name */}
              <div>
                <FieldLabel text={t("WS_CONSUMER_NAME_LABEL")} />
                <input
                  type="text"
                  value={consumerName}
                  onChange={(e) => setconsumerName(e.target.value)}
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
          onClick={onConnectionSearch}
          disabled={isSearching}
          style={{
            width: "100%",
            padding: "15px 32px",
            background: isSearching ? "#d1d5db" : "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)",
            border: "none",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "15px",
            fontWeight: "700",
            cursor: isSearching ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: isSearching ? "none" : "0 4px 20px rgba(244,119,56,0.35)",
            marginBottom: "20px",
            letterSpacing: "0.3px",
            transition: "opacity 0.15s",
          }}
        >
          {isSearching ? (
            <span>{t("WS_SEARCHING") || "Searching..."}</span>
          ) : (
            <>
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {t("WS_SEARCH_LABEL")}
            </>
          )}
        </button>

        {/* ── Register Property Row ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #eaedf3",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            flexWrap: "wrap",
            boxShadow: "0 1px 8px rgba(26,43,73,0.05)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "9px",
              background: "#fff5ef",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f47738"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
              {t("WS_CREATE_NEW_CONNECTION_MSG")}
            </span>
          </div>
          <Link to={"/suda-ui/citizen/ws/create-application/search-property"} style={{ textDecoration: "none", flexShrink: 0 }}>
            <button
              type="button"
              style={{
                padding: "8px 16px",
                background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              {t("WS_CREATE_CONNECTION")}
            </button>
          </Link>
        </div>
      </div>

      {showToast && <Toast isDleteBtn={true} error={showToast.key} label={t(showToast.label)} onClose={() => setShowToast(null)} />}
    </div>
  );
};

SearchConnection.propTypes = {
  loginParams: PropTypes.any,
};

SearchConnection.defaultProps = {
  loginParams: null,
};

export default SearchConnection;
