import React, { useState, useEffect } from "react";
import { CardLabelDesc, CardLabel, FormStep } from "@upyog/digit-ui-react-components";
import { stringReplaceAll } from "../utils";
import { useLocation } from "react-router-dom";
import Timeline from "../components/TLTimeline";


const SelectProofIdentity = ({ t, config, onSelect, userType, formData, ownerIndex = 0, addNewOwner, isMandatory }) => {
  const { pathname: url } = useLocation();
  // const editScreen = url.includes("/modify-application/");
  const isMutation = url.includes("property-mutation");

  let index = isMutation ? ownerIndex : window.location.href.charAt(window.location.href.length - 1);

  const [uploadedFile, setUploadedFile] = useState(() => formData?.owners[index]?.documents?.proofIdentity?.fileStoreId || null);
  const [file, setFile] = useState(() => {
    const doc = formData?.owners[index]?.documents?.proofIdentity;
    // Only pre-set if it's an already-uploaded doc (has fileStoreId), not a raw File blob
    return doc?.fileStoreId ? doc : null;
  });
  const [error, setError] = useState(null);
  const cityDetails = Digit.ULBService.getCurrentUlb();
  const onSkip = () => onSelect();
  const isUpdateProperty = formData?.isUpdateProperty || false;
  let isEditProperty = formData?.isEditProperty || false;

  const [dropdownValue, setDropdownValue] = useState(formData?.owners[index]?.documents?.proofIdentity?.documentType || null);
  let dropdownData = [];
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const { data: Documentsob = {} } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "Documents");
  const docs = Documentsob?.PropertyTax?.Documents;
  const proofIdentity = Array.isArray(docs) && docs.filter((doc) => doc.code.includes("IDENTITYPROOF"));
  if (proofIdentity.length > 0) {
    dropdownData = proofIdentity[0]?.dropdownData;
    dropdownData.forEach((data) => {
      data.i18nKey = stringReplaceAll(data.code, ".", "_");
    });
  }

  /* Sync dropdownValue to MDMS option object once options load */
  useEffect(() => {
    if (!dropdownData.length) return;
    const src = formData?.owners?.[index]?.documents?.proofIdentity?.documentType;
    if (!src) return;
    const savedCode = typeof src === "object" ? src.code : src;
    if (!savedCode) return;
    const matched = dropdownData.find((o) => o.code === savedCode);
    // Always set to the actual option reference from dropdownData so Dropdown can match it
    if (matched) setDropdownValue(matched);
  }, [dropdownData.length]);

  /* Sync uploadedFile, file, and dropdownValue from formData when loaded async */
  useEffect(() => {
    const doc = formData?.owners?.[index]?.documents?.proofIdentity;
    if (!doc) return;
    if (doc.fileStoreId && !uploadedFile) setUploadedFile(doc.fileStoreId);
    if (doc.fileStoreId && !file) setFile(doc);
    // Sync dropdown — handles case where MDMS was cached (length already stable) but formData arrived late
    if (doc.documentType && dropdownData.length > 0) {
      const savedCode = typeof doc.documentType === "object" ? doc.documentType.code : doc.documentType;
      if (savedCode) {
        const matched = dropdownData.find((o) => o.code === savedCode);
        if (matched) setDropdownValue(matched);
      }
    }
  }, [formData?.owners?.[index]?.documents?.proofIdentity]);

  function setTypeOfDropdownValue(dropdownValue) {
    setDropdownValue(dropdownValue);
  }

  function selectfile(e) {
    setFile(e.target.files[0]);
  }

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        // Skip if already uploaded (stored object with fileStoreId, not a new File blob)
        if (file.fileStoreId || uploadedFile) return;
        if (file.size >= 2000000) {
          setError(t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
        } else {
          try {
            // TODO: change module in file storage
            const response = await Digit.UploadServices.Filestorage("property-upload", file, Digit.ULBService.getStateId());
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId);
            } else {
              setError(t("PT_FILE_UPLOAD_ERROR"));
            }
          } catch (err) {}
        }
      }
    })();
  }, [file]);

  const [multipleownererror, setmultipleownererror] = useState(null);

  const handleSubmit = () => {
    setmultipleownererror(null);
    if (formData?.ownershipCategory?.code === "INDIVIDUAL.MULTIPLEOWNERS" && formData?.owners?.length <= 1 && index == "0" && !isMutation) {
      setmultipleownererror("PT_MULTI_OWNER_ADD_ERR_MSG");
    } else if (isMutation && formData?.owners?.length <= 1 && formData?.ownershipCategory?.code === "INDIVIDUAL.MULTIPLEOWNERS") {
      setmultipleownererror("PT_MULTI_OWNER_ADD_ERR_MSG");
    } else {
      let fileStoreId = uploadedFile;
      let fileDetails = file;
      if (fileDetails) {
        fileDetails.documentType = dropdownValue;
        fileDetails.fileStoreId = fileStoreId ? fileStoreId : null;
      }
      let ownerDetails = formData.owners && formData.owners[index];
      if (ownerDetails && ownerDetails.documents) {
        if (!isMutation) ownerDetails.documents["proofIdentity"] = fileDetails;
        else ownerDetails.documents["proofIdentity"] = { documentType: dropdownValue, fileStoreId };
      } else {
        if (!isMutation) {
          ownerDetails["documents"] = [];
          ownerDetails.documents["proofIdentity"] = fileDetails;
        } else {
          ownerDetails["documents"] = {};
          ownerDetails.documents["proofIdentity"] = { documentType: dropdownValue, fileStoreId };
        }
      }

      onSelect(config.key, isMutation ? [ownerDetails] : ownerDetails, "", index);
    }
    // onSelect(config.key, { specialProofIdentity: fileDetails }, "", index);
  };

  function onAdd() {
    if (isMutation) {
      if (!uploadedFile || !dropdownValue) {
        setError(t("ERR_DEFAULT_INPUT_FIELD_MSG"));
        return;
      }
      let ownerDetails = formData.owners && formData.owners[index];
      if (ownerDetails && ownerDetails.documents) {
        ownerDetails.documents["proofIdentity"] = { documentType: dropdownValue, fileStoreId: uploadedFile };
      } else {
        ownerDetails["documents"] = {};
        ownerDetails.documents["proofIdentity"] = { documentType: dropdownValue, fileStoreId: uploadedFile };
      }
      addNewOwner(ownerDetails);
      return;
    }

    let newIndex = parseInt(index) + 1;
    let fileStoreId = uploadedFile;
    let fileDetails = file;
    if (fileDetails) {
      fileDetails.documentType = dropdownValue;
      fileDetails.fileStoreId = fileStoreId ? fileStoreId : null;
    }
    let ownerDetails = formData.owners && formData.owners[index];
    if (ownerDetails && ownerDetails.documents) {
      ownerDetails.documents["proofIdentity"] = fileDetails;
    } else {
      ownerDetails["documents"] = [];
      ownerDetails.documents["proofIdentity"] = fileDetails;
    }
    onSelect("owner-details", {}, false, newIndex, true);
  }

  const checkMutatePT = window.location.href.includes("citizen/pt/property/property-mutation/") ? (
    <Timeline currentStep={1} flow="PT_MUTATE" />
  ) : (
    <Timeline currentStep={3} />
  );
  // Derive the effective selected code from state (dropdownValue) OR directly from formData as fallback
  const storedDoc = formData?.owners?.[index]?.documents?.proofIdentity;
  const storedCode = storedDoc?.documentType
    ? (typeof storedDoc.documentType === "object" ? storedDoc.documentType.code : storedDoc.documentType)
    : null;
  const effectiveCode = dropdownValue?.code || storedCode || "";

  return (
    <React.Fragment>
     {window.location.href.includes("/citizen") ? checkMutatePT : null}
      <FormStep
        t={t}
        config={config}
        onSelect={handleSubmit}
        onSkip={onSkip}
        isMandatory={isMandatory}
        forcedError={t(multipleownererror)}
        isDisabled={isUpdateProperty || isEditProperty ? false : multipleownererror || !uploadedFile || !effectiveCode || error}
        onAdd={onAdd}
        isMultipleAllow={formData?.ownershipCategory?.value == "INDIVIDUAL.MULTIPLEOWNERS"}
      >
        <CardLabelDesc>{t(`PT_UPLOAD_RESTRICTIONS_TYPES`)}</CardLabelDesc>
        <CardLabelDesc>{t(`PT_UPLOAD_RESTRICTIONS_SIZE`)}</CardLabelDesc>
        <CardLabel>{`${t("PT_CATEGORY_DOCUMENT_TYPE")}`}<span className="check-page-link-button"> *</span></CardLabel>
        {/* Native select — always reflects current value via string matching, no internal state */}
        <select
          style={{
            display: "block", width: "100%", height: "46px", padding: "0 40px 0 14px",
            border: effectiveCode ? "1.5px solid #1a2b49" : "1.5px solid #b0b8c1",
            borderRadius: "8px", fontSize: "14px",
            color: effectiveCode ? "#1a2b49" : "#8a97a8",
            backgroundColor: effectiveCode ? "#fff" : "#f9fafc",
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%231a2b49' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center", backgroundSize: "13px",
            WebkitAppearance: "none", MozAppearance: "none", appearance: "none",
            cursor: "pointer", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
            fontWeight: effectiveCode ? "600" : "400", marginBottom: "16px",
          }}
          value={effectiveCode}
          onChange={(e) => {
            const matched = dropdownData.find((o) => o.code === e.target.value) || null;
            setDropdownValue(matched);
          }}
        >
          <option value="" disabled hidden>{t("PT_MUTATION_SELECT_DOC_LABEL")}</option>
          {dropdownData.map((o) => (
            <option key={o.code} value={o.code}>{t(o.i18nKey)}</option>
          ))}
        </select>
        {/* File upload widget */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => document.getElementById("pt-identity-proof-input").click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") document.getElementById("pt-identity-proof-input").click(); }}
          style={{
            border: file ? "2px solid #4caf50" : "2px dashed #b0b8c1",
            borderRadius: "10px",
            background: file ? "linear-gradient(135deg,#f0fff4,#e8f5e9)" : "#fff",
            padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px",
            cursor: "pointer", minHeight: "64px", boxSizing: "border-box",
          }}
        >
          <div style={{
            width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
            background: file ? "linear-gradient(135deg,#43a047,#2e7d32)" : "linear-gradient(135deg,#e8edf5,#cfd7e8)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {file
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#505a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: file ? "#2e7d32" : "#3d4f6b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {file?.name || (uploadedFile ? t("PT_ACTION_FILEUPLOADED") : t("PT_ACTION_NO_FILEUPLOADED"))}
            </div>
            <div style={{ fontSize: "11px", color: "#8a97a8", marginTop: "3px" }}>
              {file?.size ? `${(file.size / 1024).toFixed(1)} KB` : file ? t("PT_ACTION_FILEUPLOADED") : "JPG · PNG · PDF · Max 2MB"}
            </div>
          </div>
          {file
            ? <button type="button" onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setFile(null); }} style={{ background: "rgba(229,77,66,0.1)", border: "1px solid rgba(229,77,66,0.3)", borderRadius: "6px", cursor: "pointer", color: "#e54d42", fontSize: "16px", fontWeight: "700", lineHeight: 1, padding: "4px 8px", flexShrink: 0 }}>×</button>
            : <div style={{ background: "linear-gradient(135deg,#1a2b49,#2d4a7a)", color: "#fff", fontSize: "12px", fontWeight: "600", padding: "8px 16px", borderRadius: "8px", whiteSpace: "nowrap", flexShrink: 0 }}>Browse</div>
          }
          <input type="file" id="pt-identity-proof-input" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }} onChange={selectfile} />
        </div>
        {error ? <div style={{ color: "#e54d42", fontSize: "12px", marginTop: "8px", display: "flex", alignItems: "center", gap: "5px" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div> : ""}
        <div style={{ height: "20px", width: "100%" }}></div>
      </FormStep>
    </React.Fragment>
  );
};

export default SelectProofIdentity;
