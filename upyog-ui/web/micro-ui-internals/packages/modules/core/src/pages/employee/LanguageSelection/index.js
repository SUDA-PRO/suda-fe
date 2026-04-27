import { Card, CustomButton, SubmitBar } from "@upyog/digit-ui-react-components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import Background from "../../../components/Background";

const LanguageSelection = () => {
  const { data: storeData, isLoading } = Digit.Hooks.useStore.getInitData();
  const { t } = useTranslation();
  const history = useHistory();
  const { languages, stateInfo } = storeData || {};
  const selectedLanguage = Digit.StoreData.getCurrentLanguage();
  const [selected, setselected] = useState(selectedLanguage);
  const handleChangeLanguage = (language) => {
    setselected(language.value);
    Digit.LocalizationService.changeLanguage(language.value, stateInfo.code);
  };
  let sourceUrl = "https://s3.ap-south-1.amazonaws.com/egov-qa-assets";
  const pdfUrl = "https://pg-egov-assets.s3.ap-south-1.amazonaws.com/Upyog+Code+and+Copyright+License_v1.pdf";

  const handleSubmit = (event) => {
    history.push("/upyog-ui/employee/user/login");
  };

  if (isLoading) return null;

  return (
    <Background>
      <Card className="bannerCard removeBottomMargin">
       
        <div className="language-selector" style={{ justifyContent: "space-around", marginBottom: "24px", padding: "0 5%" }}>
          {languages.slice(0, -1).map((language, index) => (
            <div className="language-button-container" key={index}>
              <CustomButton
                selected={language.value === selected}
                text={language.label}
                onClick={() => handleChangeLanguage(language)}
              ></CustomButton>
            </div>
          ))}
        </div>
        <SubmitBar style={{ width: "100%" }} label={t(`CORE_COMMON_CONTINUE`)} onSubmit={handleSubmit} />
      </Card>

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
    </Background>
  );
};

export default LanguageSelection;
