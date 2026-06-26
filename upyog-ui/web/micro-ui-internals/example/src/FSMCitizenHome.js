import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const actions = [
  {
    key: "new-application",
    i18nKey: "CS_HOME_APPLY_FOR_DESLUDGING",
    desc: "Apply for emptying of septic tank / pit at your property",
    gradient: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)",
    link: "/suda-ui/citizen/fsm/new-application",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="11" x2="12" y2="17"/>
        <line x1="9" y1="14" x2="15" y2="14"/>
      </svg>
    ),
  },
  {
    key: "my-applications",
    i18nKey: "CS_HOME_MY_APPLICATIONS",
    desc: "View and track status of your submitted applications",
    gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    link: "/suda-ui/citizen/fsm/my-applications",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
];

const FSMCitizenHome = ({ matchPath }) => {
  const { t } = useTranslation();

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f4ff 0%, #fff7f0 60%, #fef6f0 100%)" }}>
      <div style={{ maxWidth: "960px", padding: "24px 16px 48px" }}>

        {/* Page heading */}
        <div style={{ marginBottom: "28px" }}>
          <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "800", color: "#1a2b49" }}>
            {t("CS_HOME_FSM_SERVICES") || "Desludging Service"}
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
            {t("FSM_HOME_SUBTITLE") || "Apply for desludging services and track your applications"}
          </p>
        </div>

        {/* Service cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {actions.map((action) => (
            <Link key={action.key} to={action.link} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  padding: "22px 18px",
                  boxShadow: "0 2px 12px rgba(26,43,73,0.07)",
                  border: "1px solid #f0f2f5",
                  cursor: "pointer",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  height: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(26,43,73,0.13)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,43,73,0.07)";
                }}
              >
                {/* Icon box */}
                <div style={{
                  width: "52px", height: "52px", borderRadius: "14px",
                  background: action.gradient,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}>
                  {action.icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a2b49", marginBottom: "5px", lineHeight: 1.3 }}>
                    {t(action.i18nKey)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#9ca3af", lineHeight: 1.5 }}>
                    {action.desc}
                  </div>
                </div>

                {/* Click here link */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "auto" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#f47738" }}>
                    {t("PT_COMMON_CLICK_HERE") || "Click Here"}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Helpline & Contact strip */}
        <div style={{
          borderRadius: "16px", overflow: "hidden",
          boxShadow: "0 4px 20px rgba(26,43,73,0.10)",
          border: "1px solid #f0e8e0",
        }}>
          {/* Strip header */}
          <div style={{
            background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)",
            padding: "10px 20px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#fff", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {t("PT_HOME_HELP_TITLE") || "Citizen Help"}
            </span>
          </div>

          {/* Two columns */}
          <div style={{
            background: "#fffaf7",
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}>
            {/* Helpline */}
            <div style={{ padding: "18px 24px", borderRight: "1px solid #f0e8e0", display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "linear-gradient(135deg, #fff0e8 0%, #ffe0cc 100%)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12 19.79 19.79 0 0 1 1.21 3.4 2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6.25 6.25l1.21-1.21a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#1a2b49", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  {t("CALL_CENTER_HELPLINE") || "Call Center / Helpline"}
                </div>
                <a href="tel:07712221955" style={{ fontSize: "13px", fontWeight: "600", color: "#f47738", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#f47738" stroke="none">
                    <circle cx="12" cy="12" r="5"/>
                  </svg>
                  0771-2221955
                </a>
              </div>
            </div>

            {/* Address */}
            <div style={{ padding: "18px 24px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "linear-gradient(135deg, #fff0e8 0%, #ffe0cc 100%)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#1a2b49", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  {t("CITIZEN_SERVICE_CENTER") || "Citizen Service Centre"}
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

export default FSMCitizenHome;
