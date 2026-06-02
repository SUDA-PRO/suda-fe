import { Dropdown, Hamburger, TopBar as TopBarComponent } from "@upyog/digit-ui-react-components";
import React, { useRef, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import ChangeCity from "../ChangeCity";
import ChangeLanguage from "../ChangeLanguage";

const TextToImg = (props) => (
  <span className="user-img-txt" onClick={props.toggleMenu} title={props.name}>
    {props?.name?.[0]?.toUpperCase()}
  </span>
);
const TopBar = ({
  t,
  stateInfo,
  toggleSidebar,
  isSidebarOpen,
  handleLogout,
  userDetails,
  CITIZEN,
  cityDetails,
  mobileView,
  userOptions,
  handleUserDropdownSelection,
  logoUrl,
  showLanguageChange = true,
  setSideBarScrollTop,
}) => {
  const [profilePic, setProfilePic] = React.useState(null);

  React.useEffect(async () => {
    const tenant = Digit.ULBService.getCurrentTenantId();
    const uuid = userDetails?.info?.uuid;
    if (uuid) {
      const usersResponse = await Digit.UserService.userSearch(tenant, { uuid: [uuid] }, {});
      if (usersResponse?.user?.[0]?.photo) {
        try {
          const file = await Digit.UploadServices.Filefetch([usersResponse?.user?.[0]?.photo], "pg");
          if (file?.data?.fileStoreIds?.[0]?.url) {
            setProfilePic(file?.data?.fileStoreIds?.[0]?.url.split(",")[0]);
          }
        } catch (err) {
          console.error("Error fetching profile photo:", err);
        }
      }
    }
  }, [profilePic !== null, userDetails?.info?.uuid]);

  const CitizenHomePageTenantId = Digit.ULBService.getCitizenCurrentTenant(true);

  let history = useHistory();
  const { pathname } = useLocation();

  const conditionsToDisableNotificationCountTrigger = () => {
    if (Digit.UserService?.getUser()?.info?.type === "EMPLOYEE") return false;
    if (Digit.UserService?.getUser()?.info?.type === "CITIZEN") {
      if (!CitizenHomePageTenantId) return false;
      else return true;
    }
    return false;
  };

  const { data: { unreadCount: unreadNotificationCount } = {}, isSuccess: notificationCountLoaded } = Digit.Hooks.useNotificationCount({
    tenantId: CitizenHomePageTenantId,
    config: {
      enabled: conditionsToDisableNotificationCountTrigger(),
    },
  });

  const updateSidebar = () => {
    if (!Digit.clikOusideFired) {
      toggleSidebar(true);
      setSideBarScrollTop(true);
    } else {
      Digit.clikOusideFired = false;
    }
  };

  function onNotificationIconClick() {
    history.push("/suda-ui/citizen/engagement/notifications");
  }

  const urlsToDisableNotificationIcon = (pathname) =>
    !!Digit.UserService?.getUser()?.access_token
      ? false
      : ["/suda-ui/citizen/select-language", "/suda-ui/citizen/select-location"].includes(pathname);

  if (CITIZEN) {
    return (
      <div>
        <TopBarComponent
          img={stateInfo?.logoUrlWhite}
          isMobile={true}
          toggleSidebar={updateSidebar}
          logoUrl={stateInfo?.logoUrlWhite}
          onLogout={handleLogout}
          userDetails={userDetails}
          notificationCount={unreadNotificationCount < 99 ? unreadNotificationCount : 99}
          notificationCountLoaded={notificationCountLoaded}
          cityOfCitizenShownBesideLogo={t(CitizenHomePageTenantId)}
          onNotificationIconClick={onNotificationIconClick}
          hideNotificationIconOnSomeUrlsWhenNotLoggedIn={urlsToDisableNotificationIcon(pathname)}
          changeLanguage={!mobileView ? <ChangeLanguage dropdown={true} /> : null}
        />
      </div>
    );
  }
  const loggedin = userDetails?.access_token ? true : false;
  const userName = userDetails?.info?.name || userDetails?.info?.userInfo?.name || "Employee";
  const initials = userName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="topbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: "56px", background: "#ffffff", borderBottom: "1px solid #e8e8e8", boxShadow: "none" }}>
      {mobileView ? <Hamburger handleClick={toggleSidebar} color="#9E9E9E" /> : null}
      <span style={{ fontSize: "20px", fontWeight: "700", color: "#091E64", flexShrink: 0 }}>
        {t("ORG_NAME")} ({t("ORG_NAME_SHORT")})
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {!mobileView && !window.location.href.includes("employee/user/login") && !window.location.href.includes("employee/user/language-selection") && (
          <ChangeCity dropdown={true} t={t} />
        )}
        {!mobileView && showLanguageChange && <ChangeLanguage dropdown={true} />}
        {loggedin && (
          <div ref={menuRef} style={{ position: "relative", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => setMenuOpen(o => !o)}>
            {profilePic ? (
              <img src={profilePic} alt="profilePic" style={{ height: "36px", width: "36px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#091E64", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "700", flexShrink: 0 }}>
                {initials || "E"}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a1a" }}>{userName}</span>
              <span style={{ fontSize: "12px", color: "#888888" }}>Employee</span>
            </div>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ marginLeft: "2px", transition: "transform 0.2s", transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
              <path d="M1 1L6 6L11 1" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {menuOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", borderRadius: "8px", boxShadow: "0 4px 16px rgba(0,0,0,0.14)", minWidth: "180px", zIndex: 99999, overflow: "hidden" }}>
                {userOptions.map((opt, i) => (
                  <div
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); opt.func && opt.func(); }}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", cursor: "pointer", fontSize: "14px", color: "#1a1a1a", borderBottom: i < userOptions.length - 1 ? "1px solid #f0f0f0" : "none", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f7fa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ display: "flex", alignItems: "center", color: "#555" }}>{opt.icon}</span>
                    <span>{opt.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
