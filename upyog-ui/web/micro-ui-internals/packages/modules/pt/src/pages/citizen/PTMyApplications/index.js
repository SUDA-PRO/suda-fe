import { Loader } from "@upyog/digit-ui-react-components";
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PTApplication from "./pt-application";

export const PTMyApplications = () => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true) || Digit.ULBService.getCurrentTenantId();
  const user = Digit.UserService.getUser().info;

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
    ? { limit: "50", sortOrder: "ASC", sortBy: "createdTime", offset: off, tenantId, status: "INWORKFLOW" }
    : { limit: "4", sortOrder: "ASC", sortBy: "createdTime", offset: "0", mobileNumber: user?.mobileNumber, tenantId, status: "INWORKFLOW" };

  const { isLoading, data } = Digit.Hooks.pt.usePropertySearch({ filters: filter1 }, { filters: filter1 });

  const { Properties: applicationsList } = data || {};
  const count = applicationsList?.length || 0;

  let combinedApplicationNumber = count > 0 ? applicationsList.map((ob) => ob?.acknowldgementNumber) : [];
  let serviceSearchArgs = { tenantId, referenceIds: combinedApplicationNumber };
  const { isLoading: serviceloading, data: servicedata } = Digit.Hooks.useFeedBackSearch(
    { filters: { serviceSearchArgs } },
    { filters: { serviceSearchArgs }, enabled: combinedApplicationNumber.length > 0, cacheTime: 0 }
  );

  function getLabelValue(curservice) {
    let foundValue = servicedata?.Service?.find((ob) => ob?.referenceId?.includes(curservice?.acknowldgementNumber));
    if (foundValue) return t("CS_CF_VIEW");
    else if (!foundValue && curservice?.status?.includes("ACTIVE")) return t("CS_CF_RATE_US");
    else return t("CS_CF_TRACK");
  }

  if (isLoading || serviceloading) return <Loader />;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", padding: "24px 16px 40px" }}>

      {/* Page header */}
      <div style={{ maxWidth: "960px", margin: "0 auto 28px auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#1a2b49", letterSpacing: "-0.3px" }}>
              {t("CS_TITLE_MY_APPLICATIONS")}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
              {count > 0 ? `${count} ${t("PT_APPLICATIONS_FOUND") || "applications found"}` : t("PT_NO_APPLICATION_FOUND_MSG")}
            </p>
          </div>
          {count > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 16px", background: "rgba(244,119,56,0.1)", borderRadius: "20px", border: "1px solid rgba(244,119,56,0.25)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#f47738" }}>{count}</span>
            </div>
          )}
        </div>
      </div>

      {/* Application cards grid */}
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        {count > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {applicationsList.map((application, index) => (
              <PTApplication
                key={application?.acknowldgementNumber || index}
                application={application}
                tenantId={user?.permanentCity}
                buttonLabel={getLabelValue(application)}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "20px", boxShadow: "0 2px 12px rgba(26,43,73,0.07)" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <p style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "700", color: "#1a2b49" }}>{t("PT_NO_APPLICATION_FOUND_MSG")}</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>{t("PT_REGISTER_NEW_PROPERTY_MSG") || "Register a new property to get started"}</p>
          </div>
        )}

        {/* Load more */}
        {count !== 0 && (
          <div style={{ textAlign: "center", marginTop: "28px" }}>
            <Link to={`/suda-ui/citizen/pt/property/my-applications/${t1}`} style={{ textDecoration: "none" }}>
              <button style={{ padding: "12px 32px", background: "transparent", border: "2px solid #1a2b49", borderRadius: "12px", color: "#1a2b49", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "background 0.15s, color 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1a2b49"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1a2b49"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
                </svg>
                {t("PT_LOAD_MORE_MSG")}
              </button>
            </Link>
          </div>
        )}

        {/* Register new property CTA */}
        <div style={{ marginTop: "32px", padding: "24px", background: "#ffffff", borderRadius: "16px", border: "2px dashed #e5e7eb", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <span style={{ fontSize: "14px", color: "#4b5563", fontWeight: "600" }}>{t("PT_TEXT_NOT_ABLE_TO_FIND_THE_APPLICATION")}</span>
          </div>
          <Link to="/suda-ui/citizen/pt/property/new-application/info" style={{ textDecoration: "none" }}>
            <button style={{ padding: "10px 28px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 3px 12px rgba(244,119,56,0.35)", transition: "transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(244,119,56,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(244,119,56,0.35)"; }}
            >
              {t("PT_COMMON_CLICK_HERE_TO_REGISTER_NEW_PROPERTY")}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
