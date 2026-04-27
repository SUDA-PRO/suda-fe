import React, { useState } from "react";
import {
  HomeIcon,
  EditPencilIcon,
  LogoutIcon,
  Loader,
  AddressBookIcon,
  PropertyHouse,
  CaseIcon,
  CollectionIcon,
  PTIcon,
  OBPSIcon,
  PGRIcon,
  FSMIcon,
  WSICon,
  MCollectIcon,
  Phone,
  BirthIcon,
  DeathIcon,
  FirenocIcon,
  LoginIcon,
  CHBIcon
} from "@upyog/digit-ui-react-components";
import { Link, useLocation } from "react-router-dom";
import SideBarMenu from "../../../config/sidebar-menu";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import LogoutDialog from "../../Dialog/LogoutDialog";
import ChangeCity from "../../ChangeCity";
import { APPLICATION_PATH } from "../../../pages/citizen/Home/EDCR/utils";

const placeholderLogo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%23ffffff22'/%3E%3Ccircle cx='40' cy='30' r='14' fill='%23ffffff55'/%3E%3Cellipse cx='40' cy='70' rx='24' ry='18' fill='%23ffffff55'/%3E%3C/svg%3E";

const defaultImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAO4AAADUCAMAAACs0e/bAAAAM1BMVEXK0eL" +
  "/" +
  "/" +
  "/" +
  "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";
/* 
Feature :: Citizen Webview sidebar
*/
const OrgHeader = ({ stateInfo, t, onClose }) => (
  <div className="sidebar-nav__header">
    <button className="sidebar-nav__close" onClick={onClose} aria-label="Close menu">&times;</button>
    <div className="sidebar-nav__logo-wrapper">
      <img src="https://tfstatee8aog.blob.core.windows.net/filestore/Coat_of_arms_of_Chhattisgarh.svg" className="sidebar-nav__logo-img" alt="logo" />
    </div>
    <div className="sidebar-nav__org-name">
      URBAN ADMINISTRATION & DEPARTMENT
    </div>
    <div className="sidebar-nav__divider" />
  </div>
);

const iconStyle = { width: 20, height: 20, display: "block" };

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="white" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
  </svg>
);

const IconsObject = {
  CommonPTIcon: <PTIcon className="icon" style={iconStyle} />,
  OBPSIcon: <OBPSIcon className="icon" style={iconStyle} />,
  propertyIcon: <PropertyHouse className="icon" style={iconStyle} />,
  TLIcon: <CaseIcon className="icon" style={iconStyle} />,
  PGRIcon: <PGRIcon className="icon" style={iconStyle} />,
  FSMIcon: <FSMIcon className="icon" style={iconStyle} />,
  WSIcon: <WSICon className="icon" style={iconStyle} />,
  MCollectIcon: <MCollectIcon className="icon" style={iconStyle} />,
  CHBIcon: <CHBIcon className="icon" style={iconStyle} />,
  BillsIcon: <CollectionIcon className="icon" style={iconStyle} />,
  BirthIcon: <BirthIcon className="icon" style={iconStyle} />,
  DeathIcon: <DeathIcon className="icon" style={iconStyle} />,
  FirenocIcon: <FirenocIcon className="icon" style={iconStyle} />,
  HomeIcon: <HomeIcon className="icon" style={iconStyle} />,
  DashboardIcon: <DashboardIcon />,
  EditPencilIcon: <EditPencilIcon className="icon" style={iconStyle} />,
  LogoutIcon: <LogoutIcon className="icon" style={iconStyle} />,
  Phone: <Phone className="icon" style={iconStyle} />,
  LoginIcon: <LoginIcon className="icon" style={iconStyle} />,
};
const StaticCitizenSideBar = ({ linkData, islinkDataLoading, onClose }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const { pathname } = location;
  const { data: storeData, isFetched } = Digit.Hooks.useStore.getInitData();
  const { stateInfo } = storeData || {};
  const user = Digit.UserService.getUser();
  let isMobile = window.Digit.Utils.browser.isMobile();

  const [isEmployee, setisEmployee] = useState(false);
  const [isSidebarOpen, toggleSidebar] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const tenantId = Digit.ULBService.getCitizenCurrentTenant();
  const handleLogout = () => {
    toggleSidebar(false);
    setShowDialog(true);
  };
  const handleOnSubmit = () => {
    Digit.UserService.logout();
    setShowDialog(false);
  };
  const handleOnCancel = () => {
    setShowDialog(false);
  };

  if (islinkDataLoading || !isFetched) {
    return <Loader />;
  }

  const redirectToLoginPage = () => {
    // localStorage.clear();
    // sessionStorage.clear();
    history.push(`${APPLICATION_PATH}/citizen/login`);
  };
  // Function to redirect the user to the EDCR scrutiny page
  const redirectToScrutinyPage = () => {
    // localStorage.clear();
    // sessionStorage.clear();
    history.push(`${APPLICATION_PATH}/citizen/core/edcr/scrutiny`);
  };
  const showProfilePage = () => {
    history.push(`${APPLICATION_PATH}/citizen/user/profile`);
  };
  //const tenantId = Digit.ULBService.getCitizenCurrentTenant();
  const filteredTenantContact = storeData?.tenants.filter((e) => e.code === tenantId)[0]?.contactNumber || storeData?.tenants[0]?.contactNumber;

  let menuItems = [...SideBarMenu(t, showProfilePage, redirectToLoginPage, redirectToScrutinyPage, isEmployee, storeData, tenantId)];

  menuItems = menuItems.filter((item) => item.element !== "LANGUAGE");

  const MenuItem = ({ item }) => {
    const leftIconArray = item?.icon || item.icon?.type?.name;
    const leftIcon = leftIconArray ? IconsObject[leftIconArray] : IconsObject.BillsIcon;
    let itemComponent;
    if (item.type === "component") {
      itemComponent = item.action;
    } else {
      itemComponent = item.text;
    }
    const Item = () => (
      <span className="sidebar-nav__item-inner" {...item.populators}>
        <span className="sidebar-nav__item-icon">
          {leftIcon}
        </span>
        <span className="sidebar-nav__item-label">
          {itemComponent}
        </span>
      </span>
    );
    if (item.type === "external-link") {
      return (
        <a href={item.link}>
          <Item />
        </a>
      );
    }
    if (item.type === "link") {
      return (
        <Link to={item?.link.replace("/digit-ui/","/upyog-ui/")}>
          <Item />
        </Link>
      );
    }

    return <Item />;
  };

  if (isFetched && user && user.access_token) {
    menuItems = menuItems.filter((item) => item?.id !== "login-btn" && item?.id !== "help-line");
    menuItems = [
      ...menuItems,
      {
        text: t("EDIT_PROFILE"),
        element: "PROFILE",
        icon: "EditPencilIcon",
        populators: {
          onClick: showProfilePage,
        },
      },
      {
        text: t("CORE_COMMON_LOGOUT"),
        element: "LOGOUT",
        icon: "LogoutIcon",
        populators: { onClick: handleLogout },
      },
      {
        text: (
          <React.Fragment>
            {t("CS_COMMON_HELPLINE")}
            <div className="telephone" style={{ marginTop: "-10%" }}>
              <div className="link">
                <a href={`tel:${filteredTenantContact}`}>{filteredTenantContact}</a>
              </div>
            </div>
          </React.Fragment>
        ),
        element: "Helpline",
        icon: "Phone",
      },
    ];
  }
  Object.keys(linkData)
    ?.sort((x, y) => y.localeCompare(x))
    ?.map((key) => {
      if (linkData[key][0]?.sidebar === "digit-ui-links") {
        menuItems.splice(1, 0, {
          type: linkData[key][0]?.sidebarURL?.includes("digit-ui") ? "link" : "external-link",
          text: t(`ACTION_TEST_${Digit.Utils.locale.getTransformedLocale(key)}`),
          links: linkData[key],
          icon: linkData[key][0]?.leftIcon,
          link: linkData[key][0]?.sidebarURL,
        });
      }
    });

  return (
    <React.Fragment>
      <style>
        {`
            // Citizen static sidebar
            .sidebar-nav {
              background-color: #091E64;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }

            .sidebar-nav__header {
              background-color: #091E64;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 65px 12px 0;
            }

            .sidebar-nav__logo-wrapper {
              width: 72px;
              height: 72px;
              border-radius: 50%;
              border: 3px solid rgba(255, 255, 255, 0.4);
              overflow: hidden;
              margin-bottom: 12px;
              background: rgba(255, 255, 255, 0.1);
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .sidebar-nav__logo-img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }

            .sidebar-nav__org-name {
              color: #ffffff;
              font-weight: 700;
              font-size: 21px;
              text-align: center;
              line-height: 1.3;
              padding: 0 8px;
              margin-bottom: 20px;
            }

            .sidebar-nav__divider {
              border-top: 1px solid rgba(255, 255, 255, 0.2);
              width: 100%;
            }

            .sidebar-nav__menu {
              background-color: #091E64;
              padding-top: 8px;
              padding-bottom: 8px;
              flex: 1;
            }

            .sidebar-nav__item {
              margin: 2px 8px;
              border-radius: 6px;
              background-color: transparent;
              border-left: none;

              &.active {
                background-color: #F47738;
              }
            }

            .sidebar-nav__item-inner {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 0 12px;
              min-height: 48px;
              cursor: pointer;
              color: #ffffff;
              font-size: 14px;
              text-decoration: none;
            }

            .sidebar-nav__item-icon {
              display: flex;
              align-items: center;
              flex-shrink: 0;
              width: 20px;
              height: 20px;
              filter: brightness(0) invert(1);
            }

            .sidebar-nav__item-label {
              color: #ffffff;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            } 
        `}
      </style>
      <div className="sidebar-nav">
        <OrgHeader stateInfo={stateInfo} t={t} onClose={onClose} />
        <div className="sidebar-nav__menu">
          {menuItems?.map((item, index) => {
            const normalizedLink = item?.link?.replace("/digit-ui/", "/upyog-ui/");
            const isActive = pathname === normalizedLink || pathname === item?.sidebarURL;
            return (
              <div
                key={index}
                className={`sidebar-nav__item${isActive ? " active" : ""}`}
              >
                <MenuItem item={item} />
              </div>
            );
          })}
        </div>
        {showDialog && <LogoutDialog onSelect={handleOnSubmit} onCancel={handleOnCancel} onDismiss={handleOnCancel} />}
      </div>
    </React.Fragment>
  );
};

export default StaticCitizenSideBar;
