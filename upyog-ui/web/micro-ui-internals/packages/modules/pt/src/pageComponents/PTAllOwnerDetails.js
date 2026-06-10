import React, { useEffect, useState, useCallback } from "react";
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

/* ─── Helper: empty owner form state ─── */
const emptyOwner = () => ({
  name: "", gender: null, mobileNumber: "",
  fatherOrHusbandName: "", relationship: null,
  email: "", emailError: "",
  alternateMobileNumber: "", alternateMobileError: "",
  institutionName: "", institutionType: null, designation: "",
  landlineNumber: "", landlineError: "",
  institutionAltMobile: "", institutionAltMobileError: "",
  ownerType: null, permanentAddress: "", isCorrespondenceAddress: false,
  specialProofDocType: null, specialProofFile: null, specialProofUploadedId: null, specialProofError: null,
  identityProofDocType: null, identityProofFile: null, identityProofUploadedId: null, identityProofError: null,
});

/* ─── Helper: init owner form from saved data ─── */
const initOwnerFromData = (saved) => {
  if (!saved) return emptyOwner();
  return {
    name: saved.name || "",
    gender: saved.gender || null,
    mobileNumber: saved.mobileNumber || "",
    fatherOrHusbandName: saved.fatherOrHusbandName || "",
    relationship: saved.relationship || null,
    email: saved.emailId || "",
    emailError: "",
    alternateMobileNumber: saved.alternatemobilenumber || "",
    alternateMobileError: "",
    institutionName: saved.inistitutionName || "",
    institutionType: saved.inistitutetype || null,
    designation: saved.designation || "",
    landlineNumber: saved.altContactNumber || "",
    landlineError: "",
    institutionAltMobile: saved.alternatemobilenumber || "",
    institutionAltMobileError: "",
    ownerType: saved.ownerType || null,
    permanentAddress: saved.permanentAddress || "",
    isCorrespondenceAddress: saved.isCorrespondenceAddress || false,
    specialProofDocType: saved.documents?.specialProofIdentity?.documentType || null,
    specialProofFile: saved.documents?.specialProofIdentity || null,
    specialProofUploadedId: saved.documents?.specialProofIdentity?.fileStoreId || null,
    specialProofError: null,
    identityProofDocType: saved.documents?.proofIdentity?.documentType || null,
    identityProofFile: saved.documents?.proofIdentity || null,
    identityProofUploadedId: saved.documents?.proofIdentity?.fileStoreId || null,
    identityProofError: null,
  };
};

const PTAllOwnerDetails = ({ t, config, onSelect, formData = {} }) => {
  const stateId = Digit.ULBService.getStateId();

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
            // Use full dotted code (e.g. "INDIVIDUAL.SINGLEOWNER") to match API ownershipCategory values
            const fullCode = subCode.includes(".") ? subCode : `${code}.${subCode}`;
            result.push({
              label: name,
              value: fullCode,
              code: fullCode,
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
        // Skip dotted sub-codes (e.g. "INDIVIDUAL.SINGLEOWNER") whose parent is already
        // expanded from SubOwnerShipCategory — they would create duplicate dropdown entries.
        const { name, code: catCode } = OwnerShipCategory[category];
        const parentCode = catCode.split(".")[0];
        const isDotted = parentCode !== catCode;
        if (!isDotted || !subCategoriesInOwnersType.includes(parentCode)) {
          result.push({
            label: name,
            value: catCode,
            code: catCode,
            i18nKey: `PT_OWNERSHIP_${catCode.split(".")[1] || catCode.split(".")[0]}`,
          });
        }
      }
    });
    return result.splice(0, 10);
  };
  const ownershipOptions = buildOwnershipOptions(SubOwnerShipCategoryOb, OwnerShipCategoryOb);

  const [ownershipCategory, setOwnershipCategory] = useState(() => {
    const saved = formData?.ownershipCategory;
    if (!saved) return null;
    if (typeof saved === "object" && saved.code) {
      if (saved.i18nKey) return saved;
      // Build i18nKey from code so the Dropdown shows the label immediately (e.g., "INDIVIDUAL.SINGLEOWNER" → "PT_OWNERSHIP_SINGLEOWNER")
      const rawCode = saved.code || saved.value || "";
      const parts = rawCode.split(".");
      const subPart = parts[parts.length - 1];
      return { ...saved, i18nKey: `PT_OWNERSHIP_${subPart}` };
    }
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

  /* ─── Multiple owners state (one form per owner) ─── */
  const [ownerForms, setOwnerForms] = useState(() => {
    const saved = formData?.owners;
    if (saved && saved.length > 0) return saved.map(initOwnerFromData);
    return [emptyOwner()];
  });

  /* trim extra owner forms when category changes away from MULTIPLEOWNERS */
  useEffect(() => {
    const code = ownershipCategory?.value || ownershipCategory?.code || ownershipCategory;
    if (code !== "INDIVIDUAL.MULTIPLEOWNERS") {
      setOwnerForms(prev => prev.length > 1 ? [prev[0]] : prev);
    }
  }, [ownershipCategory]);

  const updateOwner = useCallback((ownerIdx, field, value) => {
    setOwnerForms(prev => {
      const updated = [...prev];
      updated[ownerIdx] = { ...updated[ownerIdx], [field]: value };
      return updated;
    });
  }, []);

  /* ─── Async file upload handlers ─── */
  const handleIdentityFileSelect = async (ownerIdx, file) => {
    if (!file) return;
    updateOwner(ownerIdx, "identityProofFile", file);
    updateOwner(ownerIdx, "identityProofError", null);
    if (file.size >= 2000000) { updateOwner(ownerIdx, "identityProofError", t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED")); return; }
    try {
      const res = await Digit.UploadServices.Filestorage("property-upload", file, stateId);
      if (res?.data?.files?.length > 0) updateOwner(ownerIdx, "identityProofUploadedId", res.data.files[0].fileStoreId);
      else updateOwner(ownerIdx, "identityProofError", t("PT_FILE_UPLOAD_ERROR"));
    } catch (_) { updateOwner(ownerIdx, "identityProofError", t("PT_FILE_UPLOAD_ERROR")); }
  };

  const handleSpecialProofFileSelect = async (ownerIdx, file) => {
    if (!file) return;
    updateOwner(ownerIdx, "specialProofFile", file);
    updateOwner(ownerIdx, "specialProofError", null);
    if (file.size >= 2000000) { updateOwner(ownerIdx, "specialProofError", t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED")); return; }
    try {
      const res = await Digit.UploadServices.Filestorage("property-upload", file, stateId);
      if (res?.data?.files?.length > 0) updateOwner(ownerIdx, "specialProofUploadedId", res.data.files[0].fileStoreId);
      else updateOwner(ownerIdx, "specialProofError", t("PT_FILE_UPLOAD_ERROR"));
    } catch (_) { updateOwner(ownerIdx, "specialProofError", t("PT_FILE_UPLOAD_ERROR")); }
  };

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

  const ownershipCategoryCode = ownershipCategory?.value || ownershipCategory?.code || ownershipCategory;

  /* ─── Institutional flag & type options ─── */
  const isInstitutional =
    ownershipCategoryCode === "INSTITUTIONALPRIVATE" ||
    ownershipCategoryCode === "INSTITUTIONALGOVERNMENT";

  const institutionTypeOptions = React.useMemo(() => {
    if (!ownershipCategoryCode || !SubOwnerShipCategoryOb) return [];
    return SubOwnerShipCategoryOb
      .filter((c) => c.active && c.ownerShipCategory === ownershipCategoryCode)
      .map((c) => ({
        label: c.name,
        value: c.code,
        code: c.code,
        i18nKey: `PROPERTYTAX_BILLING_SLAB_${c.code}`,
      }));
  }, [SubOwnerShipCategoryOb, ownershipCategoryCode]);

  const validateEmail = (ownerIdx, value) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-z.-]+\.(com|org|in)$/;
    updateOwner(ownerIdx, "emailError", value && !pattern.test(value) ? t("CORE_INVALID_EMAIL_ID_PATTERN") : "");
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

  function handleCorrespondenceAddress(ownerIdx, checked) {
    if (checked) {
      const addr = formData?.address;
      const parts = [
        addr?.doorNo,
        addr?.street,
        addr?.landmark,
        addr?.locality?.i18nkey ? t(addr.locality.i18nkey) : "",
        addr?.city?.code,
        addr?.pincode,
      ].filter(Boolean);
      updateOwner(ownerIdx, "permanentAddress", parts.join(", "));
    } else {
      updateOwner(ownerIdx, "permanentAddress", "");
    }
    updateOwner(ownerIdx, "isCorrespondenceAddress", checked);
  }

  /* ─── Special Category Proof (MDMS) ─── */
  const { data: Documentsob = {} } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "Documents");
  const docs = Documentsob?.PropertyTax?.Documents;

  /* special proof dropdown — filtered per owner type */
  const getSpecialProofOptions = (ownerType) => {
    if (!docs || !ownerType || ownerType.code === "NONE") return [];
    const row = Array.isArray(docs) && docs.find((d) => d.code.includes("SPECIALCATEGORYPROOF"));
    if (!row) return [];
    return (row.dropdownData || [])
      .filter((d) => d.active !== false && d.parentValue?.includes(ownerType.code))
      .map((d) => ({ ...d, i18nKey: stringReplaceAll(d.code, ".", "_") }));
  };

  /* ─── Identity Proof options (MDMS) ─── */
  const identityProofOptions = (() => {
    if (!docs) return [];
    const row = Array.isArray(docs) && docs.find((d) => d.code.includes("IDENTITYPROOF"));
    if (!row) return [];
    return (row.dropdownData || []).map((d) => ({ ...d, i18nKey: stringReplaceAll(d.code, ".", "_") }));
  })();

  /* ─── Validation ─── */
  const isOwnerValid = (owner) => {
    if (!ownershipCategory) return false;
    const specialOpts = getSpecialProofOptions(owner.ownerType);
    const ownerNeedsSpecialProof = owner.ownerType && owner.ownerType.code !== "NONE" && specialOpts.length > 0;
    if (isInstitutional) {
      if (!owner.institutionName || !owner.institutionType || !owner.name || !owner.designation || !owner.mobileNumber || !owner.permanentAddress) return false;
      if (owner.emailError || owner.landlineError || owner.institutionAltMobileError) return false;
      if (!owner.identityProofDocType || !owner.identityProofFile) return false;
      return true;
    }
    if (!owner.name || !owner.mobileNumber || !owner.gender?.code || !owner.relationship?.code || !owner.fatherOrHusbandName) return false;
    if (owner.emailError || owner.alternateMobileError) return false;
    if (!owner.ownerType) return false;
    if (!owner.permanentAddress) return false;
    if (ownerNeedsSpecialProof && (!owner.specialProofDocType || !owner.specialProofFile)) return false;
    if (!owner.identityProofDocType || !owner.identityProofFile) return false;
    return true;
  };

  const isFormValid = () => ownerForms.every(isOwnerValid);

  /* ─── Build owner data object ─── */
  const buildOwnerData = (owner, ownerIdx) => {
    const documents = {};
    if (owner.identityProofFile) {
      documents["proofIdentity"] = { ...owner.identityProofFile, documentType: owner.identityProofDocType, fileStoreId: owner.identityProofUploadedId || null };
    }
    const specialOpts = getSpecialProofOptions(owner.ownerType);
    const ownerNeedsSpecialProof = owner.ownerType && owner.ownerType.code !== "NONE" && specialOpts.length > 0;
    if (isInstitutional) {
      return {
        ...(formData?.owners?.[ownerIdx] || {}),
        inistitutionName: owner.institutionName,
        inistitutetype: owner.institutionType,
        name: owner.name,
        designation: owner.designation,
        altContactNumber: owner.landlineNumber || owner.mobileNumber || undefined,
        alternatemobilenumber: owner.institutionAltMobile || undefined,
        mobileNumber: owner.mobileNumber,
        emailId: owner.email,
        permanentAddress: owner.permanentAddress,
        isCorrespondenceAddress: owner.isCorrespondenceAddress,
        documents,
      };
    }
    if (ownerNeedsSpecialProof && owner.specialProofFile) {
      documents["specialProofIdentity"] = { ...owner.specialProofFile, documentType: owner.specialProofDocType, fileStoreId: owner.specialProofUploadedId || null };
    }
    return {
      ...(formData?.owners?.[ownerIdx] || {}),
      name: owner.name,
      gender: owner.gender,
      mobileNumber: owner.mobileNumber,
      alternatemobilenumber: owner.alternateMobileNumber || undefined,
      fatherOrHusbandName: owner.fatherOrHusbandName,
      relationship: owner.relationship,
      emailId: owner.email,
      ownerType: owner.ownerType,
      permanentAddress: owner.permanentAddress,
      isCorrespondenceAddress: owner.isCorrespondenceAddress,
      documents,
    };
  };

  const goNext = () => {
    sessionStorage.setItem("ownershipCategory", ownershipCategoryCode);
    const allBuilt = ownerForms.map((o, i) => buildOwnerData(o, i));
    onSelect("allOwnerDetails", {
      ownershipCategory,
      ownerData: allBuilt[0],
      ownerIndex: 0,
      allOwners: allBuilt,
    });
  };

  /* ─── Add another owner (MULTIPLE OWNERS only) ─── */
  function onAddOwner() {
    setOwnerForms(prev => [...prev, emptyOwner()]);
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
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
          height: 46px !important;
          line-height: 46px !important;
        }
        .pt-owner-details-form .mobile-field,
        .pt-owner-details-form .mobile-field > div,
        .pt-owner-details-form .phone-field-container {
          height: 46px !important;
        }
        .pt-owner-details-form .phone-prefix,
        .pt-owner-details-form .mobile-field .prefix {
          height: 46px !important;
          line-height: 46px !important;
        }
        .pt-phone-input:focus-within {
          border-color: #1a2b49 !important;
          box-shadow: 0 0 0 3px rgba(26,43,73,0.1) !important;
        }
        .pt-phone-input .pt-phone-prefix {
          font-size: 14px !important;
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
            <div className="pt-owner-details-form">
            {ownerForms.map((owner, ownerIdx) => {
              /* ─── per-owner local aliases (keeps existing JSX intact) ─── */
              const { name, gender, mobileNumber, fatherOrHusbandName, relationship, email, emailError,
                      alternateMobileNumber, alternateMobileError, institutionName, institutionType,
                      designation, landlineNumber, landlineError, institutionAltMobile, institutionAltMobileError,
                      ownerType, permanentAddress, isCorrespondenceAddress,
                      specialProofDocType, specialProofFile, specialProofUploadedId, specialProofError,
                      identityProofDocType, identityProofFile, identityProofUploadedId, identityProofError } = owner;
              const setName = (v) => updateOwner(ownerIdx, "name", v);
              const setGender = (v) => updateOwner(ownerIdx, "gender", v);
              const setMobileNumber = (v) => updateOwner(ownerIdx, "mobileNumber", v);
              const setFatherOrHusbandName = (v) => updateOwner(ownerIdx, "fatherOrHusbandName", v);
              const setRelationship = (v) => updateOwner(ownerIdx, "relationship", v);
              const setEmail = (v) => updateOwner(ownerIdx, "email", v);
              const setAlternateMobileNumber = (v) => updateOwner(ownerIdx, "alternateMobileNumber", v);
              const setAlternateMobileError = (v) => updateOwner(ownerIdx, "alternateMobileError", v);
              const setInstitutionName = (v) => updateOwner(ownerIdx, "institutionName", v);
              const setInstitutionType = (v) => updateOwner(ownerIdx, "institutionType", v);
              const setDesignation = (v) => updateOwner(ownerIdx, "designation", v);
              const setLandlineNumber = (v) => updateOwner(ownerIdx, "landlineNumber", v);
              const setLandlineError = (v) => updateOwner(ownerIdx, "landlineError", v);
              const setInstitutionAltMobile = (v) => updateOwner(ownerIdx, "institutionAltMobile", v);
              const setInstitutionAltMobileError = (v) => updateOwner(ownerIdx, "institutionAltMobileError", v);
              const setOwnerType = (v) => updateOwner(ownerIdx, "ownerType", v);
              const setPermanentAddress = (v) => updateOwner(ownerIdx, "permanentAddress", v);
              const setIsCorrespondenceAddress = (v) => updateOwner(ownerIdx, "isCorrespondenceAddress", v);
              const setSpecialProofDocType = (v) => updateOwner(ownerIdx, "specialProofDocType", v);
              const setSpecialProofUploadedId = (v) => updateOwner(ownerIdx, "specialProofUploadedId", v);
              const setSpecialProofFile = (v) => updateOwner(ownerIdx, "specialProofFile", v);
              const setIdentityProofDocType = (v) => updateOwner(ownerIdx, "identityProofDocType", v);
              const setIdentityProofUploadedId = (v) => updateOwner(ownerIdx, "identityProofUploadedId", v);
              const setIdentityProofFile = (v) => updateOwner(ownerIdx, "identityProofFile", v);
              const specialProofOptions = getSpecialProofOptions(ownerType);
              const needsSpecialProof = ownerType && ownerType.code !== "NONE" && specialProofOptions.length > 0;
              return (
              <React.Fragment key={ownerIdx}>
              {ownerIdx > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0 16px", padding: "14px 20px", background: "linear-gradient(135deg, #1a2b49 0%, #2d4a7a 100%)", borderRadius: "10px", color: "#fff" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span style={{ fontSize: "15px", fontWeight: "700", letterSpacing: "0.3px" }}>{t("PT_OWNER_DETAILS_HEADER") || "Owner Details"} {ownerIdx + 1}</span>
                </div>
              )}

            {/* ══════════════════════════════════════
                CARD 1 – Owner Basic Details
            ══════════════════════════════════════ */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>{ownerIdx === 0 ? (t("PT_OWNER_DETAILS_HEADER") || "Owner Details") : `${t("PT_OWNER_DETAILS_HEADER") || "Owner Details"} ${ownerIdx + 1}`}</div>
              <div style={rowStyle}>

                {/* Ownership Type – only on first owner */}
                {ownerIdx === 0 && (
                <div style={col6}>
                  <label style={labelStyle}>{t("PT_PROVIDE_OWNERSHIP_DETAILS")}<span style={requiredMark}>*</span></label>
                  <select
                    style={{ display: "block", width: "100%", height: "46px", padding: "0 40px 0 14px", border: ownershipCategory ? "1.5px solid #1a2b49" : "1.5px solid #b0b8c1", borderRadius: "10px", fontSize: "14px", color: ownershipCategory ? "#1a2b49" : "#8a97a8", backgroundColor: ownershipCategory ? "#fff" : "#f9fafc", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%231a2b49' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center", backgroundSize: "13px", WebkitAppearance: "none", MozAppearance: "none", appearance: "none", cursor: "pointer", outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontWeight: ownershipCategory ? "600" : "400", boxShadow: ownershipCategory ? "0 0 0 3px rgba(26,43,73,0.08)" : "none", transition: "border-color 0.2s, box-shadow 0.2s" }}
                    value={ownershipCategory?.code || ""}
                    onChange={(e) => { const val = ownershipOptions.find(o => o.code === e.target.value) || null; setOwnershipCategory(val); if (val) sessionStorage.setItem("ownershipCategory", val.value); }}
                  >
                    <option value="" disabled hidden>{t("PT_SELECT_PLACEHOLDER")}</option>
                    {ownershipOptions.map(o => <option key={o.code} value={o.code}>{t(o.i18nKey)}</option>)}
                  </select>
                </div>
                )}

                {isInstitutional ? (
                  <React.Fragment>
                    {/* Institution Name */}
                    <div style={col6}>
                      <label style={labelStyle}>{t("PT_INSTITUTION_NAME")}<span style={requiredMark}>*</span></label>
                      <TextInput type="text" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} pattern="^[a-zA-Z_@./()#&+- ]*$" title={t("PT_NAME_ERROR_MESSAGE")} />
                    </div>
                    {/* Institution Type */}
                    <div style={col6}>
                      <label style={labelStyle}>{t("PT_INSTITUTION_TYPE")}<span style={requiredMark}>*</span></label>
                      <select
                        style={{ display: "block", width: "100%", height: "46px", padding: "0 40px 0 14px", border: institutionType ? "1.5px solid #1a2b49" : "1.5px solid #b0b8c1", borderRadius: "10px", fontSize: "14px", color: institutionType ? "#1a2b49" : "#8a97a8", backgroundColor: institutionType ? "#fff" : "#f9fafc", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%231a2b49' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center", backgroundSize: "13px", WebkitAppearance: "none", MozAppearance: "none", appearance: "none", cursor: "pointer", outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontWeight: institutionType ? "600" : "400", transition: "border-color 0.2s" }}
                        value={institutionType?.code || ""}
                        onChange={(e) => { const val = institutionTypeOptions.find(o => o.code === e.target.value) || null; setInstitutionType(val); }}
                      >
                        <option value="" disabled hidden>{t("PT_SELECT_PLACEHOLDER")}</option>
                        {institutionTypeOptions.map(o => <option key={o.code} value={o.code}>{t(o.i18nKey)}</option>)}
                      </select>
                    </div>
                    {/* Authorised Person sub-header */}
                    <div style={{ ...col12, paddingTop: "8px", paddingBottom: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a2b49", borderBottom: "1px solid #f47738", paddingBottom: "6px", marginBottom: "4px" }}>
                        {t("PT_AUTH_PERSON_DETAILS") || "Authorised Person Details"}
                      </div>
                    </div>
                    {/* Authorised Person Name */}
                    <div style={col6}>
                      <label style={labelStyle}>{t("PT_OWNER_NAME")}<span style={requiredMark}>*</span></label>
                      <TextInput type="text" value={name} onChange={(e) => setName(e.target.value)} pattern="^[a-zA-Z ]*$" title={t("PT_NAME_ERROR_MESSAGE")} />
                    </div>
                    {/* Designation */}
                    <div style={col6}>
                      <label style={labelStyle}>{t("PT_COMMON_AUTHORISED_PERSON_DESIGNATION")}<span style={requiredMark}>*</span></label>
                      <TextInput type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} pattern="^[a-zA-Z ]*$" title={t("PT_NAME_ERROR_MESSAGE")} />
                    </div>
                    {/* Mobile Number */}
                    <div style={col3}>
                      <label style={labelStyle}>{t("PT_FORM3_MOBILE_NUMBER")}<span style={requiredMark}>*</span></label>
                      <div className="pt-phone-input" style={{ display: "flex", alignItems: "stretch", border: "1.5px solid #b0b8c1", borderRadius: "10px", overflow: "hidden", height: "46px", backgroundColor: "#fff", boxSizing: "border-box" }}>
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 14px", background: "linear-gradient(135deg, #eef1f6, #e8ecf3)", borderRight: "1.5px solid #dce1e9", fontSize: "14px", fontWeight: "700", color: "#1a2b49", whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "0.3px" }}>+91</span>
                        <input type="tel" value={mobileNumber} maxLength={10} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))} required pattern="[6-9]{1}[0-9]{9}" title={t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID")} style={{ flex: 1, height: "100%", border: "none", outline: "none", padding: "0 12px", fontSize: "14px", color: "#363636", backgroundColor: "transparent", fontFamily: "inherit" }} />
                      </div>
                    </div>
                    {/* Alternate Mobile Number */}
                    <div style={col3}>
                      <label style={labelStyle}>{t("PT_FORM3_ALT_MOBILE_NUMBER") || "Alternate Mobile Number"}</label>
                      <div className="pt-phone-input" style={{ display: "flex", alignItems: "stretch", border: "1.5px solid #b0b8c1", borderRadius: "10px", overflow: "hidden", height: "46px", backgroundColor: "#fff", boxSizing: "border-box" }}>
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 14px", background: "linear-gradient(135deg, #eef1f6, #e8ecf3)", borderRight: "1.5px solid #dce1e9", fontSize: "14px", fontWeight: "700", color: "#1a2b49", whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "0.3px" }}>+91</span>
                        <input type="tel" value={institutionAltMobile} maxLength={10} onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); setInstitutionAltMobile(v); if (v && !/^[6-9][0-9]{9}$/.test(v)) setInstitutionAltMobileError(t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID")); else setInstitutionAltMobileError(""); }} pattern="[6-9]{1}[0-9]{9}" title={t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID")} style={{ flex: 1, height: "100%", border: "none", outline: "none", padding: "0 12px", fontSize: "14px", color: "#363636", backgroundColor: "transparent", fontFamily: "inherit" }} />
                      </div>
                      {institutionAltMobileError && <span style={{ color: "#e54d42", fontSize: "12px", marginTop: "4px", display: "block" }}>{institutionAltMobileError}</span>}
                    </div>
                    {/* Landline Number */}
                    <div style={col3}>
                      <label style={labelStyle}>{t("PT_LANDLINE_NUMBER_FLOATING_LABEL") || "Landline Number"}</label>
                      <TextInput
                        type="tel"
                        value={landlineNumber}
                        onChange={(e) => {
                          const v = e.target.value;
                          setLandlineNumber(v);
                          if (v && !/^[0-9]{11}$/.test(v)) setLandlineError(t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID"));
                          else setLandlineError("");
                        }}
                        maxLength={11}
                        pattern="^[0-9]{11}$"
                        title={t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID")}
                      />
                      {landlineError && <span style={{ color: "#e54d42", fontSize: "12px", marginTop: "4px", display: "block" }}>{landlineError}</span>}
                    </div>
                    {/* Email */}
                    <div style={col3}>
                      <label style={labelStyle}>{t("PT_FORM3_EMAIL_ID")}</label>
                      <TextInput type="email" value={email} onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }} />
                      {emailError && <span style={{ color: "#e54d42", fontSize: "12px", marginTop: "4px", display: "block" }}>{emailError}</span>}
                    </div>
                    {/* Correspondence Address */}
                    <div style={col12}>
                      <label style={labelStyle}>{t("PT_OWNERS_ADDRESS")}<span style={requiredMark}>*</span></label>
                      <textarea
                        value={permanentAddress}
                        onChange={(e) => setPermanentAddress(e.target.value)}
                        rows={3}
                        style={{ display: "block", width: "100%", padding: "12px 14px", border: permanentAddress ? "1.5px solid #1a2b49" : "1.5px solid #b0b8c1", borderRadius: "10px", fontSize: "14px", color: "#363636", backgroundColor: "#fff", resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit", lineHeight: "1.6", transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: permanentAddress ? "0 0 0 3px rgba(26,43,73,0.08)" : "none" }}
                      />
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginTop: "12px", userSelect: "none" }}>
                        <div
                          onClick={() => handleCorrespondenceAddress(ownerIdx, !isCorrespondenceAddress)}
                          style={{ width: "20px", height: "20px", border: isCorrespondenceAddress ? "2px solid #1a2b49" : "2px solid #c0c8d4", borderRadius: "5px", background: isCorrespondenceAddress ? "#1a2b49" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0, alignSelf: "center", boxShadow: isCorrespondenceAddress ? "0 0 0 3px rgba(26,43,73,0.12)" : "none" }}
                        >
                          {isCorrespondenceAddress && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: "500", color: "#3d4f6b", lineHeight: "20px" }}>{t("PT_COMMON_SAME_AS_PROPERTY_ADDRESS")}</span>
                      </label>
                    </div>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    {/* Row 1 — Owner Name (fills remaining col6 next to Ownership) */}
                    <div style={col6}>
                      <label style={labelStyle}>{t("PT_OWNER_NAME")}<span style={requiredMark}>*</span></label>
                      <TextInput type="text" value={name} onChange={(e) => setName(e.target.value)} pattern="^[a-zA-Z ]+$" title={t("PT_NAME_ERROR_MESSAGE")} />
                    </div>

                    {/* Row 2 — Mobile · Alt Mobile · Email */}
                    <div style={col3}>
                      <label style={labelStyle}>{t("PT_FORM3_MOBILE_NUMBER")}<span style={requiredMark}>*</span></label>
                      <div className="pt-phone-input" style={{ display: "flex", alignItems: "stretch", border: "1.5px solid #b0b8c1", borderRadius: "10px", overflow: "hidden", height: "46px", backgroundColor: "#fff", boxSizing: "border-box" }}>
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 14px", background: "linear-gradient(135deg, #eef1f6, #e8ecf3)", borderRight: "1.5px solid #dce1e9", fontSize: "14px", fontWeight: "700", color: "#1a2b49", whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "0.3px" }}>+91</span>
                        <input type="tel" value={mobileNumber} maxLength={10} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))} required pattern="[6-9]{1}[0-9]{9}" title={t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID")} style={{ flex: 1, height: "100%", border: "none", outline: "none", padding: "0 12px", fontSize: "14px", color: "#363636", backgroundColor: "transparent", fontFamily: "inherit" }} />
                      </div>
                    </div>

                    <div style={col3}>
                      <label style={labelStyle}>{t("PT_FORM3_ALT_MOBILE_NUMBER") || "Alternate Mobile Number"}</label>
                      <div className="pt-phone-input" style={{ display: "flex", alignItems: "stretch", border: "1.5px solid #b0b8c1", borderRadius: "10px", overflow: "hidden", height: "46px", backgroundColor: "#fff", boxSizing: "border-box" }}>
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 14px", background: "linear-gradient(135deg, #eef1f6, #e8ecf3)", borderRight: "1.5px solid #dce1e9", fontSize: "14px", fontWeight: "700", color: "#1a2b49", whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "0.3px" }}>+91</span>
                        <input type="tel" value={alternateMobileNumber} maxLength={10} onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); setAlternateMobileNumber(v); if (v && !/^[6-9][0-9]{9}$/.test(v)) setAlternateMobileError(t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID")); else setAlternateMobileError(""); }} pattern="[6-9]{1}[0-9]{9}" title={t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID")} style={{ flex: 1, height: "100%", border: "none", outline: "none", padding: "0 12px", fontSize: "14px", color: "#363636", backgroundColor: "transparent", fontFamily: "inherit" }} />
                      </div>
                      {alternateMobileError && (
                        <span style={{ color: "#e54d42", fontSize: "12px", marginTop: "4px", display: "block" }}>{alternateMobileError}</span>
                      )}
                    </div>

                    <div style={col3}>
                      <label style={labelStyle}>{t("PT_FORM3_EMAIL_ID")}</label>
                      <TextInput type="email" value={email} onChange={(e) => { setEmail(e.target.value); validateEmail(ownerIdx, e.target.value); }} />
                      {emailError && <span style={{ color: "#e54d42", fontSize: "12px", marginTop: "4px", display: "block" }}>{emailError}</span>}
                    </div>

                    {/* Row 3 — Gender · Relationship · Father/Husband Name */}
                    <div style={col3}>
                      <label style={labelStyle}>{t("PT_FORM3_GENDER")}<span style={requiredMark}>*</span></label>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "2px" }}>
                        {genderOptions.map(opt => (
                          <label key={opt.code} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px", border: gender?.code === opt.code ? "2px solid #1a2b49" : "1.5px solid #c0c8d4", borderRadius: "8px", cursor: "pointer", background: gender?.code === opt.code ? "#f0f4ff" : "#fff", fontSize: "13px", fontWeight: "600", color: gender?.code === opt.code ? "#1a2b49" : "#505a6e", transition: "all 0.15s", userSelect: "none", boxShadow: gender?.code === opt.code ? "0 0 0 3px rgba(26,43,73,0.1)" : "none" }}>
                            <input type="radio" name={`gender-${ownerIdx}`} value={opt.code} checked={gender?.code === opt.code} onChange={() => setGender(opt)} style={{ display: "none" }} />
                            {gender?.code === opt.code && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a2b49" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                            {t(`PT_COMMON_GENDER_${opt.code}`)}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Row 3 — Gender · Relationship · Father/Husband Name */}
                    <div style={col3}>
                      <label style={labelStyle}>{t("PT_FORM3_RELATIONSHIP")}<span style={requiredMark}>*</span></label>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "2px" }}>
                        {GuardianOptions.map(opt => (
                          <label key={opt.code} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px", border: relationship?.code === opt.code ? "2px solid #1a2b49" : "1.5px solid #c0c8d4", borderRadius: "8px", cursor: "pointer", background: relationship?.code === opt.code ? "#f0f4ff" : "#fff", fontSize: "13px", fontWeight: "600", color: relationship?.code === opt.code ? "#1a2b49" : "#505a6e", transition: "all 0.15s", userSelect: "none", boxShadow: relationship?.code === opt.code ? "0 0 0 3px rgba(26,43,73,0.1)" : "none" }}>
                            <input type="radio" name={`relationship-${ownerIdx}`} value={opt.code} checked={relationship?.code === opt.code} onChange={() => setRelationship(opt)} style={{ display: "none" }} />
                            {relationship?.code === opt.code && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a2b49" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                            {t(opt.i18nKey)}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div style={col3}>
                      <label style={labelStyle}>{t("PT_FORM3_FATHER_HUSBAND_NAME") || "Father / Husband Name"}<span style={requiredMark}>*</span></label>
                      <TextInput type="text" value={fatherOrHusbandName} onChange={(e) => setFatherOrHusbandName(e.target.value)} pattern="^[a-zA-Z ]+$" title={t("PT_NAME_ERROR_MESSAGE")} />
                    </div>
                  </React.Fragment>
                )}

              </div>
            </div>

            {/* ══════════════════════════════════════
                CARD 2 – Owner Type & Address (individual only)
            ══════════════════════════════════════ */}
            {!isInstitutional && (
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>{t("PT_OWNER_TYPE_ADDRESS_HEADER") || "Owner Type & Address"}</div>
              <div style={rowStyle}>

                {/* Special Owner Category */}
                <div style={col12}>
                  <label style={labelStyle}>{t("PT_SPECIAL_OWNER_CATEGORY")}<span style={requiredMark}>*</span></label>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "2px" }}>
                    {sortedOwnerTypes.map(opt => (
                      <label key={opt.code} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px", border: ownerType?.code === opt.code ? "2px solid #1a2b49" : "1.5px solid #c0c8d4", borderRadius: "8px", cursor: "pointer", background: ownerType?.code === opt.code ? "#f0f4ff" : "#fff", fontSize: "13px", fontWeight: "600", color: ownerType?.code === opt.code ? "#1a2b49" : "#505a6e", transition: "all 0.15s", userSelect: "none", boxShadow: ownerType?.code === opt.code ? "0 0 0 3px rgba(26,43,73,0.1)" : "none" }}>
                        <input type="radio" name={`ownerType-${ownerIdx}`} value={opt.code} checked={ownerType?.code === opt.code} onChange={() => setOwnerType(opt)} style={{ display: "none" }} />
                        {ownerType?.code === opt.code && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a2b49" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        {t(`PROPERTYTAX_OWNERTYPE_${opt.code}`)}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Owner Address */}
                <div style={col12}>
                  <label style={labelStyle}>{t("PT_OWNERS_ADDRESS")}<span style={requiredMark}>*</span></label>
                  <textarea
                    value={permanentAddress}
                    onChange={(e) => setPermanentAddress(e.target.value)}
                    rows={3}
                    style={{ display: "block", width: "100%", padding: "12px 14px", border: permanentAddress ? "1.5px solid #1a2b49" : "1.5px solid #b0b8c1", borderRadius: "10px", fontSize: "14px", color: "#363636", backgroundColor: "#fff", resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit", lineHeight: "1.6", transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: permanentAddress ? "0 0 0 3px rgba(26,43,73,0.08)" : "none" }}
                  />
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginTop: "12px", userSelect: "none" }}>
                    <div
                      onClick={() => handleCorrespondenceAddress(ownerIdx, !isCorrespondenceAddress)}
                      style={{ width: "20px", height: "20px", border: isCorrespondenceAddress ? "2px solid #1a2b49" : "2px solid #c0c8d4", borderRadius: "5px", background: isCorrespondenceAddress ? "#1a2b49" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0, alignSelf: "center", boxShadow: isCorrespondenceAddress ? "0 0 0 3px rgba(26,43,73,0.12)" : "none" }}
                    >
                      {isCorrespondenceAddress && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: "500", color: "#3d4f6b", lineHeight: "20px" }}>{t("PT_COMMON_SAME_AS_PROPERTY_ADDRESS")}</span>
                  </label>
                </div>

              </div>
            </div>
            )}

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
                  <div style={col6}>
                    <div style={{ background: "linear-gradient(135deg, #fff8f3 0%, #fff3ec 100%)", border: "1px solid #f5d5c0", borderRadius: "12px", padding: "18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f5d5c0" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #f47738, #e05a1a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(244,119,56,0.3)" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#c0511a" }}>{t("PT_SPECIAL_OWNER_CATEGORY_PROOF_HEADER")}<span style={requiredMark}>*</span></div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div>
                          <label style={labelStyle}>{t("PT_CATEGORY_DOCUMENT_TYPE")}</label>
                          <select
                            style={{ display: "block", width: "100%", height: "46px", padding: "0 40px 0 14px", border: specialProofDocType ? "1.5px solid #f47738" : "1.5px solid #c0c8d4", borderRadius: "10px", fontSize: "14px", color: specialProofDocType ? "#1a2b49" : "#8a97a8", backgroundColor: "#fff", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%231a2b49' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center", backgroundSize: "13px", WebkitAppearance: "none", MozAppearance: "none", appearance: "none", cursor: "pointer", outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontWeight: specialProofDocType ? "600" : "400" }}
                            value={specialProofDocType?.code || ""}
                            onChange={(e) => { const val = specialProofOptions.find(o => o.code === e.target.value) || null; setSpecialProofDocType(val); }}
                          >
                            <option value="" disabled hidden>{t("PT_MUTATION_SELECT_DOC_LABEL")}</option>
                            {specialProofOptions.map(o => <option key={o.code} value={o.code}>{t(o.i18nKey)}</option>)}
                          </select>
                        </div>
                        <div>
                          <div role="button" tabIndex={0} onClick={() => document.getElementById(`pt-special-proof-native-${ownerIdx}`).click()} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") document.getElementById(`pt-special-proof-native-${ownerIdx}`).click(); }} style={{ border: specialProofFile ? "2px solid #4caf50" : "2px dashed #c0c8d4", borderRadius: "12px", background: specialProofFile ? "linear-gradient(135deg, #f0fff4, #e8f5e9)" : "#ffffff", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", minHeight: "64px", boxSizing: "border-box" }}>
                            <div style={{ width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0, background: specialProofFile ? "linear-gradient(135deg, #43a047, #2e7d32)" : "linear-gradient(135deg, #ffe8d6, #fdd0b0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {specialProofFile ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "13px", fontWeight: "600", color: specialProofFile ? "#2e7d32" : "#3d4f6b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{specialProofFile?.name || (specialProofUploadedId ? t("PT_ACTION_FILEUPLOADED") : t("PT_ACTION_NO_FILEUPLOADED"))}</div>
                              <div style={{ fontSize: "11px", color: "#8a97a8", marginTop: "3px" }}>{specialProofFile?.size ? `${(specialProofFile.size / 1024).toFixed(1)} KB` : specialProofFile ? t("PT_ACTION_FILEUPLOADED") : "JPG · PNG · PDF · Max 5MB"}</div>
                            </div>
                            {specialProofFile ? <button type="button" onClick={(e) => { e.stopPropagation(); setSpecialProofUploadedId(null); setSpecialProofFile(null); }} style={{ background: "rgba(229,77,66,0.1)", border: "1px solid rgba(229,77,66,0.3)", borderRadius: "6px", cursor: "pointer", color: "#e54d42", fontSize: "16px", fontWeight: "700", lineHeight: 1, padding: "4px 8px", flexShrink: 0 }}>×</button> : <div style={{ background: "linear-gradient(135deg, #f47738, #e05a1a)", color: "#fff", fontSize: "12px", fontWeight: "600", padding: "8px 16px", borderRadius: "8px", whiteSpace: "nowrap", flexShrink: 0 }}>Browse</div>}
                            <input type="file" id={`pt-special-proof-native-${ownerIdx}`} accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) handleSpecialProofFileSelect(ownerIdx, e.target.files[0]); }} />
                          </div>
                          {specialProofError && <div style={{ color: "#e54d42", fontSize: "12px", marginTop: "8px", display: "flex", alignItems: "center", gap: "5px" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{specialProofError}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Identity Proof */}
                <div style={col6}>
                  <div style={{ background: "linear-gradient(135deg, #f8f9fe 0%, #eef2fb 100%)", border: "1px solid #dde4f0", borderRadius: "12px", padding: "18px", boxShadow: "0 2px 8px rgba(26,43,73,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #dde4f0" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #1a2b49, #2d4a7a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(26,43,73,0.25)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a2b49" }}>{t("PT_PROOF_IDENTITY_HEADER")}<span style={requiredMark}>*</span></div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div>
                        <label style={labelStyle}>{t("PT_CATEGORY_DOCUMENT_TYPE")}<span style={requiredMark}>*</span></label>
                        <select
                          style={{ display: "block", width: "100%", height: "46px", padding: "0 40px 0 14px", border: identityProofDocType ? "1.5px solid #1a2b49" : "1.5px solid #b0b8c1", borderRadius: "10px", fontSize: "14px", color: identityProofDocType ? "#1a2b49" : "#8a97a8", backgroundColor: identityProofDocType ? "#fff" : "#f9fafc", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%231a2b49' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center", backgroundSize: "13px", WebkitAppearance: "none", MozAppearance: "none", appearance: "none", cursor: "pointer", outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontWeight: identityProofDocType ? "600" : "400", boxShadow: identityProofDocType ? "0 0 0 3px rgba(26,43,73,0.08)" : "none", transition: "border-color 0.2s, box-shadow 0.2s" }}
                          value={identityProofDocType?.code || ""}
                          onChange={(e) => { const val = identityProofOptions.find(o => o.code === e.target.value) || null; setIdentityProofDocType(val); }}
                        >
                          <option value="" disabled hidden>{t("PT_MUTATION_SELECT_DOC_LABEL")}</option>
                          {identityProofOptions.map(o => <option key={o.code} value={o.code}>{t(o.i18nKey)}</option>)}
                        </select>
                      </div>
                      <div>
                        <div role="button" tabIndex={0} onClick={() => document.getElementById(`pt-identity-proof-native-${ownerIdx}`).click()} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") document.getElementById(`pt-identity-proof-native-${ownerIdx}`).click(); }} style={{ border: identityProofFile ? "2px solid #4caf50" : "2px dashed #b0b8c1", borderRadius: "12px", background: identityProofFile ? "linear-gradient(135deg, #f0fff4, #e8f5e9)" : "#ffffff", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", minHeight: "64px", boxSizing: "border-box" }}>
                          <div style={{ width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0, background: identityProofFile ? "linear-gradient(135deg, #43a047, #2e7d32)" : "linear-gradient(135deg, #e8edf5, #cfd7e8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: identityProofFile ? "0 2px 6px rgba(46,125,50,0.3)" : "none" }}>
                            {identityProofFile ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#505a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: identityProofFile ? "#2e7d32" : "#3d4f6b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{identityProofFile?.name || (identityProofUploadedId ? t("PT_ACTION_FILEUPLOADED") : t("PT_ACTION_NO_FILEUPLOADED"))}</div>
                            <div style={{ fontSize: "11px", color: "#8a97a8", marginTop: "3px" }}>{identityProofFile?.size ? `${(identityProofFile.size / 1024).toFixed(1)} KB` : identityProofFile ? t("PT_ACTION_FILEUPLOADED") : "JPG · PNG · PDF · Max 5MB"}</div>
                          </div>
                          {identityProofFile ? <button type="button" onClick={(e) => { e.stopPropagation(); setIdentityProofUploadedId(null); setIdentityProofFile(null); }} style={{ background: "rgba(229,77,66,0.1)", border: "1px solid rgba(229,77,66,0.3)", borderRadius: "6px", cursor: "pointer", color: "#e54d42", fontSize: "16px", fontWeight: "700", lineHeight: 1, padding: "4px 8px", flexShrink: 0 }}>×</button> : <div style={{ background: "linear-gradient(135deg, #1a2b49 0%, #2d4a7a 100%)", color: "#fff", fontSize: "12px", fontWeight: "600", padding: "8px 16px", borderRadius: "8px", whiteSpace: "nowrap", flexShrink: 0, boxShadow: "0 2px 6px rgba(26,43,73,0.3)" }}>Browse</div>}
                          <input type="file" id={`pt-identity-proof-native-${ownerIdx}`} accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) handleIdentityFileSelect(ownerIdx, e.target.files[0]); }} />
                        </div>
                        {identityProofError && <div style={{ color: "#e54d42", fontSize: "12px", marginTop: "8px", display: "flex", alignItems: "center", gap: "5px" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{identityProofError}</div>}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            </React.Fragment>
            ); })}
            </div>
          </FormStep>
        );
      })()}
    </React.Fragment>
  );
};

export default PTAllOwnerDetails;