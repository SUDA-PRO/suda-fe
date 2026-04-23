import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Hamburger from "./Hamburger";
import { NotificationBell } from "./svgindex";
import { useLocation } from "react-router-dom";
import BackButton from "./BackButton";

const TopBar = ({
  img,
  isMobile,
  logoUrl,
  onLogout,
  toggleSidebar,
  ulb,
  userDetails,
  notificationCount,
  notificationCountLoaded,
  cityOfCitizenShownBesideLogo,
  onNotificationIconClick,
  hideNotificationIconOnSomeUrlsWhenNotLoggedIn,
  changeLanguage,
}) => {
  const { pathname } = useLocation();

  // const showHaburgerorBackButton = () => {
  //   if (pathname === "/upyog-ui/citizen" || pathname === "/upyog-ui/citizen/" || pathname === "/upyog-ui/citizen/select-language") {
  //     return <Hamburger handleClick={toggleSidebar} />;
  //   } else {
  //     return <BackButton className="top-back-btn" />;
  //   }
  // };
  return (
    <div className="navbar">
      <div className="center-container back-wrapper" style={{display:"flex",marginRight:"2rem",marginLeft:"2rem",justifyContent:"space-between"}}>
        <div className="hambuger-back-wrapper" style={{display:"flex"}}>
          {window.innerWidth <= 660  && <Hamburger handleClick={toggleSidebar} />}
          <a href={window.location.href.includes("citizen")?"/upyog-ui/citizen":"/upyog-ui/employee"}><h2 style={{fontSize:30, color:'orange', fontWeight:'bold', fontFamily: 'monospace'}}>SUDA</h2>
          </a>
          <h3></h3>
          <span>{cityOfCitizenShownBesideLogo}</span>
        </div>

        <div className="RightMostTopBarOptions">
          <span>{!hideNotificationIconOnSomeUrlsWhenNotLoggedIn ? changeLanguage : null}</span>
          {!hideNotificationIconOnSomeUrlsWhenNotLoggedIn ? (
            <div className="EventNotificationWrapper" onClick={onNotificationIconClick}>
              {notificationCountLoaded && notificationCount ? (
                <span>
                  <p>{notificationCount}</p>
                </span>
              ) : null}
              <NotificationBell />
            </div>
          ) : null}
          <h3></h3>
          {/* <img
          className="city"
          id="topbar-logo" 
          src={"https://in-egov-assets.s3.ap-south-1.amazonaws.com/images/Upyog-logo.png" || "https://cdn.jsdelivr.net/npm/@egovernments/digit-ui-css@1.0.7/img/m_seva_white_logo.png"}
          alt="mSeva"
          style={{marginLeft:"10px"}}
        /> */}
          <h2 style={{fontSize:30, color:'orange', fontWeight:'bold', fontFamily: 'monospace'}}>SUDA</h2>
        </div>
      </div>
    </div>
  );
};

TopBar.propTypes = {
  img: PropTypes.string,
};

TopBar.defaultProps = {
  img: undefined,
};

export default TopBar;
