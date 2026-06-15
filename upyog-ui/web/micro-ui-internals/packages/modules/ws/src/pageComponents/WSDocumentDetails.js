import React, { useEffect, useState } from "react";
import { Toast, Loader, FormStep } from "@upyog/digit-ui-react-components";
import Timeline from "../components/Timeline";

const WSDocumentDetails = ({ t, config, onSelect, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState }) => {
  const tenantId = Digit.ULBService.getStateId();
  const [documents, setDocuments] = useState(formData?.documents?.documents || []);
  const [error, setError] = useState(null);
  const [enableSubmit, setEnableSubmit] = useState(true);
  const [checkRequiredFields, setCheckRequiredFields] = useState(false);

  const { isLoading: wsDocsLoading, data: wsDocs } = Digit.Hooks.ws.WSSearchMdmsTypes.useWSServicesMasters(tenantId);

  const handleSubmit = () => {
    let document = formData.documents;
    let documentStep;
    documentStep = { ...document, documents: documents };
    onSelect(config.key, documentStep);
  };
  const onSkip = () => onSelect();
  function onAdd() {}

  useEffect(() => {
    let count = 0;
    wsDocs?.Documents.map((doc) => {
      let isRequired = false;
      documents.map((data) => {
        if (doc.required && data?.documentType.includes(doc.code)) isRequired = true;
      });
      if (!isRequired && doc.required) count = count + 1;
    });
    if ((count == "0" || count == 0) && documents.length > 0) setEnableSubmit(false);
    else setEnableSubmit(true);
  }, [documents, checkRequiredFields]);

  return (
    <div>
      {userType === "citizen" && <Timeline currentStep={3} />}
      {!wsDocsLoading ? (
        <FormStep t={t} config={config} onSelect={handleSubmit} onSkip={onSkip} isDisabled={enableSubmit} onAdd={onAdd}>
          {wsDocs?.Documents?.map((document, index) => {
            return (
              <SelectDocument
                key={index}
                document={document}
                t={t}
                error={error}
                setError={setError}
                setDocuments={setDocuments}
                documents={documents}
                setCheckRequiredFields={setCheckRequiredFields}
              />
            );
          })}
          {error && <Toast label={error} onClose={() => setError(null)} error />}
        </FormStep>
      ) : (
        <Loader />
      )}
    </div>
  );
};

function SelectDocument({ t, key, document: doc, setDocuments, error, setError, documents, setCheckRequiredFields }) {
  const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0];
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [selectedDocument, setSelectedDocument] = useState(
    filteredDocument
      ? { ...filteredDocument, active: true, code: filteredDocument?.documentType, i18nKey: filteredDocument?.documentType }
      : doc?.dropdownData?.length === 1
      ? doc?.dropdownData[0]
      : {}
  );
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.fileStoreId || null);
  const [uploadedFileObj, setUploadedFileObj] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(filteredDocument?.fileName || null);
  const [uploadedFileSize, setUploadedFileSize] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleSelectDocument = (value) => setSelectedDocument(value);

  function selectfile(e) {
    const f = e.target.files[0];
    if (f) {
      setUploadedFileObj(f);
      setUploadedFileName(f.name);
      setUploadedFileSize(f.size);
      setFile(f);
    }
  }

  useEffect(() => {
    if (selectedDocument?.code) {
      setDocuments((prev) => {
        const filteredDocumentsByDocumentType = prev?.filter((item) => item?.documentType !== selectedDocument?.code);
        if (uploadedFile?.length === 0 || uploadedFile === null) return filteredDocumentsByDocumentType;
        const filteredDocumentsByFileStoreId = filteredDocumentsByDocumentType?.filter((item) => item?.fileStoreId !== uploadedFile);
        return [
          ...filteredDocumentsByFileStoreId,
          {
            documentType: selectedDocument?.code,
            fileStoreId: uploadedFile,
            documentUid: selectedDocument?.documentUid || null,
            id: selectedDocument?.id || null,
            fileName: file?.name || "",
            status: "ACTIVE",
          },
        ];
      });
    }
  }, [uploadedFile, selectedDocument]);

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        if (file.size >= 5242880) {
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
          setUploadError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
        } else {
          try {
            setUploadedFile(null);
            setUploadError(null);
            const response = await Digit.UploadServices.Filestorage("WS", file, tenantId?.split(".")[0]);
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId);
            } else {
              setError(t("CS_FILE_UPLOAD_ERROR"));
              setUploadError(t("CS_FILE_UPLOAD_ERROR"));
            }
          } catch (err) {
            setError(t("CS_FILE_UPLOAD_ERROR"));
            setUploadError(t("CS_FILE_UPLOAD_ERROR"));
          }
        }
      }
    })();
  }, [file]);

  const labelStyle = { fontSize: "13px", fontWeight: "600", color: "#3d4f6b", marginBottom: "6px", display: "block" };
  const requiredMark = { color: "#e54d42", marginLeft: "2px" };
  const inputId = `ws-doc-${doc?.code || key}`;

  return (
    <div style={{ marginTop: "20px", marginBottom: "8px", background: "linear-gradient(135deg, #f8f9fe 0%, #eef2fb 100%)", border: "1px solid #dde4f0", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(26,43,73,0.06)" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px", paddingBottom: "14px", borderBottom: "1px solid #dde4f0" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #1a2b49 0%, #2d4a7a 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(26,43,73,0.25)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#1a2b49", letterSpacing: "0.1px" }}>
            {doc?.required ? (
              <React.Fragment>{t(doc?.i18nKey)}<span style={requiredMark}>*</span></React.Fragment>
            ) : (
              t(doc?.i18nKey)
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "480px" }}>
        {/* Document Type — native select */}
        <div>
          <label style={labelStyle}>{t("PT_CATEGORY_DOCUMENT_TYPE")}</label>
          <div style={{ position: "relative" }}>
            <select
              style={{
                display: "block", width: "100%", height: "46px",
                padding: "0 40px 0 14px",
                border: selectedDocument?.code ? "1.5px solid #1a2b49" : "1.5px solid #b0b8c1",
                borderRadius: "10px", fontSize: "14px",
                color: selectedDocument?.code ? "#1a2b49" : "#8a97a8",
                backgroundColor: selectedDocument?.code ? "#ffffff" : "#f9fafc",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%231a2b49' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center", backgroundSize: "13px",
                WebkitAppearance: "none", MozAppearance: "none", appearance: "none",
                cursor: "pointer", outline: "none", boxSizing: "border-box",
                fontFamily: "inherit", boxShadow: selectedDocument?.code ? "0 0 0 3px rgba(26,43,73,0.08)" : "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
                fontWeight: selectedDocument?.code ? "600" : "400",
              }}
              value={selectedDocument?.code || ""}
              onChange={(e) => {
                const selected = (doc?.dropdownData || []).find(d => d.code === e.target.value);
                handleSelectDocument(selected || null);
              }}
            >
              <option value="" disabled hidden>{t("PT_MUTATION_SELECT_DOC_LABEL")}</option>
              {(doc?.dropdownData || []).map(d => (
                <option key={d.code} value={d.code}>{t(d.i18nKey)}</option>
              ))}
            </select>
            {selectedDocument?.code && (
              <div style={{ position: "absolute", right: "32px", top: "50%", transform: "translateY(-50%)", width: "8px", height: "8px", borderRadius: "50%", background: "#4caf50" }} />
            )}
          </div>
        </div>

        {/* File Upload — fully custom */}
        <div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => document.getElementById(inputId).click()}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") document.getElementById(inputId).click(); }}
            style={{
              border: (uploadedFile || uploadedFileObj) ? "2px solid #4caf50" : "2px dashed #b0b8c1",
              borderRadius: "12px",
              background: (uploadedFile || uploadedFileObj) ? "linear-gradient(135deg, #f0fff4, #e8f5e9)" : "#ffffff",
              padding: "14px 16px",
              display: "flex", alignItems: "center", gap: "14px",
              cursor: "pointer", transition: "border-color 0.2s, background 0.2s",
              minHeight: "64px", boxSizing: "border-box",
            }}
          >
            {/* Icon */}
            <div style={{
              width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
              background: (uploadedFile || uploadedFileObj)
                ? "linear-gradient(135deg, #43a047, #2e7d32)"
                : "linear-gradient(135deg, #e8edf5, #cfd7e8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: (uploadedFile || uploadedFileObj) ? "0 2px 6px rgba(46,125,50,0.3)" : "none",
            }}>
              {(uploadedFile || uploadedFileObj) ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#505a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16"/>
                  <line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
              )}
            </div>

            {/* Text info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: "13px", fontWeight: "600",
                color: (uploadedFile || uploadedFileObj) ? "#2e7d32" : "#3d4f6b",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {uploadedFileObj
                  ? uploadedFileObj.name
                  : (uploadedFile && uploadedFileName)
                    ? uploadedFileName
                    : uploadedFile
                      ? t("CS_ACTION_FILEUPLOADED")
                      : t("ES_NO_FILE_SELECTED_LABEL")}
              </div>
              <div style={{ fontSize: "11px", color: "#8a97a8", marginTop: "3px" }}>
                {uploadedFileObj
                  ? `${(uploadedFileObj.size / 1024).toFixed(1)} KB · click × to remove`
                  : (uploadedFile && uploadedFileSize)
                    ? `${(uploadedFileSize / 1024).toFixed(1)} KB`
                    : uploadedFile
                      ? t("CS_ACTION_FILEUPLOADED")
                      : "JPG · PNG · PDF · Max 5MB"}
              </div>
            </div>

            {/* Action button */}
            {(uploadedFile || uploadedFileObj) ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadedFile(null);
                  setUploadedFileObj(null);
                  setUploadedFileName(null);
                  setUploadedFileSize(null);
                  setFile(null);
                  setCheckRequiredFields(true);
                }}
                style={{
                  background: "rgba(229,77,66,0.1)", border: "1px solid rgba(229,77,66,0.3)",
                  borderRadius: "6px", cursor: "pointer", color: "#e54d42",
                  fontSize: "16px", fontWeight: "700", lineHeight: 1,
                  padding: "4px 8px", flexShrink: 0, transition: "background 0.15s",
                }}
                title="Remove file"
              >
                ×
              </button>
            ) : (
              <div style={{
                background: "linear-gradient(135deg, #1a2b49 0%, #2d4a7a 100%)",
                color: "#fff", fontSize: "12px", fontWeight: "600",
                padding: "8px 16px", borderRadius: "8px",
                whiteSpace: "nowrap", flexShrink: 0,
                boxShadow: "0 2px 6px rgba(26,43,73,0.3)",
              }}>
                Browse
              </div>
            )}

            <input
              type="file"
              id={inputId}
              accept=".jpg,.jpeg,.png,.pdf"
              style={{ display: "none" }}
              onChange={(e) => { if (e.target.files && e.target.files[0]) selectfile(e); }}
            />
          </div>

          {uploadError && (
            <div style={{ color: "#e54d42", fontSize: "12px", marginTop: "8px", display: "flex", alignItems: "center", gap: "5px", fontWeight: "500" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {uploadError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WSDocumentDetails;
