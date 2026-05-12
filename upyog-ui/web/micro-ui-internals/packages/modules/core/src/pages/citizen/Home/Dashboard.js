// import React, { useMemo } from "react";
// import { PageBasedInput, Loader, RadioButtons, CardHeader } from "@upyog/digit-ui-react-components";
// import { useTranslation } from "react-i18next";
// import { useHistory } from "react-router-dom";

// const Dashboard = () => {
//   const { t } = useTranslation();
//   const history = useHistory();

//   return  (

//     <div className="selection-card-wrapper">
//      <h1>ABCD</h1>
//     </div>
//   )
// };

// export default Dashboard;

import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import ChangeLanguage from "../../../components/ChangeLanguage";
import { useTranslation } from "react-i18next";
// import IndianFlag from './SvgStore/Inidan-Flag.svg';
import { ReactComponent as IndianFlag } from "../../../assets/Inidan-Flag.svg";
// import vishnuSai from "../../../assets/vishnuSai.png";
// import CGLogo from "../../../assets/cglogo.png";
// import Banner from "../../../assets/banner.png";
// import Banner from "./banner.png"
// import NMC from "./NMC.png"
// import Nashik from "./nashik.png"
// import firstMajor from "./firstMajor.png"
// import secondMajor from "./secondMajor.png"
// import thirdMajor from "./thirdMajor.png"
// import fourthMajor from "./forthMajor.png"

const NMC = "https://media-upyog.nmc.gov.in/nmc-public-media/logo/NMC_logo.svg";
const Nashik = "https://media-upyog.nmc.gov.in/nmc-public-media/banner/Nashik_city_outline.svg";
// const Banner = "https://media-upyog.nmc.gov.in/nmc-public-media/video/Landing-Video.mp4";
const Banner = "https://tfstatee8aog.blob.core.windows.net/filestore/banner.png";
const CGLogo = "https://tfstatee8aog.blob.core.windows.net/filestore/cglogo%201.png";
const vishnuSai = "https://tfstatee8aog.blob.core.windows.net/filestore/VishnuDeo.png";
const ArunSaoImg = "https://tfstatee8aog.blob.core.windows.net/filestore/ArunSao%201.png";
const secondMajor = "https://media-upyog.nmc.gov.in/nmc-public-media/banner/Deputy_Mayor.png";
const thirdMajor = "https://media-upyog.nmc.gov.in/nmc-public-media/banner/Commissioner.png";
const fourthMajor = "";

const officials = [
  { name: "COMMON_MAYOR_NAME", title: "COMMON_MAYOR_DESIG_LBL", img: vishnuSai },
  { name: "COMMON_DEPUTY_MAYOR_NAME", title: "COMMON_DEPUTY_MAYOR_DESIG_LBL", img: ArunSaoImg },
  // { name: "COMMON_COMMISSIONER_NAME", title: "COMMON_COMMISSIONER_DESIG_LBL", img: thirdMajor },
  //   { name: "Smt. Karishma Nair, I.A.S.", title: "Additional Commissioner", img: fourthMajor },
];

const servicesRow1 = [
  {
    title: "COMMON_GRIEVANCE_REDRESSAL",
    img: "https://tfstatee8aog.blob.core.windows.net/filestore/GrievanceImage.png",
    url: "/suda-ui/login",
  },
  { title: "MODULE_TL", img: "https://tfstatee8aog.blob.core.windows.net/filestore/TradeLicence.png", url: "/suda-ui/comingsoon" },
  {
    title: "COMMON_HOARDING_PERMISSION",
    img: "https://tfstatee8aog.blob.core.windows.net/filestore/hoardingPermission.png",
    url: "/suda-ui/comingsoon",
  },
  {
    title: "COMMON_ROAD_CUTTING",
    img: "https://tfstatee8aog.blob.core.windows.net/filestore/RoadCutting.png",
    url: "/suda-ui/comingsoon",
  },
  {
    title: "COMMON_NOC_ISSUANCE",
    img: "https://tfstatee8aog.blob.core.windows.net/filestore/NocIssuance.png",
    url: "/suda-ui/comingsoon",
  },
];

const servicesRow2 = [
  {
    title: "COMMON_WATER_SEWERAGE_CONNECTION",
    img: "https://tfstatee8aog.blob.core.windows.net/filestore/WaterSewerage.png",
    url: "/suda-ui/comingsoon",
  },
  {
    title: "SERVICEDEFS.ACCOUNTING_FINANCE",
    img: "https://tfstatee8aog.blob.core.windows.net/filestore/AccountFinance.png",
    url: "/suda-ui/comingsoon",
  },
  {
    title: "SERVICEDEFS.MISCELLANEOUS",
    img: "https://tfstatee8aog.blob.core.windows.net/filestore/Miscellaneous.png",
    url: "/suda-ui/comingsoon",
  },

  {
    title: "SERVICEDEFS.PROPERTYTAX",
    img: "https://tfstatee8aog.blob.core.windows.net/filestore/PropertyTax.png",
    url: "/suda-ui/comingsoon",
  },
  {
    title: "SERVICEDEFS.DESLUDGING",
    img: "https://tfstatee8aog.blob.core.windows.net/filestore/DesludgingServices.png",
    url: "/suda-ui/comingsoon",
  },
];

export default function Dashboard() {
  const [searchVal, setSearchVal] = useState("");
  const [activeService, setActiveService] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const loginRef = useRef(null);
  const history = useHistory();
  const { t } = useTranslation();

  const [width, setWidth] = useState(window.innerWidth);

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

  // console.log("MODULESSS==",modules);

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

  // console.log(pgrData);
  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        marginTop: -78,
        padding: 0,
        background: highContrast ? "#000" : "#fff",
        minHeight: "100vh",
        fontSize: fontSize,
        filter: highContrast ? "invert(1) hue-rotate(180deg)" : "none",
        marginTop: "8px",
      }}
    >
      <style>
        {`
            .select-wrap {
              margin-bottom:0px;
            }

            .employee-select-wrap {
                margin-bottom:0px;
            }

            .navbar{
                display:none !important;
            }
                /*
            .lastFooter{
                display:none !important;
            }    
        */
    `}</style>

      {/* ── TOP UTILITY BAR ── */}
      <div
      style={{
        // background: "#0A1E64",
        background: "linear-gradient(90deg,rgba(10, 30, 100, 1) 0%, rgba(163, 97, 14, 1) 100%, rgba(163, 97, 14, 1) 94%)",
        borderBottom: "1px solid #e8cccc",
        padding: isMobile ? "4px 10px" : "6px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: isMobile ? 11 : 12,
        color: "#ffffff",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      {/* LEFT SECTION */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Flag */}
        <div
          style={{
            width: isMobile ? 25 : 25,
            height: isMobile ? 18 : 18,
            borderRadius: 2,
            overflow: "hidden",
            border: "0.5px solid #ccc",
          }}
        >
          <IndianFlag width="100%" height="100%" />
        </div>

        {/* Republic of India text (hide on mobile) */}
        {!isMobile && (
          <span
            style={{
              fontWeight: 500,
              color: "#e8e8e8",
              fontSize: isTablet ? 11.5 : 12,
              whiteSpace: "nowrap",
            }}
          >
            {t("LANDING_PAGE_REP_IND")}
          </span>
        )}
      </div>

      {/* RIGHT SECTION */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Skip to main (hide on mobile) */}
        {/* {!isMobile && ( */}
          <a
            href="#main"
            style={{
              color: "#eaeaea",
              fontSize: 11.5,
              textDecoration: "none",
              padding: "0 12px",
              borderRight: "1px solid #ccc",
              whiteSpace: "nowrap",
            }}
          >
            {t("LANDING_PAGE_SKIP_TO")}
          </a>
        {/* )} */}

        {/* Font size controls (hide on mobile) */}
        {/* {!isMobile && ( */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0 12px",
              borderRight: "1px solid #ccc",
            }}
          >
            <button
              onClick={() => setFontSize((f) => Math.min(f + 2, 22))}
              style={fontBtnStyle(15)}
            >
              A<sup>+</sup>
            </button>

            <button
              onClick={() => setFontSize(16)}
              style={{
                ...fontBtnStyle(13),
                background: "#7A1E1C",
                color: "#fff",
                borderRadius: 2,
                padding: "1px 6px",
              }}
            >
              A
            </button>

            <button
              onClick={() => setFontSize((f) => Math.max(f - 2, 12))}
              style={fontBtnStyle(11)}
            >
              A<sup>-</sup>
            </button>
          </div>
        {/* )} */}

        {/* Language switcher (always visible) */}
        <div
          style={{
            padding: isMobile ? "0 6px" : "0 12px",
            cursor: "pointer",
            fontSize: isMobile ? 11 : 11.5,
          }}
        >
          <ChangeLanguage dropdown />
        </div>
      </div>
    </div>

      {/* ── MAIN HEADER ── */}
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
          {/* <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
            alt="Emblem of India"
            style={{ width: 44, height: 44 }}
          /> */}
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
          {/* Login Button */}
          <button
            onClick={() => { window.location.href = "/suda-ui/login"; }}
            style={{
              padding: "8px 20px",
              borderRadius: 6,
              border: "1.7px solid #A3610E",
              background: "#fff",
              color: "#A3610E",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {t("CORE_COMMON_LOGIN")}
          </button>

          <button
            style={{
              padding: "8px 22px",
              borderRadius: 6,
              border: "none",
              background: "#A3610E",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              letterSpacing: "0.2px",
            }}
            onClick={() => {
              // setLoginOpen(false);
              window.location.href = "/suda-ui/citizen/register/user";
            }}
          >
            {" "}
            {t("CORE_REGISTER_HEADING")}
          </button>
        </div>
      </header>

      {/* ── BANNER ── */}
      <div style={{ width: "100%", overflow: "hidden", position: "relative", marginTop: "96px" }}>
        {/* <video src={Banner} autoPlay muted loop playsInline style={{ width: "100%", height: "400px", objectFit: "cover", display: "block" }} /> */}
        <img src={Banner} alt="Banner" style={{ width: "100%", height: "500px", objectFit: "cover", display: "block" }} />
        <div
          style={{
            height:20,
            width: "100%",
            background: "linear-gradient(90deg,rgba(10, 30, 100, 1) 0%, rgba(163, 97, 14, 1) 100%, rgba(163, 97, 14, 1) 94%)"          }}
        />
      </div>

      {/* ── WELCOME + OFFICIALS ── */}
      {/* <section
        id="main"
        style={{ scrollMarginTop: 90, padding: "36px 48px 20px", background: "#fff", display: "flex", justifyContent: "space-between" }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#7A1E1C", marginBottom: 12, marginTop: 0 }}>
         

            {t("LANDING_PAGE_WEL_NMC")}
          </h2>
          <div style={{ display: "flex", alignItems: "center", width: 360 }}>
         

            <h5> {t("LANDING_PAGE_ABOUT_NMC")} </h5>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
          {officials.map((off, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 160 }}>
              <div
                style={{
                  width: 148,
                  height: 160,
                  overflow: "hidden",
                  // background: "linear-gradient(145deg, #f5c27a 60%, #e8a830 100%)",
                  // border: "3px solid #f5c27a", marginBottom: 12,
                }}
              >
                <img src={off.img} alt={off.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#7A1E1C", textAlign: "center", marginBottom: 4 }}>{t(off.name)}</div>
              <div style={{ fontSize: 11.5, color: "#555", textAlign: "center" }}> {t(off.title)} </div>
            </div>
          ))}
        </div>
      </section> */}

      <section
        id="main"
        style={{
          scrollMarginTop: 90,
          padding: isMobile ? "24px 16px" : "36px 48px 20px",
          background: "#ededed",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 32,
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
        }}
      >
        {/* LEFT CONTENT */}
        <div style={{ flex: 1, maxWidth: isMobile ? "100%" : 420 }}>
          <h2
            style={{
              fontSize: "clamp(18px, 2.5vw, 22px)",
              fontWeight: 700,
              color: "#A3610E",
              marginBottom: 12,
              marginTop: 0,
            }}
          >
            {t("LANDING_PAGE_WELCOME")}
          </h2>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
            }}
          >
            <h5
              style={{
                fontSize: "clamp(13px, 1.8vw, 15px)",
                fontWeight: 400,
                lineHeight: 1.6,
                margin: 0,
                color: "#444",
              }}
            >
              {t("LANDING_PAGE_WELCOME_MESSAGE")}
            </h5>
          </div>
        </div>

        {/* RIGHT OFFICIALS */}
        <div
          style={{
            flex: 1.2,
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            justifyContent: isMobile ? "center" : "flex-end",
          }}
        >



 {/* <!-- CM Card --> */}
   
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: isMobile ? 130 : 200,
              }}
            >
              <div
                style={{
                  width: isMobile ? 120 : 230,
                  height: isMobile ? 130 : 160,
           
                }}
              >
                <img
                  src={vishnuSai}
                  alt={t("COMMON_MAYOR_NAME")}
                  style={{
                    height:250,
                    width:230,
                    marginTop:-30
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#A3610E",
                  textAlign: "center",
                  marginBottom: 4,
                  marginTop: 8,
                }}
              >
                {t("COMMON_MAYOR_NAME")}
              </div>

              <div
                style={{
                  fontSize: 11.5,
                  color: "#555",
                  textAlign: "center",
                }}
              >
                {t("COMMON_MAYOR_DESIG_LBL")}
              </div>
            </div>

                  {/* <!-- Deputy Mayor Card --> */}

            <div

              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: isMobile ? 130 : 160,
              }}
            >
              <div
                style={{
                  width: isMobile ? 120 : 148,
                  height: isMobile ? 130 : 160,
                  overflow: "hidden",
                }}
              >
                <img
                  src={ArunSaoImg}
                  alt={t("COMMON_DEPUTY_MAYOR_NAME")}
                  style={{
                    height:200
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#A3610E",
                  textAlign: "center",
                  marginBottom: 4,
                  marginTop: 8,
                }}
              >
                {t("COMMON_DEPUTY_MAYOR_NAME")}
              </div>

              <div
                style={{
                  fontSize: 11.5,
                  color: "#555",
                  textAlign: "center",
                }}
              >
                {t("COMMON_DEPUTY_MAYOR_DESIG_LBL")}
              </div>
            </div>
    
        </div>
      </section>

      {/* ── SKYLINE SVG ── */}
      {/* <div style={{ padding: "4px 48px 14px", pointerEvents: "none" }}>
        <img src={Nashik} alt="Nashik Skyline" style={{ width: "100%", height: 200 }} />
      </div> */}

      {/* ── SERVICES ROW 1 ── */}
      {/* <section style={{ padding: "0 40px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14 }}>
          {servicesRow1.map((svc, i) => (
            <ServiceCard key={i} svc={svc} active={activeService === i} onClick2={() => setActiveService(i)} />
          ))}
        </div>
      </section> */}

      {/* ── SERVICES ROW 2 ── */}
      {/* <section style={{ padding: "14px 40px 44px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14 }}>
          {servicesRow2.map((svc, i) => (
            <ServiceCard key={i} svc={svc} active={activeService === i + 6} onClick2={() => setActiveService(i + 6)} />
          ))}
        </div>
      </section> */}

      <section
        style={{
          padding: "24px clamp(16px, 4vw, 40px) 0",
          backgroundColor: "#ededed",
        }}
      >
        <div>
          <h3 style={{textAlign:"center", fontWeight: 700, fontSize:30, marginBottom:40}}>Our Citizen Centric Services</h3>

        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : isTablet ? "repeat(3, 1fr)" : "repeat(5, 1fr)",
            gap: 16,
          }}
        >
          {servicesRow1.map((svc, i) => (
            <ServiceCard key={i} svc={svc} active={activeService === i} onClick2={() => setActiveService(i)} />
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "16px clamp(16px, 4vw, 40px) 44px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : isTablet ? "repeat(3, 1fr)" : "repeat(5, 1fr)",
            gap: 16,
          }}
        >
          {servicesRow2.map((svc, i) => (
            <ServiceCard key={i} svc={svc} active={activeService === i + 6} onClick2={() => setActiveService(i + 6)} />
          ))}
        </div>
      </section>

      {/* ── FOOTER MAIN ── */}
      {/* <footer style={{ background: "#f9ece9", padding: "36px 48px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 1fr", gap: 40, alignItems: "start" }}>
        
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" style={{ width: 36, height: 36 }} />
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 10,
                }}
              >
                <img src={CGLogo} alt="CG Logo" style={{ width: 35, height: 35 }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>Government of Maharashtra</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#222", lineHeight: 1.5, marginTop: 3 }}>
                NASHIK MUNICIPAL
                <br />
                CORPORATION
              </div>
            </div>
          </div>

      
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: "#7A1E1C", marginBottom: 16, marginTop: 0 }}>
          
              {t("CS_HOME_HEADER_CONTACT_US")}
            </h4>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
              <span style={{ fontSize: 18, lineHeight: 1.2 }}>📍</span>
              <span style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              
                {t("LANDING_PAGE_ADDRESS")}
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>📞</span>
              <span style={{ fontSize: 13, color: "#444" }}>+91-7030300300</span>
            </div>
          </div>

       
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: "#7A1E1C", marginBottom: 16, marginTop: 0 }}>

              {t("LANDING_PAGE_FOLLOW_US")}
            </h4>
            <div style={{ display: "flex", gap: 10 }}>
           
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
      </footer> */}

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
              {/* <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                alt="Emblem of India"
                style={{ width: 36, height: 36 }}
              /> */}
              <img src={CGLogo} alt="CG Logo" style={{ width: 35, height: 35 }} />
            </div>

            <div>
              <div
                style={{
                  fontSize: 10,
                  color: "#e4e4e4",
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
                  color: "#e4e4e4",
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
                color: "#e6932cfc",
                marginBottom: 16,
                textTransform: "uppercase",
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
                  color: "#e4e4e4",
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
              <span style={{ fontSize: 13, color: "#e4e4e4" }}>
                <span>📞</span> &ensp;
                {pgrData?.[0]?.helpLineNumber ? pgrData?.[0]?.helpLineNumber : "0253 - 2575631 / 2 / 3 / 4"}
              </span>

              {/* <span style={{ fontSize: 13, color: "#e4e4e4" }}>
                <span>📞</span> &ensp;
                {pgrData?.[0]?.HelplineForSmartStreetLightComplaint ? pgrData?.[0]?.HelplineForSmartStreetLightComplaint : "1800 2677 953"} :-{" "}
                {t("STREET_LIGHT_HELPLINE_NO_INFO_TXT")}
              </span> */}
            </div>
          </div>

          {/* Social Block */}
          <div>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "#e6932cfc", marginBottom: 16, marginTop: 0 }}>{t("LANDING_PAGE_FOLLOW_US")}</h4>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: isMobile ? "center" : "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <SocialIcon bg="#1877F2" label="https://media-upyog.nmc.gov.in/nmc-public-media/icon/facebook.svg" />
                </a>

                <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <SocialIcon bg="#1DA1F2" label="https://media-upyog.nmc.gov.in/nmc-public-media/icon/twitter.svg" />
                </a>

                <a href="https://www.youtube.com/c" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <SocialIcon bg="#FF0000" label="https://media-upyog.nmc.gov.in/nmc-public-media/icon/youtube.svg" />
                </a>

                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
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
      {/* ── BOTTOM COPYRIGHT BAR ── */}
      
    </div>
  );
}

function ServiceCard({ svc, active, onClick2 }) {
  const history = useHistory();
  const { t } = useTranslation();
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onClick={() => history.push(svc.url)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.28)" : "0 2px 8px rgba(0,0,0,0.14)",
        transform: hovered ? "translateY(-3px) scale(1.02)" : "none",
        transition: "all 0.22s ease"
      }}
    >
      <img
        src={svc.img}
        alt={t(svc.title)}
        style={{
          width: "100%",
          height: 300,
          objectFit: "cover",
          display: "block",
          transform: hovered ? "scale(1.06)" : "scale(1)",
          transition: "transform 0.3s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 12,
          right: 12,
          fontSize: "clamp(11px, 1.1vw, 14px)",
          fontWeight: 600,
          color: "#ffffff",
          lineHeight: 1.35,
          textShadow: "0 1px 4px rgba(0,0,0,0.5)",
        }}
      >
        {t(svc.title)}
      </div>
    </div>
  );
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
