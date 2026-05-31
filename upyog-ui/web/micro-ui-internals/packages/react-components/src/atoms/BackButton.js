import React, { useState } from "react";
import { ArrowLeft, ArrowLeftWhite } from "./svgindex";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";

const backBtnBaseStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "7px 16px 7px 10px",
  borderRadius: "20px",
  border: "1.5px solid #1E3A8A",
  background: "#ffffff",
  color: "#1E3A8A",
  fontWeight: "600",
  fontSize: "14px",
  lineHeight: "1",
  marginBottom: "16px",
  marginLeft: "0",
  cursor: "pointer",
  boxShadow: "0 1px 4px rgba(30,58,138,0.10)",
  transition: "background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.12s",
  userSelect: "none",
  width: "fit-content",
};

const backBtnHoverStyle = {
  ...backBtnBaseStyle,
  background: "#1E3A8A",
  color: "#ffffff",
  boxShadow: "0 4px 12px rgba(30,58,138,0.25)",
  transform: "translateY(-1px)",
};

const BackButton = ({ history, style, isSuccessScreen, isCommonPTPropertyScreen, getBackPageNumber, className = "", variant = "black" }) => {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const computedStyle = { ...(hovered ? backBtnHoverStyle : backBtnBaseStyle), ...style };
  return (
    <div
      className={`back-btn2 ${className}`}
      style={computedStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        !isSuccessScreen
          ? !isCommonPTPropertyScreen
            ? window.location.href.includes("/citizen/fsm/new-application/street")
              ? window.history.go(getBackPageNumber())
              : (history.goBack(),
                window.location.href.includes("/citizen/pt/property/new-application/property-type")
                  ? sessionStorage.setItem("docReqScreenByBack", true)
                  : null)
            : null
          : null;
      }}
    >
      {variant == "black" ? (
        <React.Fragment>
          <ArrowLeft style={{ fill: hovered ? "#ffffff" : "#1E3A8A" }} />
          <p style={{ margin: 0, color: "inherit" }}>{t("CS_COMMON_BACK")}</p>
        </React.Fragment>
      ) : (
        <ArrowLeftWhite />
      )}
    </div>
  );
};
export default withRouter(BackButton);
