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

  if (advanceAmount === null && !billError) {
    return <Loader />;
  }

  const isDisabled = currentValue > max || currentValue < min;

  /* ── Shared card styles (matches CheckPage) ── */
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
  const rowStyle = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "13px 20px", borderBottom: "1px solid #f3f4f6",
  };
  const lastRowStyle = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "13px 20px",
  };
  const labelStyle = { fontSize: "13px", color: "#6b7280", fontWeight: "500", whiteSpace: "nowrap" };
  const valueStyle = { fontSize: "14px", color: "#111827", fontWeight: "600", flex: 1, textAlign: "right" };

  return (
    <React.Fragment>
      <Timeline currentStep={2} flow="APPLY" />
      <div style={{ padding: "16px 0" }}>

        {/* ── Content container ── */}
        <div style={{ maxWidth: "900px" }}>

          {/* ── Hero intro ── */}
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
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff", marginBottom: "2px" }}>
                {t("ES_FSM_PAYMENT_PREFERENCE_LABEL", { defaultValue: "Payment Preference" })}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)", lineHeight: "1.5" }}>
                {t("CS_FSM_PAYMENT_SUBTITLE", { defaultValue: "Review the amount breakdown and confirm your advance payment." })}
              </div>
            </div>
          </div>

          {/* ── Billing error banner ── */}
          {billError && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: "10px",
              padding: "12px 16px", marginBottom: "14px",
              background: "#fff8f0", border: "1px solid #fcd9b0", borderRadius: "12px",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: "1px" }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div style={{ fontSize: "13px", color: "#92400e", lineHeight: "1.6" }}>
                {t("FSM_BILLING_SLAB_NOT_FOUND", { defaultValue: "Billing details could not be loaded. You can still proceed — the advance amount will be determined after field inspection." })}
              </div>
            </div>
          )}

          {/* ── Payment Details card ── */}
          <div style={cardStyle}>
            {/* Card header */}
            <div style={sectionHeaderStyle}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: "#f4773820",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#091E64" }}>
                {t("ES_TITLE_PAYMENT_DETAILS", { defaultValue: "Payment Details" })}
              </span>
            </div>

            {/* Total Amount */}
            <div style={rowStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#c7d2fe", flexShrink: 0, display: "inline-block" }} />
                <span style={labelStyle}>{t("ADV_TOTAL_AMOUNT", { defaultValue: "Total Amount" })} (₹)</span>
              </div>
              <span style={valueStyle}>
                {isGpFlow ? (
                  <span style={{ color: "#9ca3af", fontSize: "13px" }}>N/A</span>
                ) : (
                  <span style={{
                    background: "#f0f4ff", borderRadius: "6px",
                    padding: "3px 12px", color: "#091E64", fontWeight: "700",
                  }}>
                    ₹ {max != null ? max : "—"}
                  </span>
                )}
              </span>
            </div>
            {isGpFlow && (
              <div style={{ padding: "0 20px 10px 34px", fontSize: "12px", color: "#f47738" }}>
                {t("FSM_TOTAL_AMOUNT_NOTE", { defaultValue: "Amount will be determined after field inspection" })}
              </div>
            )}

            {/* Minimum Advance */}
            <div style={rowStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#c7d2fe", flexShrink: 0, display: "inline-block" }} />
                <span style={labelStyle}>{t("FSM_ADV_MIN_PAY", { defaultValue: "Minimum Advance" })} (₹)</span>
              </div>
              <span style={valueStyle}>
                <span style={{
                  background: "#f0f4ff", borderRadius: "6px",
                  padding: "3px 12px", color: "#091E64", fontWeight: "700",
                }}>
                  ₹ {min != null ? Math.ceil(min) : "—"}
                </span>
              </span>
            </div>

            {/* Advance Amount — highlighted */}
            <div style={{
              ...lastRowStyle,
              background: "linear-gradient(135deg,#fff8f3 0%,#fff3e8 100%)",
              borderTop: "2px dashed #fed7aa",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f47738", flexShrink: 0, display: "inline-block" }} />
                <span style={{ ...labelStyle, color: "#c2410c", fontWeight: "700" }}>
                  {t("ADV_AMOUNT", { defaultValue: "Advance Amount" })} (₹)
                </span>
              </div>
              <span style={{
                fontSize: "20px", fontWeight: "800", color: "#f47738",
                background: "#fff",
                borderRadius: "10px",
                padding: "6px 18px",
                border: "2px solid #fed7aa",
                boxShadow: "0 4px 12px rgba(244,119,56,0.18)",
                letterSpacing: "0.5px",
              }}>
                ₹ {advanceAmount != null ? Math.ceil(advanceAmount) : 0}
              </span>
            </div>

            {/* Validation errors */}
            {currentValue > max && (
              <div style={{ padding: "8px 20px", background: "#fef2f2", borderTop: "1px solid #fecaca" }}>
                <span style={{ fontSize: "12px", color: "#dc2626" }}>
                  {t("FSM_ADVANCE_AMOUNT_MAX", { defaultValue: "Advance amount cannot exceed total amount" })}
                </span>
              </div>
            )}
            {currentValue < min && (
              <div style={{ padding: "8px 20px", background: "#fef2f2", borderTop: "1px solid #fecaca" }}>
                <span style={{ fontSize: "12px", color: "#dc2626" }}>
                  {t("FSM_ADVANCE_AMOUNT_MIN", { defaultValue: "Advance amount cannot be less than minimum amount" })}
                </span>
              </div>
            )}
          </div>

          {/* ── Info box ── */}
          <div style={{
            borderRadius: "14px",
            background: "linear-gradient(135deg,#fffbf5 0%,#fff3e0 100%)",
            border: "1px solid #ffe0b2",
            padding: "14px 18px",
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
            <div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#e65c00", marginBottom: "3px" }}>
                {t("CS_FILE_APPLICATION_INFO_LABEL", { defaultValue: "Info" })}
              </div>
              <div style={{ fontSize: "13px", color: "#7a4000", lineHeight: "1.6" }}>
                It might cost around Rs.1000–2000 for cleaning your septic tank. Concession rates are available for residents of slum areas.
              </div>
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
              {t("CS_COMMON_SKIP", { defaultValue: "Skip and Continue" })}
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isDisabled}
              style={{
                padding: "12px 40px",
                borderRadius: "8px", border: "none",
                background: isDisabled ? "#d1d5db" : "linear-gradient(135deg,#f47738 0%,#e05e18 100%)",
                color: "#fff", fontSize: "15px", fontWeight: "700",
                cursor: isDisabled ? "not-allowed" : "pointer",
                boxShadow: isDisabled ? "none" : "0 4px 14px rgba(244,119,56,0.4)",
                transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => { if (!isDisabled) e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {t("CS_COMMON_NEXT", { defaultValue: "Next" })}
          </button>
        </div>

        </div>{/* end narrow container */}
      </div>
    </React.Fragment>
  );
};

export default SelectPaymentPreference;
