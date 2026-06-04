import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";

/**
 * ERPFinance — renders the Finance ERP inside an iframe via a GET request.
 *
 * The Finance ERP at suda.digitalgovernance.digital rejects POST to /services/EGF/*
 * with 405. We use a GET iframe instead, passing auth credentials as query params.
 * Cross-origin iframe loads are not subject to CORS, so this works in both dev and prod.
 *
 * Flow:
 *   1. User clicks a Finance sidebar link → React Router navigates to
 *      /suda-ui/employee/services/<path>
 *   2. This component builds the ERP URL with auth params and sets it as the iframe src.
 *   3. The ERP filter validates auth_token, creates a session, and renders the page.
 */
const ERPFinance = () => {
  const location = useLocation();

  const getAuthToken = () =>
    localStorage.getItem("Employee.token") || localStorage.getItem("token") || "";
  const getTenantId = () =>
    localStorage.getItem("Employee.tenant-id") || localStorage.getItem("tenant-id") || "";
  const getLocale = () =>
    localStorage.getItem("Employee.locale") || localStorage.getItem("locale") || "en_IN";

  /**
   * Build the ERP URL as a GET request with auth params.
   *
   * On localhost:  https://suda.digitalgovernance.digital/services/EGF/...?auth_token=...
   * On production: /services/EGF/...?auth_token=... (same-origin GET)
   *
   * Iframes load cross-origin content without CORS restrictions, so the direct
   * URL works in dev without a proxy.
   */
  const buildErpUrl = () => {
    // location.pathname is the full path: /suda-ui/employee/services/EGF/...
    // Strip /suda-ui/employee so the ERP path becomes /services/EGF/...
    const erpPath = location.pathname.replace(/^\/suda-ui\/employee/, "");

    const params = new URLSearchParams({
      auth_token: getAuthToken(),
      tenantId: getTenantId(),
      locale: getLocale(),
      formPage: "true",
    });

    const loc = window.location;
    if (loc.hostname === "localhost" || loc.hostname === "127.0.0.1") {
      // In dev: load directly from the production ERP (cross-origin GET is fine for iframes)
      return `https://suda.digitalgovernance.digital${erpPath}?${params.toString()}`;
    }

    // Production: same-origin request
    return `${erpPath}?${params.toString()}`;
  };

  const erp_url = useMemo(buildErpUrl, [location.pathname]);
  const winheight = window.innerHeight - 100;

  return (
    <div style={{ width: "100%", height: winheight }}>
      <iframe
        src={erp_url}
        name="erp_iframe"
        id="erp_iframe"
        height={winheight}
        width="100%"
        title="Finance ERP"
        style={{ border: "none" }}
      />
    </div>
  );
};

export default ERPFinance;
