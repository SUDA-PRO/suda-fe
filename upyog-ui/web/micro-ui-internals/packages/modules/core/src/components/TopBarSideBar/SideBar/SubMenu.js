import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowForward,
  ArrowVectorDown,
  ArrowDirection,
  HomeIcon,
  ComplaintIcon,
  BPAHomeIcon,
  PropertyHouse,
  CaseIcon,
  ReceiptIcon,
  PersonIcon,
  DocumentIconSolid,
  DropIcon,
  CollectionsBookmarIcons,
  FinanceChartIcon,
  CollectionIcon,
} from "@upyog/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import ReactTooltip from "react-tooltip";

const SubMenu = ({ item }) => {
  const [subnav, setSubnav] = useState(false);
  const location = useLocation();
  const { pathname } = location;
  const { t } = useTranslation();
  const showSubnav = () => setSubnav(!subnav);
  const IconsObject = {
    home: <HomeIcon />,
    announcement: <ComplaintIcon />,
    business: <BPAHomeIcon />,
    store: <PropertyHouse />,
    assignment: <CaseIcon />,
    receipt: <ReceiptIcon />,
    "business-center": <PersonIcon />,
    description: <DocumentIconSolid />,
    "water-tap": <DropIcon />,
    "collections-bookmark": <CollectionsBookmarIcons />,
    "insert-chart": <FinanceChartIcon />,
    edcr: <CollectionIcon />,
    collections: <CollectionIcon />,
  };
  const moduleNameIconMap = {
    HOME: <HomeIcon />,
    COMPLAINTS: <ComplaintIcon />,
    PGR: <ComplaintIcon />,
    PGR_AI_MODULE: <ComplaintIcon />,
    HRMS: <PersonIcon />,
    EMPLOYEE_MANAGEMENT: <PersonIcon />,
    PROPERTYTAX: <PropertyHouse />,
    PROPERTY_TAX: <PropertyHouse />,
    TRADE_LICENSE: <BPAHomeIcon />,
    TRADELICENSE: <BPAHomeIcon />,
    BPA: <BPAHomeIcon />,
    BUILDING_PLAN: <BPAHomeIcon />,
    SURVEY: <CaseIcon />,
    SURVEYS: <CaseIcon />,
    EVENTS: <ReceiptIcon />,
    DOCUMENTS: <DocumentIconSolid />,
    BILL_GENIE: <FinanceChartIcon />,
    FINANCE: <FinanceChartIcon />,
    WSS: <DropIcon />,
    WATER: <DropIcon />,
    PUBLIC_MESSAGE_BROADCAST: <CollectionsBookmarIcons />,
  };
  const leftIconArray = item?.icon?.leftIcon?.split?.(":")?.[1] || item?.leftIcon?.split?.(":")[1];
  const getModuleName = item?.moduleName?.replace(/[ -]/g, "_");
  const leftIcon = moduleNameIconMap[getModuleName] || IconsObject[leftIconArray] || IconsObject.collections;
  const appendTranslate = t(`ACTION_TEST_${getModuleName}`);
  const trimModuleName = t(appendTranslate?.length > 20 ? appendTranslate.substring(0, 20) + "..." : appendTranslate);

  /**
   * Resolve a navigationURL to either an external href or an internal React Router path.
   *
   * Finance ERP paths (services/*) trigger a full-page navigation to /employee/services/...
   * so that rainmaker's EGFFinance component handles the iframe POST auth handshake.
   * In production, upyog-ui (/suda-ui/) and rainmaker (/employee/) are served by nginx
   * on the same domain — they share localStorage so the auth token is available to rainmaker.
   *
   * Other URL rules:
   *   - Full http/https URLs       → external anchor (new tab)
   *   - /digit-ui/...              → rewrite to /suda-ui/... then internal Link
   *   - /upyog-ui/...              → rewrite to /suda-ui/... then internal Link
   *   - /suda-ui/...               → internal Link as-is
   *   - other relative paths       → internal Link under /suda-ui/employee/
   */
  const resolveNavUrl = (navigationURL) => {
    if (!navigationURL) return { isExternal: false, to: "#" };

    // Finance ERP paths — route internally to ERPFinance component which renders an
    // iframe + hidden POST form. On localhost the form targets /erp-proxy/... (same-origin)
    // which the webpack dev-server proxy forwards to citya-suda.digitalgovernance.digital.
    // On production the form POSTs directly to the ERP subdomain.
    if (navigationURL.startsWith("services/") || navigationURL.startsWith("/services/")) {
      const cleanPath = navigationURL.replace(/^\//, "");
      return { isExternal: false, to: `/suda-ui/employee/${cleanPath}` };
    }

    if (navigationURL.startsWith("http://") || navigationURL.startsWith("https://")) {
      return { isExternal: true, href: navigationURL };
    }
    if (navigationURL.includes("/digit-ui")) {
      return { isExternal: false, to: navigationURL.replace("/digit-ui", "/suda-ui") };
    }
    if (navigationURL.includes("/upyog-ui")) {
      return { isExternal: false, to: navigationURL.replace("/upyog-ui", "/suda-ui") };
    }
    if (navigationURL.startsWith("/suda-ui")) {
      return { isExternal: false, to: navigationURL };
    }
    // Other relative paths — internal React Router
    return { isExternal: false, to: `/suda-ui/employee/${navigationURL.replace(/^\//, "")}` };
  };

  if (item.type === "single") {
    const nav = resolveNavUrl(item.navigationURL);
    return (
      <div className="submenu-container">
        <div className={`sidebar-link  ${pathname === item?.navigationURL ? "active" : ""}`}>
          <div className="actions">
            {leftIcon}
            {nav.isExternal ? (
              <a
                data-tip="React-tooltip"
                data-for={`jk-side-${getModuleName}`}
                className="custom-link"
                href={nav.href}
                target="_blank"
                rel="noreferrer"
              >
                <span> {trimModuleName} </span>
                {trimModuleName?.includes("...") && (
                  <ReactTooltip textColor="white" backgroundColor="grey" place="right" type="info" effect="solid" id={`jk-side-${getModuleName}`}>
                    {t(`ACTION_TEST_${getModuleName}`)}
                  </ReactTooltip>
                )}
              </a>
            ) : (
              <Link className="custom-link" to={nav.to}>
                <div data-tip="React-tooltip" data-for={`jk-side-${getModuleName}`}>
                  <span> {trimModuleName} </span>
                  {trimModuleName?.includes("...") && (
                    <ReactTooltip textColor="white" backgroundColor="grey" place="right" type="info" effect="solid" id={`jk-side-${getModuleName}`}>
                      {t(`ACTION_TEST_${getModuleName}`)}
                    </ReactTooltip>
                  )}
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <React.Fragment>
        <div className="submenu-container">
          <div onClick={item.links && showSubnav} className={`sidebar-link`}>
            <div className="actions">
              {leftIcon}
              <div data-tip="React-tooltip" data-for={`jk-side-${getModuleName}`}>
                <span> {trimModuleName} </span>

                {trimModuleName?.includes("...") && <ReactTooltip textColor="white" backgroundColor="grey" place="right" type="info" effect="solid" id={`jk-side-${getModuleName}`}>
                  {t(`ACTION_TEST_${getModuleName}`)}
                </ReactTooltip>}
              </div>
              {/* <div className="tooltip">
                <p className="p1">{trimModuleName}</p>
                <span className="tooltiptext">{t(`ACTION_TEST_${getModuleName}`)}</span>
              </div>{" "} */}
            </div>
            <div> {item.links && subnav ? <ArrowVectorDown /> : item.links ? <ArrowForward /> : null} </div>
          </div>
        </div>

        {subnav &&
          item.links
          .sort((a, b) => a.orderNumber - b.orderNumber)
            .filter((item) => item.url === "url" || item.url !== "")
            .map((item, index) => {
              const getChildName = item?.displayName?.toUpperCase()?.replace(/[ -]/g, "_");
              const appendTranslate = t(`ACTION_TEST_${getChildName}`);
              const trimModuleName = t(appendTranslate?.length > 20 ? appendTranslate.substring(0, 20) + "..." : appendTranslate);
              const childNav = resolveNavUrl(item.navigationURL);

              if (childNav.isExternal) {
                return (
                  <a
                    key={index}
                    className={`dropdown-link ${pathname === item.link ? "active" : ""}`}
                    href={childNav.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className="actions" data-tip="React-tooltip" data-for={`jk-side-${index}`}>
                      <span> {trimModuleName} </span>
                      {trimModuleName?.includes("...") && (
                        <ReactTooltip textColor="white" backgroundColor="grey" place="right" type="info" effect="solid" id={`jk-side-${index}`}>
                          {t(`ACTION_TEST_${getChildName}`)}
                        </ReactTooltip>
                      )}
                    </div>
                  </a>
                );
              }
              return (
                <Link
                  to={childNav.to}
                  key={index}
                  className={`dropdown-link ${pathname === item?.link || pathname === childNav.to ? "active" : ""}`}
                >
                  <div className="actions" data-tip="React-tooltip" data-for={`jk-side-${index}`}>
                    <span> {trimModuleName} </span>
                    {trimModuleName?.includes("...") && (
                      <ReactTooltip textColor="white" backgroundColor="grey" place="right" type="info" effect="solid" id={`jk-side-${index}`}>
                        {t(`ACTION_TEST_${getChildName}`)}
                      </ReactTooltip>
                    )}
                  </div>
                </Link>
              );
            })}
      </React.Fragment>
    );
  }
};

export default SubMenu;
