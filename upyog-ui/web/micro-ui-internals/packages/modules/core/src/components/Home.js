import {
  BackButton,
  BillsIcon,
  CitizenHomeCard,
  CitizenInfoLabel,
  FSMIcon,
  Loader,
  MCollectIcon,
  OBPSIcon,
  PGRIcon,
  PTIcon,
  TLIcon,
  WSICon,
  PTRIcon,
  CHBIcon
} from "@upyog/digit-ui-react-components";
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EmployeeDashboard from "./EmployeeDashboard";

// Custom Property Tax icon (replaces default PTIcon)
const CustomPTIcon = (props) => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="64" height="64" fill="url(#pattern0_2026_3486)"/>
    <defs>
      <pattern id="pattern0_2026_3486" patternContentUnits="objectBoundingBox" width="1" height="1">
        <use xlinkHref="#image0_2026_3486" transform="scale(0.015625)"/>
      </pattern>
      <image id="image0_2026_3486" width="64" height="64" preserveAspectRatio="none" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAyBJREFUeJztmrFrFEEUxr/vVoUjai+muVlNZSdCsBVUjFEIRqzUzkYbwUa8RiOKgv+BhBRBCFjorkIsBMEiAdFC00RvVQQFq6BRVMx9NolszvN2L5nbPfbmVx3z3s17+92bmbfcAA6Hw+Gww0A4YPx7/o6882gH2phk97PdGxc+LUwKOgaAIN5RDOuoB57nPXlz6M1PG3E6gRUB/MC/IOjGf8yLAKYphviNh7WR2mcbMW1hRQATmDsATqRwrQuaJRighDAail7aiL8ebFXAlKDRNXz1vaRpEKHneY/yWCp5CxDnO4DHJINfS7/CD0c/fLSRWxLdJECcOoAXAEKSQW2o9hyELM7/l24VoJGOLZVUAvihf0LQAYp9K2OCZqLh6BaQiQBxvhC8WTtcu2qjKjYkOVTCykVJVwFAsXi0UzxrYaugKyY0byNEk+udrJTkQPHseoN0AkH7bcyTKACAbTYC2aaEUtnOPD2OEyDvBPKm5wVIPAZtICgiOCZqEQAobgZQBVBJY+8kmQhAcCwajsbjYyY0hHA7jb2TZLIEVn7ZVWPQ17T2JExg9vVP9a/pWCzEHkDwzKbyptd+4J+E2mtRMxFgeU2vHgO3pLWnZLugCROaWT/096b9UiZ7AICqCQ1Xynr54apt2Nthj6SnJjQT5e/lc3PH5/5ZXnGyEqAC4XaLF6gke7sQwukf5R8egJOtHAuxB/wPQSNJPkXvA/qSHFwf0OkAQOf7gPVQ6D0gDUXqA9ZEEfuAtihqH5Cant8Dit4HJOL6gE4HAFwf0NW4PiCLIHB9gOsDupaeFyCrJRBnHsIrkkvxQUkeiF0ABrJMJlMBCFZb3uwQ6D/wL0m6nFVOWS6B+cRrLYRqQ7UxAK+zSiq7ChBerTy8Ccx5goOrzct3jgjhPl6C2JlFWpkJEF/zBAcbL1XFj0CSS2pRKDbp+VPACZB3AnnjBMg7gbxpegpUwsooxXGk+Gup2zGBEYBvEE5FR6K7jfamFUDxIArw8DH6SB5sZmhaAazzmjyV4pejGxE0E/+c9Cqb5G97vgbfRXq83nJCh8Ph6EX+AFXMlnV0gOOMAAAAAElFTkSuQmCC"/>
    </defs>
  </svg>
);


// Custom Water & Sewerage icon
const CustomWSIcon = (props) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="60" height="60" fill="url(#pattern0_2026_3514)"/>
    <defs>
      <pattern id="pattern0_2026_3514" patternContentUnits="objectBoundingBox" width="1" height="1">
        <use xlinkHref="#image0_2026_3514" transform="scale(0.015625)"/>
      </pattern>
      <image id="image0_2026_3514" width="64" height="64" preserveAspectRatio="none" xlinkHref="data:image/png;base64,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"/>
    </defs>
  </svg>
);

// Custom Trade License icon
const CustomTLIcon = (props) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="60" height="60" fill="url(#pattern0_2026_3528)"/>
    <defs>
      <pattern id="pattern0_2026_3528" patternContentUnits="objectBoundingBox" width="1" height="1">
        <use xlinkHref="#image0_2026_3528" transform="scale(0.015625)"/>
      </pattern>
      <image id="image0_2026_3528" width="64" height="64" preserveAspectRatio="none" xlinkHref="data:image/png;base64,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"/>
    </defs>
  </svg>
);

// Custom ADS icon
const CustomADSIcon = (props) => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="64" height="64" fill="url(#pattern0_2026_3543)"/>
    <defs>
      <pattern id="pattern0_2026_3543" patternContentUnits="objectBoundingBox" width="1" height="1">
        <use xlinkHref="#image0_2026_3543" transform="scale(0.015625)"/>
      </pattern>
      <image id="image0_2026_3543" width="64" height="64" preserveAspectRatio="none" xlinkHref="data:image/png;base64,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"/>
    </defs>
  </svg>
);

/* 
Feature :: Citizen All service screen cards
*/
export const processLinkData = (newData, code, t) => {
  const obj = newData?.[`${code}`];
  if (obj) {
    obj.map((link) => {
      (link.link = link["navigationURL"]), (link.i18nKey = t(link["name"]));
    });
  }
  const newObj = {
    links: obj?.reverse(),
    header: Digit.Utils.locale.getTransformedLocale(`ACTION_TEST_${code}`),
    iconName: `CITIZEN_${code}_ICON`,
  };
  if (code === "FSM") {
    const roleBasedLoginRoutes = [
      {
        role: "FSM_DSO",
        from: "/upyog-ui/citizen/fsm/dso-dashboard",
        dashoardLink: "CS_LINK_DSO_DASHBOARD",
        loginLink: "CS_LINK_LOGIN_DSO",
      },
    ];
    //RAIN-7297
    roleBasedLoginRoutes.map(({ role, from, loginLink, dashoardLink }) => {
      if (Digit.UserService.hasAccess(role))
        newObj?.links?.push({
          link: from,
          i18nKey: t(dashoardLink),
        });
      else
        newObj?.links?.push({
          link: `/upyog-ui/citizen/login`,
          state: { role: "FSM_DSO", from },
          i18nKey: t(loginLink),
        });
    });
  }

  return newObj;
};
const iconSelector = (code) => {
  switch (code) {
    case "PT":
      return <CustomPTIcon className="fill-path-primary-main" />;
    case "WS":
      return <CustomWSIcon className="fill-path-primary-main" />;
    case "FSM":
      return <FSMIcon className="fill-path-primary-main" />;
    case "MCollect":
      return <MCollectIcon className="fill-path-primary-main" />;
    case "PGR":
      return <PGRIcon className="fill-path-primary-main" />;
    case "TL":
      return <CustomTLIcon className="fill-path-primary-main" />;
    case "OBPS":
      return <OBPSIcon className="fill-path-primary-main" />;
    case "Bills":
      return <BillsIcon className="fill-path-primary-main" />;
      case "PTR":
      return <PTRIcon className="fill-path-primary-main" />;
    case "CHB":
      return <CHBIcon className="fill-path-primary-main" />;
    case "ADS":
      return <CustomADSIcon className="fill-path-primary-main" />;
    default:
      return <PTIcon className="fill-path-primary-main" />;
  }
};

const moduleColorMap = {
  PT:       { circleBg: "#c8f0c8", iconColor: "#2e7d32" },
  WS:       { circleBg: "#ffdec3", iconColor: "#1565c0" },
  FSM:      { circleBg: "#ffe0b2", iconColor: "#e65100" },
  MCollect: { circleBg: "#fff9c4", iconColor: "#f9a825" },
  PGR:      { circleBg: "#fce4ec", iconColor: "#c62828" },
  TL:       { circleBg: "#ede7f6", iconColor: "#4527a0" },
  OBPS:     { circleBg: "#e0f7fa", iconColor: "#00696f" },
  ADS:      { circleBg: "#fce4ec", iconColor: "#ad1457" },
  CHB:      { circleBg: "#f3e5f5", iconColor: "#6a1b9a" },
  PTR:      { circleBg: "#e8eaf6", iconColor: "#283593" },
  Bills:    { circleBg: "#fff3e0", iconColor: "#e65100" },
};

/* Mirror CitizenHomeCard's digit-ui → upyog-ui fix */
const fixLink = (link) => (link ? link.replace("digit-ui", "upyog-ui") : link);

const CitizenHome = ({ modules, getCitizenMenu, fetchedCitizen, isLoading }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState("services");
  const [expandedModule, setExpandedModule] = React.useState(null);

  const userInfo = Digit.UserService.getUser()?.info;
  const userName = userInfo?.name || userInfo?.userName || "";
  const firstName = userName.split(" ")[0];

  const paymentModule = modules.filter(({ code }) => code === "Payment")[0];
  const moduleArr = modules.filter(({ code }) => code !== "Payment");
  const moduleArray = [paymentModule, ...moduleArr];

  if (isLoading) {
    return <Loader />;
  }

  const handleModuleClick = (code) => {
    setExpandedModule(expandedModule === code ? null : code);
  };

  return (
    <div style={{ padding: "28px 36px", backgroundColor: "#ffffff", minHeight: "100%" }}>
      {/* Welcome Section */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "28px" }}>
        <span style={{ fontSize: "32px", lineHeight: 1, marginTop: "2px" }}>👋</span>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a", margin: "0 0 6px 0" }}>
            Welcome back, {firstName}
          </h2>
          <p style={{ fontSize: "14px", color: "#555555", margin: 0, maxWidth: "700px", lineHeight: "1.5" }}>
            Manage all municipal services conveniently in one place. Select the required service to continue. Proceed with online payment of municipal taxes and fees by choosing a payment type below.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #e0e0e0", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveTab("services")}
          style={{
            display: "flex", flexDirection: "column", alignItems: "flex-start",
            padding: "10px 24px 12px", background: "none", border: "none", cursor: "pointer",
            borderBottom: activeTab === "services" ? "3px solid #f47738" : "3px solid transparent",
            marginBottom: "-2px", outline: "none",
          }}
        >
          <span style={{ fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>Services</span>
          <span style={{ fontSize: "12px", color: "#666666" }}>Apply for municipal services</span>
        </button>
        <button
          disabled
          style={{
            display: "flex", flexDirection: "column", alignItems: "flex-start",
            padding: "10px 24px 12px", background: "none", border: "none", cursor: "not-allowed",
            borderBottom: "3px solid transparent", marginBottom: "-2px", opacity: 0.45, outline: "none",
          }}
        >
          <span style={{ fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>Payments</span>
          <span style={{ fontSize: "12px", color: "#666666" }}>Pay your municipal taxes and fees</span>
        </button>
      </div>

      {/* Module Cards Grid */}
      {activeTab === "services" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
          {moduleArray
            .filter((mod) => mod)
            .map(({ code }, index) => {
              let mdmsDataObj;
              if (fetchedCitizen) mdmsDataObj = fetchedCitizen ? processLinkData(getCitizenMenu, code, t) : undefined;
              if (!mdmsDataObj?.links?.length) return <React.Fragment key={index} />;

              const colors = moduleColorMap[code] || { circleBg: "#f0f0f0", iconColor: "#616161" };
              const IconEl = iconSelector(code);
              const links = mdmsDataObj.links
                .filter((ele) => ele?.link)
                .sort((x, y) => x?.orderNumber - y?.orderNumber);
              const isExpanded = expandedModule === code;

              return (
                <div key={index} style={{ display: "flex", flexDirection: "column" }}>
                  {/* Card */}
                  <div style={{
                    background: "#ffffff",
                    borderRadius: isExpanded ? "12px 12px 0 0" : "12px",
                    padding: "20px 16px 16px",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.10)", textAlign: "center",
                  }}>
                    {/* Colored Icon Circle */}
                    <div style={{
                      width: "76px", height: "76px", borderRadius: "50%",
                      backgroundColor: colors.circleBg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: "12px",
                    }}>
                      <div style={{ width: "64px", height: "64px", color: colors.iconColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {React.isValidElement(IconEl)
                          ? React.cloneElement(IconEl, { style: { width: '64px', height: '64px', transform: 'translateY(14px)', color: colors.iconColor } })
                          : IconEl}
                      </div>
                    </div>

                    {/* Module Title */}
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a1a", marginBottom: "14px", minHeight: "38px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {t(mdmsDataObj.header)}
                    </div>

                    {/* Services Available Button */}
                    <button
                      onClick={() => handleModuleClick(code)}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px", width: "100%",
                        justifyContent: "center", padding: "7px 12px", border: "none",
                        borderRadius: isExpanded ? "8px 8px 0 0" : "20px", cursor: "pointer",
                        backgroundColor: isExpanded ? "#f47738" : "#e8f5e9",
                        color: isExpanded ? "#ffffff" : "#2e7d32",
                        fontSize: "13px", fontWeight: "500", outline: "none",
                        transition: "background-color 0.2s",
                      }}
                    >
                      <span style={{
                        backgroundColor: "#ffffff",
                        color: isExpanded ? "#f47738" : "#2e7d32",
                        borderRadius: "50%", width: "22px", height: "22px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", fontWeight: "700", flexShrink: 0,
                      }}>
                        {links.length}
                      </span>
                      <span>Services Available</span>
                      <span style={{ marginLeft: "auto", fontSize: "16px", fontWeight: "700" }}>
                        {isExpanded ? "▾" : "›"}
                      </span>
                    </button>
                  </div>

                  {/* Expanded Service List — uses same Link pattern as CitizenHomeCard */}
                  {isExpanded && (
                    <div style={{
                      backgroundColor: "#ffffff", borderRadius: "0 0 12px 12px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.10)", overflow: "hidden",
                    }}>
                      {links.map((link, i) => (
                        <Link
                          key={i}
                          to={{ pathname: fixLink(link.link), state: link.state }}
                          style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "9px 16px", fontSize: "13px", color: "#1a1a1a",
                            textDecoration: "none",
                            borderBottom: i < links.length - 1 ? "1px solid #f0f0f0" : "none",
                            lineHeight: "1.4",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fff8f3"; e.currentTarget.style.color = "#f47738"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#1a1a1a"; }}
                        >
                          <span style={{ color: "#f47738", fontWeight: "700", fontSize: "15px", flexShrink: 0 }}>›</span>
                          {link.i18nKey}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};


const EmployeeHome = ({ modules }) => {
  const dashboardCemp = Digit.UserService.hasAccess(["DASHBOARD_EMPLOYEE"])?true:false;
  if(window.Digit.SessionStorage.get("PT_CREATE_EMP_TRADE_NEW_FORM")) window.Digit.SessionStorage.set("PT_CREATE_EMP_TRADE_NEW_FORM",{})
    const { data: dashboardConfig } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(),"common-masters",[{ name: "CommonConfig" }],
      {
        select: (data) => {
          const formattedData = data?.["common-masters"]?.["CommonConfig"];
          // Find the object with cityDashboardEnabled and return its isActive value
          const cityDashboardObject = formattedData?.find(
            (item) => item?.name === "cityDashboardEnabled"
          );
          return cityDashboardObject?.isActive;
        },
      }
    );
  return (
    <div className="employee-app-container">
      <br />
      {(dashboardConfig && dashboardCemp)?<EmployeeDashboard modules={modules}/>:null}
      <div className="ground-container moduleCardWrapper gridModuleWrapper">
        {modules.map(({ code }, index) => {
          const Card = Digit.ComponentRegistryService.getComponent(`${code}Card`) || (() => <React.Fragment />);
          return <Card key={index} />;
        })}
      </div>
        <style>
      {`
        .employee .customEmployeeCard:nth-child(odd) .employeeCustomCard {
          background-image: none;
          background-color: #716565;
          background-blend-mode: normal !important;
          background-size: cover !important;
        }
        .employee .customEmployeeCard:nth-child(even) .employeeCustomCard {
          background-image: none;
          background-color: #716565;
          background-blend-mode: normal !important;
          background-size: cover !important;
        }
      `}
      </style>



    </div>
  );
};

export const AppHome = ({ userType, modules, getCitizenMenu, fetchedCitizen, isLoading }) => {
  if (userType === "citizen") {
    return <CitizenHome modules={modules} getCitizenMenu={getCitizenMenu} fetchedCitizen={fetchedCitizen} isLoading={isLoading} />;
  }
  return <EmployeeHome modules={modules} />;
};
