import { BackButton, FormStep, Loader, MobileNumber, RadioButtons, TextInput } from "@upyog/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Timeline from "../components/Timeline";

const LicenseDetails = ({ t, config, onSelect, userType, formData, ownerIndex }) => {
  const { pathname: url } = useLocation();
  const userInfo = Digit.UserService.getUser();
  let validation = {};
  const tenantId = Digit.ULBService.getCurrentTenantId();
  let isOpenLinkFlow = window.location.href.includes("openlink");
  const uuid = userInfo?.info?.uuid;
  const { data: userDetails, isLoading: isUserLoading } = Digit.Hooks.useUserSearch(
    tenantId,
    { uuid: [uuid] },
    {},
    { enabled: uuid ? true : false }
  );
  const [name, setName] = useState((!isOpenLinkFlow ? userInfo?.info?.name : "") || formData?.LicneseDetails?.name || formData?.formData?.LicneseDetails?.name || "");
  const [email, setEmail] = useState((!isOpenLinkFlow ? userInfo?.info?.emailId : "") || formData?.LicneseDetails?.email || formData?.formData?.LicneseDetails?.email || "");
  const [gender, setGender] = useState((!isOpenLinkFlow && userDetails ? { i18nKey: `COMMON_GENDER_${userDetails?.user?.[0]?.gender}`, code: userDetails?.user?.[0]?.gender, value: userDetails?.user?.[0]?.gender } : "") || formData?.LicneseDetails?.gender || formData?.formData?.LicneseDetails?.gender);
  const [mobileNumber, setMobileNumber] = useState(
    (!isOpenLinkFlow ? userInfo?.info?.mobileNumber : "") ||
    formData?.LicneseDetails?.mobileNumber || formData?.formData?.LicneseDetails?.mobileNumber || ""
  );
  const [PanNumber, setPanNumber] = useState(
    formData?.LicneseDetails?.PanNumber || formData?.formData?.LicneseDetails?.PanNumber || ""
  );

  useEffect(() => {
    if (!gender?.code && userDetails?.user?.[0]?.gender && !isOpenLinkFlow) {
      setGender({ i18nKey: `COMMON_GENDER_${userDetails?.user?.[0]?.gender}`, code: userDetails?.user?.[0]?.gender, value: userDetails?.user?.[0]?.gender });
    }
  }, [userDetails]);

  const stateId = Digit.ULBService.getStateId();

  if (isOpenLinkFlow)
    window.onunload = function () {
      sessionStorage.removeItem("Digit.BUILDING_PERMIT");
    };

  const { isLoading, data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["GenderType"]);

  let menu = [];
  genderTypeData &&
    genderTypeData["common-masters"].GenderType.filter((data) => data.active).map((genderDetails) => {
      menu.push({ i18nKey: `COMMON_GENDER_${genderDetails.code}`, code: `${genderDetails.code}`, value: `${genderDetails.code}` });
    });

  if (isUserLoading) return <Loader />;

  function SelectName(e) { setName(e.target.value); }
  function selectEmail(e) { setEmail(e.target.value); }
  function setGenderName(value) { setGender(value); }
  function setMobileNo(e) { setMobileNumber(e.target.value); }
  function selectPanNumber(e) { setPanNumber(e.target.value); }

  const goNext = () => {
    if (!(formData?.result && formData?.result?.Licenses[0]?.id)) {
      let licenseDet = { name, mobileNumber, gender, email, PanNumber };
      onSelect(config.key, licenseDet);
    } else {
      let data = formData?.formData;
      data.LicneseDetails.name = name;
      data.LicneseDetails.mobileNumber = mobileNumber;
      data.LicneseDetails.gender = gender;
      data.LicneseDetails.email = email;
      data.LicneseDetails.PanNumber = PanNumber;
      onSelect("", formData);
    }
  };

  const onSkip = () => onSelect();

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
  const requiredMark = { color: "#e54d42", marginLeft: "2px" };
  const rowStyle = { display: "flex", flexWrap: "wrap", marginLeft: "-10px", marginRight: "-10px" };
  const col6 = { flex: "0 0 50%", maxWidth: "50%", padding: "0 10px", marginBottom: "18px", boxSizing: "border-box" };

  return (
    <div className="license-details-page">
      <style>{`.license-details-page .card-caption, .license-details-page .card-text { display: none !important; }`}</style>
      <div className={isOpenLinkFlow ? "OpenlinkContainer" : ""}>
        {isOpenLinkFlow && <BackButton style={{ border: "none" }}>{t("CS_COMMON_BACK")}</BackButton>}
        <Timeline currentStep={1} flow="STAKEHOLDER" />

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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>
              {t("BPA_STEP_1_OF_3") || "Step 3 of 3"}
            </div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
              {t("BPA_LICENSE_DET_CAPTION") || "License Details"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>
              {t("BPA_LICENSE_DETAILS_TEXT") || "Fill in your personal details"}
            </p>
          </div>
        </div>

        <style>{`.license-details-form .card-caption, .license-details-form .card-header { display: none !important; }`}</style>
        {!isLoading || !isUserLoading ? (
          <FormStep
            config={config}
            onSelect={goNext}
            onSkip={onSkip}
            t={t}
            isDisabled={!name || !mobileNumber || !gender}
          >
            <div style={{ maxWidth: "100%", width: "100%" }}>

              {/* Card – Personal Details */}
              <div style={cardStyle}>
                <div style={sectionTitleStyle}>{t("BPA_PERSONAL_DETAILS_HEADER") || "Personal Details"}</div>
                <div style={rowStyle}>

                  {/* Full Name */}
                  <div style={col6}>
                    <label style={labelStyle}>{t("BPA_APPLICANT_NAME_LABEL")}<span style={requiredMark}>*</span></label>
                    <TextInput
                      t={t}
                      type="text"
                      isMandatory={false}
                      optionKey="i18nKey"
                      name="name"
                      value={name}
                      onChange={SelectName}
                      disable={name && !isOpenLinkFlow ? true : false}
                      {...(validation = {
                        isRequired: true,
                        pattern: "^[a-zA-Z ]*$",
                        type: "text",
                        title: t("PT_NAME_ERROR_MESSAGE"),
                      })}
                    />
                  </div>

                  {/* Mobile Number */}
                  <div style={col6}>
                    <label style={labelStyle}>{t("BPA_OWNER_MOBILE_NO_LABEL")}<span style={requiredMark}>*</span></label>
                    <MobileNumber
                      value={mobileNumber}
                      name="mobileNumber"
                      onChange={(value) => setMobileNo({ target: { value } })}
                      disable={mobileNumber && !isOpenLinkFlow ? true : false}
                      {...{ required: true, pattern: "[6-9]{1}[0-9]{9}", type: "tel", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
                    />
                  </div>

                  {/* Gender */}
                  <div style={col6}>
                    <label style={labelStyle}>{t("BPA_APPLICANT_GENDER_LABEL")}<span style={requiredMark}>*</span></label>
                    <RadioButtons
                      t={t}
                      options={menu}
                      optionsKey="code"
                      name="gender"
                      value={gender}
                      selectedOption={gender}
                      onSelect={setGenderName}
                      isDependent={true}
                      labelKey="COMMON_GENDER"
                      disable={gender && !isOpenLinkFlow ? true : false}
                    />
                  </div>

                  {/* Email */}
                  <div style={col6}>
                    <label style={labelStyle}>{t("BPA_APPLICANT_EMAIL_LABEL")}</label>
                    <TextInput
                      t={t}
                      type="email"
                      isMandatory={false}
                      optionKey="i18nKey"
                      name="email"
                      value={email}
                      onChange={selectEmail}
                      disable={userInfo?.info?.emailId && !isOpenLinkFlow ? true : false}
                      {...{ required: true, pattern: "[A-Za-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$", type: "email", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
                    />
                  </div>

                  {/* PAN Number */}
                  <div style={col6}>
                    <label style={labelStyle}>{t("BPA_APPLICANT_PAN_NO")}</label>
                    <TextInput
                      t={t}
                      type="text"
                      isMandatory={false}
                      optionKey="i18nKey"
                      name="PanNumber"
                      value={PanNumber}
                      onChange={selectPanNumber}
                      {...{ required: true, pattern: "[A-Z]{5}[0-9]{4}[A-Z]{1}", title: t("BPA_INVALID_PAN_NO") }}
                    />
                  </div>

                </div>
              </div>

            </div>
          </FormStep>
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
};

export default LicenseDetails;
