import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const actions = [
  {
    key: "view-applications",
    i18nKey: "BPA_CITIZEN_HOME_VIEW_APPS_LABEL",
    label: "View applications by Citizen",
    link: "/suda-ui/citizen/obps/my-applications",
    gradient: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    key: "register-stakeholder",
    i18nKey: "BPA_CITIZEN_HOME_STAKEHOLDER_LOGIN_LABEL",
    label: "Register as a Stakeholder",
    link: "/suda-ui/citizen/obps/stakeholder/apply/stakeholder-docs-required",
    gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    key: "architect-login",
    i18nKey: "BPA_CITIZEN_HOME_ARCHITECT_LOGIN_LABEL",
    label: "Registered Architect Login",
    link: "/suda-ui/citizen/obps/home",
    gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    key: "pre-approved-plan",
    i18nKey: "BPA_CITIZEN_HOME_PRE_APPROVED_PLAN_LABEL",
    label: "Apply for Pre-approved Plan",
    link: "/suda-ui/citizen/obps/preApprovedPlan",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    ),
  },
  {
    key: "faq",
    i18nKey: "BPA_CITIZEN_HOME_FAQ_LABEL",
    label: "FAQs",
    link: "/suda-ui/citizen/obps/my-applications",
    gradient: "linear-gradient(135deg, #475569 0%, #334155 100%)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
];

const OBPSHomePage = () => {
  const { t } = useTranslation();

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f4ff 0%, #fff7f0 60%, #fef6f0 100%)" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 16px 48px" }}>

        <div style={{ marginBottom: "28px" }}>
          <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "800", color: "#1a2b49" }}>
            {t("OBPS_HOME_SERVICES_TITLE") }
          </h2>
          
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {actions.map((action) => (
            <Link key={action.key} to={action.link} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  padding: "20px 18px",
                  boxShadow: "0 2px 12px rgba(26,43,73,0.07)",
                  border: "1px solid #f0f2f5",
                  cursor: "pointer",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(26,43,73,0.13)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,43,73,0.07)";
                }}
              >
                <div style={{
                  width: "52px", height: "52px", borderRadius: "14px",
                  background: action.gradient, display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}>
                  {action.icon}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a2b49", marginBottom: "4px", lineHeight: 1.3 }}>
                    {t(action.i18nKey)}
                  </div>
                </div>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#f47738" }}>
                    {t("PT_COMMON_CLICK_HERE") }
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stakeholder info note */}
        <div style={{
          marginTop: "20px", padding: "12px 18px", background: "#fff8f4",
          borderRadius: "10px", border: "1px solid #fde8d8",
          display: "flex", alignItems: "center", gap: "10px"
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ fontSize: "12px", color: "#6b7280" }}>
            {t("BPA_CITIZEN_HOME_STAKEHOLDER_INCLUDES_INFO_LABEL") }
          </span>
        </div>

        {/* Helpline strip */}
        <div style={{ marginTop: "28px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(26,43,73,0.10)", border: "1px solid #f0e8e0" }}>
          <div style={{ background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)", padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#fff", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {t("PT_HOME_HELP_TITLE") 
              }
            </span>
          </div>
          <div style={{ background: "#fffaf7", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <div style={{ padding: "18px 24px", borderRight: "1px solid #f0e8e0", display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #fff0e8 0%, #ffe0cc 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12 19.79 19.79 0 0 1 1.21 3.4 2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6.25 6.25l1.21-1.21a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#1a2b49", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  {t("PT_HOME_HELPLINE_TITLE") }
                </div>
                <a href="tel:07712221955" style={{ fontSize: "13px", fontWeight: "600", color: "#f47738", textDecoration: "none" }}>
                  0771-2221955
                </a>
              </div>
            </div>
            <div style={{ padding: "18px 24px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #fff0e8 0%, #ffe0cc 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#1a2b49", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  {t("PT_HOME_CSC_TITLE") }
                </div>
                <div style={{ fontSize: "13px", color: "#4b5563", lineHeight: 1.6 }}>
                  4th Floor, D-Block, Indravati Bhawan<br />
                  Atal Nagar, Raipur<br />
                  Chhattisgarh – 492018
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OBPSHomePage;
