import React from "react";
import { Loader } from "@upyog/digit-ui-react-components";
import MyApplication from "./MyApplication";
import { useTranslation } from "react-i18next";

export const MyApplications = () => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { info: userInfo } = Digit.UserService.getUser();

  const { isLoading, isError, error, data: { data: { table: applicationsList } = {} } = {} } = Digit.Hooks.fsm.useSearchAll(tenantId, {
    uuid: userInfo.uuid,
    limit: 100,
  });

  if (isLoading) {
    return <Loader />;
  }

  const count = applicationsList?.length || 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "28px 24px 48px" }}>

      {/* Page Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#1a2b49", letterSpacing: "-0.3px" }}>
              {t("CS_FSM_APPLICATION_TITLE_MY_APPLICATION")}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
              {count > 0 ? `${count} ${t("FSM_APPLICATIONS_FOUND") || "application(s) found"}` : ""}
            </p>
          </div>
          {count > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 16px", background: "rgba(244,119,56,0.1)", borderRadius: "20px", border: "1px solid rgba(244,119,56,0.25)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#f47738" }}>{count}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div>
        {count > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {applicationsList.map((application, index) => (
              <MyApplication key={application.applicationNo || index} application={application} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "20px", boxShadow: "0 2px 12px rgba(26,43,73,0.07)" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <p style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "700", color: "#1a2b49" }}>
              {t("FSM_NO_APPLICATION")} {userInfo.mobileNumber}
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>
              {t("FSM_NO_APPLICATION_SUBTITLE") || "Submit a new FSM request to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
