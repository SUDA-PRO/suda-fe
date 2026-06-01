import { Card, CardHeader, CardSubHeader, CardText, Loader, SubmitBar } from "@upyog/digit-ui-react-components";
import React, { useEffect } from "react";
import { cardBodyStyle, stringReplaceAll } from "../utils";
//import { map } from "lodash-es";

const PropertyTax = ({ t, config, onSelect, userType, formData }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  sessionStorage.removeItem("docReqScreenByBack");

  const docType = config?.isMutation ? ["MutationDocuments"] : "Documents";

  const { isLoading, data: Documentsob = {} } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", docType);

  let docs = Documentsob?.PropertyTax?.[config?.isMutation ? docType[0] : docType];
  if (!config?.isMutation) docs = docs?.filter((doc) => doc["digit-citizen"]);
  function onSave() {}

  function goNext() {
    onSelect();
  }
  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  function generateCodeVerifier(length) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let codeVerifier = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      codeVerifier += characters.charAt(randomIndex);
    }
    return codeVerifier;
  }
  function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest("SHA-256", data);
  }
  function base64UrlEncode(buffer) {
    const padding = "=".repeat((4 - (buffer.length % 4)) % 4);
    const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
    return (
      base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") + padding
    );
  }
  async function generateCodeChallenge(codeVerifier) {
    const hashedBuffer = await sha256(codeVerifier);
    const codeChallenge = base64UrlEncode(hashedBuffer);
    return codeChallenge;
  }
  useEffect(()=>{
window.process={...window.process}
// console.log("enviorement Variable",process.env.NODE_ENV,process.env.REACT_APP_PROXY_API,
// process.env)

  },[])

  const {  isSuccess,error,count, mutate: assessmentMutate } = Digit.Hooks.createTokenAPI();
const onConcent=async (e)=>{
  const data = await Digit.DigiLockerService.authorization({module:"PT"});
  e.preventDefault()
  console.log("data",data)
  sessionStorage.setItem("code_verfier",data?.dlReqRef)
  //let redirectURL=data?.redirectURL.replace("https://upyog-test.niua.org","http://localhost:3000")
  window.location.href=data?.redirectURL
    /* Number of Random Bytes to Use to Generate Code Verifier (min 32, max 96 bytes) */
    // const randomByte = randomIntFromInterval(44, 96);
    // const codeVerifier = generateCodeVerifier(randomByte);
    // setItemWithExpiry('DigiLocker.codeVerifier', codeVerifier, 60);
    // /* Generate Code Challenge */
    // generateCodeChallenge(codeVerifier)
    //   .then((codeChallenge) => {
     
    //     console.log("Code Verifier:", codeVerifier);
    //     console.log("Code Challenge:", codeChallenge);
    //       window.location.href =`https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize?response_type=code&client_id=AT3053EB6D&state=oidc_flow&redirect_uri=http%3A%2F%2Flocalhost:3000%2Fdigit-ui%2Fcitizen%2Fpt%2Fproperty%2Fnew-application%2Finfo&code_challenge=${codeChallenge}&code_challenge_method=S256&dl_flow=signin`;
        
    //   })
    //   .catch((error) => {
    //     console.error("An error occurred:", error);
    //   });
      
 
}
// const useTLSearch = (params, config) => {
//   return async () => {
//     const data = await Digit.TLService.search(params, config);
//     const tenant = data?.Licenses?.[0]?.tenantId;
//     const businessIds = data?.Licenses.map((application) => application.applicationNumber);
//     const workflowRes = await Digit.WorkflowService.getAllApplication(tenant, { businessIds: businessIds.join() });
//     return combineResponse(data?.Licenses, workflowRes?.ProcessInstances, data?.Count);
//   };
// };
useEffect(async ()=>{
  //sessionStorage.setItem("DigiLocker.token1","cf87055822e4aa49b0ba74778518dc400a0277e5")
if(window.location.href.includes("code"))
{
  let code =window.location.href.split("=")[1].split("&")[0]
  let TokenReq = {
    dlReqRef: sessionStorage.getItem("code_verfier"),
    code: code, module: "PT"
  }
  console.log("token",code,TokenReq,sessionStorage.getItem("code_verfier"))
  const data = await Digit.DigiLockerService.token({TokenReq })
  sessionStorage.setItem("DigiLocker.token1",data?.TokenRes?.access_token)
  //sessionStorage.setItem("DigiLocker.token1",data?.)
  //const data = await Digit.DigiLockerService.token(TokenReq);
  // assessmentMutate(
  //   { TokenReq
  //   },
  //   {
  //     onError: (error, variables) => {
  //       console.log("error:123 ",error)
  //       //setShowToast({ key: "error", action: error?.response?.data?.Errors[0]?.message || error.message, error : {  message:error?.response?.data?.Errors[0]?.code || error.message } });
  //       setTimeout(closeToast, 5000);
  //     },
  //     onSuccess: (data, variables) => {
  //       //sessionStorage.setItem("IsPTAccessDone", data?.Assessments?.[0]?.auditDetails?.lastModifiedTime);
  //     console.log("success",data,isSuccess,variables)
  //     sessionStorage.setItem("DigiLocker.token1","94e648239a5096773d18774fb97b37f00a413587")
        
  //     },
  //   }
  // );
  //console.log("tokenData",data)
  // fetch('https://api.digitallocker.gov.in/public/oauth2/1/token', {
  //   method: 'POST',
  //   mode: 'cors',
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //     "Access-Control-Allow-Origin": "*",
  //     "Access-Control-Allow-Methods": "PUT, DELETE,POST"
  //   },
  //   body: new URLSearchParams({
  //     'code': code,
  //     'grant_type': "authorization_code",
  //     'client_id': "AT3053EB6D",
  //     "client_secret": "75fa589aa7c35b89e127",
  //     "redirect_uri": "http://localhost:3000/suda-ui/citizen/pt/property/new-application/info",
  //     "code_verifier": getItemWithExpiry('DigiLocker.codeVerifier')
  //   })
  // }) .then(response =>
  //   response.json().then(data => ({
  //     data: data,

  //   })).then(res => {
  //     console.log("step 1",res)
  //     //code1 = "Bearer " + res.data.access_token
  //     sessionStorage.setItem('DigiLocker.token1', res.data.access_token)
  //     setItemWithExpiry('DigiLocker.token', res.data.access_token, 60);
  //   }))
  
}
},[])
// Function to set data with an expiration time in sessionStorage
function setItemWithExpiry(key, value, expiryMinutes) {
  const now = new Date();
  const expiryTime = now.getTime() + (expiryMinutes * 60 * 1000); // Convert minutes to milliseconds

  const item = {
    value: value,
    expiry: expiryTime
  };

  sessionStorage.setItem(key, JSON.stringify(item));
}

// Function to get data from sessionStorage, checking for expiration
function getItemWithExpiry(key) {
  const itemString = sessionStorage.getItem(key);

  if (!itemString) {
    return null;
  }

  const item = JSON.parse(itemString);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    // Item has expired, remove it
    sessionStorage.removeItem(key);
    return null;
  }

  return item.value;
}

  return (
    <React.Fragment>
      {/* ── Page wrapper ── */}
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
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700", letterSpacing: "0.3px" }}>
              {!config.isMutation ? t("PT_DOC_REQ_SCREEN_HEADER") : t("PT_REQIURED_DOC_TRANSFER_OWNERSHIP")}
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: "14px", opacity: 0.88 }}>
              {t("PT_DOC_REQ_SCREEN_SUB_HEADER")}
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
              {t("PT_DOC_REQ_SCREEN_TEXT")}
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
            📋 {t("PT_DOC_REQ_SCREEN_LABEL")}
          </div>

          {isLoading && <Loader />}

          {Array.isArray(docs) ? (
            <div>
              {(config?.isMutation
                ? docs.map(({ code, dropdownData }, index) => ({
                    heading: t(code),
                    items: dropdownData.map((d) => t(d?.code)),
                    index,
                  }))
                : docs.map(({ code, dropdownData }, index) => ({
                    heading: t("PROPERTYTAX_" + stringReplaceAll(code, ".", "_") + "_HEADING"),
                    items: dropdownData.map((d) => t("PROPERTYTAX_" + stringReplaceAll(d?.code, ".", "_") + "_LABEL")),
                    index,
                  }))
              ).map(({ heading, items, index }) => (
                <div key={index} style={{
                  display: "flex", gap: "16px", marginBottom: "20px",
                  paddingBottom: "20px",
                  borderBottom: index < docs.length - 1 ? "1px dashed #e0e0e0" : "none",
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
                      {heading}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {items.map((item, i) => (
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
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* ── Action buttons ── */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "8px" }}>
          <button
            onClick={onSelect}
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
            {t("PT_COMMON_NEXT")} →
          </button>

        </div>

      </div>
    </React.Fragment>
  );
};

export default PropertyTax;
