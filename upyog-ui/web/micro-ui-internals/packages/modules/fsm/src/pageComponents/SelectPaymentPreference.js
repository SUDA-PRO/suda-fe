import React, { useState, useEffect } from "react";
import { Loader } from "@upyog/digit-ui-react-components";
import Timeline from "../components/TLTimelineInFSM";

const SelectPaymentPreference = ({ config, formData, t, onSelect, userType }) => {
  const tenantId = Digit.ULBService.getCitizenCurrentTenant();
  const stateId = Digit.ULBService.getStateId();
  const [advanceAmount, setAdvanceAmount] = useState(null);
  const [MinAmount, setMinAmount] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [billError, setError] = useState(false);

  // When the consolidated form is used (no selectTripNo step), derive capacity from DSO vehicles
  const cityCode = formData?.address?.city?.code || Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code;
  const skipDsoLoad = !!formData?.selectTripNo?.vehicleCapacity?.capacity;
  const { data: dsoData, isLoading: isDsoLoading } = Digit.Hooks.fsm.useDsoSearch(
    skipDsoLoad ? null : cityCode,
    { limit: -1, status: "ACTIVE" },
    { enabled: !skipDsoLoad && !!cityCode }
  );

  const onSkip = () => {
    onSelect(config.key, { advanceAmount: MinAmount });
  };

  const onSubmit = () => {
    onSelect(config.key, { advanceAmount });
  };

  useEffect(() => {
    if (!formData?.propertyType || !formData?.subtype || !formData?.address) return;
    if (formData?.address?.propertyLocation?.code !== "WITHIN_ULB_LIMITS") {
      // GP flow — no billing lookup
      setAdvanceAmount(0);
      Digit.SessionStorage.set("advance_amount", 0);
      Digit.SessionStorage.set("amount_per_trip", null);
      return;
    }

    // Resolve capacity: prefer explicit selectTripNo, fall back to min DSO vehicle
    let capacity = formData?.selectTripNo?.vehicleCapacity?.capacity;
    let tripCount = formData?.selectTripNo?.tripNo?.code || 1;

    if (!capacity) {
      // Still waiting for DSO data
      if (isDsoLoading || !dsoData) return;
      const allVehicles = (dsoData || []).reduce((acc, dso) =>
        dso.vehicles?.length ? acc.concat(dso.vehicles) : acc, []);
      if (!allVehicles.length) {
        setAdvanceAmount(0);
        Digit.SessionStorage.set("advance_amount", 0);
        Digit.SessionStorage.set("amount_per_trip", null);
        return;
      }
      // Use minimum capacity (same default as SelectTripNo)
      capacity = allVehicles.reduce((min, v) => v.capacity < min ? v.capacity : min, allVehicles[0].capacity);
    }

    (async () => {
      const { slum: slumDetails } = formData.address;
      const slum = slumDetails ? "YES" : "NO";
      const cityTenantId = formData?.address?.city?.code || tenantId;
      const billingDetails = await Digit.FSMService.billingSlabSearch(cityTenantId, {
        propertyType: formData?.subtype?.code,
        capacity,
        slum,
      });

      const billSlab = billingDetails?.billingSlab?.length && billingDetails?.billingSlab[0];
      Digit.SessionStorage.set("amount_per_trip", billSlab?.price ?? null);

      if (billSlab?.price) {
        const totaltripAmount = billSlab.price * tripCount;
        const { advanceAmount: advanceBalanceAmount } = await Digit.FSMService.advanceBalanceCalculate(cityTenantId, {
          totalTripAmount: totaltripAmount,
        });
        setMinAmount(advanceBalanceAmount);
        setTotalAmount(totaltripAmount);
        Digit.SessionStorage.set("total_amount", totaltripAmount);
        Digit.SessionStorage.set("advance_amount", advanceBalanceAmount);
        formData?.selectPaymentPreference?.advanceAmount
          ? setAdvanceAmount(Math.ceil(formData?.selectPaymentPreference?.advanceAmount))
          : setAdvanceAmount(Math.ceil(advanceBalanceAmount));
        setError(false);
      } else if (billSlab?.price === 0) {
        Digit.SessionStorage.set("total_amount", 0);
        onSkip();
      } else {
        sessionStorage.removeItem("Digit.total_amount");
        sessionStorage.removeItem("Digit.advance_amount");
        setError(true);
      }
    })();
  }, [
    formData?.propertyType,
    formData?.subtype,
    formData?.address,
    formData?.selectTripNo?.vehicleCapacity?.capacity,
    formData?.selectTripNo?.tripNo?.code,
    isDsoLoading,
    dsoData,
  ]);

  if (userType === "employee") {
    return null;
  }
  if (!skipDsoLoad && isDsoLoading) return <Loader />;

  const isGpFlow = formData?.address?.propertyLocation?.code === "FROM_GRAM_PANCHAYAT";
  let currentValue = advanceAmount;
  let max = Digit.SessionStorage.get("total_amount");
  let min = Digit.SessionStorage.get("advance_amount");

  if (advanceAmount === null) {
    return <Loader />;
  }

  const isDisabled = currentValue > max || currentValue < min;

  return (
    <React.Fragment>
      <Timeline currentStep={2} flow="APPLY" />
      <div style={{ padding: "16px 0", maxWidth: "640px" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#091E64", margin: "0 0 6px 0", letterSpacing: "-0.3px" }}>
            {t("ES_FSM_PAYMENT_PREFERENCE_LABEL", { defaultValue: "Select Payment Preference" })}
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
            {t("CS_FSM_PAYMENT_SUBTITLE", { defaultValue: "Review the amount details and confirm your advance payment." })}
          </p>
        </div>

        {/* ── Amount Summary Card ── */}
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #e8edf5",
          boxShadow: "0 2px 12px rgba(9,30,100,0.07)",
          marginBottom: "20px",
          overflow: "hidden",
        }}>
          {/* Card header */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "14px 20px",
            background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)",
            borderBottom: "1px solid #e8edf5",
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "linear-gradient(135deg, #f47738, #e8621f)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, boxShadow: "0 2px 6px rgba(244,119,56,0.3)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#091E64" }}>
              {t("ES_TITLE_PAYMENT_DETAILS", { defaultValue: "Payment Details" })}
            </span>
          </div>

          {/* Total Amount row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: "1px solid #f3f4f6",
          }}>
            <div>
              <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500", marginBottom: "2px" }}>
                {t("ADV_TOTAL_AMOUNT", { defaultValue: "Total Amount" })}
              </div>
              {isGpFlow && (
                <div style={{ fontSize: "11px", color: "#f47738", fontWeight: "500", marginTop: "2px" }}>
                  {t("FSM_TOTAL_AMOUNT_NOTE", { defaultValue: "Amount will be determined after field inspection" })}
                </div>
              )}
            </div>
            <div style={{
              fontSize: "18px", fontWeight: "700",
              color: isGpFlow ? "#9ca3af" : "#111827",
            }}>
              {isGpFlow ? "N/A" : (max ? `₹ ${max}` : "—")}
            </div>
          </div>

          {/* Minimum Advance row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: "1px solid #f3f4f6",
          }}>
            <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>
              {t("FSM_ADV_MIN_PAY", { defaultValue: "Minimum Advance" })}
            </div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>
              {min != null ? `₹ ${Math.ceil(min)}` : "—"}
            </div>
          </div>

          {/* Advance Amount (highlighted) */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 20px",
            background: "linear-gradient(135deg, #fff8f3 0%, #fff3e8 100%)",
          }}>
            <div>
              <div style={{ fontSize: "13px", color: "#f47738", fontWeight: "600", marginBottom: "2px" }}>
                {t("ES_NEW_APPLICATION_ADVANCE_COLLECTION", { defaultValue: "Advance Collection" })} (₹)
                <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
              </div>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                {t("CS_FSM_ADV_AUTO_CALC", { defaultValue: "Auto-calculated based on your property" })}
              </div>
            </div>
            <div style={{
              fontSize: "22px", fontWeight: "800", color: "#f47738",
              background: "#fff", borderRadius: "10px",
              padding: "8px 18px",
              border: "1.5px solid #fed7aa",
              boxShadow: "0 2px 8px rgba(244,119,56,0.12)",
              minWidth: "90px", textAlign: "center",
            }}>
              ₹ {advanceAmount != null ? Math.ceil(advanceAmount) : 0}
            </div>
          </div>

          {/* Validation errors */}
          {currentValue > max && (
            <div style={{ padding: "10px 20px", background: "#fff5f5", borderTop: "1px solid #fecaca" }}>
              <span style={{ color: "#dc2626", fontSize: "13px" }}>
                {t("FSM_ADVANCE_AMOUNT_MAX", { defaultValue: "Advance amount cannot exceed total amount" })}
              </span>
            </div>
          )}
          {currentValue < min && (
            <div style={{ padding: "10px 20px", background: "#fff5f5", borderTop: "1px solid #fecaca" }}>
              <span style={{ color: "#dc2626", fontSize: "13px" }}>
                {t("FSM_ADVANCE_AMOUNT_MIN", { defaultValue: "Advance amount cannot be less than minimum amount" })}
              </span>
            </div>
          )}
        </div>

        {/* ── Info box ── */}
        <div style={{
          borderRadius: "14px",
          background: "linear-gradient(135deg, #fffbf5 0%, #fff3e0 100%)",
          border: "1px solid #ffe0b2",
          padding: "16px 18px",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
          marginBottom: "24px",
          boxShadow: "0 2px 8px rgba(244,119,56,0.07)",
        }}>
          <div style={{
            flexShrink: 0, width: "32px", height: "32px", borderRadius: "50%",
            background: "linear-gradient(135deg, #f47738, #e85d00)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 6px rgba(244,119,56,0.3)",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
              <path d="M12 8v4m0 4h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#e65c00", marginBottom: "4px" }}>
              {t("CS_FILE_APPLICATION_INFO_LABEL", { defaultValue: "Info" })}
            </div>
            <div style={{ fontSize: "13px", color: "#7a4000", lineHeight: "1.6" }}>
              {t("CS_FILE_APPLICATION_INFO_TEXT", { defaultValue: "Application process will take a minute to complete. It might cost around Rs.1000-2000 for cleaning your septic tank and there are concessed rates for people living in slum areas." })}
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "stretch" }}>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isDisabled}
            style={{
              width: "100%", padding: "14px 24px",
              borderRadius: "10px", border: "none",
              background: isDisabled
                ? "#d1d5db"
                : "linear-gradient(135deg, #f47738 0%, #e8621f 100%)",
              color: "#fff", fontSize: "16px", fontWeight: "700",
              cursor: isDisabled ? "not-allowed" : "pointer",
              boxShadow: isDisabled ? "none" : "0 4px 14px rgba(244,119,56,0.4)",
              transition: "opacity 0.15s, transform 0.1s",
              letterSpacing: "0.3px",
            }}
            onMouseEnter={(e) => { if (!isDisabled) e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {t("CS_COMMON_NEXT", { defaultValue: "Next" })}
          </button>

          <button
            type="button"
            onClick={onSkip}
            style={{
              width: "100%", padding: "10px 24px",
              borderRadius: "10px",
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              color: "#6b7280", fontSize: "14px", fontWeight: "600",
              cursor: "pointer",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#f47738"; e.currentTarget.style.color = "#f47738"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; }}
          >
            {t("CS_COMMON_SKIP", { defaultValue: "Skip and Continue" })}
          </button>
        </div>

      </div>
    </React.Fragment>
  );
};

export default SelectPaymentPreference;
