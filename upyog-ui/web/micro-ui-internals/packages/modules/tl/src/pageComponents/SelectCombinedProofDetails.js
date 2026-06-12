import React, { useState, useEffect } from "react";
import { UploadFile, FormStep } from "@upyog/digit-ui-react-components";
import Timeline from "../components/TLTimeline";
import { getOwnersfromProperty } from "../utils";

const ACCEPT_IMAGE = ".jpg,.png,.jpeg";
const ACCEPT_DOC   = ".jpg,.png,.pdf,.jpeg";
const MAX_SIZE      = 2000000;

async function uploadFile(file, t, setError) {
  if (!file?.type) return null;
  const ext = `.${file.type.split("/").pop()}`;
  if (!ACCEPT_DOC.split(",").includes(ext)) {
    setError(t("PT_UPLOAD_FORMAT_NOT_SUPPORTED"));
    return null;
  }
  if (file.size >= MAX_SIZE) {
    setError(t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
    return null;
  }
  try {
    const response = await Digit.UploadServices.Filestorage("property-upload", file, Digit.ULBService.getStateId());
    if (response?.data?.files?.length > 0) return response.data.files[0].fileStoreId;
    setError(t("PT_FILE_UPLOAD_ERROR"));
  } catch {
    /* silent */
  }
  return null;
}

const SelectCombinedProofDetails = ({ t, config, onSelect, userType, formData, isMandatory }) => {
  // ── SECTION 1: Proof of Identity ──────────────────────────────────────────────
  const [identityFile,       setIdentityFile]       = useState(formData?.owners?.documents?.ProofOfIdentity);
  const [identityFileStoreId, setIdentityFileStoreId] = useState(formData?.owners?.documents?.ProofOfIdentity?.fileStoreId || null);
  const [identityError,      setIdentityError]      = useState(null);

  useEffect(() => {
    if (!identityFile?.type) return;
    uploadFile(identityFile, t, setIdentityError).then((id) => {
      if (id) { setIdentityFileStoreId(id); setIdentityError(null); }
    });
  }, [identityFile]);

  // ── SECTION 2: Proof of Ownership ─────────────────────────────────────────────
  const [ownershipFile,       setOwnershipFile]       = useState(formData?.owners?.documents?.ProofOfOwnership);
  const [ownershipFileStoreId, setOwnershipFileStoreId] = useState(formData?.owners?.documents?.ProofOfOwnership?.fileStoreId || null);
  const [ownershipError,      setOwnershipError]      = useState(null);

  useEffect(() => {
    if (!ownershipFile?.type) return;
    uploadFile(ownershipFile, t, setOwnershipError).then((id) => {
      if (id) { setOwnershipFileStoreId(id); setOwnershipError(null); }
    });
  }, [ownershipFile]);

  // ── SECTION 3: Owner Photo ────────────────────────────────────────────────────
  const [photoFile,       setPhotoFile]       = useState(formData?.owners?.documents?.OwnerPhotoProof);
  const [photoFileStoreId, setPhotoFileStoreId] = useState(formData?.owners?.documents?.OwnerPhotoProof?.fileStoreId || null);
  const [photoError,      setPhotoError]      = useState(null);

  useEffect(() => {
    if (!photoFile?.type) return;
    // Photo only accepts images (no pdf)
    const ext = `.${photoFile.type.split("/").pop()}`;
    if (!ACCEPT_IMAGE.split(",").includes(ext)) {
      setPhotoError(t("PT_UPLOAD_FORMAT_NOT_SUPPORTED"));
      return;
    }
    uploadFile(photoFile, t, setPhotoError).then((id) => {
      if (id) { setPhotoFileStoreId(id); setPhotoError(null); }
    });
  }, [photoFile]);

  useEffect(() => {
    localStorage.setItem("TLAppSubmitEnabled", "true");
  }, []);

  // ── Fetch download URLs for pre-existing files so user can view them ─────────
  const [existingUrls, setExistingUrls] = useState({});
  useEffect(() => {
    const identityId  = formData?.owners?.documents?.ProofOfIdentity?.fileStoreId;
    const ownershipId = formData?.owners?.documents?.ProofOfOwnership?.fileStoreId;
    const photoId     = formData?.owners?.documents?.OwnerPhotoProof?.fileStoreId;
    const ids = [identityId, ownershipId, photoId].filter(Boolean);
    if (ids.length === 0) return;
    Digit.UploadServices.Filefetch(ids, Digit.ULBService.getStateId()).then(res => {
      const pdfFiles = res?.data || {};
      const getUrl = (id) => {
        if (!id || !pdfFiles[id]) return null;
        const parts = (pdfFiles[id] || "").split(",");
        return parts.find(l => !l.includes("large") && !l.includes("medium") && !l.includes("small")) || parts[0] || null;
      };
      setExistingUrls({ identity: getUrl(identityId), ownership: getUrl(ownershipId), photo: getUrl(photoId) });
    }).catch(() => {});
  }, []);

  const isDisabled =
    !identityFileStoreId || !!identityError ||
    !ownershipFileStoreId || !!ownershipError ||
    !photoFileStoreId || !!photoError;

  const onSkip = () => onSelect();

  const handleSubmit = () => {
    if (isDisabled) return;

    // Build a completely fresh owners object — never mutate formData.owners
    const newDocs = {
      ProofOfIdentity:  identityFileStoreId  ? { documentType: "OWNERIDPROOF",    fileStoreId: identityFileStoreId,  fileName: identityFile?.name  || identityFile?.fileName  || null } : null,
      ProofOfOwnership: ownershipFileStoreId ? { documentType: "OWNERSHIPPROOF",  fileStoreId: ownershipFileStoreId, fileName: ownershipFile?.name || ownershipFile?.fileName || null } : null,
      OwnerPhotoProof:  photoFileStoreId     ? { documentType: "OWNERPHOTO",       fileStoreId: photoFileStoreId,     fileName: photoFile?.name     || photoFile?.fileName     || null } : null,
    };

    let owners = { ...(formData?.owners || {}), documents: newDocs };

    if (
      window.location.href.includes("/citizen/tl") &&
      (formData?.ownershipCategory?.isSameAsPropertyOwner === true ||
        formData?.ownershipCategory?.isSameAsPropertyOwner === "true")
    ) {
      owners = {
        ...owners,
        owners: getOwnersfromProperty(formData),
        permanentAddress:
          formData?.cpt?.details?.owners?.[0]?.permanentAddress ||
          formData?.cpt?.details?.owners?.[0]?.correspondenceAddress,
      };
    }

    onSelect(config.key, owners);
  };

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
  const hintStyle = { fontSize: "12px", color: "#6b7280", marginBottom: "6px", display: "block" };
  const requiredMark = { color: "#e54d42", marginLeft: "2px" };

  return (
    <React.Fragment>
      <style>{`
        .pt-property-details-form .upload-file,
        .pt-property-details-form .upload-file-max-width {
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
        .pt-property-details-form .upload-file > div {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          width: 100% !important;
        }
        .pt-property-details-form .selector-button-border {
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
        .pt-property-details-form .input-mirror-selector-button {
          position: absolute !important;
          top: 0 !important; left: 0 !important;
          width: 100% !important; height: 100% !important;
          opacity: 0 !important; cursor: pointer !important;
          z-index: 2 !important;
          min-height: unset !important; max-height: unset !important;
          background: transparent !important; border: none !important;
        }
        .pt-property-details-form .file-upload-status {
          font-size: 14px !important;
          color: #505a5f !important;
          font-weight: normal !important;
          margin: 0 !important;
          flex: 1 !important;
          min-width: 0 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
      `}</style>

      {window.location.href.includes("/citizen") ? <Timeline currentStep={3} /> : null}

      {/* PT-style hero banner (matches PTAllPropertyDetails) */}
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
          fontSize: "26px",
        }}>📄</div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>Step 3 of 3</div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{t("TL_PROOF_IDENTITY_HEADER") || "Proof Details"}</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>{t("TL_PROOF_DETAILS_SUBHEADER") || "Upload required documents to complete your application"}</p>
        </div>
      </div>

      <FormStep config={config} onSelect={handleSubmit} onSkip={onSkip} t={t} isDisabled={isDisabled} isMandatory={isMandatory}>
        <div style={{ maxWidth: "100%", width: "100%" }} className="pt-property-details-form">

          {/* ── CARD 1: Proof of Identity ── */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>{t("TL_PROOF_IDENTITY_HEADER")}</div>
            <span style={hintStyle}>{t("TL_UPLOAD_RESTRICTIONS_TYPES")}</span>
            <span style={hintStyle}>{t("TL_UPLOAD_RESTRICTIONS_SIZE")}</span>
            <label style={labelStyle}>{t("TL_CATEGORY_DOCUMENT_TYPE")}<span style={requiredMark}>*</span></label>
            {identityFileStoreId && !identityFile?.type && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
                <span>📎</span>
                <span style={{ fontSize: "13px", color: "#2e7d32", fontWeight: 600, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {identityFile?.fileName || t("TL_FILE_ALREADY_UPLOADED") || "File already uploaded"}
                </span>
                {existingUrls.identity && (
                  <a href={existingUrls.identity} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "12px", color: "#1565c0", fontWeight: 600, textDecoration: "underline", whiteSpace: "nowrap" }}>
                    {t("TL_VIEW_FILE") || "View ↗"}
                  </a>
                )}
                <span style={{ fontSize: "11px", color: "#666", whiteSpace: "nowrap" }}>
                  {t("TL_UPLOAD_NEW_TO_REPLACE") || "↑ Upload new to replace"}
                </span>
              </div>
            )}
            <UploadFile
              id="tl-proof-identity"
              extraStyleName="propertyCreate"
              accept={ACCEPT_DOC}
              onUpload={(e) => { setIdentityFileStoreId(null); setIdentityFile(e.target.files[0]); setIdentityError(null); }}
              onDelete={() => { setIdentityFileStoreId(null); setIdentityFile(null); }}
              message={identityFileStoreId ? `1 ${t("TL_ACTION_FILEUPLOADED")}` : t("TL_ACTION_NO_FILEUPLOADED")}
              error={identityError}
            />
            {identityError && <div style={{ fontSize: "12px", color: "#e54d42", marginTop: "5px" }}>{identityError}</div>}
          </div>

          {/* ── CARD 2: Proof of Ownership ── */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>{t("TL_OWNERSHIP_DOCUMENT")}</div>
            <span style={hintStyle}>{t("TL_UPLOAD_OWNERSHIP_RESTRICTIONS_TYPES")}</span>
            <span style={hintStyle}>{t("TL_UPLOAD_RESTRICTIONS_SIZE")}</span>
            <label style={labelStyle}>{t("TL_CATEGORY_DOCUMENT_TYPE")}<span style={requiredMark}>*</span></label>
            {ownershipFileStoreId && !ownershipFile?.type && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
                <span>📎</span>
                <span style={{ fontSize: "13px", color: "#2e7d32", fontWeight: 600, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ownershipFile?.fileName || t("TL_FILE_ALREADY_UPLOADED") || "File already uploaded"}
                </span>
                {existingUrls.ownership && (
                  <a href={existingUrls.ownership} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "12px", color: "#1565c0", fontWeight: 600, textDecoration: "underline", whiteSpace: "nowrap" }}>
                    {t("TL_VIEW_FILE") || "View ↗"}
                  </a>
                )}
                <span style={{ fontSize: "11px", color: "#666", whiteSpace: "nowrap" }}>
                  {t("TL_UPLOAD_NEW_TO_REPLACE") || "↑ Upload new to replace"}
                </span>
              </div>
            )}
            <UploadFile
              id="tl-proof-ownership"
              extraStyleName="propertyCreate"
              accept={ACCEPT_DOC}
              onUpload={(e) => { setOwnershipFileStoreId(null); setOwnershipFile(e.target.files[0]); setOwnershipError(null); }}
              onDelete={() => { setOwnershipFileStoreId(null); setOwnershipFile(null); }}
              message={ownershipFileStoreId ? `1 ${t("TL_ACTION_FILEUPLOADED")}` : t("TL_ACTION_NO_FILEUPLOADED")}
              error={ownershipError}
            />
            {ownershipError && <div style={{ fontSize: "12px", color: "#e54d42", marginTop: "5px" }}>{ownershipError}</div>}
          </div>

          {/* ── CARD 3: Owner Photo ── */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>{t("TL_OWNERS_PHOTOGRAPH_HEADER")}</div>
            <span style={hintStyle}>{t("TL_UPLOAD_PHOTO_RESTRICTIONS_TYPES")}</span>
            <span style={hintStyle}>{t("TL_UPLOAD_PHOTO_RESTRICTIONS_SIZE")}</span>
            <label style={labelStyle}>{t("TL_CATEGORY_DOCUMENT_TYPE")}<span style={requiredMark}>*</span></label>
            {photoFileStoreId && !photoFile?.type && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
                <span>📎</span>
                <span style={{ fontSize: "13px", color: "#2e7d32", fontWeight: 600, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {photoFile?.fileName || t("TL_FILE_ALREADY_UPLOADED") || "File already uploaded"}
                </span>
                {existingUrls.photo && (
                  <a href={existingUrls.photo} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "12px", color: "#1565c0", fontWeight: 600, textDecoration: "underline", whiteSpace: "nowrap" }}>
                    {t("TL_VIEW_FILE") || "View ↗"}
                  </a>
                )}
                <span style={{ fontSize: "11px", color: "#666", whiteSpace: "nowrap" }}>
                  {t("TL_UPLOAD_NEW_TO_REPLACE") || "↑ Upload new to replace"}
                </span>
              </div>
            )}
            <UploadFile
              id="tl-proof-photo"
              extraStyleName="propertyCreate"
              accept={ACCEPT_IMAGE}
              onUpload={(e) => { setPhotoFileStoreId(null); setPhotoFile(e.target.files[0]); setPhotoError(null); }}
              onDelete={() => { setPhotoFileStoreId(null); setPhotoFile(null); }}
              message={photoFileStoreId ? `1 ${t("TL_ACTION_FILEUPLOADED")}` : t("TL_ACTION_NO_FILEUPLOADED")}
              error={photoError}
            />
            {photoError && <div style={{ fontSize: "12px", color: "#e54d42", marginTop: "5px" }}>{photoError}</div>}
          </div>

        </div>
      </FormStep>
    </React.Fragment>
  );
};

export default SelectCombinedProofDetails;
