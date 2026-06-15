import { Toast } from "@upyog/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { convertEpochToDateCitizen, getvalidfromdate } from "../../../utils/index";
import {TLSearch} from "../../../../../../libraries/src/services/molecules/TL/Search";
import cloneDeep from "lodash/cloneDeep";

const statusConfig = {
  APPROVED:      { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0", label: "TL_ACTIVE_STATUS_MSG_SHORT" },
  EXPIRED:       { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", label: "TL_EXPIRED_STATUS_MSG_SHORT" },
  MANUALEXPIRED: { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", label: "TL_EXPIRED_STATUS_MSG_SHORT" },
  CANCELLED:     { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db", label: "WF_NEWTL_CANCELLED" },
};

const TradeLicenseList = ({ application }) => {
  sessionStorage.setItem("isDirectRenewal", true);
  const history = useHistory();
  const owners = application?.tradeLicenseDetail?.owners;
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const [allowedToNextYear, setAllowedToNextYear] = useState(false);
  const [oldRenewalAppNo, setoldRenewalAppNo] = useState("");
  const [showToast, setShowToast] = useState(null);
  const [latestRenewalYearofAPP, setlatestRenewalYearofAPP] = useState("");
  const [numOfApplications, setNumberOfApplications] = useState([]);
  const { isLoading, data: fydata = {} } = Digit.Hooks.tl.useTradeLicenseMDMS(stateId, "egf-master", "FinancialYear");
  let mdmsFinancialYear = fydata["egf-master"] ? fydata["egf-master"].FinancialYear.filter((y) => y.module === "TL") : [];
  const [isrenewalspresent,setIsrenewalspresent] =useState(false)

  async function apicall(application) {
    let res = await Digit.TLService.TLsearch({ tenantId: application.tenantId, filters: { licenseNumbers: application.licenseNumber } });
    let Licenses = res.Licenses;
    let FY = getvalidfromdate("", mdmsFinancialYear).finYearRange;
    Licenses &&
      Licenses?.map((ob) => {
        if (ob.financialYear === FY) {
          setIsrenewalspresent(true)
        }
      });
    if (isrenewalspresent && Licenses) {
      alert(t("TL_RENEWAL_PRESENT_ERROR"));
    } else if (Licenses) {
      history.push(`/suda-ui/citizen/tl/tradelicence/edit-application/action-edit/${application.applicationNumber}`);
    }
  }

  const getToastMessages = () => {
    if(isrenewalspresent){
      setShowToast({ error: true, label: `${t("TL_RENEWAL_PRESENT_ERROR")}` });
    }
    else if(allowedToNextYear == false && oldRenewalAppNo && application?.status !== "MANUALEXPIRED")
    {
      setShowToast({ error: true, label: `${t("TL_ERROR_TOAST_RENEWAL_1")} ${oldRenewalAppNo} ${t("TL_ERROR_TOAST_RENEWAL_2")}` });
    }
    else if(application?.status === "CANCELLED")
    {
      setShowToast({ error: true, label: `${t("TL_ERROR_TOAST_RENEWAL_CANCEL")}` });
    }
    else if(application?.status === "MANUALEXPIRED")
    {
      setShowToast({ error: true, label: `${t("TL_ERROR_TOAST_MUTUALLY_EXPIRED")}` });
    }
  }

  useEffect(async ()=>{
    const licenseNumbers = application?.licenseNumber;
    const filters = { licenseNumbers, offset: 0 };
    let numOfApplications = await TLSearch.numberOfApplications(application?.tenantId, filters);
    let allowedToNextYear= false;
    setIsrenewalspresent(false)
    let latestRenewalYearofAPP = "";
    let financialYear = cloneDeep(application?.financialYear);
    const financialYearDate = financialYear?.split('-')[1];
    const finalFinancialYear = `20${Number(financialYearDate)}-${Number(financialYearDate)+1}`
    const latestFinancialYear = Math.max.apply(Math, numOfApplications?.filter(ob => ob.licenseNumber === application?.licenseNumber)?.map(function(o){return parseInt(o.financialYear.split("-")[0])}))
    const isAllowedToNextYear = numOfApplications?.filter(data => (data.financialYear == finalFinancialYear && data?.status !== "REJECTED"));

    if(Object.keys(fydata).length >0)
    {
      let FY = getvalidfromdate("", mdmsFinancialYear).finYearRange;
      numOfApplications &&
      numOfApplications.map((ob) => {
        if (ob.financialYear === FY) {
          setIsrenewalspresent(true)
        }
      });
      if (isAllowedToNextYear?.length > 0){
        setAllowedToNextYear(false);
        setoldRenewalAppNo(isAllowedToNextYear?.[0]?.applicationNumber);
      }
      if(!(application?.financialYear.includes(`${latestFinancialYear}`))) {
        latestRenewalYearofAPP = application?.financialYear;
        setlatestRenewalYearofAPP(application?.financialYear);
      }
      if (!isAllowedToNextYear || isAllowedToNextYear?.length == 0){
        allowedToNextYear = true;
        setAllowedToNextYear(true);
      }
      setNumberOfApplications(numOfApplications)
    }
  },[fydata])

  const onsubmit = async() => {
    const licenseNumbers = application?.licenseNumber;
    const filters = { licenseNumbers, offset: 0 };
    let numOfApplications = await TLSearch.numberOfApplications(application?.tenantId, filters);
    let allowedToNextYear= false;
    setIsrenewalspresent(false)
    let latestRenewalYearofAPP = "";
    let financialYear = cloneDeep(application?.financialYear);
    const financialYearDate = financialYear?.split('-')[1];
    const finalFinancialYear = `20${Number(financialYearDate)}-${Number(financialYearDate)+1}`
    const latestFinancialYear = Math.max.apply(Math, numOfApplications?.filter(ob => ob.licenseNumber === application?.licenseNumber)?.map(function(o){return parseInt(o.financialYear.split("-")[0])}))
    const isAllowedToNextYear = numOfApplications?.filter(data => (data.financialYear == finalFinancialYear && data?.status !== "REJECTED"));
    let FY = getvalidfromdate("", mdmsFinancialYear).finYearRange;
    numOfApplications &&
    numOfApplications?.map((ob) => {
      if (ob.financialYear === FY) {
        setIsrenewalspresent(true)
      }
    });
    if (isAllowedToNextYear?.length > 0){
      setAllowedToNextYear(false);
      setoldRenewalAppNo(isAllowedToNextYear?.[0]?.applicationNumber);
    }
    if(!(application?.financialYear.includes(`${latestFinancialYear}`))) {
      latestRenewalYearofAPP = application?.financialYear;
      setlatestRenewalYearofAPP(application?.financialYear);
    }
    if (!isAllowedToNextYear || isAllowedToNextYear?.length == 0){
      allowedToNextYear = true;
      setAllowedToNextYear(true);
    }
    setNumberOfApplications(numOfApplications)
    if(isrenewalspresent || allowedToNextYear == false || application?.status === "CANCELLED" || (application?.status === "MANUALEXPIRED"))
      getToastMessages();
    else
      history.push(`/suda-ui/citizen/tl/tradelicence/renew-trade/${application.licenseNumber}/${application.tenantId}`);
  };

  const ownersSequences = Array.isArray(owners)
    ? owners.slice().sort((a, b) => (a?.additionalDetails?.ownerSequence || 0) - (b?.additionalDetails?.ownerSequence || 0))
    : [];

  const status = application?.status?.toUpperCase();
  const statusStyle = statusConfig[status] || { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db", label: `TL_STATUS_${status}` };
  const validUntil = application?.validTo ? convertEpochToDateCitizen(application.validTo) : null;
  const isActive = application?.status === "APPROVED";

  return (
    <React.Fragment>
      <div
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          boxShadow: "0 2px 14px rgba(26,43,73,0.09), 0 1px 3px rgba(26,43,73,0.05)",
          overflow: "hidden",
          border: "1px solid #f0f2f5",
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 10px 32px rgba(244,119,56,0.15)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 14px rgba(26,43,73,0.09)"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {/* Gradient header */}
        <div style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", padding: "16px 20px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: "-20px", top: "-20px", width: "90px", height: "90px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1 }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.75)", fontWeight: "600", letterSpacing: "0.6px", textTransform: "uppercase" }}>{t("TL_LICENSE_NUMBERL_LABEL")}</div>
                <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: "800", letterSpacing: "0.2px", marginTop: "2px", wordBreak: "break-all" }}>{application?.licenseNumber || t("CS_NA")}</div>
              </div>
            </div>
            <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: "700", letterSpacing: "0.4px", background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, textTransform: "uppercase", flexShrink: 0, whiteSpace: "nowrap" }}>
              {t(statusStyle.label)}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: "16px 20px 12px" }}>

          {/* Trade Name */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "2px" }}>{t("TL_LOCALIZATION_TRADE_NAME")}</div>
              <div style={{ fontSize: "13px", color: "#1a2b49", fontWeight: "600" }}>{application?.tradeName || t("CS_NA")}</div>
            </div>
          </div>

          {/* Owners */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "2px" }}>{t("TL_LOCALIZATION_OWNER_NAME")}</div>
              <div style={{ fontSize: "13px", color: "#1a2b49", fontWeight: "600" }}>
                {ownersSequences.map((owner, idx) => (
                  <span key={idx}>{owner?.name}{idx < ownersSequences.length - 1 ? ", " : ""}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Validity */}
          {validUntil && (
            <div style={{
              padding: "8px 14px",
              background: isActive ? "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)" : "linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)",
              borderRadius: "10px",
              border: `1px solid ${isActive ? "#a7f3d0" : "#fca5a5"}`,
              marginBottom: "10px",
              display: "flex", alignItems: "center", gap: "8px"
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#059669" : "#dc2626"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <div>
                <div style={{ fontSize: "10px", color: isActive ? "#065f46" : "#991b1b", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  {t("TL_LOCALIZATION_LICENSE_STATUS")}
                </div>
                <div style={{ fontSize: "12px", color: isActive ? "#059669" : "#dc2626", fontWeight: "700" }}>
                  {isActive ? t("TL_ACTIVE_STATUS_MSG") : t("TL_EXPIRED_STATUS_MSG")} {validUntil}
                  {!isActive && " " + t("TL_EXPIRED_STATUS_MSG_1")}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "0 20px 18px" }}>
          {isrenewalspresent ? (
            <div style={{ padding: "10px 16px", background: "#fffbeb", borderRadius: "10px", border: "1px solid #fcd34d", textAlign: "center" }}>
              <span style={{ fontSize: "13px", color: "#92400e", fontWeight: "600" }}>{t("TL_RENEWAL_PRESENT_ERROR")}</span>
            </div>
          ) : (
            <button
              onClick={onsubmit}
              style={{
                width: "100%", height: "42px",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                border: "none", borderRadius: "10px", color: "#fff",
                fontSize: "14px", fontWeight: "700", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: "0 3px 10px rgba(37,99,235,0.35)",
                transition: "transform 0.15s, box-shadow 0.15s"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 10px rgba(37,99,235,0.35)"; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              {t("TL_RENEW_LABEL")}
            </button>
          )}
        </div>
      </div>

      {showToast && (
        <Toast
          isDleteBtn={true}
          error={showToast.error}
          warning={showToast.warning}
          label={t(showToast.label)}
          onClose={() => setShowToast(null)}
        />
      )}
    </React.Fragment>
  );
};

export default TradeLicenseList;

