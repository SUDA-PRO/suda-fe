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
  const isPublicRoute =
    location?.pathname?.includes("user/login") ||
    location?.pathname?.includes("user/forgot-password") ||
    location?.pathname?.includes("user/language-selection") ||
    location?.pathname?.includes("user/change-password");
  const showShell = !isPublicRoute;
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

          /* Topbar sits to the right of the fixed expanded sidebar (320px) */
          .employee .topbar {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #091E64 !important;
            box-shadow: 0 1px 4px rgba(0,0,0,0.08) !important;
            left: 320px !important;
            width: calc(100% - 320px) !important;
            top: 0 !important;
          }

          /* Content area: shift right to not go under sidebar, down to not go under topbar */
          .employee .main,
          .employee .employee-app-wrapper {
            padding-top: 20px !important;
            margin-left: 205px !important;
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

          /* Fixed footer */
          .employee-footer {
            position: fixed;
            bottom: 0;
            left: 320px;
            width: calc(100% - 320px);
            background: #ffffff;
            border-top: 1px solid #e8e8e8;
            padding: 10px 0;
            text-align: center;
            z-index: 998;
          }

          /* Prevent content from hiding behind fixed footer */
          .employee .main {
            padding-bottom: 44px !important;
          }
        `}
      </style>

      <div className="employee">
        {/* ── Persistent shell: sidebar + topbar + footer, mounted once ── */}
        {showShell && (
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
            showLanguageChange={!showLanguageChange}
          />
        )}

        {showShell ? (
          <React.Fragment>
            <div className={`main ${DSO ? "m-auto" : ""}`}>
              <div className="employee-app-wrapper">
                <ErrorBoundary initData={initData}>
                  <Switch>
                    <PrivateRoute path={`${path}/user/profile`}>
                      <UserProfile stateCode={stateCode} userType={"employee"} cityDetails={cityDetails} />
                    </PrivateRoute>
                    <Route path={`${path}/user/error`}>
                      <ErrorComponent initData={initData} goToHome={() => { history.push("/suda-ui/employee"); }} />
                    </Route>
                    <Route>
                      <AppModules stateCode={stateCode} userType="employee" modules={modules} appTenants={appTenants} />
                    </Route>
                  </Switch>
                </ErrorBoundary>
              </div>
            </div>
            <div className="employee-footer">
              <span
                style={{ cursor: "pointer", fontSize: mobileView ? "14px" : "16px", fontWeight: "400", color: "#444" }}
                onClick={() => { window.open('https://uad.cg.gov.in/', '_blank').focus(); }}
              >
                Copyright &copy; 2026 Urban Administration &amp; Department
              </span>
            </div>
          </React.Fragment>
        ) : (
          /* ── Public / auth routes: no sidebar ── */
          <div className="loginContainer" style={{ "--banner-url": `url(${stateInfo?.bannerUrl})`, padding: "0px" }}>
            <div className="loginnn">
              <div className="login-logo-wrapper"><div className="logoNiua"></div></div>
              <TopBar></TopBar>
              <Switch>
                <Route path={`${path}/user/login`}>
                  <Redirect to="/suda-ui/login" />
                </Route>
                <Route path={`${path}/user/forgot-password`}>
                  <ForgotPassword />
                </Route>
                <Route path={`${path}/user/change-password`}>
                  <ChangePassword />
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
        )}
      </div>
    </React.Fragment>
  );
};

export default EmployeeApp;
