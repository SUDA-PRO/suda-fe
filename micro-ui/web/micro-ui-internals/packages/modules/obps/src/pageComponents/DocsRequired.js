import React, { Fragment, useEffect, useState } from "react";
import { CitizenInfoLabel, Loader, SubmitBar } from "@upyog/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";

const DocsRequired = ({ onSelect, onSkip, config }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateCode = Digit.ULBService.getStateId();
  const history = useHistory();
  const { applicationType: applicationType, serviceType: serviceType } = useParams();
  const [docsList, setDocsList] = useState([]);
  const [uiFlow, setUiFlow] = useState([]);
  const { data, isLoading } = Digit.Hooks.obps.useMDMS(stateCode, "BPA", "DocumentTypes");
  const { isLoading: commonDocsLoading, data: commonDocs } = Digit.Hooks.obps.useMDMS(stateCode, "common-masters", ["DocumentType"]);
  const { isMdmsLoading, data: mdmsData } = Digit.Hooks.obps.useMDMS(stateCode, "BPA", ["RiskTypeComputation"]);
  const userInfo = Digit.UserService.getUser();
  const queryObject = { 0: { tenantId: stateCode }, 1: { id: userInfo?.info?.id } };
  const { data: LicenseData, isLoading:LicenseDataLoading } = Digit.Hooks.obps.useBPAREGSearch(tenantId, queryObject);
  const checkingUrl = window.location.href.includes("ocbpa");
  sessionStorage.removeItem("clickOnBPAApplyAfterEDCR");

  const { data:homePageUrlLinks , isLoading: homePageUrlLinksLoading } = Digit.Hooks.obps.useMDMS(stateCode, "BPA", ["homePageUrlLinks"]);


  const goNext = () => {
    if(JSON.parse(sessionStorage.getItem("BPAintermediateValue")) !== null)
    {
    let formData = JSON.parse(sessionStorage.getItem("BPAintermediateValue"))
    sessionStorage.setItem("BPAintermediateValue",null);
    onSelect("",formData);
    }
    else
    onSelect("uiFlow", uiFlow);
  }

  useEffect(() => {
    let architectName = "", isDone = true;
    for (let i = 0; i < LicenseData?.Licenses?.length; i++) {
      if (LicenseData?.Licenses?.[i]?.status === "APPROVED" && isDone) {
        isDone = false;
        architectName = LicenseData?.Licenses?.[i]?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split('.')[0] || "ARCHITECT";
        sessionStorage.setItem("BPA_ARCHITECT_NAME", JSON.stringify(architectName));
      }
    }
  }, [LicenseData])

  useEffect(() => {
    if (!homePageUrlLinksLoading) {
      const windowUrl = window.location.href.split('/');
      const serviceType = windowUrl[windowUrl.length - 2];
      const applicationType = windowUrl[windowUrl.length - 3];
      homePageUrlLinks?.BPA?.homePageUrlLinks?.map(linkData => {
        if(applicationType?.toUpperCase() === linkData?.applicationType && serviceType?.toUpperCase() === linkData?.serviceType) {
          setUiFlow({
            flow: linkData?.flow,
            applicationType: linkData?.applicationType,
            serviceType: linkData?.serviceType
          });
        }
      });
    }
  }, [!homePageUrlLinksLoading]);

  useEffect(() => {
    if (!isLoading) {
      let unique = [], distinct = [], uniqueData = [], uniqueList = [];
      const windowUrl = window.location.href.split('/');
      const serviceType = windowUrl[windowUrl.length - 2];
      const applicationType = windowUrl[windowUrl.length - 3];
      for (let i = 0; i < data.length; i++) {
        if (!unique[data[i].applicationType] && !unique[data[i].ServiceType]) {
          distinct.push(data[i].applicationType);
          unique[data[i].applicationType] = data[i];
        }
      }
      Object.values(unique).map(indData => {
        if (indData?.applicationType == applicationType?.toUpperCase() && indData?.ServiceType == serviceType?.toUpperCase()) {
          uniqueList.push(indData?.docTypes);
        }
        uniqueList?.[0]?.forEach(doc => {
          let code = doc.code; doc.dropdownData = [];
          commonDocs?.["common-masters"]?.DocumentType?.forEach(value => {
            let values = value.code.slice(0, code.length);
            if (code === values) {
              doc.hasDropdown = true;
              value.i18nKey = value.code;
              doc.dropdownData.push(value);
            }
          });
        });
        setDocsList(uniqueList);
      })
    }
  }, [!isLoading]);

  if (isLoading) {
    return <Loader />;
  }

  const cardStyle = { background: "#ffffff", borderRadius: "10px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: "24px 28px", marginBottom: "24px", border: "1px solid #e8ecf0" };
  const sectionTitleStyle = { fontSize: "15px", fontWeight: "700", color: "#1a2b49", marginBottom: "20px", paddingBottom: "10px", borderBottom: "2px solid #f47738", letterSpacing: "0.3px" };

  return (
    <div>
      {/* Hero Banner */}
      <div style={{ background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)", borderRadius: "12px", padding: "28px 36px", marginBottom: "24px", color: "#fff", display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>
            {checkingUrl ? t("BPA_OC_APPLICATION") || "OC Application" : t("BPA_NEW_BUILDING_PERMIT") || "New Building Permit"}
          </div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
            {checkingUrl ? t("BPA_OOCUPANCY_CERTIFICATE_APP_LABEL") : t("OBPS_NEW_BUILDING_PERMIT")}
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>
            {t("OBPS_NEW_BUILDING_PERMIT_DESCRIPTION")}
          </p>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={sectionTitleStyle}>{t("BPA_REQUIRED_DOCUMENTS") || "Required Documents"}</div>
        {isLoading ? <Loader /> : (
          <Fragment>
            {docsList?.[0]?.map((doc, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ minWidth: "32px", height: "32px", borderRadius: "50%", background: "#f47738", color: "#fff", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "12px", flexShrink: 0 }}>{index + 1}</div>
                  <div style={{ fontWeight: 700, color: "#1a2b49", fontSize: "15px" }}>{t(doc?.code.replace(".", "_"))}</div>
                </div>
                {doc?.dropdownData?.length > 0 && (
                  <div style={{ marginLeft: "44px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {doc.dropdownData.map((value, i) => (
                      <span key={i} style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        border: "1px solid #c2d0e8", borderRadius: "20px",
                        padding: "5px 14px", fontSize: "13px", color: "#1a2b49",
                        background: "#e8edf5", fontWeight: "500"
                      }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#f47738" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {`${i + 1}. ${t(value?.i18nKey)}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Fragment>
        )}
        <SubmitBar label={t("CS_COMMON_NEXT")} onSubmit={goNext} />
      </div>
      <CitizenInfoLabel info={t("CS_FILE_APPLICATION_INFO_LABEL")} text={t("OBPS_DOCS_FILE_SIZE")} className={"info-banner-wrap-citizen-override"} />
    </div>
  );
};

export default DocsRequired;