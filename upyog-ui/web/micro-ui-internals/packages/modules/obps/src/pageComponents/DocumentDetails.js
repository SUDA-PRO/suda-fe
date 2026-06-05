import React, { useEffect, useMemo, useState } from "react";
import {
    Dropdown,
    UploadFile,
    Toast,
    Loader,
    FormStep,
    CitizenInfoLabel,
    MultiUploadWrapper
} from "@upyog/digit-ui-react-components";
import Timeline from "../components/Timeline";
import DocumentsPreview from "../../../templates/ApplicationDetails/components/DocumentsPreview";
import { stringReplaceAll } from "../utils";
import cloneDeep from "lodash/cloneDeep";

const DocumentDetails = ({ t, config, onSelect, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState }) => {
    const stateId = Digit.ULBService.getStateId();
    const [documents, setDocuments] = useState(formData?.documents?.documents || []);
    const [error, setError] = useState(null);
    const [enableSubmit, setEnableSubmit] = useState(true)
    const [checkRequiredFields, setCheckRequiredFields] = useState(false);
    const checkingFlow = formData?.uiFlow?.flow ? formData?.uiFlow?.flow :formData?.businessService==="BPA-PAP" ? "PRE_APPROVE":"";
    const beforeUploadDocuments = cloneDeep(formData?.PrevStateDocuments || []);
    const {data: bpaTaxDocuments, isLoading} = Digit.Hooks.obps.useBPATaxDocuments(stateId, formData, beforeUploadDocuments || []);
    const handleSubmit = () => {
        let document = formData.documents;
        let documentStep;
        let RealignedDocument = [];
        bpaTaxDocuments && bpaTaxDocuments.map((ob) => {
            documents && documents.filter(x => ob.code === stringReplaceAll(x?.additionalDetails.category,"_",".")).map((doc) => {
                RealignedDocument.push(doc);
            })
        })
        documentStep = { ...document, documents: RealignedDocument };
        onSelect(config.key, documentStep);
     };
    const onSkip = () => onSelect();
    function onAdd() { }
    useEffect(() => {
        const allRequiredDocumentsCode = bpaTaxDocuments.filter( e => e.required).map(e => e.code)

        const reqDocumentEntered = allRequiredDocumentsCode.filter(reqCode => documents.reduce((acc,doc) => {
            if (reqCode == `${doc?.documentType?.split('.')?.[0]}.${doc?.documentType?.split('.')?.[1]}`) {
                return true
            }
            else{
                return acc
            }
        }, false))
        if ((reqDocumentEntered.length == allRequiredDocumentsCode.length ) && documents.length > 0) {
            setEnableSubmit(false);
        }else {
            setEnableSubmit(true);
        }
    }, [documents, checkRequiredFields])

    return (
        <div className="document-details-page">
        <style>{".document-details-page .card-caption, .document-details-page .card-text { display: none !important; }"}</style>
        <Timeline currentStep={checkingFlow === "OCBPA"  ? 3 : checkingFlow==="PRE_APPROVE"? 7 : 2 } flow={checkingFlow}/>

        {/* Hero Banner */}
        <div style={{ background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)", borderRadius: "12px", padding: "28px 36px", marginBottom: "24px", color: "#fff", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>
              {t("BPA_BUILDING_PERMIT") || "Building Permit"}
            </div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{t("BPA_DOCUMENT_DETAILS_LABEL") || "Document Details"}</h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>
              {t("BPA_DOCUMENT_SUBTEXT") || "Upload all required supporting documents"}
            </p>
          </div>
          <div style={{ marginLeft: "auto", flexShrink: 0, background: "rgba(255,255,255,0.2)", borderRadius: "20px", padding: "6px 16px", fontSize: "12px", fontWeight: "700", color: "#fff", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>Step 2 of 3</div>
        </div>

            {!isLoading ?
                <FormStep
                    t={t}
                    config={config}
                    onSelect={handleSubmit}
                    onSkip={onSkip}
                    isDisabled={window.location.href.includes("editApplication")||window.location.href.includes("sendbacktocitizen")?false:enableSubmit}
                    onAdd={onAdd}
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
                                formData={formData}
                                beforeUploadDocuments={beforeUploadDocuments || []}
                            />
                        );
                    })}
                    {error && <Toast label={error} onClose={() => setError(null)} error />}
                </FormStep>: <Loader />}
                {(window.location.href.includes("/bpa/building_plan_scrutiny/new_construction") || window.location.href.includes("/ocbpa/building_oc_plan_scrutiny/new_construction")) && formData?.applicationNo ? <CitizenInfoLabel info={t("CS_FILE_APPLICATION_INFO_LABEL")} text={`${t("BPA_APPLICATION_NUMBER_LABEL")} ${formData?.applicationNo} ${t("BPA_DOCS_INFORMATION")}`} className={"info-banner-wrap-citizen-override"} /> : ""}
        </div>
    );
}

const SelectDocument = React.memo(function MyComponent({
    t,
    document: doc,
    setDocuments,
    error,
    setError,
    documents,
    setCheckRequiredFields,
    formData,
    beforeUploadDocuments
}) {
    const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0] || beforeUploadDocuments?.filter((item) => item?.documentType?.includes(doc?.code))[0];
    const tenantId = Digit.ULBService.getStateId(); //Digit.ULBService.getCurrentTenantId();
    const [selectedDocument, setSelectedDocument] = useState(
        filteredDocument
            ? { ...filteredDocument, active: true, code: filteredDocument?.documentType, i18nKey: filteredDocument?.documentType }
            : doc?.dropdownData?.length > 0
                ? doc?.dropdownData[0]
                : {}
    );
    const [file, setFile] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(() => documents?.filter((item) => item?.documentType?.includes(doc?.code)).map( e => ({fileStoreId: e?.fileStoreId, fileName: e?.fileName || ""}) ) || null);
    const [newArray, setnewArray ] = useState([]);
    const [uploadedfileArray, setuploadedfileArray] = useState([]);
    const [fileArray, setfileArray] = useState([] || formData?.documents?.documents.filter((ob) => ob.documentType === selectedDocument.code) );

    const handleSelectDocument = (value) => {
        if(filteredDocument?.documentType){
            filteredDocument.documentType=value?.code;
            let currDocs=documents?.filter((item) => item?.documentType?.includes(doc?.code));
            currDocs.map(doc=>doc.documentType=value?.code);
            let newDoc=[ ...documents?.filter((item) => !item?.documentType?.includes(doc?.code)),...currDocs]
            setDocuments(newDoc);
        }
        setSelectedDocument(value);
    };

    function selectfile(e, key) {
        e && setFile(e.file);
        e && setfileArray([...fileArray,e.file]);
    }

    function getData(e) {
        let key = selectedDocument.code;
        let data,newArr;
        if (e?.length > 0) {
            data = Object.fromEntries(e);
            newArr = Object.values(data);
            newArr = formData?.documents?.documents?.filter((ob) => ob.documentType === selectedDocument.code);
            setnewArray(newArr);
            // const filteredDocumentsByFileStoreId = documents?.filter((item) => item?.fileStoreId !== uploadedFile.fileStoreId) || []
            let newfiles = [];
            e?.map((doc, index) => {
                newfiles.push({
                        documentType: selectedDocument?.code,
                        additionalDetails:{category:selectedDocument?.code.split(".").slice(0,2).join('_')},
                        fileStoreId: doc?.[1]?.fileStoreId?.fileStoreId,
                        documentUid: doc?.[1].fileStoreId?.fileStoreId,
                        fileName: doc?.[0] || "",
                        id:documents? documents.find(x => x.documentType === selectedDocument?.code)?.id:undefined,
                })
            })
            const __documents = [
                ...documents.filter(e => e.documentType !== key ),
                ...newfiles,
            ]
            setDocuments(__documents)
        }else if(e?.length==0){
            const __documents = [
                ...documents.filter(e => e.documentType !== key ),
            ]
            setDocuments(__documents);
        }
    
        newArr?.map((ob) => {
            if(!ob?.file){
                ob.file = {}
            }
          ob.file.documentType = key;
          selectfile(ob,key);
        })
      }

    function setcodeafterupload(){
        if (selectedDocument?.code) {
            setDocuments((prev) => {
                //const filteredDocumentsByDocumentType = prev?.filter((item) => item?.documentType !== selectedDocument?.code);

                if (uploadedFile === null || uploadedFile?.fileStoreId === undefined || uploadedFile?.fileStoreId === null) {
                    return prev;
                }

                const filteredDocumentsByFileStoreId = prev?.filter((item) => item?.fileStoreId !== uploadedFile.fileStoreId);
                let newfiles = [];
                uploadedfileArray && uploadedfileArray.map((doc, index) => {
                    newfiles.push({
                        documentType: selectedDocument?.code,
                            fileStoreId: doc.fileStoreId,
                            additionalDetails:{category:selectedDocument?.code.split(".").slice(0,2).join('_')},
                            documentUid: doc.fileStoreId,
                            fileName: fileArray[index]?.name || "",
                            id:documents? documents.find(x => x.documentType === selectedDocument?.code)?.id:undefined,
                    })
                })
                
                return [
                    ...filteredDocumentsByFileStoreId,
                    ...newfiles,
                ];
            });
            setuploadedfileArray([]);
        }
    }

    useEffect(() => {
        uploadedfileArray.length>0 && setcodeafterupload();

        if (selectedDocument?.code) {
            setDocuments((prev) => {
                //const filteredDocumentsByDocumentType = prev?.filter((item) => item?.documentType !== selectedDocument?.code);

                if (uploadedFile === null|| uploadedFile?.fileStoreId === undefined || uploadedFile?.fileStoreId === null) {
                    if (prev?.length > 0) {
                        prev?.forEach(data => {
                            const normalDocumentType = `${data?.documentType?.split('.')[0]}.${data?.documentType?.split('.')[1]}`;
                            const selectedDocumentType = `${selectedDocument?.code?.split('.')[0]}.${selectedDocument?.code?.split('.')[1]}`;
                            if (normalDocumentType == selectedDocumentType) {
                                if (data?.documentType) data.documentType = selectedDocument?.code;
                                if (data?.file?.documentType) data.file.documentType = selectedDocument?.code;
                                
                            }
                        });
                    }
                    return prev;
                }
                const filteredDocumentsByFileStoreId = prev?.filter((item) => item?.fileStoreId !== uploadedFile.fileStoreId);
                return [
                    ...filteredDocumentsByFileStoreId,
                    {
                        documentType: selectedDocument?.code,
                        fileStoreId: uploadedFile.fileStoreId,
                        documentUid: uploadedFile.fileStoreId,
                        fileName: file?.name ||uploadedFile.fileName || "document",
                        id:documents? documents.find(x => x.documentType === selectedDocument?.code)?.id:undefined,
                    },
                ];
            });
        }
    }, [uploadedFile, selectedDocument]);

    useEffect(() => {
        if(!selectedDocument.code && uploadedFile!== null)
        setuploadedfileArray([...uploadedfileArray,uploadedFile])
    },[uploadedFile]);

    const allowedFileTypes = /(.*?)(jpg|jpeg|png|image|pdf)$/i;

    const uploadedFilesPreFill = useMemo(()=>{
        let selectedUplDocs=[];
        formData?.documents?.documents?.filter((ob) => ob.documentType === selectedDocument.code).forEach(e =>
            selectedUplDocs.push([e.fileName, {file: {name: e.fileName, type: e.documentType}, fileStoreId: {fileStoreId: e.fileStoreId, tenantId}}])
            )
        return selectedUplDocs;
    },[formData])

    // Current session uploaded files for this document type (from parent documents state)
    const sessionFiles = useMemo(() => {
        return documents?.filter(d => {
            const base = `${d?.documentType?.split('.')?.[0]}.${d?.documentType?.split('.')?.[1]}`;
            const docBase = `${doc?.code?.split('.')?.[0]}.${doc?.code?.split('.')?.[1]}`;
            return base === docBase;
        }) || [];
    }, [documents, doc?.code]);

    const displayFiles = sessionFiles.length > 0 ? sessionFiles : uploadedFilesPreFill;
    const hasUploaded = displayFiles.length > 0;

    return (
        <div style={{
            background: "#F7F8FD",
            border: "1px solid #D6D5D4",
            borderRadius: "12px",
            marginBottom: "20px",
            overflow: "hidden",
        }}>
            {/* Card Header: icon + document name */}
            <div style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "14px 20px",
                borderBottom: "1px solid #16213a",
                background: "#1D2D50",
            }}>
                <div style={{
                    width: "36px", height: "36px", borderRadius: "8px",
                    background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="8" y1="10" x2="16" y2="10" />
                        <line x1="8" y1="14" x2="14" y2="14" />
                    </svg>
                </div>
                <div style={{ fontWeight: "700", fontSize: "15px", color: "#FFFFFF" }}>
                    {doc?.required ? (
                        <React.Fragment>
                            {t(doc?.code)}&nbsp;<span style={{ color: "#ff9f80" }}>*</span>
                        </React.Fragment>
                    ) : (
                        t(doc?.code)
                    )}
                </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: "16px 20px" }}>
                {/* Description text */}
                {doc?.description && (
                    <div style={{ fontSize: "13px", color: "#505A5F", marginBottom: "12px", lineHeight: "1.5" }}>
                        {t(doc.description)}
                    </div>
                )}

                {/* Document Type dropdown — always shown when options exist */}
                {doc?.dropdownData?.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                        <div style={{ fontWeight: "700", fontSize: "13px", color: "#0B0C0C", marginBottom: "6px" }}>
                            {t("PT_DOCUMENT_TYPE_LABEL") || "Document Type"}&nbsp;
                            {doc?.required && <span style={{ color: "#d4351c" }}>*</span>}
                        </div>
                        <Dropdown
                            t={t}
                            isMandatory={false}
                            option={Digit.Utils.locale.sortDropdownNames(doc?.dropdownData, 'i18nKey', t)}
                            selected={selectedDocument}
                            optionKey="i18nKey"
                            select={handleSelectDocument}
                            placeholder={t("CS_SELECT_DOCUMENT") || "Select Document"}
                        />
                    </div>
                )}

                {/* Upload area */}
                <div style={{
                    border: "1.5px dashed #B1B4B6",
                    borderRadius: "8px",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    background: "#FFFFFF",
                }}>
                    {/* Upload cloud icon */}
                    <div style={{
                        width: "48px", height: "48px", borderRadius: "8px",
                        background: "#F3F2F1", display: "flex", alignItems: "center",
                        justifyContent: "center", flexShrink: 0,
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#505A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 16 12 12 8 16" />
                            <line x1="12" y1="12" x2="12" y2="21" />
                            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                        </svg>
                    </div>

                    {/* File status text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {hasUploaded ? (
                            <div style={{ fontWeight: "600", fontSize: "14px", color: "#1D70B8" }}>
                                {displayFiles.length}&nbsp;{displayFiles.length === 1 ? "file uploaded" : "files uploaded"}
                            </div>
                        ) : (
                            <div style={{ fontWeight: "600", fontSize: "14px", color: "#0B0C0C" }}>
                                No File Uploaded
                            </div>
                        )}
                        <div style={{ fontSize: "12px", color: "#6F777B", marginTop: "2px" }}>
                            JPG · PNG · PDF · Max 5MB
                        </div>
                    </div>

                    {/* Browse button with transparent MultiUploadWrapper on top */}
                    <div style={{ flexShrink: 0, position: "relative", minWidth: "100px", height: "40px" }}>
                        <div style={{
                            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                            background: "#1D2D50", color: "#FFFFFF", borderRadius: "4px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: "700", fontSize: "14px", letterSpacing: "0.3px",
                            pointerEvents: "none", userSelect: "none",
                        }}>
                            Browse
                        </div>
                        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, overflow: "hidden" }}>
                            <MultiUploadWrapper
                                module="BPA"
                                tenantId={tenantId}
                                getFormState={getData}
                                setuploadedstate={uploadedFilesPreFill}
                                t={t}
                                extraStyleName={"OBPS"}
                                allowedFileTypesRegex={allowedFileTypes}
                                allowedMaxSizeInMB={5}
                                acceptFiles="image/*, .pdf, .png, .jpeg, .jpg"
                            />
                        </div>
                    </div>
                </div>

                {/* Uploaded file tags */}
                {displayFiles.length > 0 && (
                    <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {displayFiles.map((f, idx) => {
                            const name = Array.isArray(f) ? f[0] : f?.fileName || f?.documentType || "";
                            return (
                                <span key={idx} style={{
                                    background: "#E8F4E8", border: "1px solid #A8D8AA", borderRadius: "4px",
                                    padding: "4px 10px", fontSize: "12px", color: "#2E7D32", fontWeight: "500",
                                }}>
                                    {name}
                                </span>
                            );
                        })}
                    </div>
                )}

                {doc?.uploadedDocuments?.length && <DocumentsPreview isSendBackFlow={true} documents={doc?.uploadedDocuments} />}
            </div>
        </div>
    );
    });

export default DocumentDetails;
