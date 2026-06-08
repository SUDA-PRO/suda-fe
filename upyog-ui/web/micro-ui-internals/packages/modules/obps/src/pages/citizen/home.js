import { Loader, Toast } from "@upyog/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

const BPACitizenHomeScreen = ({ parentRoute }) => {
  const userInfo = Digit.UserService.getUser();
  const userRoles = userInfo?.info?.roles?.map((roleData) => roleData.code);
  const stateCode = Digit.ULBService.getStateId();
  const ulbTenantId = userInfo?.info?.roles?.find(r => r.tenantId && r.tenantId !== stateCode)?.tenantId || stateCode;
  const [stakeHolderRoles, setStakeholderRoles] = useState(false);
  const { data: stakeHolderDetails, isLoading: stakeHolderDetailsLoading } = Digit.Hooks.obps.useMDMS(
    stateCode,
    "StakeholderRegistraition",
    "TradeTypetoRoleMapping"
  );
  const [bpaLinks, setBpaLinks] = useState([]);
  const state = Digit.ULBService.getStateId();
  const { t } = useTranslation();
  const location = useLocation();
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage("BPA_HOME_CREATE", {});
  const { data: homePageUrlLinks, isLoading: homePageUrlLinksLoading } = Digit.Hooks.obps.useMDMS(state, "BPA", ["homePageUrlLinks"]);
  const [showToast, setShowToast] = useState(null);
  const [totalCount, setTotalCount] = useState("-");

  const closeToast = () => {
    window.location.replace("/suda-ui/citizen");
    setShowToast(null);
  };

  const [searchParams, setSearchParams] = useState({
    applicationStatus: [],
  });
  let isMobile = window.Digit.Utils.browser.isMobile();
  const [pageOffset, setPageOffset] = useState(0);
  const [pageSize, setPageSize] = useState(window.Digit.Utils.browser.isMobile() ? 50 : 10);
  const [sortParams, setSortParams] = useState([{ id: "createdTime", sortOrder: "DESC" }]);
  const paginationParams = isMobile
    ? { limit: 10, offset: 0, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.sortOrder }
    : { limit: pageSize, offset: pageOffset, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.sortOrder };
  const inboxSearchParams = { limit: 10, offset: 0, mobileNumber: userInfo?.info?.mobileNumber };

  const { isLoading: bpaLoading, data: bpaInboxData } = Digit.Hooks.obps.useArchitectInbox({
    tenantId: stateCode,
    moduleName: "bpa-services",
    businessService: ["BPA_LOW", "BPA", "BPA_OC"],
    filters: {
      searchForm: {
        ...searchParams,
      },
      tableForm: {
        sortBy: sortParams?.[0]?.id,
        limit: pageSize,
        offset: pageOffset,
        sortOrder: sortParams?.[0]?.sortOrder,
      },
      filterForm: {
        moduleName: "bpa-services",
        businessService: [],
        applicationStatus: searchParams?.applicationStatus,
        locality: [],
        assignee: "ASSIGNED_TO_ALL",
      },
    },
    config: {},
    withEDCRData: false,
  });
  const { isLoading: isEDCRInboxLoading, data: { totalCount: edcrCount } = {} } = Digit.Hooks.obps.useEDCRInbox({
    tenantId: ulbTenantId,
    filters: { filterForm: {}, searchForm: {}, tableForm: { limit: 10, offset: 0 } },
  });

  useEffect(()=>{
    if (location.pathname === "/suda-ui/citizen/obps/home"){
      Digit.SessionStorage.del("OBPS.INBOX")
      Digit.SessionStorage.del("STAKEHOLDER.INBOX")
    }
  },[location.pathname])

  useEffect(() => {
    if (!bpaLoading) {
      const totalCountofBoth = bpaInboxData?.totalCount || 0;
      setTotalCount(totalCountofBoth);
    }
  }, [bpaInboxData]);

  useEffect(() => {
    if (!stakeHolderDetailsLoading) {
      let roles = [];
      stakeHolderDetails?.StakeholderRegistraition?.TradeTypetoRoleMapping?.map((type) => {
        type?.role?.map((role) => {
          roles.push(role);
        });
      });
      const uniqueRoles = roles?.filter((item, i, ar) => ar.indexOf(item) === i);
      let isRoute = false;
      uniqueRoles?.map((unRole) => {
        if (userRoles?.includes(unRole) && !isRoute) {
          isRoute = true;
        }
      });
      if (!isRoute) {
        setStakeholderRoles(false);
        setShowToast({ key: "true", message: t("BPA_LOGIN_HOME_VALIDATION_MESSAGE_LABEL") });
      } else {
        setStakeholderRoles(true);
      }
    }
  }, [stakeHolderDetailsLoading]);

  useEffect(() => {
    if (!homePageUrlLinksLoading && homePageUrlLinks?.BPA?.homePageUrlLinks?.length > 0) {
      let uniqueLinks = [];
      homePageUrlLinks?.BPA?.homePageUrlLinks?.map((linkData) => {
        uniqueLinks.push({
          link: `${linkData?.flow?.toLowerCase()}/${linkData?.applicationType?.toLowerCase()}/${linkData?.serviceType?.toLowerCase()}/docs-required`,
          i18nKey: t(`BPA_HOME_${linkData?.applicationType}_${linkData?.serviceType}_LABEL`),
          state: { linkData },
          linkState: true,
        });
      });
      setBpaLinks(uniqueLinks);
    }
  }, [!homePageUrlLinksLoading]);

  useEffect(() => {
    clearParams();
  }, []);

  Digit.SessionStorage.set("EDCR_BACK", "IS_EDCR_BACK");

  if (showToast) return <Toast error={true} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />;

  if (stakeHolderDetailsLoading || !stakeHolderRoles || bpaLoading) {
    return <Loader />;
  } // || bparegLoading

  const renderCard = (action) => (
    <Link
      key={action.key}
      to={action.link}
      {...(action.linkState ? { state: action.state } : {})}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "20px 18px",
          boxShadow: "0 2px 12px rgba(26,43,73,0.07)",
          border: "1px solid #f0f2f5",
          cursor: "pointer",
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(26,43,73,0.13)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,43,73,0.07)"; }}
      >
        <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: action.gradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          {action.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a2b49", lineHeight: 1.3 }}>
            {t(action.i18nKey)}
          </div>
          {action.count !== undefined && (
            <div style={{ marginTop: "6px", fontSize: "22px", fontWeight: "800", color: action.countColor || "#f47738" }}>
              {action.count}
            </div>
          )}
        </div>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#f47738" }}>{t("PT_COMMON_CLICK_HERE")}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    </Link>
  );

  const sectionHeading = (label, accentColor) => (
    <h3 style={{ margin: "0 0 14px", fontSize: "16px", fontWeight: "800", color: "#1a2b49", display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ display: "inline-block", width: "4px", height: "18px", borderRadius: "2px", background: accentColor, flexShrink: 0 }} />
      {label}
    </h3>
  );

  sessionStorage.setItem("isPermitApplication", true);
  sessionStorage.setItem("isEDCRDisable", JSON.stringify(false));

  const inboxCards = [
    {
      key: "obps-inbox",
      i18nKey: "ES_COMMON_OBPS_INBOX_LABEL",
      link: `/suda-ui/citizen/obps/bpa/inbox`,
      count: !bpaLoading ? totalCount : "-",
      countColor: "#f47738",
      gradient: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
        </svg>
      ),
    },
    {
      key: "edcr-inbox",
      i18nKey: "ES_COMMON_EDCR_INBOX_LABEL",
      link: `/suda-ui/citizen/obps/edcr/inbox`,
      count: !isEDCRInboxLoading ? edcrCount : "-",
      countColor: "#2563eb",
      gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ),
    },
  ];

  const scrutinyCards = [
    {
      key: "edcr-scrutiny",
      i18nKey: "BPA_PLAN_SCRUTINY_FOR_NEW_CONSTRUCTION_LABEL",
      link: `edcrscrutiny/apply`,
      gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      ),
    },
    {
      key: "edcr-oc-scrutiny",
      i18nKey: "BPA_OC_PLAN_SCRUTINY_FOR_NEW_CONSTRUCTION_LABEL",
      link: `edcrscrutiny/oc-apply`,
      gradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      ),
    },
  ];

  const bpaCards = bpaLinks.map((bl, idx) => ({
    key: `bpa-link-${idx}`,
    i18nKey: bl.i18nKey,
    link: bl.link,
    linkState: bl.linkState,
    state: bl.state,
    gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  }));

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f4ff 0%, #fff7f0 60%, #fef6f0 100%)" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 16px 48px", display: "flex", flexDirection: "column", gap: "28px" }}>

        <div>
          {sectionHeading(t("ACTION_TEST_BPA_STAKE_HOLDER_HOME") , "#f47738")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
            {inboxCards.map(renderCard)}
          </div>
        </div>

        <div>
          {sectionHeading(t("ACTION_TEST_EDCR_SCRUTINY") , "#059669")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
            {scrutinyCards.map(renderCard)}
          </div>
        </div>

        {bpaCards.length > 0 && (
          <div>
            {sectionHeading(t("ACTION_TEST_BPA_STAKE_HOLDER_HOME"), "#d97706")}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
              {bpaCards.map(renderCard)}
            </div>
          </div>
        )}

        {/* Helpline / Address strip */}
        <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(26,43,73,0.10)", border: "1px solid #f0e8e0" }}>
          <div style={{ background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)", padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#fff", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {t("PT_HOME_HELP_TITLE") }
            </span>
          </div>
          <div style={{ background: "#fffaf7", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <div style={{ padding: "18px 24px", borderRight: "1px solid #f0e8e0", display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #fff0e8 0%, #ffe0cc 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12 19.79 19.79 0 0 1 1.21 3.4 2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6.25 6.25l1.21-1.21a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#1a2b49", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  {t("PT_HOME_HELPLINE_TITLE") }
                </div>
                <a href="tel:07712221955" style={{ fontSize: "13px", fontWeight: "600", color: "#f47738", textDecoration: "none" }}>0771-2221955</a>
              </div>
            </div>
            <div style={{ padding: "18px 24px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #fff0e8 0%, #ffe0cc 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#1a2b49", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  {t("PT_HOME_CSC_TITLE") }
                </div>
                <div style={{ fontSize: "13px", color: "#4b5563", lineHeight: 1.6 }}>
                  4th Floor, D-Block, Indravati Bhawan<br />
                  Atal Nagar, Raipur<br />
                  Chhattisgarh – 492018
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BPACitizenHomeScreen;
