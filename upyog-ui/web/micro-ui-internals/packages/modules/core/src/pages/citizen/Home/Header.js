import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import ChangeLanguage from "../../../components/ChangeLanguage";
import { useTranslation } from "react-i18next";
// import IndianFlag from './SvgStore/Inidan-Flag.svg';
import { ReactComponent as IndianFlag } from "../../../assets/Inidan-Flag.svg";


const Header = () => {
    const { t } = useTranslation();
    const CGLogo = "https://tfstatee8aog.blob.core.windows.net/filestore/cglogo.png";
    const [loginOpen, setLoginOpen] = useState(false);
    const loginRef = useRef(null);
      const history = useHistory();
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        function handleClick(e) {
          if (loginRef.current && !loginRef.current.contains(e.target)) {
            setLoginOpen(false);
          }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);


    useEffect(() => {
        const onResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;

    useEffect(() => {
        function handleClick(e) {
          if (loginRef.current && !loginRef.current.contains(e.target)) {
            setLoginOpen(false);
          }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
      }, []);
    
      const modules = JSON.parse(sessionStorage.getItem("Digit.initData"))?.value?.modules || "en_IN";

      const pgrData = modules?.filter((item) => item.code === "PGR");

    const fontBtnStyle = (size) => ({
        background: "none",
        border: "none",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: size,
        color: "#555",
        padding: "0 2px",
        lineHeight: 1,
    });
    

  return (
    <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 24px",
          background: "#fff",
          borderBottom: "1px solid #eee",
          position: "fixed",
          top: "30px",
          left: 0,
          right: 0,
          zIndex: 100,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
            alt="Emblem of India"
            style={{ width: 44, height: 44 }}
          />
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 11,
              textAlign: "center",
              flexShrink: 0,
            }}
          >
            <img src={CGLogo} alt="CG Logo" style={{ width: 35, height: 35 }} />
          </div>


          {!isMobile && (
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.4 }}>
                {/* <span style={{ fontSize: 12.5, color: "black", textTransform: "uppercase", letterSpacing: "0.6px" }}>{t("LANDING_PAGE_GOV")}</span> */}
                <span style={{ fontSize: 17.5, fontWeight: 700, color: "black", letterSpacing: "0.3px" }}>{t("LANDING_PAGE_TITLE")}</span>
              </div>
          )}


        </div>

        {/* Login + Register */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Login with Dropdown */}
          <div ref={loginRef} style={{ position: "relative" }}>
            <button
              onClick={() => setLoginOpen((o) => !o)}
              style={{
                padding: "8px 20px",
                borderRadius: 6,
                border: "1.5px solid #999",
                background: "#fff",
                color: "#333",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
              }}
            >
              {/* Login */}
              {t("CORE_COMMON_LOGIN")}
              <svg width="10" height="10" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {loginOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
                  minWidth: 180,
                  zIndex: 200,
                  overflow: "hidden",
                }}
              >
                <div
                  onClick={() => {
                    setLoginOpen(false);
                    window.location.href = "/upyog-ui/citizen/login";
                  }}
                  style={{
                    padding: "12px 20px",
                    fontSize: 13,
                    color: "#333",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A1E1C" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {/* Citizen Login */}
                  {t("CS_COMMON_CITIZEN")} {t("CORE_COMMON_LOGIN")}
                </div>

                <div
                  onClick={() => {
                    setLoginOpen(false);
                    window.location.href = "/upyog-ui/employee/user/login";
                  }}
                  style={{
                    padding: "12px 20px",
                    fontSize: 13,
                    color: "#333",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A1E1C" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                    <line x1="12" y1="12" x2="12" y2="16" />
                    <line x1="10" y1="14" x2="14" y2="14" />
                  </svg>
                  {/* Department Login */}
                  {t("employee.Assignment.fields.department")} {t("CORE_COMMON_LOGIN")}
                </div>
              </div>
            )}
          </div>

          <button
            style={{
              padding: "8px 22px",
              borderRadius: 6,
              border: "none",
              background: "#7A1E1C",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              letterSpacing: "0.2px",
            }}
            onClick={() => {
              // setLoginOpen(false);
              window.location.href = "/upyog-ui/citizen/register/user";
            }}
          >
            {" "}
            {t("CORE_REGISTER_HEADING")}
          </button>
        </div>
      </header>
  )
}

export default Header