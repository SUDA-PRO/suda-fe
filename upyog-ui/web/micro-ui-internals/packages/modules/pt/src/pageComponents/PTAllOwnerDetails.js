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

  /* ─── Institution-specific state ─── */
  const [institutionName, setInstitutionName] = useState(existingOwner.inistitutionName || "");
  const [institutionType, setInstitutionType] = useState(existingOwner.inistitutetype || null);
  const [designation, setDesignation] = useState(existingOwner.designation || "");
  const [landlineNumber, setLandlineNumber] = useState(existingOwner.altContactNumber || "");
  const [landlineError, setLandlineError] = useState("");
  const [institutionAltMobile, setInstitutionAltMobile] = useState(existingOwner.alternatemobilenumber || "");
  const [institutionAltMobileError, setInstitutionAltMobileError] = useState("");

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
  const [specialProofFile, setSpecialProofFile] = useState(() => {
    const doc = existingOwner.documents?.specialProofIdentity;
    if (!doc) return null;
    if (doc.name) return doc;
    const n = sessionStorage.getItem(`pt-sp-name-${index}`); const s = sessionStorage.getItem(`pt-sp-size-${index}`);
    return { ...doc, name: n || null, size: s ? Number(s) : null };
  });
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
  const [identityProofFile, setIdentityProofFile] = useState(() => {
    const doc = existingOwner.documents?.proofIdentity;
    if (!doc) return null;
    if (doc.name) return doc;
    const n = sessionStorage.getItem(`pt-id-name-${index}`); const s = sessionStorage.getItem(`pt-id-size-${index}`);
    return { ...doc, name: n || null, size: s ? Number(s) : null };
  });
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

  /* ─── Sync identity proof from async formData load ─── */
  useEffect(() => {
    const savedDoc = formData?.owners?.[index]?.documents?.proofIdentity;
    if (!savedDoc) return;
    if (!identityProofFile) setIdentityProofFile(savedDoc);
    if (!identityProofUploadedId && savedDoc.fileStoreId) setIdentityProofUploadedId(savedDoc.fileStoreId);
    if (savedDoc.documentType && identityProofOptions.length > 0) {
      const savedCode = typeof savedDoc.documentType === "object" ? savedDoc.documentType.code : savedDoc.documentType;
      const matched = identityProofOptions.find((o) => o.code === savedCode);
      if (matched && matched !== identityProofDocType) setIdentityProofDocType(matched);
    }
  }, [formData?.owners?.[index]?.documents?.proofIdentity, identityProofOptions.length]);

  /* ─── Sync special category proof from async formData load ─── */
  useEffect(() => {
    const savedDoc = formData?.owners?.[index]?.documents?.specialProofIdentity;
    if (!savedDoc) return;
    if (!specialProofFile) setSpecialProofFile(savedDoc);
    if (!specialProofUploadedId && savedDoc.fileStoreId) setSpecialProofUploadedId(savedDoc.fileStoreId);
    if (savedDoc.documentType && specialProofOptions.length > 0) {
      const savedCode = typeof savedDoc.documentType === "object" ? savedDoc.documentType.code : savedDoc.documentType;
      const matched = specialProofOptions.find((o) => o.code === savedCode);
      if (matched && matched !== specialProofDocType) setSpecialProofDocType(matched);
    }
  }, [formData?.owners?.[index]?.documents?.specialProofIdentity, specialProofOptions.length, ownerType]);

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
    setInstitutionName(existing.inistitutionName || "");
    setInstitutionType(existing.inistitutetype || null);
    setDesignation(existing.designation || "");
    setLandlineNumber(existing.altContactNumber || "");
    setLandlineError("");
    setInstitutionAltMobile(existing.alternatemobilenumber || "");
    setInstitutionAltMobileError("");
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
    if (isInstitutional) {
      if (!institutionName || !institutionType || !name || !designation || !mobileNumber || !permanentAddress) return false;
      if (emailError || landlineError || institutionAltMobileError) return false;
      if (!identityProofDocType || !identityProofFile) return false;
      return true;
    }
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
    const documents = {};
    if (identityProofFile) {
      const f = { ...identityProofFile, name: identityProofFile?.name, size: identityProofFile?.size, documentType: identityProofDocType, fileStoreId: identityProofUploadedId || null };
      documents["proofIdentity"] = f;
    }
    if (isInstitutional) {
      return {
        ...(formData?.owners?.[index] || {}),
        inistitutionName: institutionName,
        inistitutetype: institutionType,
        name,
        designation,
        altContactNumber: landlineNumber || mobileNumber || undefined,
        alternatemobilenumber: institutionAltMobile || undefined,
        mobileNumber,
        emailId: email,
        permanentAddress,
        isCorrespondenceAddress,
        documents,
      };
    }
    if (needsSpecialProof && specialProofFile) {
      const f = { ...specialProofFile, name: specialProofFile?.name, size: specialProofFile?.size, documentType: specialProofDocType, fileStoreId: specialProofUploadedId || null };
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
    sessionStorage.setItem("ownershipCategory", ownershipCategoryCode);
    onSelect("allOwnerDetails", {
      ownershipCategory,
      ownerData: buildOwnerData(),
      ownerIndex: index,
    });
  };

  /* ─── Add another owner (MULTIPLE OWNERS only) ─── */
  function onAddOwner() {
    sessionStorage.setItem("ownershipCategory", ownershipCategoryCode);
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

            {/* ══════════════════════════════════════
                CARD 1 – Owner Basic Details
            ══════════════════════════════════════ */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>{t("PT_OWNER_DETAILS_HEADER") || "Owner Details"}</div>
              <div style={rowStyle}>

                {/* Ownership Type – always visible */}
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
                          onClick={() => handleCorrespondenceAddress({ target: { checked: !isCorrespondenceAddress } })}
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
                      <TextInput type="email" value={email} onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }} />
                      {emailError && <span style={{ color: "#e54d42", fontSize: "12px", marginTop: "4px", display: "block" }}>{emailError}</span>}
                    </div>

                    {/* Row 3 — Gender · Relationship · Father/Husband Name */}
                    <div style={col3}>
                      <label style={labelStyle}>{t("PT_FORM3_GENDER")}<span style={requiredMark}>*</span></label>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "2px" }}>
                        {genderOptions.map(opt => (
                          <label key={opt.code} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px", border: gender?.code === opt.code ? "2px solid #1a2b49" : "1.5px solid #c0c8d4", borderRadius: "8px", cursor: "pointer", background: gender?.code === opt.code ? "#f0f4ff" : "#fff", fontSize: "13px", fontWeight: "600", color: gender?.code === opt.code ? "#1a2b49" : "#505a6e", transition: "all 0.15s", userSelect: "none", boxShadow: gender?.code === opt.code ? "0 0 0 3px rgba(26,43,73,0.1)" : "none" }}>
                            <input type="radio" name="gender" value={opt.code} checked={gender?.code === opt.code} onChange={() => setGender(opt)} style={{ display: "none" }} />
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
                            <input type="radio" name="relationship" value={opt.code} checked={relationship?.code === opt.code} onChange={() => setRelationship(opt)} style={{ display: "none" }} />
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
                        <input type="radio" name="ownerType" value={opt.code} checked={ownerType?.code === opt.code} onChange={() => setOwnerType(opt)} style={{ display: "none" }} />
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
                      onClick={() => handleCorrespondenceAddress({ target: { checked: !isCorrespondenceAddress } })}
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
                          <div role="button" tabIndex={0} onClick={() => document.getElementById("pt-special-proof-native").click()} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") document.getElementById("pt-special-proof-native").click(); }} style={{ border: specialProofFile ? "2px solid #4caf50" : "2px dashed #c0c8d4", borderRadius: "12px", background: specialProofFile ? "linear-gradient(135deg, #f0fff4, #e8f5e9)" : "#ffffff", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", minHeight: "64px", boxSizing: "border-box" }}>
                            <div style={{ width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0, background: specialProofFile ? "linear-gradient(135deg, #43a047, #2e7d32)" : "linear-gradient(135deg, #ffe8d6, #fdd0b0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {specialProofFile ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "13px", fontWeight: "600", color: specialProofFile ? "#2e7d32" : "#3d4f6b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{specialProofFile?.name || (specialProofUploadedId ? t("PT_ACTION_FILEUPLOADED") : t("PT_ACTION_NO_FILEUPLOADED"))}</div>
                              <div style={{ fontSize: "11px", color: "#8a97a8", marginTop: "3px" }}>{specialProofFile?.size ? `${(specialProofFile.size / 1024).toFixed(1)} KB` : specialProofFile ? t("PT_ACTION_FILEUPLOADED") : "JPG · PNG · PDF · Max 5MB"}</div>
                            </div>
                            {specialProofFile ? <button type="button" onClick={(e) => { e.stopPropagation(); setSpecialProofUploadedId(null); setSpecialProofFile(null); }} style={{ background: "rgba(229,77,66,0.1)", border: "1px solid rgba(229,77,66,0.3)", borderRadius: "6px", cursor: "pointer", color: "#e54d42", fontSize: "16px", fontWeight: "700", lineHeight: 1, padding: "4px 8px", flexShrink: 0 }}>×</button> : <div style={{ background: "linear-gradient(135deg, #f47738, #e05a1a)", color: "#fff", fontSize: "12px", fontWeight: "600", padding: "8px 16px", borderRadius: "8px", whiteSpace: "nowrap", flexShrink: 0 }}>Browse</div>}
                            <input type="file" id="pt-special-proof-native" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) { const f = e.target.files[0]; sessionStorage.setItem(`pt-sp-name-${index}`, f.name); sessionStorage.setItem(`pt-sp-size-${index}`, String(f.size)); setSpecialProofFile(f); } }} />
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
                        <div role="button" tabIndex={0} onClick={() => document.getElementById("pt-identity-proof-native").click()} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") document.getElementById("pt-identity-proof-native").click(); }} style={{ border: identityProofFile ? "2px solid #4caf50" : "2px dashed #b0b8c1", borderRadius: "12px", background: identityProofFile ? "linear-gradient(135deg, #f0fff4, #e8f5e9)" : "#ffffff", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", minHeight: "64px", boxSizing: "border-box" }}>
                          <div style={{ width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0, background: identityProofFile ? "linear-gradient(135deg, #43a047, #2e7d32)" : "linear-gradient(135deg, #e8edf5, #cfd7e8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: identityProofFile ? "0 2px 6px rgba(46,125,50,0.3)" : "none" }}>
                            {identityProofFile ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#505a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: identityProofFile ? "#2e7d32" : "#3d4f6b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{identityProofFile?.name || (identityProofUploadedId ? t("PT_ACTION_FILEUPLOADED") : t("PT_ACTION_NO_FILEUPLOADED"))}</div>
                            <div style={{ fontSize: "11px", color: "#8a97a8", marginTop: "3px" }}>{identityProofFile?.size ? `${(identityProofFile.size / 1024).toFixed(1)} KB` : identityProofFile ? t("PT_ACTION_FILEUPLOADED") : "JPG · PNG · PDF · Max 5MB"}</div>
                          </div>
                          {identityProofFile ? <button type="button" onClick={(e) => { e.stopPropagation(); setIdentityProofUploadedId(null); setIdentityProofFile(null); }} style={{ background: "rgba(229,77,66,0.1)", border: "1px solid rgba(229,77,66,0.3)", borderRadius: "6px", cursor: "pointer", color: "#e54d42", fontSize: "16px", fontWeight: "700", lineHeight: 1, padding: "4px 8px", flexShrink: 0 }}>×</button> : <div style={{ background: "linear-gradient(135deg, #1a2b49 0%, #2d4a7a 100%)", color: "#fff", fontSize: "12px", fontWeight: "600", padding: "8px 16px", borderRadius: "8px", whiteSpace: "nowrap", flexShrink: 0, boxShadow: "0 2px 6px rgba(26,43,73,0.3)" }}>Browse</div>}
                          <input type="file" id="pt-identity-proof-native" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) { const f = e.target.files[0]; sessionStorage.setItem(`pt-id-name-${index}`, f.name); sessionStorage.setItem(`pt-id-size-${index}`, String(f.size)); setIdentityProofFile(f); } }} />
                        </div>
                        {identityProofError && <div style={{ color: "#e54d42", fontSize: "12px", marginTop: "8px", display: "flex", alignItems: "center", gap: "5px" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{identityProofError}</div>}
                      </div>
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