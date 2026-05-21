import React, { useEffect, useState } from "react";
import {
  CardLabel,
  CardLabelDesc,
  TextInput,
  MobileNumber,
  RadioButtons,
  Dropdown,
  TextArea,
  CheckBox,
  UploadFile,
  FormStep,
} from "@upyog/digit-ui-react-components";
import Timeline from "../components/TLTimeline";
import { stringReplaceAll } from "../utils";

const PTAllOwnerDetails = ({ t, config, onSelect, formData = {} }) => {
  const stateId = Digit.ULBService.getStateId();

  /* ─── index from URL (supports multi-owner /owner-all-details/0, /1, …) ─── */
  const rawLast = window.location.href.split("/").pop();
  const index = isNaN(parseInt(rawLast)) ? 0 : parseInt(rawLast);

  /* ─── Ownership category (MDMS) ─── */
  const { data: SubOwnerShipCategoryOb, isLoading: subLoading } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "SubOwnerShipCategory");
  const { data: OwnerShipCategoryOb, isLoading: ownLoading } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "OwnerShipCategory");

  /* Build same dropdown as SelectOwnerShipDetails citizen flow */
  const buildOwnershipOptions = (sub, own) => {
    if (!own) return [];
    const subCategoriesInOwnersType = ["INDIVIDUAL"];
    const OwnerShipCategory = {};
    const SubOwnerShipCategory = {};
    own.forEach((c) => { OwnerShipCategory[c.code] = c; });
    if (sub) sub.forEach((c) => { SubOwnerShipCategory[c.code] = c; });
    const result = [];
    Object.keys(OwnerShipCategory).forEach((category) => {
      const code = OwnerShipCategory[category].code;
      if (subCategoriesInOwnersType.includes(code)) {
        const subKeys = Object.keys(SubOwnerShipCategory).filter(
          (s) => SubOwnerShipCategory[s].ownerShipCategory === code
        );
        if (subKeys.length > 0) {
          subKeys.forEach((s) => {
            const { name, code: subCode } = SubOwnerShipCategory[s];
            result.push({
              label: name,
              value: subCode,
              code: subCode,
              i18nKey: `PT_OWNERSHIP_${subCode.split(".")[1] || subCode.split(".")[0]}`,
            });
          });
        } else {
          // sub-category data unavailable — add parent directly
          const { name, code: catCode } = OwnerShipCategory[category];
          result.push({
            label: name,
            value: catCode,
            code: catCode,
            i18nKey: `PT_OWNERSHIP_${catCode.split(".")[1] || catCode.split(".")[0]}`,
          });
        }
      } else {
        const { name, code: catCode } = OwnerShipCategory[category];
        result.push({
          label: name,
          value: catCode,
          code: catCode,
          i18nKey: `PT_OWNERSHIP_${catCode.split(".")[1] || catCode.split(".")[0]}`,
        });
      }
    });
    return result.splice(0, 10);
  };
  const ownershipOptions = buildOwnershipOptions(SubOwnerShipCategoryOb, OwnerShipCategoryOb);

  const [ownershipCategory, setOwnershipCategory] = useState(() => {
    const saved = formData?.ownershipCategory;
    if (!saved) return null;
    if (typeof saved === "object" && saved.code) return saved;
    return null;
  });

  /* sync ownershipCategory once MDMS loads */
  useEffect(() => {
    if (!subLoading && SubOwnerShipCategoryOb && OwnerShipCategoryOb && formData?.ownershipCategory) {
      const opts = buildOwnershipOptions(SubOwnerShipCategoryOb, OwnerShipCategoryOb);
      const pre = opts.find((o) => o.code === (formData.ownershipCategory?.value || formData.ownershipCategory?.code || formData.ownershipCategory));
      if (pre) setOwnershipCategory(pre);
    }
  }, [subLoading, SubOwnerShipCategoryOb, OwnerShipCategoryOb]);

  /* ─── Owner basic details ─── */
  const existingOwner = formData?.owners?.[index] || {};
  const [name, setName] = useState(existingOwner.name || "");
  const [gender, setGender] = useState(existingOwner.gender || null);
  const [mobileNumber, setMobileNumber] = useState(existingOwner.mobileNumber || "");
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState(existingOwner.fatherOrHusbandName || "");
  const [relationship, setRelationship] = useState(existingOwner.relationship || null);
  const [email, setEmail] = useState(existingOwner.emailId || "");
  const [emailError, setEmailError] = useState("");
  const [alternateMobileNumber, setAlternateMobileNumber] = useState(existingOwner.alternatemobilenumber || "");
  const [alternateMobileError, setAlternateMobileError] = useState("");

  /* ─── Gender MDMS ─── */
  const { data: GenderMenu } = Digit.Hooks.pt.useGenderMDMS(stateId, "common-masters", "GenderType");
  const genderOptions = (GenderMenu || []).map((g) => ({
    i18nKey: `PT_COMMON_GENDER_${g.code}`,
    code: g.code,
    value: g.code,
  }));

  const GuardianOptions = [
    { name: "HUSBAND", code: "HUSBAND", i18nKey: "PT_RELATION_HUSBAND" },
    { name: "Father", code: "FATHER", i18nKey: "PT_RELATION_FATHER" },
  ];

  const validateEmail = (value) => {
    if (!value) { setEmailError(""); return; }
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-z.-]+\.(com|org|in)$/;
    setEmailError(pattern.test(value) ? "" : t("CORE_INVALID_EMAIL_ID_PATTERN"));
  };

  /* ─── Owner Type / Special Category (MDMS) ─── */
  const { data: OwnerTypeMenu, isLoading: ownerTypeLoading } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "OwnerType");
  const sortedOwnerTypes = (() => {
    if (!OwnerTypeMenu) return [];
    const menu = [...OwnerTypeMenu];
    menu.forEach((d, i) => { d.order = d.code === "NONE" ? 0 : i + 1; });
    menu.sort((a, b) => a.order - b.order);
    return menu;
  })();

  const [ownerType, setOwnerType] = useState(existingOwner.ownerType || null);

  /* ─── Owner Address ─── */
  const [permanentAddress, setPermanentAddress] = useState(existingOwner.permanentAddress || "");
  const [isCorrespondenceAddress, setIsCorrespondenceAddress] = useState(existingOwner.isCorrespondenceAddress || false);

  function handleCorrespondenceAddress(e) {
    if (e.target.checked) {
      const addr = formData?.address;
      const parts = [
        addr?.doorNo,
        addr?.street,
        addr?.landmark,
        addr?.locality?.i18nkey ? t(addr.locality.i18nkey) : "",
        addr?.city?.code,
        addr?.pincode,
      ].filter(Boolean);
      setPermanentAddress(parts.join(", "));
    } else {
      setPermanentAddress("");
    }
    setIsCorrespondenceAddress(e.target.checked);
  }

  /* ─── Special Category Proof (MDMS) ─── */
  const { data: Documentsob = {} } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "Documents");
  const docs = Documentsob?.PropertyTax?.Documents;

  /* special proof dropdown — filtered by ownerType */
  const specialProofOptions = (() => {
    if (!docs || !ownerType || ownerType.code === "NONE") return [];
    const row = Array.isArray(docs) && docs.find((d) => d.code.includes("SPECIALCATEGORYPROOF"));
    if (!row) return [];
    return (row.dropdownData || [])
      .filter((d) => d.active !== false && d.parentValue?.includes(ownerType.code))
      .map((d) => ({ ...d, i18nKey: stringReplaceAll(d.code, ".", "_") }));
  })();

  const [specialProofDocType, setSpecialProofDocType] = useState(existingOwner.documents?.specialProofIdentity?.documentType || null);
  const [specialProofFile, setSpecialProofFile] = useState(existingOwner.documents?.specialProofIdentity || null);
  const [specialProofUploadedId, setSpecialProofUploadedId] = useState(existingOwner.documents?.specialProofIdentity?.fileStoreId || null);
  const [specialProofError, setSpecialProofError] = useState(null);

  useEffect(() => {
    if (!specialProofFile) return;
    if (specialProofFile.fileStoreId || specialProofUploadedId) return;
    (async () => {
      setSpecialProofError(null);
      if (specialProofFile.size >= 2000000) { setSpecialProofError(t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED")); return; }
      try {
        const res = await Digit.UploadServices.Filestorage("property-upload", specialProofFile, stateId);
        if (res?.data?.files?.length > 0) setSpecialProofUploadedId(res.data.files[0].fileStoreId);
      } catch (_) {}
    })();
  }, [specialProofFile]);

  /* ─── Identity Proof (MDMS) ─── */
  const identityProofOptions = (() => {
    if (!docs) return [];
    const row = Array.isArray(docs) && docs.find((d) => d.code.includes("IDENTITYPROOF"));
    if (!row) return [];
    return (row.dropdownData || []).map((d) => ({ ...d, i18nKey: stringReplaceAll(d.code, ".", "_") }));
  })();

  const [identityProofDocType, setIdentityProofDocType] = useState(existingOwner.documents?.proofIdentity?.documentType || null);
  const [identityProofFile, setIdentityProofFile] = useState(existingOwner.documents?.proofIdentity || null);
  const [identityProofUploadedId, setIdentityProofUploadedId] = useState(existingOwner.documents?.proofIdentity?.fileStoreId || null);
  const [identityProofError, setIdentityProofError] = useState(null);

  useEffect(() => {
    if (!identityProofFile) return;
    if (identityProofFile.fileStoreId || identityProofUploadedId) return;
    (async () => {
      setIdentityProofError(null);
      if (identityProofFile.size >= 2000000) { setIdentityProofError(t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED")); return; }
      try {
        const res = await Digit.UploadServices.Filestorage("property-upload", identityProofFile, stateId);
        if (res?.data?.files?.length > 0) setIdentityProofUploadedId(res.data.files[0].fileStoreId);
      } catch (_) {}
    })();
  }, [identityProofFile]);

  /* auto-select special proof doc when only one option */
  useEffect(() => {
    if (specialProofOptions.length === 1 && specialProofDocType !== specialProofOptions[0]) {
      setSpecialProofDocType(specialProofOptions[0]);
    }
  }, [ownerType, specialProofOptions.length]);

  /* ─── Reset all owner fields when navigating to a new owner index (Add Owner clicked) ─── */
  useEffect(() => {
    const existing = formData?.owners?.[index] || {};
    setName(existing.name || "");
    setGender(existing.gender || null);
    setMobileNumber(existing.mobileNumber || "");
    setFatherOrHusbandName(existing.fatherOrHusbandName || "");
    setRelationship(existing.relationship || null);
    setEmail(existing.emailId || "");
    setEmailError("");
    setAlternateMobileNumber(existing.alternatemobilenumber || "");
    setAlternateMobileError("");
    setOwnerType(existing.ownerType || null);
    setPermanentAddress(existing.permanentAddress || "");
    setIsCorrespondenceAddress(existing.isCorrespondenceAddress || false);
    setSpecialProofDocType(existing.documents?.specialProofIdentity?.documentType || null);
    setSpecialProofFile(existing.documents?.specialProofIdentity || null);
    setSpecialProofUploadedId(existing.documents?.specialProofIdentity?.fileStoreId || null);
    setSpecialProofError(null);
    setIdentityProofDocType(existing.documents?.proofIdentity?.documentType || null);
    setIdentityProofFile(existing.documents?.proofIdentity || null);
    setIdentityProofUploadedId(existing.documents?.proofIdentity?.fileStoreId || null);
    setIdentityProofError(null);
  }, [index]);

  /* ─── Validation ─── */
  const needsSpecialProof = ownerType && ownerType.code !== "NONE" && specialProofOptions.length > 0;

  const isFormValid = () => {
    if (!ownershipCategory) return false;
    if (!name || !mobileNumber || !gender?.code || !relationship?.code || !fatherOrHusbandName) return false;
    if (emailError) return false;
    if (alternateMobileError) return false;
    if (!ownerType) return false;
    if (!permanentAddress) return false;
    if (needsSpecialProof && (!specialProofDocType || !specialProofFile)) return false;
    if (!identityProofDocType || !identityProofFile) return false;
    return true;
  };

  /* ─── Build owner object and submit ─── */
  function buildOwnerData() {
    const documents = [];
    if (identityProofFile) {
      const f = { ...identityProofFile, documentType: identityProofDocType, fileStoreId: identityProofUploadedId || null };
      documents["proofIdentity"] = f;
    }
    if (needsSpecialProof && specialProofFile) {
      const f = { ...specialProofFile, documentType: specialProofDocType, fileStoreId: specialProofUploadedId || null };
      documents["specialProofIdentity"] = f;
    }
    return {
      ...(formData?.owners?.[index] || {}),
      name,
      gender,
      mobileNumber,
      alternatemobilenumber: alternateMobileNumber || undefined,
      fatherOrHusbandName,
      relationship,
      emailId: email,
      ownerType,
      permanentAddress,
      isCorrespondenceAddress,
      documents,
    };
  }

  const goNext = () => {
    sessionStorage.setItem("ownershipCategory", ownershipCategory?.value);
    onSelect("allOwnerDetails", {
      ownershipCategory,
      ownerData: buildOwnerData(),
      ownerIndex: index,
    });
  };

  /* ─── Add another owner (MULTIPLE OWNERS only) ─── */
  function onAddOwner() {
    sessionStorage.setItem("ownershipCategory", ownershipCategory?.value);
    const newIndex = index + 1;
    onSelect("allOwnerDetails", {
      ownershipCategory,
      ownerData: buildOwnerData(),
      ownerIndex: index,
      addNewOwnerIndex: newIndex,
    }, false, newIndex, true);
  }

  const isMultipleOwners = ownershipCategory?.value === "INDIVIDUAL.MULTIPLEOWNERS";

  return (
    <React.Fragment>
      <style>{`
        .pt-owner-details-form .select,
        .pt-owner-details-form .select-active {
          border: 1px solid #b1b4b6 !important;
          border-radius: 8px !important;
        }
        .pt-owner-details-form .select:hover,
        .pt-owner-details-form .select-active:hover {
          border: 1px solid #b1b4b6 !important;
          border-radius: 8px !important;
        }
        .pt-owner-details-form .select-wrap,
        .pt-owner-details-form .employee-select-wrap {
          max-width: none !important;
          position: relative !important;
          overflow: visible !important;
        }
        .pt-owner-details-form .select-wrap .options-card,
        .pt-owner-details-form .employee-select-wrap .options-card {
          position: absolute !important;
          top: 100% !important;
          bottom: auto !important;
          margin-top: 4px !important;
          margin-bottom: 0 !important;
          max-height: 220px !important;
          overflow-y: auto !important;
          overscroll-behavior: contain !important;
          z-index: 9999 !important;
          width: 100% !important;
          background: #fff !important;
          border: 1px solid #b1b4b6 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
        #pt-identity-doc-dropdown .options-card,
        #pt-special-doc-dropdown .options-card {
          top: auto !important;
          bottom: 100% !important;
          margin-top: 0 !important;
          margin-bottom: 4px !important;
          box-shadow: 0 -4px 12px rgba(0,0,0,0.15) !important;
        }
        .pt-owner-details-form .text-input-width {
          max-width: none !important;
        }
        .pt-owner-details-form .citizen-card-input,
        .pt-owner-details-form .employee-card-input,
        .pt-owner-details-form .card-input,
        .pt-owner-details-form .card-input-error,
        .pt-owner-details-form .employee-card-input-error {
          border: 1px solid #b1b4b6 !important;
          border-radius: 8px !important;
          height: 40px !important;
          line-height: 40px !important;
        }
        .pt-owner-details-form .upload-file,
        .pt-owner-details-form .upload-file-max-width {
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          width: 100% !important;
          max-width: none !important;
          min-height: 40px !important;
          border: 1px solid #b1b4b6 !important;
          border-radius: 8px !important;
          background: #fff !important;
          padding: 0 8px !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        }
        .pt-owner-details-form .upload-file > div {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .pt-owner-details-form .input-mirror-selector-button {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          opacity: 0 !important;
          cursor: pointer !important;
          z-index: 2 !important;
          min-height: unset !important;
          max-height: unset !important;
          background: transparent !important;
          border: none !important;
        }
        .pt-owner-details-form .file-upload-status {
          flex: 1 !important;
          font-size: 14px !important;
          color: #505a5f !important;
          font-weight: normal !important;
          margin: 0 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          min-width: 0 !important;
        }
        .pt-owner-details-form .selector-button-border {
          position: relative !important;
          z-index: 1 !important;
          pointer-events: none !important;
          height: 32px !important;
          min-height: 32px !important;
          width: 30% !important;
          flex-shrink: 0 !important;
          padding: 0 8px !important;
          font-size: 14px !important;
          white-space: nowrap !important;
          border-radius: 6px !important;
        }
        .pt-owner-details-form .upload-file .tag-container {
          width: 65% !important;
        }
      `}</style>
      {window.location.href.includes("/citizen") ? <Timeline currentStep={2} /> : null}

      {/* ── Hero Banner ── */}
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>Step 2 of 3</div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{t("PT_OWNER_DETAILS_HEADER") || "Owner Details"}</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>{t("PT_OWNER_DETAILS_SUBHEADER") || "Provide ownership and contact information"}</p>
        </div>
      </div>

      {/* ── Layout styles (same design as Property Details) ── */}
      {(() => {
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
        const rowStyle = {
          display: "flex",
          flexWrap: "wrap",
          marginLeft: "-10px",
          marginRight: "-10px",
        };
        const col3 = {
          flex: "0 0 33.333%",
          maxWidth: "33.333%",
          padding: "0 10px",
          marginBottom: "18px",
          boxSizing: "border-box",
        };
        const col6 = {
          flex: "0 0 50%",
          maxWidth: "50%",
          padding: "0 10px",
          marginBottom: "18px",
          boxSizing: "border-box",
        };
        const col12 = {
          flex: "0 0 100%",
          maxWidth: "100%",
          padding: "0 10px",
          marginBottom: "18px",
          boxSizing: "border-box",
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

        return (
          <FormStep
            config={config}
            onSelect={goNext}
            t={t}
            isDisabled={!isFormValid()}
            onAdd={isMultipleOwners ? onAddOwner : null}
            isMultipleAllow={isMultipleOwners}
          >

            {/* ══════════════════════════════════════
                CARD 1 – Owner Basic Details
            ══════════════════════════════════════ */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>{t("PT_OWNER_DETAILS_HEADER") || "Owner Details"}</div>
              <div style={rowStyle}>

                {/* Ownership Type */}
                <div style={col6}>
                  <label style={labelStyle}>{t("PT_PROVIDE_OWNERSHIP_DETAILS")}<span style={requiredMark}>*</span></label>
                  <Dropdown t={t} isMandatory={true} option={ownershipOptions} selected={ownershipCategory} optionKey="i18nKey" select={(val) => { setOwnershipCategory(val); sessionStorage.setItem("ownershipCategory", val?.value); }} placeholder={t("PT_SELECT_PLACEHOLDER")} />
                </div>

                {/* Owner Name */}
                <div style={col6}>
                  <label style={labelStyle}>{t("PT_OWNER_NAME")}<span style={requiredMark}>*</span></label>
                  <TextInput type="text" value={name} onChange={(e) => setName(e.target.value)} pattern="^[a-zA-Z ]+$" title={t("PT_NAME_ERROR_MESSAGE")} />
                </div>

                {/* Mobile Number */}
                <div style={col3}>
                  <label style={labelStyle}>{t("PT_FORM3_MOBILE_NUMBER")}<span style={requiredMark}>*</span></label>
                  <MobileNumber value={mobileNumber} name="mobileNumber" onChange={(val) => setMobileNumber(val)} required pattern="[6-9]{1}[0-9]{9}" type="tel" title={t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID")} />
                </div>

                {/* Email */}
                <div style={col3}>
                  <label style={labelStyle}>{t("PT_FORM3_EMAIL_ID")}</label>
                  <TextInput type="email" value={email} onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }} />
                  {emailError && <span style={{ color: "#e54d42", fontSize: "12px", marginTop: "4px", display: "block" }}>{emailError}</span>}
                </div>

                {/* Father / Husband Name */}
                <div style={col3}>
                  <label style={labelStyle}>{t("PT_FORM3_FATHER_HUSBAND_NAME") || "Father / Husband Name"}<span style={requiredMark}>*</span></label>
                  <TextInput type="text" value={fatherOrHusbandName} onChange={(e) => setFatherOrHusbandName(e.target.value)} pattern="^[a-zA-Z ]+$" title={t("PT_NAME_ERROR_MESSAGE")} />
                </div>

                {/* Alternate Mobile Number */}
                <div style={col3}>
                  <label style={labelStyle}>{t("PT_FORM3_ALT_MOBILE_NUMBER") || "Alternate Mobile Number"}</label>
                  <MobileNumber
                    value={alternateMobileNumber}
                    name="alternateMobileNumber"
                    onChange={(val) => {
                      setAlternateMobileNumber(val);
                      if (val && !/^[6-9][0-9]{9}$/.test(val)) {
                        setAlternateMobileError(t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID"));
                      } else {
                        setAlternateMobileError("");
                      }
                    }}
                    pattern="[6-9]{1}[0-9]{9}"
                    type="tel"
                    title={t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID")}
                  />
                  {alternateMobileError && (
                    <span style={{ color: "#e54d42", fontSize: "12px", marginTop: "4px", display: "block" }}>{alternateMobileError}</span>
                  )}
                </div>

                {/* Gender */}
                <div style={col6}>
                  <label style={labelStyle}>{t("PT_FORM3_GENDER")}<span style={requiredMark}>*</span></label>
                  <RadioButtons t={t} options={genderOptions} optionsKey="code" name="gender" selectedOption={gender} onSelect={setGender} isDependent={true} labelKey="PT_COMMON_GENDER" />
                </div>

                {/* Relationship */}
                <div style={col6}>
                  <label style={labelStyle}>{t("PT_FORM3_RELATIONSHIP")}<span style={requiredMark}>*</span></label>
                  <RadioButtons t={t} optionsKey="i18nKey" options={GuardianOptions} selectedOption={relationship} onSelect={setRelationship} isDependent={true} labelKey="PT_RELATION" />
                </div>

              </div>
            </div>

            {/* ══════════════════════════════════════
                CARD 2 – Owner Type & Address
            ══════════════════════════════════════ */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>{t("PT_OWNER_TYPE_ADDRESS_HEADER") || "Owner Type & Address"}</div>
              <div style={rowStyle}>

                {/* Special Owner Category */}
                <div style={col12}>
                  <label style={labelStyle}>{t("PT_SPECIAL_OWNER_CATEGORY")}<span style={requiredMark}>*</span></label>
                  <RadioButtons t={t} optionsKey="i18nKey" options={sortedOwnerTypes} selectedOption={ownerType} onSelect={setOwnerType} isDependent={true} labelKey="PROPERTYTAX_OWNERTYPE" />
                </div>

                {/* Owner Address */}
                <div style={col12}>
                  <label style={labelStyle}>{t("PT_OWNERS_ADDRESS")}<span style={requiredMark}>*</span></label>
                  <TextArea value={permanentAddress} onChange={(e) => setPermanentAddress(e.target.value)} />
                  <CheckBox label={t("PT_COMMON_SAME_AS_PROPERTY_ADDRESS")} onChange={handleCorrespondenceAddress} value={isCorrespondenceAddress} checked={isCorrespondenceAddress || false} style={{ paddingTop: "10px" }} />
                </div>

              </div>
            </div>

            {/* ══════════════════════════════════════
                CARD 3 – Documents
            ══════════════════════════════════════ */}
            <div style={cardStyle}>
              {/* Card header with icon */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", paddingBottom: "14px", borderBottom: "2px solid #f47738" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "linear-gradient(135deg, #1a2b49, #2d4a7a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#1a2b49" }}>{t("PT_DOCUMENTS_HEADER") || "Documents"}</div>
                  <div style={{ fontSize: "12px", color: "#8a97a8", marginTop: "2px" }}>
                    {t("PT_UPLOAD_RESTRICTIONS_TYPES")} &middot; {t("PT_UPLOAD_RESTRICTIONS_SIZE")}
                  </div>
                </div>
              </div>

              <div style={rowStyle}>

                {/* Special Category Proof – conditional */}
                {needsSpecialProof && (
                  <div style={col12}>
                    <div style={{ background: "#f8f9fe", border: "1px solid #e4e8f0", borderRadius: "10px", padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#fff3ec", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                        </div>
                        <label style={{ ...labelStyle, margin: 0, lineHeight: "1.2" }}>{t("PT_SPECIAL_OWNER_CATEGORY_PROOF_HEADER")}<span style={requiredMark}>*</span></label>
                      </div>
                      <div style={{ display: "flex", gap: "16px", alignItems: "center", width: "100%" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <label style={{ ...labelStyle, fontWeight: "500", fontSize: "12px", color: "#5a6475" }}>{t("PT_CATEGORY_DOCUMENT_TYPE")}</label>
                          <Dropdown t={t} isMandatory={false} option={specialProofOptions} selected={specialProofDocType} optionKey="i18nKey" select={setSpecialProofDocType} placeholder={t("PT_MUTATION_SELECT_DOC_LABEL")} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ border: "2px dashed #c8d0dc", borderRadius: "10px", background: "#ffffff", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                              <span style={{ fontSize: "18px", lineHeight: 1 }}>📎</span>
                              <span style={{ fontSize: "10px", color: "#8a97a8", whiteSpace: "nowrap" }}>JPG &middot; PNG &middot; PDF | Max 5MB</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <UploadFile id="pt-special-proof" extraStyleName="propertyCreate" accept=".jpg,.png,.pdf" onUpload={(e) => setSpecialProofFile(e.target.files[0])} onDelete={() => { setSpecialProofUploadedId(null); setSpecialProofFile(null); }} message={specialProofFile ? `1 ${t("PT_ACTION_FILEUPLOADED")}` : t("PT_ACTION_NO_FILEUPLOADED")} error={specialProofError} />
                            </div>
                          </div>
                          {specialProofError && <div style={{ color: "#e54d42", fontSize: "12px", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}><span>⚠</span> {specialProofError}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Identity Proof */}
                <div style={col12}>
                  <div style={{ background: "#f8f9fe", border: "1px solid #e4e8f0", borderRadius: "10px", padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#e8f4e8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                      </div>
                      <label style={{ ...labelStyle, margin: 0, lineHeight: "1.2" }}>{t("PT_PROOF_IDENTITY_HEADER")}<span style={requiredMark}>*</span></label>
                    </div>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center", width: "100%" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <label style={{ ...labelStyle, fontWeight: "500", fontSize: "12px", color: "#5a6475" }}>{t("PT_CATEGORY_DOCUMENT_TYPE")}<span style={requiredMark}>*</span></label>
                        <Dropdown t={t} isMandatory={false} option={identityProofOptions} selected={identityProofDocType} optionKey="i18nKey" select={setIdentityProofDocType} placeholder={t("PT_MUTATION_SELECT_DOC_LABEL")} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ border: "2px dashed #c8d0dc", borderRadius: "10px", background: "#ffffff", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                            <span style={{ fontSize: "18px", lineHeight: 1 }}>📎</span>
                            <span style={{ fontSize: "10px", color: "#8a97a8", whiteSpace: "nowrap" }}>JPG &middot; PNG &middot; PDF | Max 5MB</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <UploadFile id="pt-identity-proof" extraStyleName="propertyCreate" accept=".jpg,.png,.pdf" onUpload={(e) => setIdentityProofFile(e.target.files[0])} onDelete={() => { setIdentityProofUploadedId(null); setIdentityProofFile(null); }} message={identityProofFile ? `1 ${t("PT_ACTION_FILEUPLOADED")}` : t("PT_ACTION_NO_FILEUPLOADED")} error={identityProofError} />
                          </div>
                        </div>
                        {identityProofError && <div style={{ color: "#e54d42", fontSize: "12px", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}><span>⚠</span> {identityProofError}</div>}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </FormStep>
        );
      })()}
    </React.Fragment>
  );
};

export default PTAllOwnerDetails;