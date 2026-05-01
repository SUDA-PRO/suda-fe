import React, { useState } from "react";
import {
  CardLabel,
  LabelFieldPair,
  Dropdown,
  TextInput,
  MobileNumber,
  TextArea,
  CheckBox,
  CardLabelError,
  Loader,
  SubmitBar,
} from "@upyog/digit-ui-react-components";
import Timeline from "../components/TLTimeline";

const sectionStyle = {
  marginTop: "24px",
  padding: "16px",
  background: "#f9f9f9",
  borderRadius: "4px",
  borderLeft: "4px solid #0B4972",
};

const sectionHeaderStyle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#0B4972",
  marginBottom: "16px",
};

const OwnershipDetailsPage = ({ t, config, onSelect, formData }) => {
  const stateId = Digit.ULBService.getStateId();
  const ownerIndex = 0;

  // ============ SECTION 1: Ownership Category ============
  const [ownershipCategory, setOwnershipCategory] = useState(formData?.ownershipCategory || null);

  const { data: SubOwnerShipCategoryOb, isLoading: subOwnerShipLoading } = Digit.Hooks.pt.usePropertyMDMS(
    stateId,
    "PropertyTax",
    "SubOwnerShipCategory"
  );
  const { data: OwnerShipCategoryOb, isLoading: ownerShipCatLoading } = Digit.Hooks.pt.usePropertyMDMS(
    stateId,
    "PropertyTax",
    "OwnerShipCategory"
  );

  const buildOwnershipOptions = () => {
    const ownerShipdropDown = [];
    const subCategoriesInOwnersType = ["INDIVIDUAL"];
    const OwnerShipCategory = {};
    const SubOwnerShipCategory = {};

    OwnerShipCategoryOb &&
      OwnerShipCategoryOb.forEach((cat) => {
        OwnerShipCategory[cat.code] = cat;
      });
    SubOwnerShipCategoryOb &&
      SubOwnerShipCategoryOb.forEach((cat) => {
        SubOwnerShipCategory[cat.code] = cat;
      });

    Object.keys(OwnerShipCategory).forEach((categoryKey) => {
      const categoryCode = OwnerShipCategory[categoryKey].code;
      if (subCategoriesInOwnersType.includes(categoryCode)) {
        Object.keys(SubOwnerShipCategory)
          .filter((sub) => categoryCode === SubOwnerShipCategory[sub].ownerShipCategory)
          .forEach((sub) => {
            const { name, code } = SubOwnerShipCategory[sub];
            ownerShipdropDown.push({ label: name, value: code, code });
          });
      } else {
        const { name, code } = OwnerShipCategory[categoryKey];
        ownerShipdropDown.push({ label: name, value: code, code });
      }
    });

    return ownerShipdropDown.slice(0, 10).map((item) => ({
      ...item,
      i18nKey: `PT_OWNERSHIP_${item.value.split(".")[1] || item.value.split(".")[0]}`,
    }));
  };

  const ownershipOptions = buildOwnershipOptions();

  const isIndividual = ownershipCategory?.code?.startsWith("INDIVIDUAL");
  const isInstitutional = ownershipCategory?.code?.startsWith("INSTITUTIONAL");

  // ============ SECTION 2: Individual Owner Details ============
  const [name, setName] = useState(formData?.owners?.[ownerIndex]?.name || "");
  const [gender, setGender] = useState(formData?.owners?.[ownerIndex]?.gender || null);
  const [mobileNumber, setMobileNumber] = useState(formData?.owners?.[ownerIndex]?.mobileNumber || "");
  const [email, setEmail] = useState(formData?.owners?.[ownerIndex]?.emailId || "");
  const [emailError, setEmailError] = useState(null);
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState(
    formData?.owners?.[ownerIndex]?.fatherOrHusbandName || ""
  );
  const [relationship, setRelationship] = useState(formData?.owners?.[ownerIndex]?.relationship || null);

  const genderOptions = [
    { name: "Female", value: "FEMALE", code: "FEMALE", i18nKey: "PT_COMMON_GENDER_FEMALE" },
    { name: "Male", value: "MALE", code: "MALE", i18nKey: "PT_COMMON_GENDER_MALE" },
    { name: "Transgender", value: "TRANSGENDER", code: "TRANSGENDER", i18nKey: "PT_COMMON_GENDER_TRANSGENDER" },
  ];

  const guardianOptions = [
    { name: "HUSBAND", code: "HUSBAND", i18nKey: "PT_RELATION_HUSBAND" },
    { name: "Father", code: "FATHER", i18nKey: "PT_RELATION_FATHER" },
  ];

  const validateEmail = (value) => {
    if (!value) {
      setEmailError(null);
      return;
    }
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-z.-]+\.(com|org|in)$/;
    setEmailError(pattern.test(value) ? null : t("CORE_INVALID_EMAIL_ID_PATTERN"));
  };

  // ============ SECTION 3: Owner Address ============
  const [permanentAddress, setPermanentAddress] = useState(
    formData?.owners?.[ownerIndex]?.permanentAddress || ""
  );
  const [isCorrespondenceAddress, setIsCorrespondenceAddress] = useState(
    formData?.owners?.[ownerIndex]?.isCorrespondenceAddress || false
  );

  const handleCorrespondenceAddress = (e) => {
    if (e.target.checked) {
      const address = formData?.address;
      const parts = [];
      if (address?.doorNo) parts.push(address.doorNo);
      if (address?.street) parts.push(address.street);
      if (address?.landmark) parts.push(address.landmark);
      if (address?.locality?.i18nkey) parts.push(t(address.locality.i18nkey));
      if (address?.city?.code) parts.push(address.city.code);
      if (address?.pincode) parts.push(address.pincode);
      setPermanentAddress(parts.join(", "));
    } else {
      setPermanentAddress("");
    }
    setIsCorrespondenceAddress(e.target.checked);
  };

  // ============ INSTITUTION SECTION ============
  const [institutionName, setInstitutionName] = useState(formData?.owners?.[ownerIndex]?.inistitutionName || "");
  const [institutionType, setInstitutionType] = useState(formData?.owners?.[ownerIndex]?.inistitutetype || null);
  const [contactName, setContactName] = useState(formData?.owners?.[ownerIndex]?.name || "");
  const [designation, setDesignation] = useState(formData?.owners?.[ownerIndex]?.designation || "");
  const [instMobile, setInstMobile] = useState(formData?.owners?.[ownerIndex]?.mobileNumber || "");
  const [altContact, setAltContact] = useState(formData?.owners?.[ownerIndex]?.altContactNumber || "");
  const [instEmail, setInstEmail] = useState(formData?.owners?.[ownerIndex]?.emailId || "");

  const getInstitutionTypeOptions = () => {
    const SubOwnerShipCategory = {};
    const payload = JSON.parse(sessionStorage.getItem("getSubPropertyOwnerShipCategory") || "{}");
    const subList = payload?.PropertyTax?.SubOwnerShipCategory || [];
    subList.forEach((cat) => {
      SubOwnerShipCategory[cat.code] = cat;
    });
    const value = ownershipCategory?.value || "";
    return Object.keys(SubOwnerShipCategory)
      .filter((key) => SubOwnerShipCategory[key].ownerShipCategory === value)
      .map((key) => {
        const { name, code } = SubOwnerShipCategory[key];
        return { label: name, value: code, code: t(`PROPERTYTAX_BILLING_SLAB_${code}`) };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  // ============ Submit ============
  const handleSubmit = () => {
    let ownerData;

    if (isIndividual) {
      ownerData = {
        name,
        gender,
        mobileNumber,
        emailId: email,
        fatherOrHusbandName,
        relationship,
        permanentAddress,
        isCorrespondenceAddress,
      };
    } else {
      ownerData = {
        inistitutionName: institutionName,
        inistitutetype: institutionType,
        name: contactName,
        designation,
        mobileNumber: instMobile,
        altContactNumber: altContact,
        emailId: instEmail,
        permanentAddress,
        isCorrespondenceAddress,
      };
    }

    sessionStorage.setItem("ownershipCategory", ownershipCategory?.value);
    onSelect(config.key, { ownershipCategory, owners: [ownerData] }, false, ownerIndex);
  };

  const isLoading = subOwnerShipLoading || ownerShipCatLoading;
  if (isLoading) return <Loader />;

  return (
    <React.Fragment>
      <Timeline currentStep={2} />

      {/* SECTION 1: Ownership Category */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>{t("PT_PROVIDE_OWNERSHIP_DETAILS")} *</div>
        <Dropdown
          className="form-field"
          selected={ownershipCategory}
          option={ownershipOptions}
          select={setOwnershipCategory}
          optionKey="i18nKey"
          t={t}
          placeholder={t("PT_SELECT_OWNERSHIP_TYPE")}
        />
      </div>

      {/* INDIVIDUAL FLOW */}
      {isIndividual && (
        <React.Fragment>
          {/* SECTION 2: Owner Details */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>{t("PT_OWNERSHIP_INFO_SUB_HEADER")}</div>

            <LabelFieldPair>
              <CardLabel>{t("PT_OWNER_NAME")} *</CardLabel>
              <TextInput
                t={t}
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                ValidationRequired={true}
                validation={{ isRequired: true, pattern: "^[a-zA-Z ]+$", title: t("PT_NAME_ERROR_MESSAGE") }}
              />
            </LabelFieldPair>

            <LabelFieldPair>
              <CardLabel>{t("PT_FORM3_GUARDIAN_NAME")} *</CardLabel>
              <TextInput
                t={t}
                type="text"
                name="fatherOrHusbandName"
                value={fatherOrHusbandName}
                onChange={(e) => setFatherOrHusbandName(e.target.value)}
                validation={{ pattern: "^[a-zA-Z ]+$", title: t("PT_NAME_ERROR_MESSAGE") }}
              />
            </LabelFieldPair>

            <LabelFieldPair>
              <CardLabel>{t("PT_FORM3_GENDER")} *</CardLabel>
              <Dropdown
                className="form-field"
                selected={gender}
                option={genderOptions}
                select={setGender}
                optionKey="i18nKey"
                t={t}
              />
            </LabelFieldPair>

            <LabelFieldPair>
              <CardLabel>{t("PT_FORM3_MOBILE_NUMBER")} *</CardLabel>
              <MobileNumber
                value={mobileNumber}
                name="mobileNumber"
                onChange={(e) => setMobileNumber(e.target.value)}
                validation={{ isRequired: true, pattern: "[6-9]{1}[0-9]{9}", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
              />
            </LabelFieldPair>

            <LabelFieldPair>
              <CardLabel>{t("PT_FORM3_EMAIL_ID")}</CardLabel>
              <TextInput
                t={t}
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
              />
            </LabelFieldPair>
            {emailError && <CardLabelError style={{ marginLeft: "30%" }}>{emailError}</CardLabelError>}

            

            <LabelFieldPair>
              <CardLabel>{t("PT_FORM3_RELATIONSHIP")} *</CardLabel>
              <Dropdown
                className="form-field"
                selected={relationship}
                option={guardianOptions}
                select={setRelationship}
                optionKey="i18nKey"
                t={t}
              />
            </LabelFieldPair>
          </div>

          {/* SECTION 3: Owner Address */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>{t("PT_OWNERS_ADDRESS")} *</div>
            <CheckBox
              label={t("PT_SAME_AS_PROPERTY_ADDRESS")}
              checked={isCorrespondenceAddress}
              onChange={handleCorrespondenceAddress}
            />
            <LabelFieldPair>
              <CardLabel>{t("PT_FORM3_PERMANENT_ADDRESS")} *</CardLabel>
              <TextArea
                value={permanentAddress}
                name="permanentAddress"
                onChange={(e) => setPermanentAddress(e.target.value)}
                rows={3}
              />
            </LabelFieldPair>
          </div>
        </React.Fragment>
      )}

      {/* INSTITUTIONAL FLOW */}
      {isInstitutional && (
        <React.Fragment>
          {/* SECTION 2: Institution Details */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>{t("PT_INSTITUTION_DETAILS_HEADER")}</div>

            <LabelFieldPair>
              <CardLabel>{t("PT_COMMON_INSTITUTION_NAME")} *</CardLabel>
              <TextInput
                t={t}
                type="text"
                name="institutionName"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                validation={{ isRequired: true }}
              />
            </LabelFieldPair>

            <LabelFieldPair>
              <CardLabel>{t("PT_INSTITUTION_TYPE_LABEL")} *</CardLabel>
              <Dropdown
                className="form-field"
                selected={institutionType}
                option={getInstitutionTypeOptions()}
                select={setInstitutionType}
                optionKey="code"
                t={t}
              />
            </LabelFieldPair>

            <LabelFieldPair>
              <CardLabel>{t("PT_CONTACT_PERSON_NAME")} *</CardLabel>
              <TextInput
                t={t}
                type="text"
                name="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                validation={{ isRequired: true, pattern: "^[a-zA-Z ]+$", title: t("PT_NAME_ERROR_MESSAGE") }}
              />
            </LabelFieldPair>

            <LabelFieldPair>
              <CardLabel>{t("PT_DESIGNATION_LABEL")} *</CardLabel>
              <TextInput
                t={t}
                type="text"
                name="designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                validation={{ isRequired: true }}
              />
            </LabelFieldPair>

            <LabelFieldPair>
              <CardLabel>{t("PT_FORM3_MOBILE_NUMBER")} *</CardLabel>
              <MobileNumber
                value={instMobile}
                name="instMobile"
                onChange={(e) => setInstMobile(e.target.value)}
                validation={{ isRequired: true, pattern: "[6-9]{1}[0-9]{9}", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
              />
            </LabelFieldPair>

            <LabelFieldPair>
              <CardLabel>{t("PT_ALT_CONTACT_NUMBER")} *</CardLabel>
              <MobileNumber
                value={altContact}
                name="altContact"
                onChange={(e) => setAltContact(e.target.value)}
                validation={{ isRequired: true }}
              />
            </LabelFieldPair>

            <LabelFieldPair>
              <CardLabel>{t("PT_FORM3_EMAIL_ID")}</CardLabel>
              <TextInput
                t={t}
                type="email"
                name="instEmail"
                value={instEmail}
                onChange={(e) => setInstEmail(e.target.value)}
              />
            </LabelFieldPair>
          </div>

          {/* SECTION 3: Owner Address */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>{t("PT_OWNERS_ADDRESS")} *</div>
            <CheckBox
              label={t("PT_SAME_AS_PROPERTY_ADDRESS")}
              checked={isCorrespondenceAddress}
              onChange={handleCorrespondenceAddress}
            />
            <LabelFieldPair>
              <CardLabel>{t("PT_FORM3_PERMANENT_ADDRESS")} *</CardLabel>
              <TextArea
                value={permanentAddress}
                name="permanentAddress"
                onChange={(e) => setPermanentAddress(e.target.value)}
                rows={3}
              />
            </LabelFieldPair>
          </div>
        </React.Fragment>
      )}

      {/* Submit Button */}
      {ownershipCategory && (
        <div style={{ marginTop: "24px" }}>
          <SubmitBar label={t("PT_COMMON_NEXT")} onSubmit={handleSubmit} />
        </div>
      )}
    </React.Fragment>
  );
};

export default OwnershipDetailsPage;
