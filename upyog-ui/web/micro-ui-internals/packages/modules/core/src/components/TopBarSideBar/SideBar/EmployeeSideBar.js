import React, { useRef, useEffect, useState } from "react";
import SubMenu from "./SubMenu";
import { Loader, SearchIcon, LogoutIcon } from "@upyog/digit-ui-react-components";
import LogoutDialog from "../../Dialog/LogoutDialog";
import { useTranslation } from "react-i18next";
import NavItem from "./NavItem";
import _, { findIndex } from "lodash";

const OrgHeader = () => (
  <div style={{ backgroundColor: "#091E64", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 12px 0" }}>
    <div style={{ width: "72px", height: "72px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.4)", overflow: "hidden", marginBottom: "12px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <img src="https://tfstatee8aog.blob.core.windows.net/filestore/Coat_of_arms_of_Chhattisgarh.svg" style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="logo" />
    </div>
    <div style={{ color: "#ffffff", fontWeight: 700, fontSize: "21px", textAlign: "center", lineHeight: 1.3, padding: "0 8px", marginBottom: "20px", whiteSpace: "normal" }}>
      URBAN ADMINISTRATION &amp; DEPARTMENT
    </div>
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", width: "100%" }} />
  </div>
);

const EmployeeSideBar = () => {
  const sidebarRef = useRef(null);
  const { isLoading, data } = Digit.Hooks.useAccessControl();
  const [search, setSearch] = useState("");
  const { t } = useTranslation();
  const [showDialog, setShowDialog] = useState(false);
  const handleLogout = () => { setShowDialog(true); };
  const handleOnSubmit = () => { Digit.UserService.logout(); setShowDialog(false); };
  const handleOnCancel = () => { setShowDialog(false); };
  useEffect(() => {
    if (isLoading) {
      return <Loader />;
    }
    sidebarRef.current.style.cursor = "pointer";
    collapseNav();
  }, [isLoading]);

  const expandNav = () => {
    sidebarRef.current.style.width = "260px";
    sidebarRef.current.style.overflow = "auto";

    sidebarRef.current.querySelectorAll(".dropdown-link").forEach((element) => {
      element.style.display = "flex";
    });
  };
  const collapseNav = () => {
    sidebarRef.current.style.width = "55px";
    sidebarRef.current.style.overflow = "hidden";

    sidebarRef.current.querySelectorAll(".dropdown-link").forEach((element) => {
      element.style.display = "none";
    });
    sidebarRef.current.querySelectorAll(".actions").forEach((element) => {
      element.style.padding = "0";
    });
  };

  const configEmployeeSideBar = {};

  //creating the object structure from mdms value for easy iteration
  let configEmployeeSideBar1 = {};
  data?.actions?.filter((e) => e.url === "url")?.forEach((item) => {
    _.set(configEmployeeSideBar1,item.path,{...item}) 
  })

  data?.actions
    .filter((e) => e.url === "url")
    .forEach((item) => {
      let index = item.path.split(".")[0];
      if (search == "" && item.path !== "") {
         index = item.path.split(".")[0];
        if (index === "TradeLicense") index = "Trade License";
        if (!configEmployeeSideBar[index]) {
          configEmployeeSideBar[index] = [item];
        } else {
          configEmployeeSideBar[index].push(item);
        }
      } else if (item.path !== "" && t(`ACTION_TEST_${index?.toUpperCase()?.replace(/[ -]/g, "_")}`)?.toLowerCase().includes(search.toLowerCase())) {
         index = item.path.split(".")[0];
        if (index === "TradeLicense") index = "Trade License";
        if (!configEmployeeSideBar[index]) {
          configEmployeeSideBar[index] = [item];
        } else {
          configEmployeeSideBar[index].push(item);
        }
      }
    });
  let res = [];

  //method is used for restructing of configEmployeeSideBar1 nested object into nested array object
  function restructuringOfConfig (tempconfig){
    const result = [];
    for(const key in tempconfig){
      const value= tempconfig[key];
      if(typeof value === "object" && !(value?.id)){
      const children = restructuringOfConfig(value);
      result.push({label : key,children, icon:children?.[0]?.icon, to:""});
      }
      else{
        result.push({label: key, value, icon:value?.leftIcon, to: key === "Home" ? "/upyog-ui/employee" : value?.navigationURL});
      }
    }

    return result
  }
  const splitKeyValue = () => {
    const keys = Object.keys(configEmployeeSideBar);
    keys.sort((a, b) => a.orderNumber - b.orderNumber);
    for (let i = 0; i < keys.length; i++) {
      if (configEmployeeSideBar[keys[i]][0].path.indexOf(".") === -1) {
        if (configEmployeeSideBar[keys[i]][0].displayName === "Home") {
          const homeURL = "/upyog-ui/employee";
          res.unshift({
            moduleName: keys[i].toUpperCase(),
            icon: configEmployeeSideBar[keys[i]][0],
            navigationURL: homeURL,
            type: "single",
          });
        } else {
          res.push({
            moduleName: configEmployeeSideBar[keys[i]][0]?.displayName.toUpperCase(),
            type: "single",
            icon: configEmployeeSideBar[keys[i]][0],
            navigationURL: configEmployeeSideBar[keys[i]][0].navigationURL,
          });
        }
      } else {
        res.push({
          moduleName: keys[i].toUpperCase(),
          links: configEmployeeSideBar[keys[i]],
          icon: configEmployeeSideBar[keys[i]][0],
          orderNumber: configEmployeeSideBar[keys[i]][0].orderNumber,
        });
      }
    }
    if(res.find(a => a.moduleName === "HOME"))
    {
      //res.splice(0,1);
      const indx = res.findIndex(a => a.moduleName === "HOME");
      const home = res?.filter((ob) => ob?.moduleName === "HOME")
      let res1 = res?.filter((ob) => ob?.moduleName !== "HOME")
      res = res1.sort((a,b) => a.moduleName.localeCompare(b.moduleName));
      home?.[0] && res.unshift(home[0]);
    }
    else
    {
      res.sort((a,b) => a.moduleName.localeCompare(b.moduleName));
    }
    //reverting the newsidebar change for now, in order to solve ndss login issue
    //let newconfig = restructuringOfConfig(configEmployeeSideBar1);
    //below lines are used for shifting home object to first place
    // newconfig.splice(newconfig.findIndex((ob) => ob?.label === ""),1);
    // newconfig.sort((a,b) => a.label.localeCompare(b.label));
    // const fndindex = newconfig?.findIndex((el) => el?.label === "Home");
    // const homeitem = newconfig.splice(fndindex,1);
    // newconfig.unshift(homeitem?.[0]);
    // return (
    //   newconfig.map((item, index) => {
    //       return <NavItem key={`${item?.label}-${index}`} item={item} />;
    //     })
    // );
    return res?.map((item, index) => {
      return <SubMenu item={item} key={index + 1} />;
    });
  };

  if (isLoading) {
    return <Loader />;
  }
  if (!res) {
    return "";
  }

  const renderSearch = () => {
    return (
      <div className="submenu-container">
        <div className="sidebar-link">
          <div className="actions search-icon-wrapper">
            <SearchIcon className="search-icon" />
            <input
              className="employee-search-input"
              type="text"
              placeholder={t(`ACTION_TEST_SEARCH`)}
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="sidebar" ref={sidebarRef} onMouseOver={expandNav} onMouseLeave={collapseNav} style={{display:window.location.href.includes("main-dashboard-landing")?"none":""}}>
      <OrgHeader />
      {renderSearch()}
      {splitKeyValue()}
      
      <style>
      {`
        .citizen .sidebar, .employee .sidebar {
          background-color: #091E64 !important;
          background-image: none !important;
        }
        .employee .sidebar .submenu-container .sidebar-link {
          color: #ffffff !important;
        }
        .employee .sidebar .submenu-container .sidebar-link .actions span,
        .employee .sidebar .submenu-container .sidebar-link .actions a,
        .employee .sidebar .dropdown-link .actions span {
          color: #ffffff !important;
        }
        .employee .sidebar .submenu-container .sidebar-link svg path,
        .employee .sidebar .submenu-container .sidebar-link svg rect,
        .employee .sidebar .submenu-container .sidebar-link svg circle {
          fill: #ffffff !important;
        }
        .employee .sidebar .submenu-container .sidebar-link:hover,
        .employee .sidebar .dropdown-link:hover {
          background-color: rgba(255,255,255,0.1) !important;
          border-radius: 6px;
        }
        .employee .sidebar .submenu-container .sidebar-link.active,
        .employee .sidebar .dropdown-link.active {
          background-color: #F47738 !important;
          border-radius: 6px;
        }
        .employee .sidebar .employee-search-input {
          color: #ffffff !important;
          background: transparent !important;
          border-bottom: 1px solid rgba(255,255,255,0.4) !important;
        }
        .employee .sidebar .employee-search-input::placeholder {
          color: rgba(255,255,255,0.6) !important;
        }
        .employee .sidebar .search-icon-wrapper svg path {
          fill: rgba(255,255,255,0.7) !important;
        }
        .employee .popup-module .card-text,
        .employee .popup-module p,
        .employee .popup-module span:not(.icon) {
          color: #0B0C0C !important;
        }
        .employee .popup-module strong {
          color: #0B0C0C !important;
        }
      `}
      </style>

      <div className="submenu-container" style={{ borderTop: "1px solid rgba(255,255,255,0.2)", marginTop: "16px" }}>
        <div className="sidebar-link" onClick={handleLogout} style={{ cursor: "pointer" }}>
          <div className="actions">
            <LogoutIcon style={{ width: 20, height: 20, flexShrink: 0 }} />
            <span style={{ marginLeft: "8px", whiteSpace: "nowrap" }}>{t("CORE_COMMON_LOGOUT")}</span>
          </div>
        </div>
      </div>
      {showDialog && <LogoutDialog onSelect={handleOnSubmit} onCancel={handleOnCancel} onDismiss={handleOnCancel} />}
    </div>
  );
};

export default EmployeeSideBar;
