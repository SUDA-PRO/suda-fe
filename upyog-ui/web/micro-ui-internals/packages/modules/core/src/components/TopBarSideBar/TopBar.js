import { Dropdown, Hamburger, TopBar as TopBarComponent } from "@upyog/digit-ui-react-components";
import React from "react";
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
  return (
    <div className="topbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: "56px", background: "#ffffff", borderBottom: "1px solid #e8e8e8", boxShadow: "none" }}>
      {mobileView ? <Hamburger handleClick={toggleSidebar} color="#9E9E9E" /> : null}
      <span style={{ fontSize: "22px", fontWeight: "700", color: "#091E64", flexShrink: 0 }}>
        State Urban Development Agency (SUDA)
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {!mobileView && !window.location.href.includes("employee/user/login") && !window.location.href.includes("employee/user/language-selection") && (
          <ChangeCity dropdown={true} t={t} />
        )}
        {!mobileView && showLanguageChange && <ChangeLanguage dropdown={true} />}
        {loggedin && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Dropdown
              option={userOptions}
              optionKey={"name"}
              select={handleUserDropdownSelection}
              showArrow={false}
              freeze={true}
              style={{ right: 0 }}
              optionCardStyles={{ overflow: "revert" }}
              customSelector={
                profilePic == null ? (
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#091E64", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", cursor: "pointer", flexShrink: 0 }}>
                    {initials || "E"}
                  </div>
                ) : (
                  <img src={profilePic} alt="profilePic" style={{ height: "36px", width: "36px", borderRadius: "50%", cursor: "pointer" }} />
                )
              }
            />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontSize: "15px", fontWeight: "600", color: "#1a1a1a" }}>{userName}</span>
              <span style={{ fontSize: "12px", color: "#888888" }}>Employee</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
