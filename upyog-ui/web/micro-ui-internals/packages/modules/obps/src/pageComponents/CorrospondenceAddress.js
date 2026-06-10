import { BackButton, CheckBox, FormStep, TextArea, Toast } from "@upyog/digit-ui-react-components";
import React, { useState } from "react";
import Timeline from "../components/Timeline";

const CorrospondenceAddress = ({ t, config, onSelect, value, userType, formData }) => {
  const onSkip = () => onSelect();
  const [Correspondenceaddress, setCorrespondenceaddress] = useState(formData?.Correspondenceaddress || formData?.formData?.Correspondenceaddress || "");
  const [isAddressSame, setisAddressSame] = useState(formData?.isAddressSame || formData?.formData?.isAddressSame || false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [isDisableForNext, setIsDisableForNext] = useState(false);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  let isopenlink = window.location.href.includes("/openlink/");

  if (isopenlink)
    window.onunload = function () {
      sessionStorage.removeItem("Digit.BUILDING_PERMIT");
    };

  function selectChecked(e) {
    if (isAddressSame == false) {
      setisAddressSame(true);
      setCorrespondenceaddress(formData?.LicneseDetails?.PermanentAddress ? formData?.LicneseDetails?.PermanentAddress : formData?.formData?.LicneseDetails?.PermanentAddress);
    }
    else {
      Array.from(document.querySelectorAll("input")).forEach((input) => (input.value = ""));
      setisAddressSame(false);
      setCorrespondenceaddress("");
    }
  }
  function selectCorrespondenceaddress(e) {
    setCorrespondenceaddress(e.target.value);
  }

  const goNext = () => {

    if (!(formData?.result && formData?.result?.Licenses[0]?.id)) {
      setIsDisableForNext(true);
      let payload = {
        "Licenses": [
          {
            "tradeLicenseDetail": {
              "owners": [
                {
                  "gender": formData?.LicneseDetails?.gender?.code,
                  "mobileNumber": formData?.LicneseDetails?.mobileNumber,
                  "name": formData?.LicneseDetails?.name,
                  "dob": null,
                  "emailId": formData?.LicneseDetails?.email,
                  "permanentAddress": formData?.LicneseDetails?.PermanentAddress,
                  "correspondenceAddress": Correspondenceaddress,
                  "pan":formData?.LicneseDetails?.PanNumber,
                  // "permanentPinCode": "143001"
                }
              ],
              "subOwnerShipCategory": "INDIVIDUAL",
              "tradeUnits": [
                {
                  "tradeType": formData?.LicneseType?.LicenseType?.tradeType,
                }
              ],
              "additionalDetail": {
                "counsilForArchNo": formData?.LicneseType?.ArchitectNo,
              },
              "address": {
                "city": "",
                "landmark": "",
                "pincode": ""
              },
              "institution": null,
              "applicationDocuments": null
            },
            "licenseType": "PERMANENT",
            "businessService": "BPAREG",
            "tenantId": formData?.LicneseType?.selectedCity?.code || formData?.formData?.LicneseType?.selectedCity?.code || tenantId,
            "action": "NOWORKFLOW"
          }
        ]
      }

      Digit.OBPSService.BPAREGCreate(payload, tenantId)
        .then((result, err) => {
          setIsDisableForNext(false);
          let data = { result: result, formData: formData, Correspondenceaddress: Correspondenceaddress, isAddressSame: isAddressSame }
          //1, units
          onSelect("", data, "", true);

        })
        .catch((e) => {
          setIsDisableForNext(false);
          setShowToast({ key: "error" });
          setError(e?.response?.data?.Errors[0]?.message || null);
        });
    }
    else {
      formData.Correspondenceaddress = Correspondenceaddress;
      formData.isAddressSame = isAddressSame;
      onSelect("", formData, "", true);
    }
    // sessionStorage.setItem("CurrentFinancialYear", FY);
    // onSelect(config.key, { TradeName });
  };

  /* ── Layout styles ── */
  const cardStyle = {
    background: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    padding: "24px 28px",
    marginBottom: "24px",
    border: "1px solid #e8ecf0",
  };
  const sectionTitleStyle = {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1a2b49",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "2px solid #f47738",
    letterSpacing: "0.3px",
  };
  const labelStyle = {
    display: "block",
    fontWeight: "600",
    fontSize: "13px",
    color: "#3d4f6b",
    marginBottom: "6px",
    letterSpacing: "0.2px",
  };

  return (
    <div className="correspondence-address-page">
      <style>{`.correspondence-address-page .card-caption, .correspondence-address-page .card-text { display: none !important; }`}</style>
      <div className={isopenlink ? "OpenlinkContainer" : ""}>
        {isopenlink && <BackButton style={{ border: "none" }}>{t("CS_COMMON_BACK")}</BackButton>}
        <Timeline currentStep={2} flow="STAKEHOLDER" />

        {/* Hero Banner */}
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
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>
              {t("BPA_STEP_2_OF_3") || "Step 2 of 3"}
            </div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
              {t("BPA_CORRESPONDENCE_ADDRESS_HEADER") || "Correspondence Address"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>
              {t("BPA_CORRESPONDENCE_ADDRESS_SUBTEXT") || "Enter your correspondence / mailing address"}
            </p>
          </div>
        </div>

        <FormStep config={config} onSelect={goNext} onSkip={onSkip} t={t} isDisabled={isDisableForNext}>
          <div style={{ maxWidth: "100%", width: "100%" }}>
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>{t("BPA_CORRESPONDENCE_DETAILS_HEADER") || "Correspondence Details"}</div>
              <CheckBox
                label={t("BPA_SAME_AS_PERMANENT_ADDRESS")}
                onChange={(e) => selectChecked(e)}
                checked={isAddressSame}
                style={{ paddingBottom: "10px", paddingTop: "10px" }}
              />
              <label style={{ ...labelStyle, marginTop: "12px" }}>{t("BPA_APPLICANT_CORRESPONDENCE_ADDRESS_LABEL")}</label>
              <TextArea
                t={t}
                isMandatory={false}
                type={"text"}
                optionKey="i18nKey"
                name="Correspondenceaddress"
                onChange={selectCorrespondenceaddress}
                value={Correspondenceaddress}
                disable={isAddressSame}
              />
            </div>
          </div>
        </FormStep>
      </div>
      <div style={{ height: "30px", width: "100%", fontSize: "14px" }}></div>
      {showToast && (
        <Toast
          error={showToast?.key === "error" ? true : false}
          label={error}
          isDleteBtn={true}
          onClose={() => { setShowToast(null); setError(null); }}
        />
      )}
    </div>
  );
};

export default CorrospondenceAddress;