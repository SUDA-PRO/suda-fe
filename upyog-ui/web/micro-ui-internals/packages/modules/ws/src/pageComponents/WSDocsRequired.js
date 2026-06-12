import React, { Fragment } from "react";
import { Card, CardHeader, SubmitBar, CitizenInfoLabel, CardText, Loader, CardSubHeader, BackButton, BreadCrumb, Header, CardLabel, CardSectionHeader, CardCaption, ActionBar, PrintBtnCommon } from "@upyog/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router-dom";

const WSDocsRequired = ({ onSelect, userType, onSkip, config }) => {
  const { t } = useTranslation();
  const history = useHistory()
  const match = useRouteMatch();
  const tenantId = Digit.ULBService.getStateId();
  const goNext = () => {
    onSelect("DocsReq", "");
  }

  sessionStorage.removeItem("Digit.PT_CREATE_EMP_WS_NEW_FORM");
  sessionStorage.removeItem("IsDetailsExists");
  sessionStorage.removeItem("FORMSTATE_ERRORS");

  const { isLoading: wsDocsLoading, data: wsDocs } = Digit.Hooks.ws.WSSearchMdmsTypes.useWSServicesMasters(tenantId);

  if (userType === "citizen") {
    return (
      <Fragment>
        <div style={{ maxWidth: "100%", fontFamily: "'Roboto', sans-serif" }}>

          {/* ── Hero Banner ── */}
          <div style={{
            background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)",
            borderRadius: "12px",
            padding: "32px 36px",
            marginBottom: "24px",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700", letterSpacing: "0.3px" }}>
                {t(`WS_COMMON_APPL_NEW_CONNECTION`)}
              </h2>
              <p style={{ margin: "6px 0 0", fontSize: "14px", opacity: 0.88 }}>
                {t(`WS_DOCS_REQUIRED_TIME`)}
              </p>
            </div>
          </div>

          {/* ── Info card ── */}
          <div style={{
            background: "#fff8f0",
            border: "1px solid #f4d0b0",
            borderLeft: "4px solid #f47738",
            borderRadius: "8px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            gap: "14px",
            alignItems: "flex-start",
          }}>
            <span style={{ fontSize: "22px", lineHeight: 1 }}>ℹ️</span>
            <div>
              <p style={{ margin: 0, fontSize: "14px", color: "#5c3a1e", fontWeight: "600" }}>
                {t(`WS_NEW_CONNECTION_TEST_1`)}
              </p>
              <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#5c3a1e" }}>
                {t(`WS_NEW_CONNECTION_TEST_2`)}
              </p>
              <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#5c3a1e" }}>
                {t(`WS_NEW_CONNECTION_TEST_3`)}
              </p>
            </div>
          </div>

          {/* ── Documents checklist card ── */}
          <div style={{
            background: "#ffffff",
            borderRadius: "10px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            padding: "24px 28px",
            marginBottom: "24px",
            border: "1px solid #e8ecf0",
          }}>
            <div style={{
              fontSize: "15px", fontWeight: "700", color: "#1a2b49",
              marginBottom: "20px", paddingBottom: "10px",
              borderBottom: "2px solid #f47738", letterSpacing: "0.3px",
            }}>
              📋 {t("WS_DOC_REQ_SCREEN_LABEL")}
            </div>

            {wsDocsLoading ? <Loader /> : (
              <Fragment>
                {wsDocs?.Documents?.map((doc, index) => (
                  <div key={index} style={{
                    display: "flex", gap: "16px", marginBottom: "20px",
                    paddingBottom: "20px",
                    borderBottom: index < wsDocs.Documents.length - 1 ? "1px dashed #e0e0e0" : "none",
                  }}>
                    {/* Number badge */}
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: "#1a2b49", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "14px", fontWeight: "700", flexShrink: 0, marginTop: "2px",
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a2b49", marginBottom: "10px" }}>
                        {t(doc?.code.replace('.', '_'))}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {doc?.dropdownData?.map((value, i) => (
                          <span key={i} style={{
                            background: "#f0f4ff",
                            border: "1px solid #c5d0f0",
                            borderRadius: "20px",
                            padding: "4px 14px",
                            fontSize: "12px",
                            color: "#3d4f6b",
                            fontWeight: "500",
                            display: "flex", alignItems: "center", gap: "5px",
                          }}>
                            <span style={{ color: "#f47738", fontWeight: "bold" }}>✓</span>
                            {t(value?.i18nKey)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </Fragment>
            )}
          </div>

          {/* ── Action button ── */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "8px" }}>
            <button
              onClick={goNext}
              style={{
                flex: 1, minWidth: "180px",
                background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)",
                color: "#fff", border: "none",
                borderRadius: "8px", padding: "14px 28px",
                fontSize: "15px", fontWeight: "700",
                cursor: "pointer", letterSpacing: "0.3px",
                boxShadow: "0 4px 12px rgba(244,119,56,0.35)",
                transition: "all 0.2s",
              }}
            >
              {t(`CS_COMMON_NEXT`)} →
            </button>
          </div>

        </div>
      </Fragment>
    );
  }

  const printDiv = () => {
    let content = document.getElementById("documents-div").innerHTML;
    //APK button to print required docs
    if(window.mSewaApp && window.mSewaApp.isMsewaApp()){
      window.mSewaApp.downloadBase64File(window.btoa(content), t("WS_REQ_DOCS"));
    }
    else{
    let printWindow = window.open("", "");
    printWindow.document.write(`<html><body>${content}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    }
  };
  

  return (
    <div style={{ maxWidth: "100%", fontFamily: "'Roboto', sans-serif", margin: "16px" }}>

      {/* ── Hero Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)",
        borderRadius: "12px",
        padding: "32px 36px",
        marginBottom: "24px",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z"/>
              <path d="M3 20c0-4 4-7 9-7s9 3 9 7"/>
            </svg>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700", letterSpacing: "0.3px" }}>
              {t("WS_WATER_AND_SEWERAGE_NEW_CONNECTION_LABEL")}
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: "14px", opacity: 0.88 }}>
              {t("WS_DOCS_REQUIRED_TIME")}
            </p>
          </div>
        </div>
        <div onClick={printDiv} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.15)", borderRadius: "8px", padding: "10px 18px" }}>
          <PrintBtnCommon />
          <span style={{ fontSize: "16px", fontWeight: "600", color: "#fff" }}>{"Print"}</span>
        </div>
      </div>

      {/* ── Documents checklist card ── */}
      <div style={{
        background: "#ffffff",
        borderRadius: "10px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        padding: "24px 28px",
        marginBottom: "24px",
        border: "1px solid #e8ecf0",
      }}>
        <div style={{
          fontSize: "15px", fontWeight: "700", color: "#1a2b49",
          marginBottom: "20px", paddingBottom: "10px",
          borderBottom: "2px solid #f47738", letterSpacing: "0.3px",
        }}>
          📋 {t("WS_DOC_REQ_SCREEN_LABEL")}
        </div>

        {wsDocsLoading ? <Loader /> : (
          <div id="documents-div">
            {wsDocs?.Documents?.map((doc, index) => (
              <div key={index} style={{
                display: "flex", gap: "16px", marginBottom: "20px",
                paddingBottom: "20px",
                borderBottom: index < wsDocs.Documents.length - 1 ? "1px dashed #e0e0e0" : "none",
              }}>
                {/* Number badge */}
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "#1a2b49", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", fontWeight: "700", flexShrink: 0, marginTop: "2px",
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a2b49", marginBottom: "6px" }}>
                    {t(doc?.code.replace('.', '_'))}
                  </div>
                  {doc.dropdownData && doc.dropdownData.length > 1 && (
                    <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#5c3a1e" }}>
                      {t(`${doc?.code.replace('.', '_')}_DESCRIPTION`)}
                    </p>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {doc?.dropdownData?.map((value, idx) => (
                      <span key={idx} style={{
                        background: "#f0f4ff",
                        border: "1px solid #c5d0f0",
                        borderRadius: "20px",
                        padding: "4px 14px",
                        fontSize: "12px",
                        color: "#3d4f6b",
                        fontWeight: "500",
                        display: "flex", alignItems: "center", gap: "5px",
                      }}>
                        <span style={{ color: "#f47738", fontWeight: "bold" }}>✓</span>
                        {t(value?.i18nKey)}
                      </span>
                    ))}
                  </div>
                  {t(`${doc?.code.replace('.', '_')}_BELOW_DESCRIPTION`) !== `${doc?.code.replace('.', '_')}_BELOW_DESCRIPTION` && (
                    <p style={{ margin: "10px 0 0", fontSize: "13px", color: "#666" }}>
                      {t(`${doc?.code.replace('.', '_')}_BELOW_DESCRIPTION`)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Action button ── */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "8px" }}>
        <button
          onClick={() => { history.push(match.path.replace("create-application", "new-application")); }}
          disabled={wsDocsLoading}
          style={{
            flex: 1, minWidth: "180px",
            background: wsDocsLoading
              ? "#ccc"
              : "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)",
            color: "#fff", border: "none",
            borderRadius: "8px", padding: "14px 28px",
            fontSize: "15px", fontWeight: "700",
            cursor: wsDocsLoading ? "not-allowed" : "pointer",
            letterSpacing: "0.3px",
            boxShadow: wsDocsLoading ? "none" : "0 4px 12px rgba(244,119,56,0.35)",
            transition: "all 0.2s",
          }}
        >
          {t("ACTION_TEST_APPLY")} →
        </button>
      </div>

    </div>
  )
};

export default WSDocsRequired;