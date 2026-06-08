import { Dropdown, FormStep, Loader, TextInput, Toast, UploadFile } from "@upyog/digit-ui-react-components";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { getPattern, stringReplaceAll, sortDropdownNames  } from "../utils";

const cardStyle = {
    background: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e8ecf0",
    padding: "20px 24px",
    marginBottom: "20px",
};

const labelStyle = {
    display: "block",
    fontWeight: "600",
    fontSize: "13px",
    color: "#3d4f6b",
    marginBottom: "8px",
};

const EDCRForm = ({ t, config, onSelect, userType, formData, ownerIndex = 0, addNewOwner, isShowToast, isSubmitBtnDisable, setIsShowToast }) => {
    const { pathname: url } = useLocation();
    const tenantId = Digit.ULBService.getCurrentTenantId();
    const stateId = Digit.ULBService.getStateId();
    const [citymoduleList, setCitymoduleList] = useState([]);
    const [name, setName] = useState(formData?.Scrutiny?.[0]?.applicantName);
    const [tenantIdData, setTenantIdData] = useState(formData?.Scrutiny?.[0]?.tenantIdData);
    const [uploadedFile, setUploadedFile] = useState(() => formData?.Scrutiny?.[0]?.proofIdentity?.fileStoreId || null);
    const [file, setFile] = useState(formData?.owners?.documents?.proofIdentity);
    const [error, setError] = useState(null);
    const [uploadMessage, setUploadMessage] = useState("");
    const [showToast, setShowToast] = useState(null);
    const fileInputRef = useRef(null);
    const history = useHistory();

    let validation = { };

    function setApplicantName(e) {
        const value = e.target.value;
        setError(null);
        if (!/^[a-zA-Z ]+$/.test(value)) {
            setError(t("APPLICANT_NAME_INVALID_PATTERN"));
        } else {
            setError(null);
        }
        setName(e.target.value);
    }

    function setTypeOfTenantID(value) {
        setTenantIdData(value);
    }

    function selectfile(e) {
        setUploadedFile(e.target.files[0]);
        setFile(e.target.files[0]);
    }

    const onSkip = () => {
        setUploadMessage("NEED TO DELETE");
    };

    const { isLoading, data: citymodules } = Digit.Hooks.obps.useMDMS(stateId, "tenant", ["citymodule"]);

    useEffect(() => {
        if (citymodules?.tenant?.citymodule?.length > 0) {
            const list = citymodules?.tenant?.citymodule?.filter(data => data.code == "BPAAPPLY");
            list?.[0]?.tenants?.forEach(data => {
                data.i18nKey = `TENANT_TENANTS_${stringReplaceAll(data?.code?.toUpperCase(), ".", "_")}`;
            });
            if (Array.isArray(list?.[0]?.tenants)) list?.[0]?.tenants.reverse();
            let sortTenants = sortDropdownNames(list?.[0]?.tenants, "code", t);
            setCitymoduleList(sortTenants);
        }
    }, [citymodules]);

    useEffect(() => {
        if (uploadMessage || isShowToast) {
            setName("");
            setTenantIdData("");
            setUploadedFile(null);
            setFile("");
            setUploadMessage("");
        }
        if (isShowToast) {
            history.replace(
                `/suda-ui/citizen/obps/edcrscrutiny/apply/acknowledgement`,
                { data: isShowToast?.label ? isShowToast?.label : "BPA_INTERNAL_SERVER_ERROR", type: "ERROR" }
            );
        }
    }, [uploadMessage, isShowToast, isSubmitBtnDisable]);

    function onAdd() {
        setUploadMessage("NEED TO DELETE");
    }

    const handleSubmit = () => {
        const data = { };
        data.tenantId = tenantIdData;
        data.applicantName = name;
        data.file = file;
        onSelect(config.key, data);
    };

    if (isLoading || isSubmitBtnDisable) {
        return <Loader />;
    }

    return (
        <div className="edcr-form-page">
            <style>{".edcr-form-page .card-caption, .edcr-form-page .card-text { display: none !important; }"}</style>

            {/* Hero Banner */}
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
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="3" y1="9" x2="21" y2="9"/>
                        <line x1="9" y1="21" x2="9" y2="9"/>
                    </svg>
                </div>
                <div>
                    <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>
                        {t("EDCR_SCRUTINY_TITLE") || "eDCR Scrutiny"}
                    </div>
                    <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
                        {t("EDCR_COMMON_APPL_NEW") || "New Plan Scrutiny Application"}
                    </h2>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>
                        {t("BPA_PROVIDE_REQ_FOR_NEW_BPA") || "Upload your building plan for scrutiny"}
                    </p>
                </div>
            </div>

            <FormStep
                t={t}
                config={config}
                onSelect={handleSubmit}
                onSkip={onSkip}
                isDisabled={!tenantIdData || !name || !file || isSubmitBtnDisable}
                onAdd={onAdd}
                forcedError={error}
                isMultipleAllow={true}
            >
                {/* Application Details Card */}
                <div style={cardStyle}>
                    <div style={{
                        fontWeight: "700", fontSize: "15px", color: "#1a2b49",
                        marginBottom: "18px", paddingBottom: "10px",
                        borderBottom: "2px solid #f47738",
                    }}>
                        {t("EDCR_APPLICATION_DETAILS") || "Application Details"}
                    </div>

                    {/* City */}
                    <div style={{ marginBottom: "18px" }}>
                        <label style={labelStyle}>
                            {t("EDCR_SCRUTINY_CITY")}<span style={{ color: "#e54d42", marginLeft: "3px" }}>*</span>
                        </label>
                        <Dropdown
                            t={t}
                            isMandatory={false}
                            option={citymoduleList}
                            selected={tenantIdData}
                            optionKey="i18nKey"
                            select={setTypeOfTenantID}
                            uploadMessage={uploadMessage}
                        />
                    </div>

                    {/* Applicant Name */}
                    <div style={{ marginBottom: "18px" }}>
                        <label style={labelStyle}>
                            {t("EDCR_SCRUTINY_NAME_LABEL")}<span style={{ color: "#e54d42", marginLeft: "3px" }}>*</span>
                        </label>
                        <TextInput
                            isMandatory={false}
                            optionKey="i18nKey"
                            t={t}
                            name="applicantName"
                            onChange={setApplicantName}
                            uploadMessage={uploadMessage}
                            value={name}
                            {...(validation = {
                                isRequired: true,
                                pattern: "^[a-zA-Z ]+$",
                                type: "text",
                                title: t("TL_NAME_ERROR_MESSAGE"),
                            })}
                        />
                        {error && <div style={{ color: "#e54d42", fontSize: "12px", marginTop: "4px" }}>{error}</div>}
                    </div>

                    {/* Plan Diagram Upload */}
                    <div>
                        <label style={labelStyle}>
                            {t("BPA_PLAN_DIAGRAM_LABEL")}<span style={{ color: "#e54d42", marginLeft: "3px" }}>*</span>
                        </label>

                        {/* Custom upload zone */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: "2px dashed #b0bed0",
                                borderRadius: "10px",
                                background: "#fff",
                                padding: "18px 20px",
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                                cursor: "pointer",
                            }}
                        >
                            <div style={{
                                width: "48px", height: "48px", borderRadius: "10px",
                                background: "#eef2f8", display: "flex", alignItems: "center",
                                justifyContent: "center", flexShrink: 0,
                            }}>
                                {file ? (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                ) : (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a2b49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                                    </svg>
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                {file ? (
                                    <>
                                        <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a2b49", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {file?.name || t("PT_ACTION_FILEUPLOADED")}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#22c55e", marginTop: "2px", fontWeight: "600" }}>
                                            ✓ {t("PT_ACTION_FILEUPLOADED") || "File selected"}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a2b49" }}>
                                            {t("ES_NO_FILE_SELECTED_LABEL") || "No File Selected"}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#7a8a9e", marginTop: "2px" }}>
                                            {t("EDCR_UPLOAD_FILE_LIMITS_LABEL") || "DXF · Max file size 5MB"}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                                {file && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setFile(""); }}
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
                        <input
                            ref={fileInputRef}
                            id="edcr-doc"
                            type="file"
                            style={{ display: "none" }}
                            onChange={selectfile}
                        />
                    </div>
                </div>

                {isShowToast && <Toast error={isShowToast.key} label={t(isShowToast.label)} onClose={() => setIsShowToast(null)} isDleteBtn={true} />}
            </FormStep>
        </div>
    );
};

export default EDCRForm;

