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
const Banner = "https://tfstatee8aog.blob.core.windows.net/filestore/home-images/41826c21c1036a64c75b1a50155249hoh213e50ee23.png";
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
  const [citizenCornerOpen, setCitizenCornerOpen] = useState(false);
  const [miscOpen, setMiscOpen] = useState(false);
  const [obpsOpen, setObpsOpen] = useState(false);
  const [ptOpen, setPtOpen] = useState(false);
  const [wsOpen, setWsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const loginRef = useRef(null);
  const citizenCornerRef = useRef(null);
  const history = useHistory();
  const { t } = useTranslation();

  const handleServiceClick = () => {
    history.push("/suda-ui/login");
  };

  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  useEffect(() => {
    function handleClick(e) {
      if (citizenCornerRef.current && !citizenCornerRef.current.contains(e.target)) {
        setCitizenCornerOpen(false);
      }
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

        {!isMobile && (
          <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Home */}
            <a
              href="/suda-ui/dashboard"
              style={{
                padding: "6px 14px",
                fontSize: 14,
                fontWeight: 600,
                color: "#A3610E",
                textDecoration: "none",
                borderBottom: "2px solid #A3610E",
                whiteSpace: "nowrap",
              }}
            >
              {t("LANDING_PAGE_HOME") || "Home"}
            </a>

            {/* Citizen Corner dropdown */}
            <div ref={citizenCornerRef} style={{ position: "relative" }}>
              <button
                onClick={() => setCitizenCornerOpen((o) => { if (o) setMiscOpen(false); return !o; })}
                style={{
                  padding: "6px 14px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#333",
                  background: "none",
                  border: "none",
                  borderBottom: "2px solid transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  whiteSpace: "nowrap",
                }}
              >
                {t("LANDING_PAGE_CITIZEN_CORNER") }
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1l4 4 4-4" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {citizenCornerOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    background: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
                    minWidth: 220,
                    zIndex: 200,
                    overflow: "visible",
                  }}
                >
                  {[
                    { label: t("COMMON_NOC_ISSUANCE") !== "COMMON_NOC_ISSUANCE" ? t("COMMON_NOC_ISSUANCE") : "NOC Issuance", href: "/suda-ui/comingsoon" },
                    { label: t("SERVICEDEFS.ACCOUNTING_FINANCE") !== "SERVICEDEFS.ACCOUNTING_FINANCE" ? t("SERVICEDEFS.ACCOUNTING_FINANCE") : "Accounting & Finance", href: "/suda-ui/comingsoon" },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href="#"
                      onClick={(e) => { e.preventDefault(); setCitizenCornerOpen(false); handleServiceClick(item.href); }}
                      style={{
                        display: "block",
                        padding: "11px 20px",
                        fontSize: 13,
                        color: "#333",
                        textDecoration: "none",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fff8f0")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                    >
                      {item.label}
                    </a>
                  ))}

                  {/* Miscellaneous with right flyout */}
                  <div
                    style={{ position: "relative" }}
                    onMouseEnter={() => setMiscOpen(true)}
                    onMouseLeave={() => setMiscOpen(false)}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "11px 20px",
                        fontSize: 13,
                        color: "#333",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0",
                        background: miscOpen ? "#fff8f0" : "#fff",
                        borderRadius: miscOpen ? "0" : "0",
                      }}
                    >
                      <span>{t("SERVICEDEFS.MISCELLANEOUS") !== "SERVICEDEFS.MISCELLANEOUS" ? t("SERVICEDEFS.MISCELLANEOUS") : "Miscellaneous"}</span>
                      {/* Right arrow */}
                      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M1 1l5 5-5 5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {miscOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: "100%",
                          background: "#fff",
                          border: "1px solid #e0e0e0",
                          borderRadius: 8,
                          boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
                          minWidth: 200,
                          zIndex: 300,
                          overflow: "hidden",
                        }}
                      >
                        {[
                          { label: t("MISC_SEARCH_AND_PAY") !== "MISC_SEARCH_AND_PAY" ? t("MISC_SEARCH_AND_PAY") : "Search and Pay", href: "/suda-ui/comingsoon" },
                          { label: t("MISC_MY_CHALLANS") !== "MISC_MY_CHALLANS" ? t("MISC_MY_CHALLANS") : "My Challans", href: "/suda-ui/comingsoon" },
                          { label: t("MISC_FAQ") !== "MISC_FAQ" ? t("MISC_FAQ") : "FAQ", href: "#faq" },
                        ].map((sub) => (
                          <a
                            key={sub.label}
                            href={sub.href}
                            onClick={(e) => { e.preventDefault(); setCitizenCornerOpen(false); setMiscOpen(false); handleServiceClick(sub.href); }}
                            style={{
                              display: "block",
                              padding: "11px 20px",
                              fontSize: 13,
                              color: "#333",
                              textDecoration: "none",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#fff8f0")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                          >
                            {sub.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* OBPS with right flyout */}
                  <div
                    style={{ position: "relative" }}
                    onMouseEnter={() => setObpsOpen(true)}
                    onMouseLeave={() => setObpsOpen(false)}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "11px 20px",
                        fontSize: 13,
                        color: "#333",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0",
                        background: obpsOpen ? "#fff8f0" : "#fff",
                      }}
                    >
                      <span>OBPS</span>
                      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M1 1l5 5-5 5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {obpsOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: "100%",
                          background: "#fff",
                          border: "1px solid #e0e0e0",
                          borderRadius: 8,
                          boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
                          minWidth: 240,
                          zIndex: 300,
                          overflow: "hidden",
                        }}
                      >
                        {[
                          { label: "View Application by Citizen", href: "/suda-ui/comingsoon" },
                          { label: "Register as Stakeholder", href: "/suda-ui/comingsoon" },
                          { label: "Registered Architect", href: "/suda-ui/comingsoon" },
                          { label: "Apply for Pre-approved Plan", href: "/suda-ui/comingsoon" },
                        ].map((sub) => (
                          <a
                            key={sub.label}
                            href={sub.href}
                            onClick={(e) => { e.preventDefault(); setCitizenCornerOpen(false); setObpsOpen(false); handleServiceClick(sub.href); }}
                            style={{
                              display: "block",
                              padding: "11px 20px",
                              fontSize: 13,
                              color: "#333",
                              textDecoration: "none",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#fff8f0")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                          >
                            {sub.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PT with right flyout */}
                  <div
                    style={{ position: "relative" }}
                    onMouseEnter={() => setPtOpen(true)}
                    onMouseLeave={() => setPtOpen(false)}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "11px 20px",
                        fontSize: 13,
                        color: "#333",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0",
                        background: ptOpen ? "#fff8f0" : "#fff",
                      }}
                    >
                      <span>Property Tax (PT)</span>
                      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M1 1l5 5-5 5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {ptOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: "100%",
                          background: "#fff",
                          border: "1px solid #e0e0e0",
                          borderRadius: 8,
                          boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
                          minWidth: 240,
                          zIndex: 300,
                          overflow: "hidden",
                        }}
                      >
                        {[
                          { label: "Search and Pay", href: "/suda-ui/comingsoon" },
                          { label: "My Tax Bills", href: "/suda-ui/comingsoon" },
                          { label: "Create Property", href: "/suda-ui/comingsoon" },
                          { label: "My Properties", href: "/suda-ui/comingsoon" },
                          { label: "My Applications", href: "/suda-ui/comingsoon" },
                          { label: "Transfer Property Ownership", href: "/suda-ui/comingsoon" },
                          { label: "My Payments", href: "/suda-ui/comingsoon" },
                        ].map((sub) => (
                          <a
                            key={sub.label}
                            href={sub.href}
                            onClick={(e) => { e.preventDefault(); setCitizenCornerOpen(false); setPtOpen(false); handleServiceClick(sub.href); }}
                            style={{
                              display: "block",
                              padding: "11px 20px",
                              fontSize: 13,
                              color: "#333",
                              textDecoration: "none",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#fff8f0")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                          >
                            {sub.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Water & Sewerage with right flyout */}
                  <div
                    style={{ position: "relative" }}
                    onMouseEnter={() => setWsOpen(true)}
                    onMouseLeave={() => setWsOpen(false)}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "11px 20px",
                        fontSize: 13,
                        color: "#333",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0",
                        background: wsOpen ? "#fff8f0" : "#fff",
                      }}
                    >
                      <span>Water &amp; Sewerage</span>
                      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M1 1l5 5-5 5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {wsOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: "100%",
                          background: "#fff",
                          border: "1px solid #e0e0e0",
                          borderRadius: 8,
                          boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
                          minWidth: 240,
                          zIndex: 300,
                          overflow: "hidden",
                        }}
                      >
                        {[
                          { label: "Search and Pay", href: "/suda-ui/comingsoon" },
                          { label: "My Bills", href: "/suda-ui/comingsoon" },
                          { label: "Connection", href: "/suda-ui/comingsoon" },
                          { label: "Apply for New Connection", href: "/suda-ui/comingsoon" },
                          { label: "My Applications", href: "/suda-ui/comingsoon" },
                          { label: "My Payments", href: "/suda-ui/comingsoon" },
                        ].map((sub) => (
                          <a
                            key={sub.label}
                            href={sub.href}
                            onClick={(e) => { e.preventDefault(); setCitizenCornerOpen(false); setWsOpen(false); handleServiceClick(sub.href); }}
                            style={{
                              display: "block",
                              padding: "11px 20px",
                              fontSize: 13,
                              color: "#333",
                              textDecoration: "none",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#fff8f0")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                          >
                            {sub.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Gallery */}
            <a
              href="#gallery"
              style={{
                padding: "6px 14px",
                fontSize: 14,
                fontWeight: 600,
                color: "#333",
                textDecoration: "none",
                borderBottom: "2px solid transparent",
                whiteSpace: "nowrap",
              }}
            >
              {t("LANDING_PAGE_GALLERY") || "Gallery"}
            </a>

            {/* Opportunities */}
            <a
              href="/suda-ui/opportunities"
              style={{
                padding: "6px 14px",
                fontSize: 14,
                fontWeight: 600,
                color: "#333",
                textDecoration: "none",
                borderBottom: "2px solid transparent",
                whiteSpace: "nowrap",
              }}
            >
              {t("LANDING_PAGE_OPPORTUNITIES") || "Opportunities"}
            </a>
          </nav>
        )}

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
      <div style={{ width: "100%", overflow: "visible", position: "relative", marginTop: "96px" }}>
        {/* <video src={Banner} autoPlay muted loop playsInline style={{ width: "100%", height: "400px", objectFit: "cover", display: "block" }} /> */}
        <img src={Banner} alt="Banner" style={{ width: "100%", height: "500px", objectFit: "cover", display: "block" }} />
        {/* Dark solid container band at bottom of banner */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 130,
            background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.88) 55%, rgba(0,0,0,0) 100%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        {/* ── INSIGHTS overlapping bottom of banner ── */}
        <InsightsSection isMobile={isMobile} />
      </div>

      {/* ── ANNOUNCEMENTS TICKER ── */}
      <AnnouncementsTicker />

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
          marginTop: isMobile ? 8 : 12,
          background: "#fff",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 80,
          justifyContent: "flex-start",
          alignItems: isMobile ? "flex-start" : "center",
        }}
      >
        {/* LEFT CONTENT */}
        <div style={{ flex: 1, width: "100%" }}>
          <h2
            style={{
              fontSize: "clamp(20px, 2.5vw, 24px)",
              fontWeight: 700,
              color: "#080501",
              marginBottom: 18,
              marginTop: 0,
            
            }}
          >
            {t("ABOUT_SUDA")}
          </h2>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              width: "100%",
            }}
          >
            <img
              src="https://tfstatee8aog.blob.core.windows.net/filestore/home-images/b67bd657e60014cc769868fb668adad390436cdf.png"
              alt="SUDA"
              style={{
                width: 120,
                height: 120,
                objectFit: "cover",
                borderRadius: 8,
                flexShrink: 0,
              }}
            />
            <h5
              style={{
                flex: 1,
                fontSize: "clamp(13px, 1.8vw, 15px)",
                fontWeight: 400,
                lineHeight: 1.6,
                margin: 0,
                color: "#444",
              }}
            >
              {t("ABOUT_SUDA_MESSAGE")}
            </h5>
          </div>
        </div>

        {/* RIGHT OFFICIALS */}

<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: isMobile ? "100%" : "auto", // ✅ FIXED
    marginLeft: isMobile ? 0 : "auto",
  }}
>
  {/* Card 1 */}
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    
    <div style={{ width: 150, display: "flex", justifyContent: "center" }}>
      <img
        src={vishnuSai}
        alt={t("COMMON_MAYOR_NAME")}
        style={{
          width: 150,
          height: 150,
          objectFit: "cover",
          objectPosition: "top center",
        }}
      />
    </div>

    <div
      style={{
        width: "220px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700, color: "#A3610E" }}>
        {t("COMMON_MAYOR_NAME")}
      </div>
      <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
        {t("COMMON_MAYOR_DESIG_LBL")}
      </div>
    </div>
  </div>

  {/* Card 2 */}
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    
    <div style={{ width: 150, display: "flex", justifyContent: "center" }}>
      <img
        src={ArunSaoImg}
        alt={t("COMMON_DEPUTY_MAYOR_NAME")}
        style={{
          width: 110,
          height: 110,
          objectFit: "cover",
          objectPosition: "top center",
        }}
      />
    </div>

    <div
      style={{
        width: "220px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700, color: "#A3610E" }}>
        {t("COMMON_DEPUTY_MAYOR_NAME")}
      </div>
      <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
        {t("COMMON_DEPUTY_MAYOR_DESIG_LBL")}
      </div>
    </div>
  </div>
</div>
  </section>

      {/* ── LATEST NEWS & EVENTS ── */}
      <NewsEventsCarousel isMobile={isMobile} />

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
          backgroundColor: "#fff",
        }}
      >
        <div>
          <h3 style={{textAlign:"center", fontWeight: 700, fontSize:30, marginBottom:40}}>{t("LANDING_PAGE_CITIZEN_CENTRIC_SERVICES")}</h3>

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

      {/* ── QUICK LINKS ── */}
      <QuickLinksSection isMobile={isMobile} />

      {/* ── FAQ ── */}
      <FaqSection isMobile={isMobile} />

      {/* ── CONNECT WITH SUDA ── */}
      <ConnectWithSuda isMobile={isMobile} isTablet={isTablet} />

      {/* ── GALLERY ── */}
      <GallerySection isMobile={isMobile} />

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
                {t("LANDING_PAGE_TITLE")}
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

const insightStats = [
  { value: "194", label: "URBAN_LOCAL_BODIES", icon: null },
  { value: "15+",  label: "CITIZEN_SERVICES",   icon: null },
  { value: "50K+", label: "APPLICATIONS",       icon: null },
  { value: "1L+",  label: "REGISTERED_CITIZENS",icon: null },
];

const announcementItems = [
  "Announcement_1",
  "Announcement_2",
  "Announcement_3",
  "Announcement_4",
];

function AnnouncementsTicker() {
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "#fff",
        width: "100%",
        height: 38,
        overflow: "hidden",
      }}
    >
      {/* Label */}
      <div
        style={{
          background: "#F59E0B",
          color: "#fff",
          fontWeight: 700,
          fontSize: 13,
          padding: "0 20px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          flexShrink: 0,
          letterSpacing: "0.3px",
        }}
      >
        {t("ANNOUNCEMENTS_LABEL")}
      </div>

      {/* Static items */}
      <div style={{ display: "flex", alignItems: "center", padding: "0 20px", gap: 24 }}>
        {announcementItems.map((item, i) => (
          <span key={i} style={{ fontSize: 13, color: "#333", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#F59E0B", fontWeight: 700, fontSize: 16 }}>•</span>
            {t(item)}
          </span>
        ))}
      </div>
    </div>
  );
}

function InsightsSection({ isMobile }) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: isMobile ? "0 12px" : "0 48px",
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 8 : 14,
        flexWrap: isMobile ? "wrap" : "nowrap",
      }}
    >
      {/* Insights label */}
      <div
        style={{
          color: "#fff",
          fontWeight: 700,
          fontSize: isMobile ? 14 : 17,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          flexShrink: 0,
          textShadow: "0 2px 8px rgba(0,0,0,0.8)",
          minWidth: isMobile ? "unset" : 80,
        }}
      >
        {t("INSIGHTS_LABEL")}
      </div>

      {/* Stat cards */}
      {insightStats.map((stat, i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 6px 24px rgba(0,0,0,0.28)",
            padding: isMobile ? "10px 12px" : "14px 22px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 4,
            flex: 1,
            minWidth: isMobile ? "calc(50% - 8px)" : 0,
          }}
        >
          {stat.icon ? (
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "#F59E0B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <img src={stat.icon} alt="" style={{ width: 26, height: 26, objectFit: "contain" }} />
            </div>
          ) : (
            <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 800, color: "#091E64", lineHeight: 1 }}>
              {stat.value}
            </div>
          )}
          <div style={{ fontSize: isMobile ? 10 : 11, color: "#666", fontWeight: 500, marginTop: 2 }}>
            {t(stat.label)}
          </div>
        </div>
      ))}
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
        height: 300,
        background: "#000",
        boxShadow: hovered
          ? "0 10px 28px rgba(0,0,0,0.3)"
          : "0 4px 12px rgba(0,0,0,0.15)",
        transform: hovered ? "translateY(-3px) scale(1.02)" : "none",
        transition: "all 0.25s ease",
        border: active ? "2px solid #A3610E" : "none",
      }}
    >
      {/* Image */}
      <img
        src={svc.img}
        alt={t(svc.title)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: hovered ? "scale(1.06)" : "scale(1)",
          transition: "transform 0.3s ease",
        }}
      />

      {/* Gradient */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "45%",
          background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Text */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          right: 16,
          fontSize: "clamp(12px, 1.2vw, 15px)",
          fontWeight: 600,
          color: "#fff",
          lineHeight: 1.4,
        }}
      >
        {t(svc.title)}
      </div>
    </div>
  );
}

function ConnectWithSuda({ isMobile, isTablet }) {
  const { t } = useTranslation();
  return (
    <section
      style={{
        position: "relative",
        background: "#f5ece9",
        backgroundImage: "url('https://tfstatee8aog.blob.core.windows.net/filestore/home-images/dd21920db1c31832196050888eb840655ce0fc3b.jpg')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right center",
        backgroundSize: "cover",
        backgroundBlendMode: "multiply",
        padding: isMobile ? "24px 14px" : isTablet ? "32px 28px" : "44px 56px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "center",
          gap: isMobile ? 20 : 48,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {/* LEFT — illustration */}
        {!isMobile && (
          <div style={{ flex: "0 0 auto" }}>
            <img
              src="https://tfstatee8aog.blob.core.windows.net/filestore/home-images/image%205.png"
              alt="Connect"
              style={{ width: isTablet ? 180 : 260, height: "auto", display: "block" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </div>
        )}

        {/* RIGHT — content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: isMobile ? 20 : "clamp(22px, 2.5vw, 32px)",
              fontWeight: 500,
              color: "#222",
              marginBottom: isMobile ? 16 : 28,
              marginTop: 0,
              textAlign: isMobile ? "center" : "left",
            }}
          >
            {t("CONNECT_WITH_SUDA")}
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: isMobile ? 10 : 12,
            }}
          >
            {/* Toll Free */}
            <div
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: isMobile ? "10px 10px" : "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 8 : 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                minWidth: 0,
              }}
            >
              <img src="https://tfstatee8aog.blob.core.windows.net/filestore/home-images/OIP%20(4)%201.png" alt="Toll Free" style={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, objectFit: "contain", flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: isMobile ? 9 : 10, color: "#000000", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
                  {t("CONNECT_TOLL_FREE_LABEL")}
                </div>
                <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700, color: "#FF8E01", wordBreak: "break-all" }}>
                  1800 123 8000
                </div>
              </div>
            </div>

            {/* Email */}
            <div
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: isMobile ? "10px 10px" : "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 8 : 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                minWidth: 0,
              }}
            >
              <img src="https://tfstatee8aog.blob.core.windows.net/filestore/home-images/download%201.png" alt="Email" style={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, objectFit: "contain", flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: isMobile ? 9 : 10, color: "#000000", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
                  {t("CONNECT_EMAIL_LABEL")}
                </div>
                <div style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: "#FF8E01", wordBreak: "break-all" }}>
                  suda@cg.gov.in
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <div
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: isMobile ? "10px 10px" : "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 8 : 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                minWidth: 0,
              }}
            >
              <img src="https://tfstatee8aog.blob.core.windows.net/filestore/home-images/OIP%20(2)%201.png" alt="WhatsApp" style={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, objectFit: "contain", flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: isMobile ? 9 : 10, color: "#000000", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
                  {t("CONNECT_WHATSAPP_LABEL")}
                </div>
                <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700, color: "#FF8E01" }}>
                  9876543210
                </div>
              </div>
            </div>

            {/* Follow Us */}
            <div
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: isMobile ? "10px 10px" : "10px 14px",
                display: "flex",
                flexDirection: "column",
                alignItems: isMobile ? "center" : "flex-start",
                gap: isMobile ? 8 : 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                minWidth: 0,
              }}
            >
              <div style={{ fontSize: isMobile ? 9 : 11, color: "#000000", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", flexShrink: 0 }}>
                {t("LANDING_PAGE_FOLLOW_US") || "Follow Us"}
              </div>
              <div style={{ display: "flex", gap: isMobile ? 6 : 10, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}>
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
                  <SocialIcon bg="#1877F2" label="https://media-upyog.nmc.gov.in/nmc-public-media/icon/facebook.svg" />
                </a>
                <a href="https://x.com/" target="_blank" rel="noopener noreferrer">
                  <SocialIcon bg="#1DA1F2" label="https://media-upyog.nmc.gov.in/nmc-public-media/icon/twitter.svg" />
                </a>
                <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">
                  <SocialIcon bg="#FF0000" label="https://media-upyog.nmc.gov.in/nmc-public-media/icon/youtube.svg" />
                </a>
                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                  <SocialIcon bg="linear-gradient(45deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)" label="https://media-upyog.nmc.gov.in/nmc-public-media/icon/instagram.svg" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const galleryPhotos = [
  "https://tfstatee8aog.blob.core.windows.net/filestore/home-images/74f6e4e8ecdf89599bd657f2561518466d5a0ae2.png",
  "https://tfstatee8aog.blob.core.windows.net/filestore/home-images/eb654f719887ee880b4bf66f9e0a3aaf422d4cb0.png",
];

const galleryVideos = [
  { thumb: "https://tfstatee8aog.blob.core.windows.net/filestore/home-images/Cards.png", url: "#" },
  { thumb: "https://tfstatee8aog.blob.core.windows.net/filestore/home-images/Cards.png", url: "#" },
];

function GallerySection({ isMobile }) {
  const { t } = useTranslation();
  return (
    <section
      id="gallery"
      style={{
        scrollMarginTop: 90,
        background: "#fff",
        padding: isMobile ? "28px 16px" : "40px 56px",
        borderTop: "1px solid #f0f0f0",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 28 : 40,
          alignItems: "flex-start",
        }}
      >
        {/* PHOTO GALLERY */}
        <div style={{ flex: "0 0 auto", width: isMobile ? "100%" : 280 }}>
          <h3
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#222",
              marginTop: 0,
              marginBottom: 14,
            }}
          >
            {t("GALLERY_PHOTO_HEADING") }
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {galleryPhotos.map((src, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  height: 130,
                  background: "#eee",
                }}
              >
                <img
                  src={src}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* VIDEO GALLERY */}
<div style={{ flex: 1, width: isMobile ? "100%" : "auto" }}>
  {/* ✅ Heading ABOVE videos */}
  <h3
    style={{
      fontSize: 17,
      fontWeight: 700,
      color: "#222",
      marginTop: 0,
      marginBottom: 16, // ✅ spacing from videos
    }}
  >
    {t("GALLERY_VIDEO_HEADING") }
  </h3>

  {/* ✅ Video Cards */}
  <div
    style={{
      display: "flex",
      gap: 14,
      flexDirection: isMobile ? "column" : "row",
      flexWrap: "wrap", // ✅ helps alignment
    }}
  >
    {galleryVideos.map((vid, i) => (
      <a
        key={i}
        href={vid.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", display: "block", width: isMobile ? "100%" : "auto" }}
      >
        <div
          style={{
            borderRadius: 8,
            overflow: "hidden",
            background: "#3a3a3a",

            // ✅ SIZE FIX (matches design)
            width: isMobile ? "100%" : 360,
            aspectRatio: "4 / 3",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
          }}
        >
          {/* Thumbnail */}
          {vid.thumb && (
            <img
              src={vid.thumb}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.5,
              }}
            />
          )}

          {/* Play button */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#F59E0B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 20 20">
              <polygon points="6,4 17,10 6,16" fill="#fff" />
            </svg>
          </div>
        </div>
      </a>
    ))}
  </div>
</div>
      </div>
    </section>
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

const quickLinks = [
  { label: "QUICK_LINK_POLICY",    fallback: "Policy",      icon: "🗂" },
  { label: "QUICK_LINK_NOTICES",   fallback: "Notices",     icon: "≡" },
  { label: "QUICK_LINK_ACT_RULES", fallback: "Act & Rules", icon: "📋" },
  { label: "QUICK_LINK_SCHEMES",   fallback: "Schemes",     icon: "📄" },
  { label: "QUICK_LINK_ORDERS",    fallback: "Orders",      icon: "=✗" },
  { label: "QUICK_LINK_TENDERS",   fallback: "Tenders",     icon: "📑" },
];


function QuickLinksSection({ isMobile }) {
  const { t } = useTranslation();

  return (
   <section
  style={{
    position: "relative",

    // ✅ Strong blue base
    backgroundColor: "#091E64",

    // ✅ Background image
    backgroundImage:
      "url('https://tfstatee8aog.blob.core.windows.net/filestore/home-images/a6348605a4074e8bbb1830a4a5f78bf5b38be6ce.png')",

    // ✅ KEY: makes white icons pop more
    backgroundBlendMode: "screen",   // ✅ BEST for white icons visibility

    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",

    padding: isMobile ? "40px 16px" : "60px 56px",
    minHeight: isMobile ? 200 : 260,

    display: "flex",
    alignItems: "center",
  }}
>
      {/* ✅ Correct deep blue overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(rgba(9,30,100,0.92), rgba(9,30,100,0.92))",
        }}
      />

      {/* ✅ Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : "repeat(3, 1fr)",
          gap: isMobile ? 12 : 16,
          maxWidth: 700,
          width: "100%",
          margin: "0 auto",
        }}
      >
        {quickLinks.map((link, i) => (
          <button
            key={i}
            style={{
              background: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",

              // ✅ compact typography
              fontSize: 12,
              fontWeight: 600,
              color: "#091E64",
              letterSpacing: "0.4px",
              textTransform: "uppercase",

              minHeight: 36,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#EEF2FF")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#fff")
            }
          >
            <span style={{ fontSize: 14, flexShrink: 0 }}>
              {link.icon}
            </span>

            {t(link.label) !== link.label
              ? t(link.label)
              : link.fallback}
          </button>
        ))}
      </div>
    </section>
  );
}


const faqItems = [
  { q: "FAQ_Q1" },
  { q: "FAQ_Q2" },
  { q: "FAQ_Q3" },
  { q: "FAQ_Q4" },
  { q: "FAQ_Q5" },
  { q: "FAQ_Q6" },
];

function FaqSection({ isMobile }) {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = React.useState(null);

  const half = Math.ceil(faqItems.length / 2);
  const col1 = faqItems.slice(0, half);
  const col2 = faqItems.slice(half);

  const FaqItem = ({ item, idx }) => {
    const isOpen = openIndex === idx;
    return (
      <div
        onClick={() => setOpenIndex(isOpen ? null : idx)}
        style={{
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          padding: "12px 16px",
          cursor: "pointer",
          background: "#fff",
          marginBottom: 10,
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13.5, color: "#333", fontWeight: 500 }}>
            {t(item.q)}
          </span>
          <span style={{ fontSize: 16, color: "#888", flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
        </div>
        {isOpen && (
          <p style={{ margin: "10px 0 0", fontSize: 13, color: "#555", lineHeight: 1.6 }}>
            {t(item.q + "_ANS")}
          </p>
        )}
      </div>
    );
  };

  return (
    <section
      style={{
        position: "relative",
        background: "#f9f7f4",
        padding: isMobile ? "32px 16px" : "44px 48px",
        overflow: "hidden",
      }}
    >
      {/* Decorative question mark */}
      <img
        src="https://tfstatee8aog.blob.core.windows.net/filestore/home-images/Vector.png"
        alt=""
        style={{
          position: "absolute",
          right: isMobile ? -20 : 40,
          top: "50%",
          transform: "translateY(-50%)",
          width: isMobile ? 140 : 220,
          height: "auto",
          opacity: 0.15,
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      <h3 style={{ fontSize: "clamp(18px, 2.2vw, 24px)", fontWeight: 700, color: "#222", marginBottom: 28, marginTop: 0, textAlign: "center" }}>
        {t("FAQ_HEADING")}
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "0 32px",
          position: "relative",
          zIndex: 1,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <div>{col1.map((item, i) => <FaqItem key={i} item={item} idx={i} />)}</div>
        <div>{col2.map((item, i) => <FaqItem key={i + half} item={item} idx={i + half} />)}</div>
      </div>
    </section>
  );
}

const newsItems = [
  { type: "News",   text: "NEWS_ITEM_1" },
  { type: "Events", text: "NEWS_ITEM_2" },
  { type: "News",   text: "NEWS_ITEM_3" },
  { type: "Events", text: "NEWS_ITEM_4" },
  { type: "News",   text: "NEWS_ITEM_5" },
  { type: "Events", text: "NEWS_ITEM_6" },
];

function NewsEventsCarousel({ isMobile }) {
  const { t } = useTranslation();
  const [current, setCurrent] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  const visibleCount = isMobile ? 1 : 4;
  const total = newsItems.length;

  React.useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % (total - visibleCount + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [playing, total, visibleCount]);

  const visible = newsItems.slice(current, current + visibleCount);

  return (
    <section
      style={{
        background: "#f5f0e8",
        padding: isMobile ? "28px 16px" : "36px 48px",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h3
          style={{
            fontSize: "clamp(18px, 2vw, 22px)",
            fontWeight: 700,
            color: "#222",
            margin: 0,
          }}
        >
          {t("LATEST_NEWS_AND_EVENTS") || "Latest News and Events"}
        </h3>

        {/* Controls */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setPlaying((p) => !p)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: "#555",
              padding: "4px 6px",
              lineHeight: 1,
            }}
            title={playing ? "Pause" : "Play"}
          >
            {playing ? "⏸" : "▶"}
          </button>
          <button
            onClick={() =>
              setCurrent((c) => Math.min(c + 1, total - visibleCount))
            }
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: "#555",
              padding: "4px 6px",
              lineHeight: 1,
            }}
          >
            ▶
          </button>
        </div>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${visibleCount}, 1fr)`,
          gap: 16,
        }}
      >
        {visible.map((item, i) => (
          <div
            key={current + i}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "20px 18px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Tag */}
            <span
              style={{
                display: "inline-block",
                alignSelf: "flex-start",
                padding: "4px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                color: "#fff",
                background: item.type === "Events" ? "#F59E0B" : "#1a1a1a",
              }}
            >
              {item.type}
            </span>

            {/* Text */}
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "#444",
                lineHeight: 1.65,
              }}
            >
              {t(item.text) !== item.text ? t(item.text) : item.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}