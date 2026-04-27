import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Redirect, Route, Switch, useLocation, useRouteMatch, useHistory } from "react-router-dom";
import { AppModules } from "../../components/AppModules";
import ErrorBoundary from "../../components/ErrorBoundaries";
import TopBarSideBar from "../../components/TopBarSideBar";
import ChangePassword from "./ChangePassword";
import ForgotPassword from "./ForgotPassword";
import LanguageSelection from "./LanguageSelection";
import EmployeeLogin from "./Login";
import UserProfile from "../citizen/Home/UserProfile";
import ErrorComponent from "../../components/ErrorComponent";
import { PrivateRoute, TopBar } from "@upyog/digit-ui-react-components";

const userScreensExempted = ["user/profile", "user/error"];

const EmployeeApp = ({
  stateInfo,
  userDetails,
  CITIZEN,
  cityDetails,
  mobileView,
  handleUserDropdownSelection,
  logoUrl,
  DSO,
  stateCode,
  modules,
  appTenants,
  sourceUrl,
  pathname,
  initData,
}) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { path } = useRouteMatch();
  const location = useLocation();
  const showLanguageChange = location?.pathname?.includes("language-selection");
  const isUserProfile = userScreensExempted.some((url) => location?.pathname?.includes(url));
  useEffect(() => {
    console.log("isMobile", window.Digit.Utils.browser.isMobile(),window.innerWidth)
    Digit.UserService.setType("employee");
  }, []);
  sourceUrl = "https://s3.ap-south-1.amazonaws.com/egov-qa-assets";
  const pdfUrl = "https://pg-egov-assets.s3.ap-south-1.amazonaws.com/Upyog+Code+and+Copyright+License_v1.pdf"

  return (
    <React.Fragment>
      <style>
        {`
          .navbar, .employeeChangePassword .submit-bar, .employeeForgotPassword button.submit-bar {
            background: #002991 !important;
          }

          .employeeForgotPassword .employee-card-input {
            height: 31px !important;
          }

          .employeeForgotPassword .employee-card-input:hover {
            border-left: none !important;
          }

          .employeeChangePassword .employeeCard .card-text-button {
            color: orange !important;
          }

          .RightMostTopBarOptions .EventNotificationWrapper {
            align-self: center;
          }

          .employeeCard .employee-select-wrap svg path:first-child {
            fill: transparent;
          }
        `}
      </style>

      <div className="employee">
        <Switch>
          <Route path={`${path}/user`}>
            {isUserProfile && (
              <TopBarSideBar
                t={t}
                stateInfo={stateInfo}
                userDetails={userDetails}
                CITIZEN={CITIZEN}
                cityDetails={cityDetails}
                mobileView={mobileView}
                handleUserDropdownSelection={handleUserDropdownSelection}
                logoUrl={logoUrl}
                showSidebar={isUserProfile ? true : false}
                showLanguageChange={!showLanguageChange}
              />
            )}
            <div
              className={isUserProfile ? "grounded-container" : "loginContainer"}
              style={
                isUserProfile
                  ? { padding: 0, paddingTop: "80px", marginLeft: mobileView ? "" : "64px" }
                  : { "--banner-url": `url(${stateInfo?.bannerUrl})`, padding: "0px" }
              }
            >
              <div className="loginnn">
                {/* <picture>
                <source media="(min-width: 760px)" src="https://i.postimg.cc/wxnnKGtG/Banner-18-10-22-1.png" style={{"position":"absolute","height":"100%","width":"100%"}}/>
                  <source media="(min-width: 400px)" srcset="https://i.postimg.cc/9Q7jT6Dd/Banner-Image-2.png" style={{"position":"absolute","height":"100%","width":"100%"}}/>
                  </picture> */}
                  <div className="login-logo-wrapper">
                <div className="logoNiua">
                  
                  </div>
                  </div>

                <TopBar></TopBar>

              <Switch>
                <Route path={`${path}/user/login`}>
                  <Redirect to="/upyog-ui/login" />
                </Route>
                <Route path={`${path}/user/forgot-password`}>
                  <ForgotPassword />
                </Route>
                <Route path={`${path}/user/change-password`}>
                  <ChangePassword />
                </Route>
                <PrivateRoute path={`${path}/user/profile`}>
                  <UserProfile stateCode={stateCode} userType={"employee"} cityDetails={cityDetails} />
                </PrivateRoute>
                <Route path={`${path}/user/error`}>
                  <ErrorComponent
                    initData={initData}
                    goToHome={() => {
                      history.push("/upyog-ui/employee");
                    }}
                  />
                </Route>
                <Route path={`${path}/user/language-selection`}>
                  <LanguageSelection />
                </Route>
                <Route>
                  <Redirect to={`${path}/user/language-selection`} />
                </Route>
              </Switch>
              </div>
            </div>
          </Route>
          <Route>
            <TopBarSideBar
              t={t}
              stateInfo={stateInfo}
              userDetails={userDetails}
              CITIZEN={CITIZEN}
              cityDetails={cityDetails}
              mobileView={mobileView}
              handleUserDropdownSelection={handleUserDropdownSelection}
              logoUrl={logoUrl}
              modules={modules}
            />
            <div className={`main ${DSO ? "m-auto" : ""}`}>
              <div className="employee-app-wrapper">
                <ErrorBoundary initData={initData}>
                  <AppModules stateCode={stateCode} userType="employee" modules={modules} appTenants={appTenants} />
                </ErrorBoundary>
              </div>
              {/* <div className="footerr" style={{ width: '100%', bottom: 0,backgroundColor:"white",color:"black !important"}}>
                <div style={{ display: 'flex', justifyContent: 'center', color:"color","backgroundColor":"#808080b3"  }}>
                  <img style={{ cursor: "pointer", display: "inline-flex", height: '1.4em' }} alt={"Powered by DIGIT"} src={`${sourceUrl}/digit-footer.png`} onError={"this.src='./../digit-footer.png'"} onClick={() => {
                    window.open('https://www.digit.org/', '_blank').focus();
                  }}></img>
                  <span style={{ margin: "0 10px" }}>|</span>
                  <span style={{ cursor: "pointer", fontSize: "16px", fontWeight: "400"}} onClick={() => { window.open('https://uad.cg.gov.in/', '_blank').focus();}} >Copyright © 2026 Urban Administration & Department</span>
                  <span style={{ margin: "0 10px" }}>|</span>
                  <a style={{ cursor: "pointer", fontSize: "16px", fontWeight: "400"}} href={pdfUrl} target='_blank'>UPYOG License</a>
                </div>
              </div> */}
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
          </Route>
          <Route>
            <Redirect to={`${path}/user/language-selection`} />
          </Route>
        </Switch>
      </div>
    </React.Fragment>
  );
};

export default EmployeeApp;
