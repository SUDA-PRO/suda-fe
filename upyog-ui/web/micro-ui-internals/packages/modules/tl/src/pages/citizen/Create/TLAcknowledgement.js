import { Loader } from "@upyog/digit-ui-react-components";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { convertToEditTrade, convertToResubmitTrade, convertToTrade, convertToUpdateTrade, stringToBoolean } from "../../../utils";
import getPDFData from "../../../utils/getTLAcknowledgementData";

const GetActionMessage = (props) => {
  const { t } = useTranslation();
  if (props.isSuccess) {
    return !window.location.href.includes("renew-trade") || !window.location.href.includes("edit-application") ? t("CS_TRADE_APPLICATION_SUCCESS") : t("CS_TRADE_UPDATE_APPLICATION_SUCCESS");
  } else if (props.isLoading) {
    return !window.location.href.includes("renew-trade") || !window.location.href.includes("edit-application") ? t("CS_TRADE_APPLICATION_SUCCESS") : t("CS_TRADE_UPDATE_APPLICATION_PENDING");
  } else if (!props.isSuccess) {
    return !window.location.href.includes("renew-trade") || !window.location.href.includes("edit-application") ? t("CS_TRADE_APPLICATION_FAILED") : t("CS_TRADE_UPDATE_APPLICATION_FAILED");
  }
};

const rowContainerStyle = {
  padding: "4px 0px",
  justifyContent: "space-between",
};

/* ─── PT-style result card ──────────────────────────────────────────────── */
const ResultCard = ({ isSuccess, isLoading, appNumber, isEdit, isDirectRenewal, onDownload, t }) => {
  const successBg = "linear-gradient(135deg, #27ae60 0%, #1e8449 100%)";
  const failBg    = "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)";
  const pendingBg = "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)";
  const bg = isSuccess ? successBg : isLoading ? pendingBg : failBg;
  const icon = isSuccess ? "✅" : isLoading ? "⏳" : "❌";

  const statusLabel = isSuccess
    ? (t("CS_TRADE_APPLICATION_SUCCESS") || "Application Submitted Successfully!")
    : isLoading
    ? (t("CS_TRADE_UPDATE_APPLICATION_PENDING") || "Processing…")
    : (t("CS_TRADE_APPLICATION_FAILED") || "Submission Failed");

  return (
    <div style={{ width: "100%", padding: "8px 0 32px" }}>
      {/* header card */}
      <div style={{
        background: bg, borderRadius: "14px", padding: "32px 28px",
        marginBottom: "24px", textAlign: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>{icon}</div>
        <div style={{ color: "#fff", fontSize: "22px", fontWeight: 700, lineHeight: 1.3 }}>
          {statusLabel}
        </div>
        {isSuccess && appNumber && (
          <div style={{
            marginTop: "16px", display: "inline-block",
            background: "rgba(255,255,255,0.2)", borderRadius: "10px",
            padding: "10px 24px", border: "1px solid rgba(255,255,255,0.4)",
          }}>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px", marginBottom: "4px" }}>
              {t("TL_REF_NO_LABEL") || "Application Number"}
            </div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "18px", letterSpacing: "1px" }}>
              {appNumber}
            </div>
          </div>
        )}
        {isSuccess && (
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", marginTop: "14px" }}>
            {!isDirectRenewal
              ? (t("TL_FILE_TRADE_RESPONSE") || "Your trade licence application has been submitted.")
              : (t("TL_FILE_TRADE_RESPONSE_DIRECT_REN") || "Your renewal has been submitted.")}
          </div>
        )}
        {!isSuccess && !isLoading && (
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", marginTop: "14px" }}>
            {t("TL_FILE_TRADE_FAILED_RESPONSE") || "Something went wrong. Please try again."}
          </div>
        )}
      </div>

      {/* action buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {isSuccess && onDownload && (
          <button
            onClick={onDownload}
            style={{
              width: "100%", padding: "14px", borderRadius: "10px",
              border: "2px solid #27ae60", background: "#fff",
              color: "#27ae60", fontWeight: 700, fontSize: "15px",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            ⬇️ {t("TL_DOWNLOAD_ACK_FORM") || "Download Acknowledgement"}
          </button>
        )}
        <Link to="/suda-ui/citizen" style={{ textDecoration: "none" }}>
          <button style={{
            width: "100%", padding: "14px", borderRadius: "10px", border: "none",
            background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)",
            color: "#fff", fontWeight: 700, fontSize: "15px", cursor: "pointer",
          }}>
            🏠 {t("CORE_COMMON_GO_TO_HOME") || "Go to Home"}
          </button>
        </Link>
      </div>
    </div>
  );
};

const TLAcknowledgement = ({ data, onSuccess, onUpdateSuccess }) => {
  const { t } = useTranslation();
  const [mutationHappened, setMutationHappened, clear] = Digit.Hooks.useSessionStorage("CITIZEN_TL_MUTATION_HAPPENED", false);
  const resubmit = window.location.href.includes("edit-application");
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const isRenewTrade = !window.location.href.includes("renew-trade")
  const mutation = Digit.Hooks.tl.useTradeLicenseAPI(
    data?.cpt?.details?.address?.tenantId ? data?.cpt?.details?.address?.tenantId : tenantId,
    isRenewTrade
  );
  const mutation1 = Digit.Hooks.tl.useTradeLicenseAPI(
    data?.cpt?.details?.address?.tenantId ? data?.cpt?.details?.address?.tenantId : tenantId,
    false
  );
  const mutation2 = Digit.Hooks.tl.useTradeLicenseAPI(
    data?.cpt?.details?.address?.tenantId ? data?.cpt?.details?.address?.tenantId : tenantId,
    false
  );
  const isEdit = window.location.href.includes("renew-trade");
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  const stateId = Digit.ULBService.getStateId();
  const { isLoading, data: fydata = {} } = Digit.Hooks.tl.useTradeLicenseMDMS(stateId, "egf-master", "FinancialYear");
  let isDirectRenewal = sessionStorage.getItem("isDirectRenewal") ? stringToBoolean(sessionStorage.getItem("isDirectRenewal")) : null;


  useEffect(() => {
    const onSuccessedit = () => {
      setMutationHappened(true);
    };
    try {
      let tenantId1 = data?.cpt?.details?.address?.tenantId ? data?.cpt?.details?.address?.tenantId : tenantId;
      data.tenantId = tenantId1;
      if (!resubmit) {
        let formdata = !isEdit ? convertToTrade(data) : convertToEditTrade(data, fydata["egf-master"] ? fydata["egf-master"].FinancialYear.filter(y => y.module === "TL") : []);
        formdata.Licenses[0].tenantId = formdata?.Licenses[0]?.tenantId || tenantId1;
        if(!isEdit)
        {
          mutation.mutate(formdata, {
            onSuccess,
          })
        }
        else{
          if((fydata["egf-master"] && fydata["egf-master"].FinancialYear.length > 0 && isDirectRenewal))
          {
            mutation2.mutate(formdata, {
              onUpdateSuccess,
            })
          }
          else
          {
            mutation1.mutate(formdata, {
              onUpdateSuccess,
            })
          }
        }

        // !isEdit ? mutation.mutate(formdata, {
        //   onSuccess,
        // }) : (fydata["egf-master"] && fydata["egf-master"].FinancialYear.length > 0 && isDirectRenewal ? mutation2.mutate(formdata, {
        //   onSuccess,
        // }) :mutation1.mutate(formdata, {
        //   onSuccess,
        // }));
      } else {
        let formdata = convertToResubmitTrade(data);
        formdata.Licenses[0].tenantId = formdata?.Licenses[0]?.tenantId || tenantId1;
        !mutation2.isLoading && !mutation2.isSuccess &&!mutationHappened && mutation2.mutate(formdata, {
          onSuccessedit,
        })

      }
    } catch (err) {
    }
  }, [fydata]);

  useEffect(() => {
    if (mutation.isSuccess || (mutation1.isSuccess && isEdit && !isDirectRenewal)) {
      try {
        let Licenses = !isEdit ? convertToUpdateTrade(mutation.data, data) : convertToUpdateTrade(mutation1.data, data);
        mutation2.mutate(Licenses, {
          onSuccess : onUpdateSuccess,
        });
      }
      catch (er) {
      }
    }
  }, [mutation.isSuccess, mutation1.isSuccess]);

  const handleDownloadPdf = async () => {
    const { Licenses = [] } = mutation.data || mutation1.data || mutation2.data;
    const License = (Licenses && Licenses[0]) || {};
    const tenantInfo = tenants.find((tenant) => tenant.code === License.tenantId);
    let res = License;
    const data = getPDFData({ ...res }, tenantInfo, t);
    data.then((ress) => Digit.Utils.pdf.generate(ress));
  };

  let enableLoader = !resubmit ? (!isEdit ? mutation.isIdle || mutation.isLoading : isDirectRenewal ? false : mutation1.isIdle || mutation1.isLoading) : false;

  if (enableLoader) {
    return <Loader />;
  }

  if (((mutation?.isSuccess === false && mutation?.isIdle === false) || (mutation1?.isSuccess === false && mutation1?.isIdle === false)) && !isDirectRenewal && !resubmit) {
    return (
      <ResultCard
        isSuccess={false}
        isLoading={false}
        isEdit={isEdit}
        isDirectRenewal={isDirectRenewal}
        t={t}
      />
    );
  }

  if (mutation2.isLoading || mutation2.isIdle) {
    return <Loader />;
  }

  const appNumber = mutation2.data?.Licenses?.[0]?.applicationNumber;
  const isPendingPayment = mutation2?.data?.Licenses?.[0]?.status === "PENDINGPAYMENT";

  return (
    <div style={{ width: "100%", padding: "8px 0 32px" }}>
      <ResultCard
        isSuccess={mutation2.isSuccess}
        isLoading={mutation2.isIdle || mutation2.isLoading}
        appNumber={appNumber}
        isEdit={isEdit}
        isDirectRenewal={isDirectRenewal}
        onDownload={mutation2.isSuccess && (!isEdit || true) ? handleDownloadPdf : null}
        t={t}
      />
      {isPendingPayment && (
        <Link
          to={{
            pathname: `/suda-ui/citizen/payment/collect/${mutation2.data.Licenses[0].businessService}/${mutation2.data.Licenses[0].applicationNumber}`,
            state: { tenantId: mutation2.data.Licenses[0].tenantId },
          }}
          style={{ textDecoration: "none" }}
        >
          <button style={{
            width: "100%", padding: "14px", borderRadius: "10px", border: "none",
            background: "linear-gradient(135deg, #1a6a9a 0%, #0d4f7a 100%)",
            color: "#fff", fontWeight: 700, fontSize: "15px", cursor: "pointer",
            marginTop: "12px",
          }}>
            💳 {t("COMMON_MAKE_PAYMENT") || "Make Payment"}
          </button>
        </Link>
      )}
    </div>
  );
};

export default TLAcknowledgement;
