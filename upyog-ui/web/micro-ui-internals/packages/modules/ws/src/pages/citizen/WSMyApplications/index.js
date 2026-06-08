import { Loader } from "@upyog/digit-ui-react-components";
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import WSApplication from "./ws-application";
import WSInfoLabel from "../../../pageComponents/WSInfoLabel";

export const WSMyApplications = () => {
  const { t } = useTranslation();
  const user = Digit.UserService.getUser();
  const tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code || user?.info?.permanentCity || Digit.ULBService.getCurrentTenantId();
  let filter = window.location.href.split("/").pop();
  let t1;
  let off;
  if (!isNaN(parseInt(filter))) {
    off = filter;
    t1 = parseInt(filter) + 50;
  } else {
    t1 = 4;
  }

  let filter1 = !isNaN(parseInt(filter))
    ? { tenantId: tenantId, mobileNumber: user?.info?.mobileNumber }
    : { tenantId: tenantId, mobileNumber: user?.info?.mobileNumber };

  const { isLoading, isError, error, data } = Digit.Hooks.ws.useMyApplicationSearch({ filters: filter1 }, { filters: filter1 });

  const { isLoading: isSWLoading, isError: isSWError, error: SWerror, data: SWdata } = Digit.Hooks.ws.useMyApplicationSearch({ filters: filter1, BusinessService: "SW" }, { filters: filter1 });
  let applicationNoWS = (data && data?.WaterConnection?.map((ob) => ob.applicationNo).join(",")) || "";
  let applicaionNoSW = (SWdata && SWdata?.SewerageConnections?.map((ob) => ob.applicationNo).join(",")) || "";
  let applicationNos = applicationNoWS.concat(applicaionNoSW);
  let workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: applicationNos,
    moduleCode: "WS,SW",
    config: {
      enabled: !!applicationNos
    }
  });
  let propertyWS = (data && data?.WaterConnection?.map((ob) => ob?.propertyId).join(",")) || "";
  let propertySW = (SWdata && SWdata?.SewerageConnections?.map((ob) => ob?.propertyId).join(",")) || "";
  let propertyNos = propertyWS.concat(propertySW);
  const { isLoading: PTisLoading, isError: PTisError, error: PTerror, data: PTdata } = Digit.Hooks.pt.usePropertySearch(
    { filters: { propertyIds: propertyNos } },
    { filters: { propertyIds: propertyNos }, enabled: propertyNos ? true : false }
  );
  if (isLoading || isSWLoading || PTisLoading) {
    return <Loader />;
  }
  let { WaterConnection: WSapplicationsList } = data || {};
  let { SewerageConnections: SWapplicationsList } = SWdata || {};
  WSapplicationsList = WSapplicationsList?.map((ob) => ({ ...ob, sla: workflowDetails?.data?.processInstances?.filter((pi) => pi.businessId == ob.applicationNo)[0]?.businesssServiceSla }));
  SWapplicationsList = SWapplicationsList?.map((ob) => ({ ...ob, sla: workflowDetails?.data?.processInstances?.filter((pi) => pi.businessId == ob.applicationNo)[0]?.businesssServiceSla }));
  WSapplicationsList = WSapplicationsList?.filter((ob) => ob?.applicationType !== "MODIFY_WATER_CONNECTION");
  SWapplicationsList = SWapplicationsList?.filter((ob) => ob?.applicationType !== "MODIFY_SEWERAGE_CONNECTION");
  let applicationsList = WSapplicationsList.concat(SWapplicationsList);
  applicationsList =
    applicationsList &&
    applicationsList.map((ob) => ({
      ...ob,
      property: PTdata?.Properties?.filter((pt) => pt?.propertyId === ob?.propertyId)[0],
    }));

  const count = applicationsList?.length || 0;
  const sorted = applicationsList?.slice().sort((a, b) => b.auditDetails?.lastModifiedTime - a.auditDetails?.lastModifiedTime);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", padding: "24px 16px 40px" }}>

      {/* Page header */}
      <div style={{ maxWidth: "960px", margin: "0 auto 28px auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#1a2b49", letterSpacing: "-0.3px" }}>
              {t("CS_HOME_MY_APPLICATIONS")}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
              {count > 0 ? `${count} ${t("WS_APPLICATIONS_FOUND")}` : t("WS_NO_APPLICATION_FOUND_MSG")}
            </p>
          </div>
          {count > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 16px", background: "rgba(244,119,56,0.1)", borderRadius: "20px", border: "1px solid rgba(244,119,56,0.25)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#f47738" }}>{count}</span>
            </div>
          )}
        </div>

        {/* Info label */}
        <div style={{ marginTop: "12px" }}>
          <WSInfoLabel t={t} />
        </div>
      </div>

      {/* Application cards grid */}
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        {count > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 420px), 1fr))", gap: "20px" }}>
            {sorted.map((application, index) => (
              <WSApplication key={application?.applicationNo || index} application={application} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "20px", boxShadow: "0 2px 12px rgba(26,43,73,0.07)" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "700", color: "#1a2b49" }}>{t("WS_NO_APPLICATION_FOUND_MSG")}</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>{t("WS_APPLY_NEW_CONNECTION_MSG")}</p>
          </div>
        )}

        {/* Load more */}
        {count !== 0 && (
          <div style={{ textAlign: "center", marginTop: "28px" }}>
            <Link to={`/suda-ui/citizen/ws/my-applications/${t1}`} style={{ textDecoration: "none" }}>
              <button
                style={{ padding: "12px 32px", background: "transparent", border: "2px solid #1a2b49", borderRadius: "12px", color: "#1a2b49", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "background 0.15s, color 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#1a2b49"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1a2b49"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.5" />
                </svg>
                {t("WS_LOAD_MORE_MSG")}
              </button>
            </Link>
          </div>
        )}

        {/* New application CTA */}
        <div style={{ marginTop: "32px", padding: "24px", background: "#ffffff", borderRadius: "16px", border: "2px dashed #e5e7eb", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span style={{ fontSize: "14px", color: "#4b5563", fontWeight: "600" }}>{t("WS_NOT_ABLE_TO_FIND_CONNECTION")}</span>
          </div>
          <Link to="/suda-ui/citizen/ws/create-application" style={{ textDecoration: "none" }}>
            <button
              style={{ padding: "10px 28px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 3px 12px rgba(244,119,56,0.35)", transition: "transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(244,119,56,0.45)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(244,119,56,0.35)"; }}
            >
              {t("WS_APPLY_NEW_CONNECTION")}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
