import { forEach } from "lodash";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ACCENT = "#B54708";
const ORANGE = "#f47738";
const NAVY   = "#1a2b49";

const FSMLink = ({ parentRoute, isMobile, data }) => {
  const { t } = useTranslation();

  const allLinks = [
    {
      text: t("ES_TITLE_NEW_DESULDGING_APPLICATION"),
      link: "/suda-ui/employee/fsm/new-application",
      roles: ["FSM_CREATOR_EMP"],
      icon: "➕",
    },
    {
      text: t("ES_TITILE_SEARCH_APPLICATION"),
      link: `${parentRoute}/search`,
      icon: "🔍",
    },
    {
      text: t("ES_TITLE_REPORTS"),
      link: `/employee/report/fsm/FSMDailyDesludingReport`,
      roles: ["FSM_ADMIN"],
      hyperlink: true,
      icon: "📊",
    },
  ];

  const [links, setLinks] = useState([]);
  const { roles: userRoles } = Digit.UserService.getUser().info;

  useEffect(() => {
    const linksToShow = allLinks.filter(
      ({ roles }) => roles?.some((e) => userRoles?.map(({ code }) => code).includes(e)) || !roles?.length
    );
    setLinks(linksToShow);
  }, []);

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: "14px",
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(26,43,73,0.09)",
      border: "1px solid #e8edf5",
    }}>
      {/* Card header */}
      <div style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #274080 60%, ${ACCENT}cc 100%)`,
        padding: "14px 18px",
        display: "flex", alignItems: "center", gap: "10px",
      }}>
        <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", flexShrink: 0 }}>
          🚿
        </div>
        <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: "700", letterSpacing: "0.1px", lineHeight: 1.3 }}>
          {t("ES_TITLE_FAECAL_SLUDGE_MGMT")}
        </span>
      </div>

      {/* Action links */}
      <div style={{ padding: "10px 12px" }}>
        {links.map(({ link, text, hyperlink = false, icon }, index) => {
          const isFirst = index === 0;
          const linkStyle = {
            display: "flex", alignItems: "center", gap: "8px",
            padding: "9px 12px", borderRadius: "8px",
            color: isFirst ? ACCENT : "#3d4f6e",
            fontSize: "13px", fontWeight: isFirst ? "600" : "500",
            textDecoration: "none",
            background: isFirst ? "#fff7ed" : "#f7f8fb",
            border: `1px solid ${isFirst ? "#fed7aa" : "#edf0f5"}`,
            marginBottom: index < links.length - 1 ? "6px" : "0",
          };
          return hyperlink ? (
            <a key={index} href={link} style={linkStyle}>{icon && <span style={{ fontSize: "13px" }}>{icon}</span>}{text}</a>
          ) : (
            <Link key={index} to={link} style={linkStyle}>{icon && <span style={{ fontSize: "13px" }}>{icon}</span>}{text}</Link>
          );
        })}
      </div>
    </div>
  );
};

export default FSMLink;
