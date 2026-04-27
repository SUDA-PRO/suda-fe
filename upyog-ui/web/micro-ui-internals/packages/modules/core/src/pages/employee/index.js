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

          /* ── Employee layout: sidebar full-height from top, topbar starts after sidebar ── */

          /* Sidebar starts from very top, full height like citizen */
          .employee .sidebar {
            margin-top: 0 !important;
            top: 0 !important;
            height: 100vh !important;
            background: #091E64 !important;
            background-image: none !important;
            z-index: 1000 !important;
          }

          /* Topbar sits to the right of the collapsed sidebar (55px) */
          .employee .topbar {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #091E64 !important;
            box-shadow: 0 1px 4px rgba(0,0,0,0.08) !important;
            left: 55px !important;
            width: calc(100% - 55px) !important;
            top: 0 !important;
          }

          /* When sidebar is hovered/expanded (260px wide) shift topbar */
          .employee .sidebar:hover ~ * .topbar,
          .employee:has(.sidebar:hover) .topbar {
            left: 260px !important;
            width: calc(100% - 260px) !important;
          }

          /* Content area: shift right to not go under sidebar, down to not go under topbar */
          .employee .main,
          .employee .employee-app-wrapper {
            padding-top: 56px !important;
            margin-left: 55px !important;
          }

          /* Sidebar menu items: active = orange highlight, hover = subtle white */
          .employee .sidebar .sidebar-link.active {
            background-color: #F47738 !important;
            border-right: none !important;
            color: #ffffff !important;
            border-radius: 6px;
          }
          .employee .sidebar .sidebar-link.active svg {
            fill: #ffffff !important;
          }
          .employee .sidebar .sidebar-link:hover {
            background-color: rgba(255,255,255,0.1) !important;
            color: #ffffff !important;
            border-radius: 6px;
          }
          .employee .sidebar .sidebar-link:hover svg {
            fill: #ffffff !important;
          }
          .employee .sidebar .dropdown-link.active,
          .employee .sidebar a.dropdown-link:hover {
            background-color: rgba(255,255,255,0.1) !important;
            color: #ffffff !important;
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
          background: "#ffffff",
          borderTop: "1px solid #e8e8e8",
          padding: "8px 0",
          textAlign: "center",
        }}
      >
        <span style={{ cursor: "pointer", fontSize: mobileView ? "14px" : "16px", fontWeight: "400", color: "black" }} onClick={() => { window.open('https://uad.cg.gov.in/', '_blank').focus(); }}>
          Copyright &copy; 2026 Urban Administration &amp; Department
        </span>
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
