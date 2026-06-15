import React, { useEffect } from "react";
import { Redirect, Route, Switch, useHistory, useLocation, useParams } from "react-router-dom";
import EmployeeApp from "./pages/employee";
import CitizenApp from "./pages/citizen";
import SudaLoginPage from "./pages/employee/Login/SudaLoginPage";
import Dashboard from "./pages/citizen/Home/Dashboard";
import CityPage from "./pages/citizen/Home/CityPage";

const CityDashboard = (props) => {
  const { city } = useParams();
  const { data: cities, isLoading } = Digit.Hooks.useTenants();

  // While MDMS cities are loading, render nothing
  if (isLoading || !cities) return null;

  // Validate the city slug against MDMS tenants (same matching logic as SudaLoginPage)
  const slug = city?.toLowerCase() || "";
  const validCity = cities.find(
    (c) =>
      c.name?.toLowerCase() === slug ||
      c.code?.toLowerCase().endsWith(slug) ||
      c.code?.toLowerCase().split(".").pop() === slug
  );

  // If the city does not exist in MDMS, redirect to home
  if (!validCity) return <Redirect to="/suda-ui/home" />;

  return <CityPage {...props} citySlug={city} />;
};

export const DigitApp = ({ stateCode, modules, appTenants, logoUrl, initData }) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const innerWidth = window.innerWidth;
  const cityDetails = Digit.ULBService.getCurrentUlb();
  const userDetails = Digit.UserService.getUser();
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { stateInfo } = storeData || {};
  const DSO = Digit.UserService.hasAccess(["FSM_DSO"]);
  let CITIZEN = userDetails?.info?.type === "CITIZEN" || !window.location.pathname.split("/").includes("employee") ? true : false;
console.log("DigitAppDigitAppDigitApp",stateCode, modules, appTenants, logoUrl, initData)
  if (window.location.pathname.split("/").includes("employee")) CITIZEN = false;

  useEffect(() => {
    if (!pathname?.includes("application-details")) {
      if (!pathname?.includes("inbox")) {
        Digit.SessionStorage.del("fsm/inbox/searchParams");
      }
      if (pathname?.includes("search")) {
        Digit.SessionStorage.del("fsm/search/searchParams");
      }
    }
    if (!pathname?.includes("dss")) {
      Digit.SessionStorage.del("DSS_FILTERS");
    }
    if (!pathname?.includes("landing")) {
      Digit.SessionStorage.del("DSS_FILTERS_CUMILATIVETRANSACTIONS");
    }
    if (pathname?.toString() === "/suda-ui/employee") {
      Digit.SessionStorage.del("SEARCH_APPLICATION_DETAIL");
      Digit.SessionStorage.del("WS_EDIT_APPLICATION_DETAILS");
    }
    if (pathname?.toString() === "/suda-ui/home" || pathname?.toString() === "/suda-ui/citizen" || pathname?.toString() === "/suda-ui/employee") {
      Digit.SessionStorage.del("WS_DISCONNECTION");
    }
  }, [pathname]);

  history.listen(() => {
    window?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  });

  const handleUserDropdownSelection = (option) => {
    option.func();
  };

  const mobileView = innerWidth <= 640;
  let sourceUrl = `${window.location.origin}/citizen`;
  const commonProps = {
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
  };
  return (
    <React.Fragment>
      <style>
        {`
          .navbar {
            font-family: monospace;
            postion: relative;
            background: #1f45a4 !important;
            padding: 5px;
          }

          .navbar .RightMostTopBarOptions .EventNotificationWrapper {
            align-self: center;
          }

          .navbar .RightMostTopBarOptions .select-wrap svg path:first-child {
            fill: transparent;
          }

          .primary-label-btn, .drawer-desktop .sidebar-list.active .menu-label, .link {
            color: orange !important;
          }

          .submit-bar, .submit-bar-disabled {
            background-color: orange !important;
          }

          .radio-wrap .radio-btn-wrap input:checked ~ .radio-btn-checkmark:after, .radio-wrap .radio-btn-wrap .checkbox-wrap .input-emp:checked ~ .radio-btn-checkmark:after, .checkbox-wrap .radio-wrap .radio-btn-wrap .input-emp:checked ~ .radio-btn-checkmark:after, .icon-banner-employee svg {
            background-color: orange !important;
          }

          .radio-wrap .radio-btn-wrap input:checked ~ .radio-btn-checkmark, .radio-wrap .radio-btn-wrap .checkbox-wrap .input-emp:checked ~ .radio-btn-checkmark, .checkbox-wrap .radio-wrap .radio-btn-wrap .input-emp:checked ~ .radio-btn-checkmark, .drawer-desktop .sidebar-list.active {
            border-color: orange !important;  
          }

          .CardBasedOptions .mainContent .CardBasedOptionsMainChildOption .ChildOptionImageWrapper svg, .drawer-desktop .sidebar-list.active .icon, .fill-path-primary-main path {
            fill: orange !important;
          }

          .ChildOptionImageWrapper svg path {
            fill: orange !important;
          }

          .checkbox-wrap input:checked ~ .custom-checkbox,
          .checkbox-wrap input:hover ~ .custom-checkbox,
          .checkbox-wrap input:checked ~ .custom-checkbox-emp,
          .checkbox-wrap input:hover ~ .custom-checkbox-emp {
            border: 2px solid #FF6600 !important;
          }

          .checkbox-wrap input:checked ~ .custom-checkbox svg,
          .checkbox-wrap input:checked ~ .custom-checkbox-emp svg {
            fill: #FF6600 !important;
          }

          .employee .topbar {
            background: #1f45a4 !important;
          }

          .selector-button-primary, selector-button-primary-disabled {
            background-color: orange;
            border-radius: 20px;
          }

          .selector-button-border, selector-button-primary-disabled {
            border-radius: 20px;
          }
        `}
      </style>
      <Switch>
        <Route path="/suda-ui/login" exact>
          <SudaLoginPage />
        </Route>
        <Route path="/suda-ui/employee">
          <EmployeeApp {...commonProps} />
        </Route>
        <Route path="/suda-ui/citizen">
          <CitizenApp {...commonProps} />
        </Route>
        <Route path="/suda-ui/home">
          <Dashboard {...commonProps} />
        </Route>
        <Route path="/suda-ui/dashboard" exact>
          <Redirect to="/suda-ui/home" />
        </Route>
        <Route path="/suda-ui/:city" exact>
          <CityDashboard {...commonProps} />
        </Route>
        <Route>
          <Redirect to="/suda-ui/home" />
        </Route>
      </Switch>
    </React.Fragment>
  );
};
