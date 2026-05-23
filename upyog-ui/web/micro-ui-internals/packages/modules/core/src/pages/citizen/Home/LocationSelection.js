import { BackButton } from "@upyog/digit-ui-react-components";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";

const LocationSelection = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const { data: cities, isLoading } = Digit.Hooks.useTenants();

  const [selectedCity, setSelectedCity] = useState(() => {
    const code = Digit.ULBService.getCitizenCurrentTenant(true);
    return code ? { code } : null;
  });
  const [showError, setShowError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  /* close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* sync selectedCity label once cities loaded */
  useEffect(() => {
    if (cities && selectedCity?.code && !selectedCity?.i18nKey) {
      const match = cities.find((c) => c.code === selectedCity.code);
      if (match) setSelectedCity(match);
    }
  }, [cities]);

  const filteredCities = useMemo(() => {
    if (!cities) return [];
    if (!search.trim()) return cities;
    return cities.filter((c) =>
      t(c.i18nKey || c.name || c.code).toLowerCase().includes(search.toLowerCase())
    );
  }, [cities, search, t]);

  function selectCity(city) {
    setSelectedCity(city);
    setSearch("");
    setIsOpen(false);
    setShowError(false);
  }

  function onSubmit() {
    if (selectedCity?.code) {
      Digit.SessionStorage.set("CITIZEN.COMMON.HOME.CITY", selectedCity);
      const redirectBackTo = location.state?.redirectBackTo;
      if (redirectBackTo) history.replace(redirectBackTo);
      else history.push("/suda-ui/citizen");
    } else {
      setShowError(true);
    }
  }

  const displayLabel = selectedCity?.i18nKey
    ? t(selectedCity.i18nKey)
    : selectedCity?.name || selectedCity?.code || "";

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: "48px", height: "48px", border: "4px solid #f47738", borderTop: "4px solid transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", position: "relative" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dropIn { from { opacity: 0; transform: scaleY(0.92) translateY(6px); } to { opacity: 1; transform: scaleY(1) translateY(0); } }
        .loc-card { animation: fadeUp 0.4s ease both; }
        .loc-submit-btn:hover:not(:disabled) { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(244,119,56,0.45) !important; }
        .loc-submit-btn:active:not(:disabled) { transform: translateY(0) !important; }
        .loc-back-btn { position: absolute !important; top: 20px !important; left: 20px !important; }
        .loc-dropdown-list { animation: dropIn 0.18s ease both; transform-origin: bottom center; }
        .loc-city-item:hover { background: #fff3ec !important; color: #f47738 !important; }
        .loc-city-item.selected { background: #fff3ec !important; color: #f47738 !important; font-weight: 700 !important; }
        .loc-dropdown-list::-webkit-scrollbar { width: 5px; }
        .loc-dropdown-list::-webkit-scrollbar-thumb { background: #e0e4ed; border-radius: 4px; }
        .loc-search-input:focus { outline: none !important; }
        .loc-trigger:focus { outline: none; }
      `}</style>

      {/* Back button */}
      <div className="loc-back-btn"><BackButton /></div>

      {/* Card */}
      <div className="loc-card" style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 20px 60px rgba(26,43,73,0.12), 0 4px 16px rgba(0,0,0,0.06)", padding: "40px 36px 32px", width: "100%", maxWidth: "480px" }}>

        {/* Icon + Title */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(244,119,56,0.30)" }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: "800", color: "#1a2b49", letterSpacing: "-0.3px" }}>{t("CS_COMMON_CHOOSE_LOCATION")}</h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#7a8a9e" }}>{t("CS_LOCATION_SUBTEXT") || "Select your city to access local services"}</p>
        </div>

        {/* Divider */}
        <div style={{ height: "2px", background: "linear-gradient(90deg, #f47738 0%, #1a2b4920 100%)", borderRadius: "2px", marginBottom: "28px" }} />

        {/* Custom Dropdown */}
        <div ref={dropdownRef} style={{ position: "relative" }}>

          {/* Label */}
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#3d4f6b", marginBottom: "8px", letterSpacing: "0.2px" }}>
            {t("MYCITY_CODE_LABEL") || "City / ULB"} <span style={{ color: "#e54d42" }}>*</span>
          </label>

          {/* Trigger button */}
          <button
            className="loc-trigger"
            onClick={() => setIsOpen((o) => !o)}
            style={{
              width: "100%",
              height: "48px",
              padding: "0 16px",
              background: "#fff",
              border: `2px solid ${isOpen ? "#f47738" : "#d0d5dd"}`,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "border-color 0.2s",
              boxShadow: isOpen ? "0 0 0 3px rgba(244,119,56,0.12)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={selectedCity?.code ? "#f47738" : "#aab1be"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span style={{ fontSize: "14px", color: selectedCity?.code ? "#1a2b49" : "#aab1be", fontWeight: selectedCity?.code ? "600" : "400" }}>
                {selectedCity?.code ? displayLabel : (t("PT_SELECT_PLACEHOLDER") || "Select cityâ€¦")}
              </span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a8a9e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Dropdown panel */}
          {isOpen && (
            <div className="loc-dropdown-list" style={{ position: "absolute", bottom: "calc(100% + 6px)", top: "auto", left: 0, right: 0, background: "#fff", border: "2px solid #f47738", borderRadius: "14px", boxShadow: "0 -8px 32px rgba(26,43,73,0.16)", zIndex: 9999, overflow: "hidden" }}>

              {/* Search inside dropdown */}
              <div style={{ padding: "10px 12px", borderBottom: "1px solid #f0f2f5" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", borderRadius: "8px", padding: "6px 12px", border: "1px solid #e4e8f0" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aab1be" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    className="loc-search-input"
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("COMMON_TABLE_SEARCH") || "Search cityâ€¦"}
                    style={{ border: "none", background: "transparent", fontSize: "13px", color: "#1a2b49", width: "100%", outline: "none" }}
                  />
                  {search && (
                    <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: "#aab1be" }}>âœ•</button>
                  )}
                </div>
              </div>

              {/* City list */}
              <div className="loc-dropdown-list" style={{ maxHeight: "280px", overflowY: "auto" }}>
                {filteredCities.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "#aab1be", fontSize: "13px" }}>{t("COMMON_NO_RESULTS_FOUND") || "No cities found"}</div>
                ) : (
                  filteredCities.map((city) => (
                    <div
                      key={city.code}
                      className={`loc-city-item${selectedCity?.code === city.code ? " selected" : ""}`}
                      onClick={() => selectCity(city)}
                      style={{ padding: "12px 16px", fontSize: "14px", color: "#1a2b49", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", transition: "background 0.15s, color 0.15s", borderBottom: "1px solid #f8f9fb" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {t(city.i18nKey || city.name || city.code)}
                      {selectedCity?.code === city.code && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "auto", flexShrink: 0 }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {showError && (
          <div style={{ marginTop: "12px", padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", color: "#dc2626", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {t("CS_COMMON_LOCATION_SELECTION_ERROR")}
          </div>
        )}

        {/* Submit */}
        <button
          className="loc-submit-btn"
          onClick={onSubmit}
          disabled={!selectedCity?.code}
          style={{ marginTop: "24px", width: "100%", height: "50px", background: selectedCity?.code ? "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)" : "#d0d5dd", color: selectedCity?.code ? "#ffffff" : "#8a97a8", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: selectedCity?.code ? "pointer" : "not-allowed", transition: "transform 0.15s ease, box-shadow 0.15s ease", boxShadow: selectedCity?.code ? "0 4px 16px rgba(244,119,56,0.35)" : "none", letterSpacing: "0.3px", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {t("CORE_COMMON_CONTINUE")}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "8px" }}>
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>

      </div>
    </div>
  );
};


export default LocationSelection;
