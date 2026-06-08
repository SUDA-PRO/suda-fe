import React, { Fragment, useEffect, useRef, useState } from "react";
import {
    Dropdown,
    Toast,
    Loader,
    FormStep,
    CitizenInfoLabel,
    BackButton
} from "@upyog/digit-ui-react-components";
import Timeline from "../components/Timeline";

const StakeholderDocuments = ({ t, config, onSelect, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState }) => {
    const tenantId = Digit.ULBService.getCurrentTenantId();
    const stateId = Digit.ULBService.getStateId();
    const [documents, setDocuments] = useState(formData?.documents?.documents || []);
    const [error, setError] = useState(null);
    const [bpaTaxDocuments, setBpaTaxDocuments] = useState([]);
    const [enableSubmit, setEnableSubmit] = useState(true)
    const [checkRequiredFields, setCheckRequiredFields] = useState(false);
    const isCitizenUrl = Digit.Utils.browser.isMobile()?true:false;
    let isopenlink = window.location.href.includes("/openlink/");

    if(isopenlink)  
    window.onunload = function () {
      sessionStorage.removeItem("Digit.BUILDING_PERMIT");
    }

    const { data, isLoading } = Digit.Hooks.obps.useMDMS(stateId, "StakeholderRegistraition", "TradeTypetoRoleMapping");
    

    useEffect(() => {
        let filtredBpaDocs = [];
        if (data?.StakeholderRegistraition?.TradeTypetoRoleMapping) {
            filtredBpaDocs = data?.StakeholderRegistraition?.TradeTypetoRoleMapping?.filter(ob => (ob.tradeType === formData?.formData?.LicneseType?.LicenseType?.tradeType))
        }

        let documentsList = [];
        filtredBpaDocs?.[0]?.docTypes?.forEach(doc => {
            documentsList.push(doc);
        });
        setBpaTaxDocuments(documentsList);

    }, [!isLoading]);

    const handleSubmit = () => {
        let document = formData.documents;
        let documentStep;
        let regularDocs = [];
        bpaTaxDocuments && documents && documents !== null && bpaTaxDocuments.map((initialob,index) => {
            let docobject = documents.find((ob) => (ob && ob !==null) && (ob.documentType === initialob.code));
            if(docobject)
            regularDocs.push(docobject);
        })
        documentStep = { ...document, documents: regularDocs };
        onSelect(config.key, documentStep);
     };
    const onSkip = () => onSelect();
    function onAdd() { }

    useEffect(() => {
        let count = 0;
        bpaTaxDocuments.map(doc => {
            let isRequired = false;
            documents.map(data => {
                if (doc.required && data !== null && data && doc.code == `${data.documentType.split('.')[0]}.${data.documentType.split('.')[1]}`) {
                    isRequired = true;
                }
            });
            if (!isRequired && doc.required) {
                count = count + 1;
            }
        });
        if ((count == "0" || count == 0) && documents.length > 0) setEnableSubmit(false);
        else setEnableSubmit(true);
    }, [documents, checkRequiredFields])


    return (
        <div className="stakeholder-docs-page">
            <style>{".stakeholder-docs-page .card-caption, .stakeholder-docs-page .card-text { display: none !important; }"}</style>
            <div className={isopenlink? "OpenlinkContainer":""}>
            {isopenlink && <BackButton style={{ border: "none" }}>{t("CS_COMMON_BACK")}</BackButton>}
            <Timeline currentStep={3} flow="STAKEHOLDER" />

            {/* Hero Banner */}
            <div style={{ background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)", borderRadius: "12px", padding: "28px 36px", marginBottom: "24px", color: "#fff", display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>
                  {t("BPA_STEP_3_OF_3") || "Step 3 of 3"}
                </div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{t("BPA_STAKEHOLDER_DOCUMENTS") || "Upload Documents"}</h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>
                  {t("BPA_STAKEHOLDER_DOCS_SUBTEXT") || "Upload all required documents for registration"}
                </p>
              </div>
            </div>

            {!isLoading ?
                <FormStep
                    t={t}
                    config={config}
                    onSelect={handleSubmit}
                    onSkip={onSkip}
                    isDisabled={enableSubmit}
                    onAdd={onAdd}
                    cardStyle={{paddingRight:"16px"}}
                >
                    {bpaTaxDocuments?.map((document, index) => {
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
                                isCitizenUrl={isCitizenUrl}
                            />
                        );
                    })}
                    {error && <Toast label={error} isDleteBtn={true} onClose={() => setError(null)} error  />}
                </FormStep> : <Loader />}
                {!(formData?.initiationFlow) && <CitizenInfoLabel info={t("CS_FILE_APPLICATION_INFO_LABEL")} text={`${t("BPA_APPLICATION_NUMBER_LABEL")} ${formData?.result?.Licenses?.[0]?.applicationNumber} ${t("BPA_DOCS_INFORMATION")}`} className={"info-banner-wrap-citizen-override"}/>}
                </div>
            </div>
        // </div>
    );
}

function SelectDocument({
    t,
    document: doc,
    setDocuments,
    error,
    setError,
    documents,
    setCheckRequiredFields,
    isCitizenUrl
}) {

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
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleSelectDocument = (value) => setSelectedDocument(value);

    function selectfile(e) {
        const selected = e.target.files[0];
        if (selected) setFile(selected);
    }

    useEffect(() => {
        setDocuments((prev) => {
            const filteredDocumentsByDocumentType = prev?.filter((item) => item?.documentType !== doc?.code);
            if (uploadedFile?.length === 0 || uploadedFile === null) {
                return filteredDocumentsByDocumentType;
            }
            const filteredDocumentsByFileStoreId = filteredDocumentsByDocumentType?.filter((item) => item?.fileStoreId !== uploadedFile);
            return [
                ...filteredDocumentsByFileStoreId,
                {
                    documentType: selectedDocument?.code || doc?.code,
                    fileStoreId: uploadedFile,
                    documentUid: uploadedFile,
                    fileName: file?.name || "",
                    info: doc?.info || ""
                },
            ];
        });
    }, [uploadedFile, file]);

    useEffect(() => {
        (async () => {
            setError(null);
            if (file) {
                const allowedFileTypesRegex = /(.*?)(jpg|jpeg|png|image|pdf)$/i;
                if (file.size >= 5242880) {
                    setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
                } else if (file?.type && !allowedFileTypesRegex.test(file?.type)) {
                    setError(t("NOT_SUPPORTED_FILE_TYPE"));
                } else {
                    try {
                        setUploading(true);
                        setUploadedFile(null);
                        const response = await Digit.UploadServices.Filestorage("PT", file, tenantId?.split(".")[0]);
                        if (response?.data?.files?.length > 0) {
                            setUploadedFile(response?.data?.files[0]?.fileStoreId);
                        } else {
                            setError(t("CS_FILE_UPLOAD_ERROR"));
                        }
                    } catch (err) {
                        setError(t("CS_FILE_UPLOAD_ERROR"));
                    } finally {
                        setUploading(false);
                    }
                }
            }
        })();
    }, [file]);

    const docTitle = doc?.required
        ? `${t(`BPAREG_HEADER_${doc?.code?.replace(".", "_")}`)}`
        : `${t(`BPAREG_HEADER_${doc?.code?.replace(".", "_")}`)}`; 

    return (
        <div style={{ marginBottom: "24px" }}>
            {/* Title label (old style) */}
            <div style={{ fontWeight: "600", fontSize: "14px", color: "#0b0c0c", marginBottom: "8px" }}>
                {docTitle}{doc?.required && <span style={{ color: "#e54d42", marginLeft: "4px" }}>*</span>}
            </div>

            {/* Info/description text (old style) */}
            {doc?.info && (
                <div style={{ fontSize: "12px", color: "#505A5F", fontWeight: 400, lineHeight: "15px", marginBottom: "10px" }}>{t(doc.info)}</div>
            )}

            {/* Document Type dropdown */}
            {doc?.dropdownData?.length > 1 && (
                <div style={{ marginBottom: "12px" }}>
                    <Dropdown
                        t={t}
                        isMandatory={true}
                        option={doc.dropdownData}
                        selected={selectedDocument}
                        optionKey="i18nKey"
                        select={handleSelectDocument}
                        placeholder={t("BPAREG_SELECT_DOCUMENT") || "Select Document"}
                    />
                </div>
            )}

                {/* Upload zone */}
                <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    style={{
                        border: "2px dashed #b0bed0",
                        borderRadius: "10px",
                        background: "#fff",
                        padding: "18px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        cursor: uploading ? "wait" : "pointer",
                        transition: "border-color 0.2s",
                    }}
                >
                    {/* Upload icon */}
                    <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: "#eef2f8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {uploading ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a2b49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                                <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
                                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                                <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
                            </svg>
                        ) : uploadedFile ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a2b49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
                                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                            </svg>
                        )}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {uploadedFile ? (
                            <>
                                <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a2b49", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {file?.name || t("CS_ACTION_FILEUPLOADED") || "File Uploaded"}
                                </div>
                                <div style={{ fontSize: "12px", color: "#22c55e", marginTop: "2px", fontWeight: "600" }}>
                                    ✓ {t("CS_ACTION_FILEUPLOADED") || "Uploaded successfully"}
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a2b49" }}>
                                    {uploading ? (t("CS_UPLOADING") || "Uploading...") : (t("CS_ACTION_NO_FILEUPLOADED") || "No File Uploaded")}
                                </div>
                                <div style={{ fontSize: "12px", color: "#7a8a9e", marginTop: "2px" }}>
                                    JPG · PNG · PDF · Max 5MB
                                </div>
                            </>
                        )}
                    </div>

                    {/* Browse / Delete button */}
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                        {uploadedFile && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setFile(null); setCheckRequiredFields(true); }}
                                style={{ background: "transparent", border: "1.5px solid #e54d42", color: "#e54d42", borderRadius: "8px", padding: "8px 14px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
                            >
                                {t("CS_COMMON_DELETE") || "Remove"}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            style={{ background: "#1a2b49", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
                        >
                            {t("CS_COMMON_BROWSE") || "Browse"}
                        </button>
                    </div>
                </div>
                {error && <div style={{ color: "#e54d42", fontSize: "12px", marginTop: "8px", fontWeight: "500" }}>{error}</div>}

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*, .pdf, .png, .jpeg, .jpg"
                    style={{ display: "none" }}
                    onChange={selectfile}
                />
        </div>
    );
}

export default StakeholderDocuments;
