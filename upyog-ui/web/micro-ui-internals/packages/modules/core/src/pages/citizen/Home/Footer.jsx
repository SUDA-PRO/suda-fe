import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useHistory } from "react-router-dom";


const Footer = () => {
    const { t } = useTranslation();
    const CGLogo = "https://tfstatee8aog.blob.core.windows.net/filestore/cglogo%201.png";
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
    <div>

    <footer
        style={{
          background: "#091E64",
          padding: isMobile ? "24px 16px" : "36px 48px 28px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1.2fr 1.4fr 1fr",
            gap: isMobile ? 24 : 40,
            alignItems: "start",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          {/* Logo Block */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: isMobile ? "center" : "flex-start",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            
              <img src={CGLogo} alt="CG Logo" style={{ width: 35, height: 35 }} />
            </div>

            <div>
              <div
                style={{
                  fontSize: 10,
                  color: "#d5d5d5",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Government of Chhattisgarh
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#d5d5d5",
                  lineHeight: 1.5,
                  marginTop: 3,
                }}
              >
                STATE URBAN DEVELOPMENT AGENCY (SUDA)
              </div>
            </div>
          </div>

          {/* Contact Block */}
          <div>
            <h4
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: 16,
              }}
            >
              {t("CS_HOME_HEADER_CONTACT_US")}
            </h4>

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: isMobile ? "center" : "flex-start",
                marginBottom: 14,
              }}
            >
              <span>📍</span>
              <span
                style={{
                  fontSize: 13,
                  color: "#d5d5d5",
                  lineHeight: 1.6,
                }}
              >
                {t("LANDING_PAGE_ADDRESS")}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                justifyContent: isMobile ? "center" : "flex-start",
              }}
            >
              <span style={{ fontSize: 13, color: "#d5d5d5" }}>
                <span>📞</span> &ensp;
                {pgrData?.[0]?.helpLineNumber ? pgrData?.[0]?.helpLineNumber : "1800 2677 953"} :- {t("GRIEVANCE_HELPLINE_NO_INFO_TXT")}
              </span>

              <span style={{ fontSize: 13, color: "#d5d5d5" }}>
                <span>📞</span> &ensp;
                {pgrData?.[0]?.HelplineForSmartStreetLightComplaint ? pgrData?.[0]?.HelplineForSmartStreetLightComplaint : "1800 2677 953"} :-{" "}
                {t("STREET_LIGHT_HELPLINE_NO_INFO_TXT")}
              </span>
            </div>
          </div>

          {/* Social Block */}
          <div>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", marginBottom: 16, marginTop: 0 }}>{t("LANDING_PAGE_FOLLOW_US")}</h4>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: isMobile ? "center" : "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <a href="https://www.facebook.com/mynashikmc/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <SocialIcon bg="#1877F2" label="https://media-upyog.nmc.gov.in/nmc-public-media/icon/facebook.svg" />
                </a>

                <a href="https://x.com/my_nmc" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <SocialIcon bg="#1DA1F2" label="https://media-upyog.nmc.gov.in/nmc-public-media/icon/twitter.svg" />
                </a>

                <a href="https://www.youtube.com/c/mynmc" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <SocialIcon bg="#FF0000" label="https://media-upyog.nmc.gov.in/nmc-public-media/icon/youtube.svg" />
                </a>

                <a href="https://www.instagram.com/my_nmci" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <SocialIcon
                    bg="linear-gradient(45deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)"
                    label="https://media-upyog.nmc.gov.in/nmc-public-media/icon/instagram.svg"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <div
          style={{
            background: "#04113c",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: isMobile ? "10px 16px" : "10px 48px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: isMobile ? 8 : 0,
          }}
        >
          <span style={{ fontSize: 12, color: "#c8cfe8" }}>
            © 2026 Copyright &nbsp;|&nbsp; {t("LANDING_PAGE_GOV_CG")} &nbsp;|&nbsp; {t("LANDING_PAGE_ALL_RIGHTS_RESERVED")} &nbsp;|&nbsp; {t("LANDING_PAGE_ALL_RIGHTS_RESERVED")}
          </span>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <a href="#" style={{ fontSize: 12, color: "#c8cfe8", textDecoration: "none" }}>
              {t("LANDING_PAGE_TERMS_CONDITIONS")}
            </a>
            <span style={{ color: "#c8cfe8" }}>|</span>
            <a href="#" style={{ fontSize: 12, color: "#c8cfe8", textDecoration: "none" }}>
              {t("LANDING_PAGE_PRIVACY_POLICY")}
            </a>
          </div>
        </div>
    </div>
  )
}
function SocialIcon({ bg, label }) {
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: 15,
        cursor: "pointer",
      }}
    >
      {/* {label} */}

      <img src={label} alt="facebook" />
    </div>
  );
}

export default Footer