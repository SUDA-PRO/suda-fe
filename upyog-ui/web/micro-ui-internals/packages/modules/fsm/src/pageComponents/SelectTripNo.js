import React, { useState, useEffect } from "react";
import { Loader } from "@upyog/digit-ui-react-components";

const SelectTripNo = ({ config, formData, t, onSelect, userType }) => {
  const state = Digit.ULBService.getStateId();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const selectedCity = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code;
  const { data: tripNumberData, isLoading } = Digit.Hooks.fsm.useMDMS(stateId, "FSM", "TripNumber");
  const { data: dsoData, isLoading: isDsoLoading, isSuccess: isDsoSuccess, error: dsoError } = Digit.Hooks.fsm.useDsoSearch(selectedCity, {
    limit: -1,
    status: "ACTIVE",
  });
  const { isLoading: isVehicleMenuLoading, data: vehicleData } = Digit.Hooks.fsm.useMDMS(state, "Vehicle", "VehicleType", {
    staleTime: Infinity,
  });
  const [tripNo, setTripNo] = useState(formData?.tripNo);
  const [vehicleCapacity, setVehicleCapacity] = useState(formData?.capacity);
  const [vehicleMenu, setVehicleMenu] = useState([]);

  useEffect(() => {
    if (dsoData && vehicleData) {
      const allVehicles = dsoData.reduce((acc, curr) => {
        return curr.vehicles && curr.vehicles.length ? acc.concat(curr.vehicles) : acc;
      }, []);

      const cpacityMenu = Array.from(new Set(allVehicles.map((a) => a.capacity))).map((capacity) => allVehicles.find((a) => a.capacity === capacity));

      setVehicleMenu(cpacityMenu);
    }
  }, [dsoData, vehicleData]);

  useEffect(() => {
    if (!isLoading && tripNumberData) {
      const preFilledTripNumber = tripNumberData.filter(
        (tripNumber) => tripNumber.code === (formData?.selectTripNo?.tripNo?.code || formData?.selectTripNo)
      )[0];
      preFilledTripNumber ? setTripNo(preFilledTripNumber) : setTripNo(tripNumberData.find((i) => i.code === 1));
    }
  }, [formData?.selectTripNo?.tripNo, tripNumberData]);

  useEffect(() => {
    if (!isLoading && vehicleMenu) {
      const preFilledCapacity = vehicleMenu.filter((i) => i.capacity === formData?.selectTripNo?.vehicleCapacity?.capacity)[0];
      let minCapacity = vehicleMenu.reduce((prev, current) => (prev.capacity < current.capacity ? prev : current), 0);
      preFilledCapacity ? setVehicleCapacity(preFilledCapacity) : setVehicleCapacity(minCapacity);
    }
  }, [formData?.selectTripNo?.vehicleCapacity, vehicleMenu]);

  const SelectTrip = (value) => {
    setTripNo(value);
    if (userType === "employee") {
      return null;
    }
  };

  const selectVehicle = (value) => {
    setVehicleCapacity(value);
    if (userType === "employee") {
      return null;
    }
  };

  const onSkip = () => {
    if (tripNo) {
      onSelect(config.key, { tripNo, vehicleCapacity });
    }
  };

  const onSubmit = () => {
    if (tripNo) {
      onSelect(config.key, { tripNo, vehicleCapacity });
    }
  };

  if (isLoading || isDsoLoading || isVehicleMenuLoading) {
    return <Loader />;
  }

  if (userType === "employee") {
    return null;
  }

  const cardStyle = {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e8edf5",
    boxShadow: "0 2px 12px rgba(9,30,100,0.07)",
    marginBottom: "16px",
    overflow: "hidden",
  };
  const sectionHeaderStyle = {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "14px 20px",
    background: "linear-gradient(135deg,#f8faff 0%,#f0f4ff 100%)",
    borderBottom: "1px solid #e8edf5",
  };
  const fieldRowStyle = {
    padding: "18px 20px",
    borderBottom: "1px solid #f3f4f6",
  };
  const lastFieldRowStyle = {
    padding: "18px 20px",
  };
  const fieldLabelStyle = {
    fontSize: "13px", color: "#6b7280", fontWeight: "600",
    marginBottom: "10px", display: "block",
  };
  const selectStyle = {
    width: "100%",
    padding: "11px 16px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px", color: "#111827", fontWeight: "500",
    background: "#fff",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    cursor: "pointer",
    outline: "none",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    transition: "border-color 0.15s",
  };

  const tripOptions = (tripNumberData || []).map((t) => ({ code: t.code, label: t.i18nKey || t.code }));
  const vehicleOptions = (vehicleMenu || [])
    .map((v) => ({ capacity: v.capacity, label: `${v.capacity} Ltrs` }))
    .sort((a, b) => a.capacity - b.capacity);

  return (
    <React.Fragment>
      <div style={{ padding: "16px 0" }}>
        <div style={{ maxWidth: "900px" }}>

          {/* ── Hero banner ── */}
          <div style={{
            display: "flex", alignItems: "center", gap: "14px",
            padding: "18px 22px",
            background: "linear-gradient(135deg,#091e64 0%,#1a3a8f 100%)",
            borderRadius: "16px",
            marginBottom: "18px",
            boxShadow: "0 6px 24px rgba(9,30,100,0.18)",
          }}>
            <div style={{
              flexShrink: 0, width: "48px", height: "48px", borderRadius: "12px",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.25)",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4l3 3v4h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff", marginBottom: "2px" }}>
                {t("CS_FSM_TRIP_DETAILS_TITLE") || "Service Request"}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)", lineHeight: "1.5" }}>
                {t("CS_FSM_TRIP_DETAILS_SUBTITLE") || "Select the number of trips and vehicle capacity required."}
              </div>
            </div>
          </div>

          {/* ── Trip Details card ── */}
          <div style={cardStyle}>
            {/* Card header */}
            <div style={sectionHeaderStyle}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: "#f4773820",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </div>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#091E64" }}>
                {t("CS_FSM_TRIP_CARD_HEADER") || "Trip Details"}
              </span>
            </div>

            {/* Number of Trips */}
            <div style={fieldRowStyle}>
              <label style={fieldLabelStyle}>
                {t("ES_NEW_APPLICATION_NO_OF_TRIPS") || "Number of Trips"}
                <span style={{ color: "#f47738", marginLeft: "2px" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <select
                  style={selectStyle}
                  value={tripNo?.code ?? ""}
                  onChange={(e) => {
                    const selected = (tripNumberData || []).find((x) => String(x.code) === String(e.target.value));
                    if (selected) SelectTrip(selected);
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#f47738"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }}
                >
                  {tripOptions.map((opt) => (
                    <option key={opt.code} value={opt.code}>{t(opt.label) || opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vehicle Capacity */}
            <div style={lastFieldRowStyle}>
              <label style={fieldLabelStyle}>
                {t("ES_NEW_APPLICATION_VEHICLE_CAPACITY") || "Vehicle Capacity (Ltrs)"}
                <span style={{ color: "#f47738", marginLeft: "2px" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <select
                  style={selectStyle}
                  value={vehicleCapacity?.capacity ?? ""}
                  onChange={(e) => {
                    const selected = (vehicleMenu || []).find((v) => String(v.capacity) === String(e.target.value));
                    if (selected) selectVehicle(selected);
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#f47738"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }}
                >
                  {vehicleOptions.map((opt) => (
                    <option key={opt.capacity} value={opt.capacity}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Info note ── */}
          <div style={{
            borderRadius: "14px",
            background: "linear-gradient(135deg,#fffbf5 0%,#fff3e0 100%)",
            border: "1px solid #ffe0b2",
            padding: "13px 18px",
            display: "flex", gap: "12px", alignItems: "flex-start",
            boxShadow: "0 2px 8px rgba(244,119,56,0.07)",
            marginBottom: "24px",
          }}>
            <div style={{
              flexShrink: 0, width: "30px", height: "30px", borderRadius: "50%",
              background: "linear-gradient(135deg,#f47738,#e85d00)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(244,119,56,0.3)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                <path d="M12 8v4m0 4h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ fontSize: "13px", color: "#7a4000", lineHeight: "1.6" }}>
              {t("CS_FSM_TRIP_INFO_TEXT") || "Don't know how many trips or vehicle capacity it takes to complete this service? You can skip and our team will assess during field inspection."}
            </div>
          </div>

          {/* ── Actions ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              onClick={onSkip}
              style={{
                padding: "11px 28px",
                borderRadius: "8px",
                border: "1.5px solid #f47738",
                background: "#fff",
                color: "#f47738", fontSize: "14px", fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(244,119,56,0.12)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fff8f3"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
            >
              {t("CS_COMMON_SKIP") || "Skip and Continue"}
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!tripNo && !vehicleCapacity}
              style={{
                padding: "12px 40px",
                borderRadius: "8px", border: "none",
                background: (!tripNo && !vehicleCapacity) ? "#d1d5db" : "linear-gradient(135deg,#f47738 0%,#e05e18 100%)",
                color: "#fff", fontSize: "15px", fontWeight: "700",
                cursor: (!tripNo && !vehicleCapacity) ? "not-allowed" : "pointer",
                boxShadow: (!tripNo && !vehicleCapacity) ? "none" : "0 4px 14px rgba(244,119,56,0.4)",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => { if (tripNo || vehicleCapacity) e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              {t("CS_COMMON_NEXT") || "Next"}
            </button>
          </div>

        </div>
      </div>
    </React.Fragment>
  );
};

export default SelectTripNo;
