import React, { useEffect, useState } from "react";
import { Loader } from "@upyog/digit-ui-react-components";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import getPDFData from "../../../getPDFData";

const Response = ({ data, onSuccess }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const mutation = Digit.Hooks.fsm.useDesludging(data?.address?.city ? data.address?.city?.code : tenantId);
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  const [mutationHappened, setMutationHappened, clear] = Digit.Hooks.useSessionStorage("FSM_MUTATION_HAPPENED", false);
  const [errorInfo, setErrorInfo, clearError] = Digit.Hooks.useSessionStorage("FSM_ERROR_DATA", false);
  const [successData, setsuccessData, clearSuccessData] = Digit.Hooks.useSessionStorage("FSM_MUTATION_SUCCESS_DATA", false);
  const [paymentPreference, setPaymentPreference] = useState(null);
  const [advancePay, setAdvancePay] = useState(null);
  const [zeroPay, setZeroPay] = useState(null);

  const Data = mutation?.data || successData;
  const localityCode = Data?.fsm?.[0].address?.locality?.code;
  const slumCode = Data?.fsm?.[0].address?.slumName;
  const slum = Digit.Hooks.fsm.useSlum(Data?.fsm?.[0].address?.tenantId, slumCode, localityCode, {
    enabled: slumCode ? true : false,
    retry: slumCode ? true : false,
  });

  const onError = (error, variables) => {
    console.log("error",error)
    setErrorInfo(error?.response?.data?.Errors[0]?.code || "ERROR");
    setMutationHappened(true);
  };
  useEffect(() => {
    if (mutation.data) setsuccessData(mutation.data);
  }, [mutation.data]);

  useEffect(() => {
    if (!mutationHappened && !errorInfo) {
      try {
        const amount = Digit.SessionStorage.get("total_amount");
        const amountPerTrip = Digit.SessionStorage.get("amount_per_trip");
        const { subtype, propertyID, pitDetail, address, pitType, source, selectGender, selectPaymentPreference, selectTripNo } = data;
        const {
          city,
          locality,
          geoLocation,
          pincode,
          street,
          doorNo,
          landmark,
          slum,
          gramPanchayat,
          village,
          propertyLocation,
          newLocality,
          newGramPanchayat,
          newVillage,
        } = address;
        setPaymentPreference(selectPaymentPreference?.code);
        const advanceAmount = amount === 0 ? null : selectPaymentPreference?.advanceAmount;
        amount === 0 ? setZeroPay(true) : setZeroPay(false);
        advanceAmount === 0 ? setAdvancePay(true) : setAdvancePay(false);
        const formdata = {
          fsm: {
            citizen: {
              gender: selectGender?.code,
            },
            tenantId: city?.code,
            propertyUsage: subtype?.code,
            address: {
              tenantId: city?.code,
              additionalDetails: {
                boundaryType: propertyLocation?.code === "FROM_GRAM_PANCHAYAT" ? "GP" : "Locality",
                gramPanchayat: {
                  code: gramPanchayat?.code,
                  name: gramPanchayat?.name,
                },
                village: village?.code
                  ? {
                      code: village?.code ? village?.code : "",
                      name: village?.name ? village?.name : "",
                    }
                  : newVillage,
                newLocality: newLocality,
                newGramPanchayat: newGramPanchayat,
              },
              street: street?.trim(),
              doorNo: doorNo?.trim(),
              landmark: landmark,
              slumName: slum,
              city: city?.name,
              pincode,
              locality: {
                code: propertyLocation?.code === "WITHIN_ULB_LIMITS" ? locality?.code : gramPanchayat?.code,
                name: propertyLocation?.code === "WITHIN_ULB_LIMITS" ? locality?.name : gramPanchayat?.name,
              },
              geoLocation: {
                latitude: geoLocation?.latitude,
                longitude: geoLocation?.longitude,
                additionalDetails: {},
              },
            },
            pitDetail: {
              additionalDetails: {
                fileStoreId: {
                  CITIZEN: pitDetail?.images,
                },
              },
            },
            source,
            sanitationtype: pitType?.code,
            paymentPreference: amount === 0 ? null : selectPaymentPreference?.paymentType ? selectPaymentPreference?.paymentType?.code : null,
            noOfTrips: selectTripNo ? selectTripNo?.tripNo?.code : 1,
            vehicleCapacity: selectTripNo ? selectTripNo?.vehicleCapacity?.capacity : "",
            additionalDetails: {
              totalAmount: amount,
              tripAmount: typeof amountPerTrip === "number" ? JSON.stringify(amountPerTrip) : amountPerTrip,
              propertyID : propertyID?.propertyID,
              distancefromroad : data?.roadWidth?.distancefromroad,
              roadWidth: data?.roadWidth?.roadWidth,
              propertyID : data?.cptId?.id
            },
            advanceAmount: typeof advanceAmount === "number" ? JSON.stringify(advanceAmount) : advanceAmount,
          },
          workflow: null,
        };
        console.log("formdata212",formdata,address,data)
        mutation.mutate(formdata, {
          onError,
          onSuccess: () => {
            setMutationHappened(true);
            onSuccess();
          },
        });
        sessionStorage.removeItem("Digit.total_amount");
        sessionStorage.removeItem("Digit.fsm.file.address.city");
      } catch (err) {}
    }
  }, []);

  const handleDownloadPdf = () => {
    const { fsm } = Data;
    const [applicationDetails, ...rest] = fsm;
    const tenantInfo = tenants.find((tenant) => tenant.code === applicationDetails.tenantId);

    const data = getPDFData({ ...applicationDetails, slum }, tenantInfo, t);
    Digit.Utils.pdf.generate(data);
  };
  const isSuccess = !successData ? mutation?.isSuccess : true;
  const appNo = Data?.fsm?.[0]?.applicationNo;
  const responseText = (paymentPreference && paymentPreference === "POST_PAY") || advancePay
    ? "CS_FILE_PROPERTY_RESPONSE_POST_PAY"
    : zeroPay
    ? "CS_FSM_RESPONSE_CREATE_DISPLAY_ZERO_PAY"
    : "CS_FILE_PROPERTY_RESPONSE";

  return mutation.isLoading || (mutation.isIdle && !mutationHappened) ? (
    <Loader />
  ) : (
    <div style={{ padding: "10px 24px 24px" }}>

      {/* ── Banner — horizontal layout ── */}
      <div style={{
        position: "relative",
        borderRadius: "20px",
        background: isSuccess
          ? "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)"
          : "linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #dc2626 100%)",
        padding: "24px 28px",
        display: "flex", flexDirection: "row", alignItems: "center",
        gap: "20px", overflow: "hidden",
        marginBottom: "0",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-15px", left: "30%", width: "70px", height: "70px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        {/* Icon ring */}
        <div style={{
          flexShrink: 0,
          width: "64px", height: "64px", borderRadius: "50%",
          background: "rgba(255,255,255,0.15)",
          border: "2px solid rgba(255,255,255,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: "46px", height: "46px", borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {isSuccess ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            )}
          </div>
        </div>

        {/* Title + subtitle */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "#fff", fontSize: "20px", fontWeight: "800", letterSpacing: "-0.3px", lineHeight: "1.2" }}>
            {t(isSuccess ? "CS_FILE_DESLUDGING_APPLICATION_SUCCESS" : "CS_FILE_DESLUDGING_APPLICATION_FAILED",
              { defaultValue: isSuccess ? "Application Submitted" : "Submission Failed" })}
          </div>
          {isSuccess && (
            <div style={{ color: "rgba(255,255,255,0.72)", fontSize: "12px", marginTop: "4px" }}>
              {t("CS_RESPONSE_SUBMITTED_SUBTITLE", { defaultValue: "Your request has been received successfully" })}
            </div>
          )}
        </div>

        {/* Application number chip */}
        {isSuccess && appNo && (
          <div style={{
            flexShrink: 0,
            background: "#fff",
            borderRadius: "14px",
            padding: "10px 20px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
            minWidth: "180px",
          }}>
            <div style={{
              fontSize: "10px", fontWeight: "700", letterSpacing: "1.6px",
              textTransform: "uppercase",
              color: "#15803d",
            }}>
              {t("CS_FILE_DESLUDGING_APPLICATION_NO", { defaultValue: "Application No." })}
            </div>
            <div style={{
              fontSize: "15px", fontWeight: "800",
              letterSpacing: "0.5px", fontFamily: "monospace",
              color: "#f47738",
              whiteSpace: "nowrap",
            }}>
              {appNo}
            </div>
          </div>
        )}
      </div>

      {/* ── Below-banner content — padded container ── */}
      <div style={{ padding: "18px 0 0" }}>

        {/* Message */}
        <p style={{
          fontSize: "13px", color: "#4b5563", lineHeight: "1.7",
          margin: "0 0 18px 0", textAlign: "left",
        }}>
          {t(responseText, { defaultValue: "Application reference is sent to your registered mobile number. You will be notified with the charges shortly." })}
        </p>

        {/* What happens next */}
        {isSuccess && (
          <div style={{
            marginBottom: "18px",
            background: "#f9fafb",
            borderRadius: "14px",
            border: "1px solid #f0f3f9",
            padding: "14px 16px",
          }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>
              {t("CS_WHAT_HAPPENS_NEXT", { defaultValue: "What happens next?" })}
            </div>
            {[
              { icon: "📋", label: t("CS_NEXT_STEP_REVIEW", { defaultValue: "Your application will be reviewed" }) },
              { icon: "🚛", label: t("CS_NEXT_STEP_DSO", { defaultValue: "A DSO will be assigned to your request" }) },
              { icon: "💳", label: t("CS_NEXT_STEP_PAY", { defaultValue: "Complete payment via My Applications" }) },
            ].map((step, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 0",
                borderBottom: i < 2 ? "1px dashed #e8edf5" : "none",
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: "#fff", border: "1px solid #e8edf5",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "15px", flexShrink: 0,
                }}>{step.icon}</div>
                <div style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>{step.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "row", gap: "12px", marginBottom: "18px", alignItems: "center", justifyContent: "center" }}>
          {isSuccess && (
            <button
              type="button"
              onClick={handleDownloadPdf}
              style={{
                flexShrink: 0,
                padding: "10px 20px",
                borderRadius: "50px",
                border: "2px solid #e5e7eb",
                background: "#fff",
                color: "#374151", fontSize: "13px", fontWeight: "600",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                transition: "all 0.18s ease",
                whiteSpace: "nowrap",
                letterSpacing: "0.2px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#f47738"; e.currentTarget.style.color = "#f47738"; e.currentTarget.style.background = "#fff8f4"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(244,119,56,0.18)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              {t("CS_COMMON_DOWNLOAD", { defaultValue: "Download" })}
            </button>
          )}
          <Link to="/suda-ui/citizen" style={{ textDecoration: "none" }}>
            <button
              type="button"
              style={{
                padding: "10px 24px",
                borderRadius: "50px", border: "none",
                background: "linear-gradient(135deg, #f47738 0%, #d95910 100%)",
                color: "#fff", fontSize: "13px", fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(244,119,56,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                letterSpacing: "0.2px",
                transition: "all 0.18s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #ff8c4a 0%, #e8661f 100%)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(244,119,56,0.5), inset 0 1px 0 rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #f47738 0%, #d95910 100%)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(244,119,56,0.35), inset 0 1px 0 rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              {t("CORE_COMMON_GO_TO_HOME", { defaultValue: "Go to Home" })}
            </button>
          </Link>
        </div>

        {/* Info box */}
        <div style={{
          borderRadius: "12px",
          background: "linear-gradient(135deg, #fffbf5 0%, #fff3e0 100%)",
          border: "1px solid #ffe0b2",
          padding: "14px 16px",
          display: "flex", gap: "10px", alignItems: "flex-start",
          boxShadow: "0 2px 6px rgba(244,119,56,0.06)",
        }}>
          <div style={{
            flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%",
            background: "linear-gradient(135deg, #f47738, #e85d00)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 5px rgba(244,119,56,0.3)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
              <path d="M12 8v4m0 4h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#e65c00", marginBottom: "3px" }}>
              {t("CS_FILE_APPLICATION_INFO_LABEL", { defaultValue: "Info" })}
            </div>
            <div style={{ fontSize: "12px", color: "#7a4000", lineHeight: "1.6" }}>
              {(() => {
                const raw = t("CS_FILE_APPLICATION_INFO_TEXT", { defaultValue: "It might cost around Rs.1000-2000 for cleaning your septic tank and there are concessed rates for people living in slum areas." });
                return raw.replace(/\{CONTENT\}\s*/g, "").replace(/\{MINAMOUNT\}/g, "1000").replace(/\{MAXAMOUNT\}/g, "2000");
              })()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Response;

