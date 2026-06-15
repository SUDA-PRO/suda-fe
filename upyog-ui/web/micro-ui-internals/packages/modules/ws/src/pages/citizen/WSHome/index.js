import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const actions = [
  {
    key: "search-pay",
    i18nKey: "ACTION_TEXT_WS_SEARCH_AND_PAY",
    desc: "WS_HOME_SEARCH_PAY_DESC",
    link: "/suda-ui/citizen/ws/search",
    gradient: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    key: "my-bills",
    i18nKey: "ACTION_TEST_WNS_MY_BILLS",
    desc: "WS_HOME_MY_BILLS_DESC",
    link: "/suda-ui/citizen/ws/my-bills",
    gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    key: "my-connections",
    i18nKey: "ACTION_TEXT_WS_MY_CONNECTION",
    desc: "WS_HOME_MY_CONN_DESC",
    link: "/suda-ui/citizen/ws/my-connections",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    ),
  },
  {
    key: "new-connection",
    i18nKey: "ACTION_TEST_APPLY_NEW_CONNECTION",
    desc: "WS_HOME_NEW_CONN_DESC",
    link: "/suda-ui/citizen/ws/create-application",
    gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  {
    key: "my-applications",
    i18nKey: "ACTION_TEXT_WS_MY_APPLICATION",
    desc: "WS_HOME_MY_APP_DESC",
    link: "/suda-ui/citizen/ws/my-applications",
    gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    key: "my-payments",
    i18nKey: "ACTION_TEST_MY_PAYMENTS",
    desc: "WS_HOME_MY_PAYMENTS_DESC",
    link: "/suda-ui/citizen/ws/my-payments",
    gradient: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    key: "faqs",
    i18nKey: "WS_FAQ_S",
    desc: "WS_HOME_FAQ_DESC",
    link: "/suda-ui/citizen/ws-faq",
    gradient: "linear-gradient(135deg, #475569 0%, #334155 100%)",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

const WSHomePage = () => {
  const { t } = useTranslation();
  // Returns translation if found, otherwise returns the provided fallback
  const tx = (key, fallback) => {
    const v = t(key);
    return v === key ? fallback : v;
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f4ff 0%, #fff7f0 60%, #fef6f0 100%)" }}>
      {/* Services Grid */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 16px 48px" }}>
        <div style={{ marginBottom: "28px" }}>
          <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "800", color: "#1a2b49" }}>
            {t("ACTION_TEST_WS")}
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>{t("WS_HOME_SERVICES_SUBTITLE")}</p>
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(26,43,73,0.13)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,43,73,0.07)";
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: action.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {action.icon}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a2b49", marginBottom: "4px", lineHeight: 1.3 }}>
                    {t(action.i18nKey)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#9ca3af", lineHeight: 1.4 }}>{t(action.desc) !== action.desc ? t(action.desc) : ""}</div>
                </div>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#f47738" }}>{t("PT_COMMON_CLICK_HERE")}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#f47738"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Contact / Helpline strip */}
        <div
          style={{
            marginTop: "32px",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(26,43,73,0.10)",
            border: "1px solid #f0e8e0",
          }}
        >
          {/* Strip header */}
          <div
            style={{
              background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)",
              padding: "10px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#fff", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {t("WS_HOME_HELP_TITLE")}
            </span>
          </div>

          {/* Two columns */}
          <div style={{ background: "#fffaf7", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0" }}>
            {/* Helpline */}
            <div style={{ padding: "18px 24px", borderRight: "1px solid #f0e8e0", display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #fff0e8 0%, #ffe0cc 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f47738"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12 19.79 19.79 0 0 1 1.21 3.4 2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6.25 6.25l1.21-1.21a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#1a2b49",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                  }}
                >
                  {t("CALL_CENTER_HELPLINE")}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  <a
                    href={`tel:${"0771-2221955".replace(/-/g, "")}`}
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#f47738",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#f47738" stroke="none">
                      <circle cx="12" cy="12" r="5" />
                    </svg>
                    0771-2221955
                  </a>
                </div>
              </div>
            </div>

            {/* Address */}
            <div style={{ padding: "18px 24px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #fff0e8 0%, #ffe0cc 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f47738"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#1a2b49",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                  }}
                >
                  {t("CITIZEN_SERVICE_CENTER")}
                </div>
                <div style={{ fontSize: "13px", color: "#4b5563", lineHeight: 1.6 }}>
                  4th Floor, D-Block, Indravati Bhawan
                  <br />
                  Atal Nagar, Raipur
                  <br />
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

export default WSHomePage;
