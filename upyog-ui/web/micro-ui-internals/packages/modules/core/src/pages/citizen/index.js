import { BackButton, WhatsappIcon, Card, CitizenHomeCard, CitizenInfoLabel, PrivateRoute,AdvertisementModuleCard, TopBar } from "@upyog/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Redirect, Route, Switch, useRouteMatch, useHistory, Link } from "react-router-dom";
import ErrorBoundary from "../../components/ErrorBoundaries";
import { AppHome, processLinkData } from "../../components/Home";
import ChangeLanguage from "../../components/ChangeLanguage";
import TopBarSideBar from "../../components/TopBarSideBar";
import StaticCitizenSideBar from "../../components/TopBarSideBar/SideBar/StaticCitizenSideBar";
import CitizenHome from "./Home";
import LanguageSelection from "./Home/LanguageSelection";
import LocationSelection from "./Home/LocationSelection";
import Login from "./Login";
import UserProfile from "./Home/UserProfile";
import ErrorComponent from "../../components/ErrorComponent";
import FAQsSection from "./FAQs/FAQs";
import HowItWorks from "./HowItWorks/howItWorks";
import StaticDynamicCard from "./StaticDynamicComponent/StaticDynamicCard";
import AcknowledgementCF from "../../components/AcknowledgementCF";
import CitizenFeedback from "../../components/CitizenFeedback";
import Search from "./SearchApp";
import QRCode from "./QRCode";
import VSearchCertificate from "./CMSearchCertificate";
import AssetsQRCode from "./AssetsQRCode";
import ChallanQRCode from "./ChallanQRCode";
import { newConfig as newConfigEDCR } from "../../config/edcrConfig";
import CreateAnonymousEDCR from "./Home/EDCR";
import EDCRAcknowledgement from "./Home/EDCR/EDCRAcknowledgement";
import { APPLICATION_PATH } from "./Home/EDCR/utils";
import Dashboard from "./Home/Dashboard";

const sidebarHiddenFor = [
  "suda-ui/citizen/register/name",
  "/suda-ui/citizen/select-language",
  "/suda-ui/home",
  "/suda-ui/citizen/select-location",
  "/suda-ui/login",
  "/suda-ui/citizen/register/otp",
  // "/suda-ui/citizen/verificationsearch-home" // route for verificationsearch component
];

const getTenants = (codes, tenants) => {
  return tenants.filter((tenant) => codes.map((item) => item.code).includes(tenant.code));
};

const Home = ({
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
  const { isLoading: islinkDataLoading, data: linkData, isFetched: isLinkDataFetched } = Digit.Hooks.useCustomMDMS(
    Digit.ULBService.getStateId(),
    "ACCESSCONTROL-ACTIONS-TEST",
    [
      {
        name: "actions-test",
        filter: "[?(@.url == 'digit-ui-card')]",
      },
    ],
    {
      select: (data) => {
        const formattedData = data?.["ACCESSCONTROL-ACTIONS-TEST"]?.["actions-test"]
          ?.filter((el) => el.enabled === true)
          .reduce((a, b) => {
            a[b.parentModule] = a[b.parentModule]?.length > 0 ? [b, ...a[b.parentModule]] : [b];
            return a;
          }, {});
        return formattedData;
      },
    }
  );
  const isMobile = window.Digit.Utils.browser.isMobile();
  // const classname = Digit.Hooks.fsm.useRouteSubscription(pathname);
  const classname = Digit.Hooks.useRouteSubscription(pathname);
  const { t } = useTranslation();
  const { path } = useRouteMatch();
  sourceUrl = "https://s3.ap-south-1.amazonaws.com/egov-qa-assets";
  const pdfUrl = "https://pg-egov-assets.s3.ap-south-1.amazonaws.com/Upyog+Code+and+Copyright+License_v1.pdf"
  const history = useHistory();
  const handleClickOnWhatsApp = (obj) => {
    window.open(obj);
  };
  // Fetches the state ID using the ULBService and retrieves the form configuration for EDCR from MDMS.
  // If EdcrConfig is available in the fetched data, it is used; otherwise, it falls back to newConfigEDCR.
  const stateId = Digit.ULBService.getStateId();
  let { data: newConfig } = Digit.Hooks.obps.SearchMdmsTypes.getFormConfig(stateId, []);
  newConfig = newConfig?.EdcrConfig ? newConfig?.EdcrConfig : newConfigEDCR;

  const hideSidebar = sidebarHiddenFor.some((e) => window.location.href.includes(e));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const appRoutes = modules.map(({ code, tenants }, index) => {

    const Module = Digit.ComponentRegistryService.getComponent(`${code}Module`);
    return Module ? (
      <Route key={index} path={`${path}/${code.toLowerCase()}`}>
        <Module stateCode={stateCode} moduleCode={code} userType="citizen" tenants={getTenants(tenants, appTenants)} />
      </Route>
    ) : null;
  });
  // Fetches advertisement details (e.g., image, title, location, pole number, price) 
  // from the MDMS and formats them for display on the homepage.
  const { data: advertisement } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "Advertisement", [{ name: "Unipole_12_8" }], {
    select: (data) => {
      const formattedData = data?.["Advertisement"]?.["Unipole_12_8"].map((details) => {
        return { imageSrc: `${details.imageSrc}`, light: `${details.light}`, title: `${details.title}`, location: `${details.location}`, poleNo:`${details.poleNo}`,price:`${details.price}`,adtype:`${details.adtype}`,faceArea:`${details.faceArea}` };
      });
      return formattedData;
    },
  });
  const Advertisement=advertisement||[];

  const ModuleLevelLinkHomePages = modules.map(({ code, bannerImage }, index) => {
    let Links = Digit.ComponentRegistryService.getComponent(`${code}Links`) || (() => <React.Fragment />);
    let mdmsDataObj = isLinkDataFetched ? processLinkData(linkData, code, t) : undefined;

    //if (mdmsDataObj?.header === "ACTION_TEST_WS") {
      mdmsDataObj?.links && mdmsDataObj?.links.sort((a, b) => {
        return a.orderNumber - b.orderNumber;
      });
    // }
    const CustomHomePage = Digit?.ComponentRegistryService?.getComponent(`${code}HomePage`);
    return (
      <React.Fragment key={index}>
        <Route path={`${path}/${code.toLowerCase()}-home`}>
          {CustomHomePage ? (
            <CustomHomePage matchPath={`${path}/${code.toLowerCase()}`} />
          ) : (
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <div className="back-with-header">
              <BackButton className="moduleLinkHomePageBackButton" />

              {isMobile? <h4 style={{top: "calc(16vw + 40px)",left:"1.5rem",position:"absolute",color:"white"}}>{t("MODULE_" + code.toUpperCase())}</h4>:<h1>{t("MODULE_" + code.toUpperCase())}</h1>}
            </div>

            <div className="moduleLinkHomePage">
              {/* <img src={ "https://nugp-assets.s3.ap-south-1.amazonaws.com/nugp+asset/Banner+UPYOG+%281920x500%29B+%282%29.jpg"||bannerImage || stateInfo?.bannerUrl} alt="noimagefound" /> */}
              
              <div className="moduleLinkHomePageModuleLinks">
                {mdmsDataObj && (
                  <CitizenHomeCard
                    header={t(mdmsDataObj?.header)}
                    links={mdmsDataObj?.links}
                    Icon={() => <span />}
                    Info={
                      code === "OBPS"
                        ? () => (
                            <CitizenInfoLabel
                              style={{ margin: "0px", padding: "10px" }}
                              info={t("CS_FILE_APPLICATION_INFO_LABEL")}
                              text={t(`BPA_CITIZEN_HOME_STAKEHOLDER_INCLUDES_INFO_LABEL`)}
                            />
                          )
                        : null
                    }
                    isInfo={code === "OBPS" ? true : false}
                  />
                )}
                {/* <Links key={index} matchPath={`/suda-ui/citizen/${code.toLowerCase()}`} userType={"citizen"} /> */}
              </div>
              {code?.toUpperCase()==="ADS" && (
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between" }}>
                {Advertisement.map((ad, adIndex) => (
                  <AdvertisementModuleCard
                    key={ad.poleNo || adIndex}
                    imageSrc={ad.imageSrc} 
                    poleNo={ad.poleNo} 
                    light={ad.light} 
                    title={ad.title} 
                    location={ad.location} 
                    price={ad.price} 
                    path={`${path}/${code.toLowerCase()}/`}
                    adType={ad.adtype}
                    faceArea={ad.faceArea}
                  />
                ))}
              </div>
              )}
              <StaticDynamicCard moduleCode={code?.toUpperCase()}/>
            </div>
          </div>
          )}
        </Route>
        <Route key={"faq" + index} path={`${path}/${code.toLowerCase()}-faq`}>
          <FAQsSection module={code?.toUpperCase()} />
        </Route>
        <Route key={"hiw" + index} path={`${path}/${code.toLowerCase()}-how-it-works`}>
          <HowItWorks module={code?.toUpperCase()} />
        </Route>
      </React.Fragment>
    );
  });

  return (
    <div className={classname}>
          <style>
          {
            `
              .citizen-card-input .citizen-card-input--front
              {
                height:40px !important;
              }

              .back-with-header {
                margin-bottom: 30px;
                padding-left: 15px;
              }

              .CitizenHomeCard .links {
                color: orange;  
              }

              .citizen-home-container .back-with-header .moduleLinkHomePageBackButton svg path:first-child {
                fill: transparent;
              }

              .citizen-home-container .back-with-header h1 {
                font-size: 40px;
                color: #1f45a4;
                font-weight: 500;
              }

              .citizen-home-flex {
                display: flex !important;
                align-items: stretch;
                height: 100vh !important;
                overflow: hidden !important;
              }

              html, body, .body-container {
                overflow: hidden !important;
                height: 100% !important;
              }

              .SideBarStatic {
                width: 300px !important;
                min-width: 300px !important;
                flex-shrink: 0 !important;
                background: #091E64 !important;
                height: 100% !important;
                overflow: hidden !important;
                display: flex !important;
                flex-direction: column !important;
              }

              .citizen-home-flex > .HomePageContainer,
              .citizen-home-flex > div:not(.SideBarStatic) {
                flex: 1 !important;
                min-width: 0 !important;
                width: auto !important;
              }

              .sidebar-overlay {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.5);
                z-index: 999;
              }
              .sidebar-overlay.mobile-open {
                display: block;
              }

              @media (max-width: 780px) {
                .SideBarStatic {
                  position: fixed !important;
                  top: 0;
                  left: -300px;
                  height: 100vh !important;
                  z-index: 1000;
                  transition: left 0.3s ease;
                  display: block !important;
                }
                .SideBarStatic.mobile-open {
                  left: 0;
                }
                .sidebar-hamburger {
                  display: flex !important;
                }
                .citizen-home-flex > .HomePageContainer,
                .citizen-home-flex > div:not(.SideBarStatic) {
                  width: 100% !important;
                }
              }

              .sidebar-hamburger {
                display: none;
                position: fixed;
                top: 14px;
                left: 14px;
                z-index: 998;
                background: #091E64;
                border: none;
                border-radius: 6px;
                padding: 8px 10px;
                cursor: pointer;
                flex-direction: column;
                gap: 5px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              }
              .sidebar-hamburger span {
                display: block;
                width: 22px;
                height: 2px;
                background: white;
                border-radius: 2px;
              }
              .sidebar-nav__close {
                display: none;
                position: absolute;
                top: 12px;
                right: 12px;
                background: none;
                border: none;
                color: rgba(255,255,255,0.7);
                font-size: 28px;
                cursor: pointer;
                line-height: 1;
                padding: 4px 8px;
              }
              @media (max-width: 780px) {
                .sidebar-nav__close { display: block; }
              }

              .citizen-footer {
                position: fixed;
                bottom: 0;
                left: 300px;
                right: 0;
                background: white;
                text-align: center;
                padding: 8px 0;
                z-index: 100;
                border-top: 1px solid #e8e8e8;
              }
              @media (max-width: 780px) {
                .citizen-footer { left: 0; }
              }
              .citizen-content-wrap {
                padding-bottom: 50px;
                height: 100% !important;
                overflow-y: auto !important;
                overflow-x: hidden !important;
              }

              /* Content scrollbar */
              .citizen-content-wrap::-webkit-scrollbar {
                width: 7px;
              }
              .citizen-content-wrap::-webkit-scrollbar-track {
                background: #f0f0f0;
              }
              .citizen-content-wrap::-webkit-scrollbar-thumb {
                background: #bdbdbd;
                border-radius: 4px;
              }
              .citizen-content-wrap::-webkit-scrollbar-thumb:hover {
                background: #9e9e9e;
              }
            `
          }
        </style>
      {/* <TopBarSideBar
        t={t}
        stateInfo={stateInfo}
        userDetails={userDetails}
        CITIZEN={CITIZEN}
        cityDetails={cityDetails}
        mobileView={mobileView}
        handleUserDropdownSelection={handleUserDropdownSelection}
        logoUrl={logoUrl}
        showSidebar={true}
        linkData={linkData}
        islinkDataLoading={islinkDataLoading}
      /> */}

      {/* <div className={`main center-container citizen-home-container mb-25`}> */}
         <div className="citizen-home-flex" style={{ display: "flex", height: "100vh", overflow: "hidden", alignItems: "stretch" }}>
        {!hideSidebar && (
          <button className="sidebar-hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <span /><span /><span />
          </button>
        )}
        {!hideSidebar && (
          <div className={`sidebar-overlay${mobileOpen ? " mobile-open" : ""}`} onClick={() => setMobileOpen(false)} />
        )}
        {hideSidebar ? null : (
          <div className={`SideBarStatic${mobileOpen ? " mobile-open" : ""}`}
            style={{ display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflow: "hidden", width: "300px", minWidth: "300px", flexShrink: 0, background: "#091E64" }}
          >
            <StaticCitizenSideBar linkData={linkData} islinkDataLoading={islinkDataLoading} onClose={() => setMobileOpen(false)} />
          </div>
        )}

        <div className="citizen-content-wrap" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#ffffff" }}>
        {!hideSidebar && (() => {
          const userInfo = Digit.UserService.getUser()?.info;
          const userName = userInfo?.name || userInfo?.userName || "";
          const initials = userName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
          return (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 28px", height: "56px", background: "#ffffff",
              borderBottom: "1px solid #e8e8e8", flexShrink: 0,
            }}>
              <span style={{ fontSize: "22px", fontWeight: "700", color: "#091E64" }}>
                URBAN ADMINISTRATION &amp; DEPARTMENT (UAD)
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <ChangeLanguage dropdown={true} />
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "#091E64", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", fontWeight: "700", flexShrink: 0,
                }}>
                  {initials || "U"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                  <span style={{ fontSize: "17px", fontWeight: "600", color: "#1a1a1a" }}>{userName}</span>
                  <span style={{ fontSize: "14px", color: "#888888" }}>Citizen</span>
                </div>
              </div>
            </div>
          );
        })()}
        <Switch>
          <Route exact path={`${path}/dashboard`}><Redirect to={path} /></Route>

          <Route exact path={path}>
            <AppHome
              userType="citizen"
              modules={modules}
              getCitizenMenu={linkData}
              fetchedCitizen={isLinkDataFetched}
              isLoading={islinkDataLoading}
            />
          </Route>

          <PrivateRoute path={`${path}/feedback`} component={CitizenFeedback}></PrivateRoute>
          <PrivateRoute path={`${path}/feedback-acknowledgement`} component={AcknowledgementCF}></PrivateRoute>

          <Route exact path={`${path}/select-language`}>
            <LanguageSelection />
          </Route>

          <Route exact path={`${path}/select-location`}>
            <LocationSelection />
          </Route>
          <Route path={`${path}/error`}>
            <ErrorComponent
              initData={initData}
              goToHome={() => {
                history.push("/suda-ui/home");
              }}
            />
          </Route>

          <Route path={`${path}/login`}>
            <Login stateCode={stateCode} />
          </Route>

          <Route path={`${path}/register`}>
            <Login stateCode={stateCode} isUserRegistered={false} />
          </Route>

          <PrivateRoute path={`${path}/user/profile`}>
            <UserProfile stateCode={stateCode} userType={"citizen"} cityDetails={cityDetails} />
          </PrivateRoute>

          <Route exact path="/suda-ui/home">
            <Dashboard />
          </Route>

          <Route path={`${path}/Audit`}>
            <Search/>
          </Route>
          <Route path={`${path}/payment/verification`}>
            <QRCode></QRCode>
          </Route>
          <Route path={`${path}/assets/services`}>
            <AssetsQRCode></AssetsQRCode>
          </Route>
          <Route path={`${path}/verificationsearch-home`}>
            <VSearchCertificate/>
          </Route>
          <Route path={`${path}/challan/details`}>
         <ChallanQRCode></ChallanQRCode>
          </Route>
          <Route path={`${APPLICATION_PATH}/citizen/core/edcr/scrutiny`}>
            <CreateAnonymousEDCR />
          </Route>
          <Route path={`${APPLICATION_PATH}/citizen/core/edcr/scrutiny/acknowledgement`}>
            <EDCRAcknowledgement />
          </Route>



          <ErrorBoundary initData={initData}>
            {appRoutes}
            {ModuleLevelLinkHomePages}
          </ErrorBoundary>
        </Switch>
        <div className="citizen-footer" style={{ left: hideSidebar ? 0 : 300 }}>
          <span style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile()?"14px":"16px", fontWeight: "400", color: "black"}} onClick={() => { window.open('https://uad.cg.gov.in/', '_blank').focus();}} >Copyright &copy; 2026 Urban Administration &amp; Department</span>
        </div>
        </div>{/* end citizen-content-wrap */}
      </div>{/* end citizen-home-flex */}
    </div>
  );
};

export default Home;
