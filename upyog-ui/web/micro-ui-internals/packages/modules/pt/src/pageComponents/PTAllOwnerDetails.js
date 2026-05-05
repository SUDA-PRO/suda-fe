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
    if (!own || !sub) return [];
    const subCategoriesInOwnersType = ["INDIVIDUAL"];
    const OwnerShipCategory = {};
    const SubOwnerShipCategory = {};
    own.forEach((c) => { OwnerShipCategory[c.code] = c; });
    sub.forEach((c) => { SubOwnerShipCategory[c.code] = c; });
    const result = [];
    Object.keys(OwnerShipCategory).forEach((category) => {
      const code = OwnerShipCategory[category].code;
      if (subCategoriesInOwnersType.includes(code)) {
        Object.keys(SubOwnerShipCategory)
          .filter((s) => SubOwnerShipCategory[s].ownerShipCategory === code)
          .forEach((s) => {
            const { name, code: subCode } = SubOwnerShipCategory[s];
            result.push({
              label: name,
              value: subCode,
              code: subCode,
              i18nKey: `PT_OWNERSHIP_${subCode.split(".")[1] || subCode.split(".")[0]}`,
            });
          });
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
    (async () => {
      setSpecialProofError(null);
      if (specialProofFile.size >= 2000000) { setSpecialProofError(t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED")); return; }
      try {
        const res = await Digit.UploadServices.Filestorage("property-upload", specialProofFile, stateId);
        if (res?.data?.files?.length > 0) setSpecialProofUploadedId(res.data.files[0].fileStoreId);
        else setSpecialProofError(t("PT_FILE_UPLOAD_ERROR"));
      } catch (_) { setSpecialProofError(t("PT_FILE_UPLOAD_ERROR")); }
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
    (async () => {
      setIdentityProofError(null);
      if (identityProofFile.size >= 2000000) { setIdentityProofError(t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED")); return; }
      try {
        const res = await Digit.UploadServices.Filestorage("property-upload", identityProofFile, stateId);
        if (res?.data?.files?.length > 0) setIdentityProofUploadedId(res.data.files[0].fileStoreId);
        else setIdentityProofError(t("PT_FILE_UPLOAD_ERROR"));
      } catch (_) { setIdentityProofError(t("PT_FILE_UPLOAD_ERROR")); }
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
      {window.location.href.includes("/citizen") ? <Timeline currentStep={2} /> : null}
      <FormStep
        config={config}
        onSelect={goNext}
        t={t}
        isDisabled={!isFormValid()}
        onAdd={isMultipleOwners ? onAddOwner : null}
        isMultipleAllow={isMultipleOwners}
      >

        {/* ── Ownership Type ── */}
        <CardLabel>
          {t("PT_PROVIDE_OWNERSHIP_DETAILS")}
          <span className="check-page-link-button"> *</span>
        </CardLabel>
        <RadioButtons
          isMandatory={true}
          options={ownershipOptions}
          selectedOption={ownershipCategory}
          optionsKey="i18nKey"
          onSelect={(val) => {
            setOwnershipCategory(val);
            sessionStorage.setItem("ownershipCategory", val?.value);
          }}
          value={ownershipCategory}
          labelKey="PT_OWNERSHIP"
          isDependent={true}
        />

        {/* ── Owner Name ── */}
        <CardLabel>
          {t("PT_OWNER_NAME")}
          <span className="check-page-link-button"> *</span>
        </CardLabel>
        <TextInput
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          pattern="^[a-zA-Z ]+$"
          title={t("PT_NAME_ERROR_MESSAGE")}
        />

        {/* ── Gender ── */}
        <CardLabel>
          {t("PT_FORM3_GENDER")}
          <span className="check-page-link-button"> *</span>
        </CardLabel>
        <RadioButtons
          t={t}
          options={genderOptions}
          optionsKey="code"
          name="gender"
          selectedOption={gender}
          onSelect={setGender}
          isDependent={true}
          labelKey="PT_COMMON_GENDER"
        />

        {/* ── Mobile ── */}
        <CardLabel>
          {t("PT_FORM3_MOBILE_NUMBER")}
          <span className="check-page-link-button"> *</span>
        </CardLabel>
        <MobileNumber
          value={mobileNumber}
          name="mobileNumber"
          onChange={(val) => setMobileNumber(val)}
          required
          pattern="[6-9]{1}[0-9]{9}"
          type="tel"
          title={t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID")}
        />

        {/* ── Guardian Name ── */}
        <CardLabel>
          {t("PT_FORM3_GUARDIAN_NAME")}
          <span className="check-page-link-button"> *</span>
        </CardLabel>
        <TextInput
          type="text"
          value={fatherOrHusbandName}
          onChange={(e) => setFatherOrHusbandName(e.target.value)}
          pattern="^[a-zA-Z ]+$"
          title={t("PT_NAME_ERROR_MESSAGE")}
        />

        {/* ── Relationship ── */}
        <CardLabel>
          {t("PT_FORM3_RELATIONSHIP")}
          <span className="check-page-link-button"> *</span>
        </CardLabel>
        <RadioButtons
          t={t}
          optionsKey="i18nKey"
          options={GuardianOptions}
          selectedOption={relationship}
          onSelect={setRelationship}
          isDependent={true}
          labelKey="PT_RELATION"
        />

        {/* ── Email (optional) ── */}
        <CardLabel>{t("PT_FORM3_EMAIL_ID")}</CardLabel>
        <TextInput
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }}
        />
        {emailError && <span style={{ color: "red", fontSize: "12px" }}>{emailError}</span>}

        {/* ── Special Owner Category ── */}
        <CardLabel>
          {t("PT_SPECIAL_OWNER_CATEGORY")}
          <span className="check-page-link-button"> *</span>
        </CardLabel>
        <RadioButtons
          t={t}
          optionsKey="i18nKey"
          options={sortedOwnerTypes}
          selectedOption={ownerType}
          onSelect={setOwnerType}
          isDependent={true}
          labelKey="PROPERTYTAX_OWNERTYPE"
        />

        {/* ── Owner Address ── */}
        <CardLabel>
          {t("PT_OWNERS_ADDRESS")}
          <span className="check-page-link-button"> *</span>
        </CardLabel>
        <TextArea
          value={permanentAddress}
          onChange={(e) => setPermanentAddress(e.target.value)}
        />
        <CheckBox
          label={t("PT_COMMON_SAME_AS_PROPERTY_ADDRESS")}
          onChange={handleCorrespondenceAddress}
          value={isCorrespondenceAddress}
          checked={isCorrespondenceAddress || false}
          style={{ paddingTop: "10px" }}
        />

        {/* ── Special Category Proof (only when ownerType ≠ NONE) ── */}
        {needsSpecialProof && (
          <React.Fragment>
            <CardLabel>
              {t("PT_SPECIAL_OWNER_CATEGORY_PROOF_HEADER")}
              <span className="check-page-link-button"> *</span>
            </CardLabel>
            <CardLabelDesc>{t("PT_UPLOAD_RESTRICTIONS_TYPES")}</CardLabelDesc>
            <CardLabelDesc>{t("PT_UPLOAD_RESTRICTIONS_SIZE")}</CardLabelDesc>
            <CardLabel>{t("PT_CATEGORY_DOCUMENT_TYPE")}</CardLabel>
            <Dropdown
              t={t}
              isMandatory={false}
              option={specialProofOptions}
              selected={specialProofDocType}
              optionKey="i18nKey"
              select={setSpecialProofDocType}
              placeholder={t("PT_MUTATION_SELECT_DOC_LABEL")}
            />
            <UploadFile
              id="pt-special-proof"
              extraStyleName="propertyCreate"
              accept=".jpg,.png,.pdf"
              onUpload={(e) => setSpecialProofFile(e.target.files[0])}
              onDelete={() => { setSpecialProofUploadedId(null); setSpecialProofFile(null); }}
              message={specialProofFile ? `1 ${t("PT_ACTION_FILEUPLOADED")}` : t("PT_ACTION_NO_FILEUPLOADED")}
              error={specialProofError}
            />
            {specialProofError && <div style={{ color: "red", fontSize: "14px" }}>{specialProofError}</div>}
          </React.Fragment>
        )}

        {/* ── Identity Proof ── */}
        <CardLabel>
          {t("PT_PROOF_IDENTITY_HEADER")}
          <span className="check-page-link-button"> *</span>
        </CardLabel>
        <CardLabelDesc>{t("PT_UPLOAD_RESTRICTIONS_TYPES")}</CardLabelDesc>
        <CardLabelDesc>{t("PT_UPLOAD_RESTRICTIONS_SIZE")}</CardLabelDesc>
        <CardLabel>{t("PT_CATEGORY_DOCUMENT_TYPE")}<span className="check-page-link-button"> *</span></CardLabel>
        <Dropdown
          t={t}
          isMandatory={false}
          option={identityProofOptions}
          selected={identityProofDocType}
          optionKey="i18nKey"
          select={setIdentityProofDocType}
          placeholder={t("PT_MUTATION_SELECT_DOC_LABEL")}
        />
        <UploadFile
          id="pt-identity-proof"
          extraStyleName="propertyCreate"
          accept=".jpg,.png,.pdf"
          onUpload={(e) => setIdentityProofFile(e.target.files[0])}
          onDelete={() => { setIdentityProofUploadedId(null); setIdentityProofFile(null); }}
          message={identityProofFile ? `1 ${t("PT_ACTION_FILEUPLOADED")}` : t("PT_ACTION_NO_FILEUPLOADED")}
          error={identityProofError}
        />
        {identityProofError && <div style={{ color: "red", fontSize: "14px" }}>{identityProofError}</div>}

      </FormStep>
    </React.Fragment>
  );
};

export default PTAllOwnerDetails;
