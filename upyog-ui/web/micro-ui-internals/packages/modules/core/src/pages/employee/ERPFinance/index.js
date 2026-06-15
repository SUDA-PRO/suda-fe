import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * ERPFinance — renders the Finance ERP inside an iframe via a POST form.
 *
 * Extensionless ERP URLs (e.g. /services/EGF/expensebill/newform) require POST.
 * Cross-origin form POSTs are allowed by browsers (no CORS preflight), so this
 * works from localhost to suda.digitalgovernance.digital.
 *
 * Flow:
 *   1. User clicks a Finance sidebar link → React Router navigates to
 *      /suda-ui/employee/services/<path>
 *   2. This component builds the ERP URL and submits a hidden form into the iframe.
 *   3. The ERP filter validates auth_token, creates a session, and renders the page.
 *
 * Note: .action URLs (Struts) currently return 405 on POST — backend team needs
 * to enable POST forwarding in nginx for those paths.
 */
const ERPFinance = () => {
  const location = useLocation();
  const formRef = useRef(null);

  const getAuthToken = () =>
    localStorage.getItem("Employee.token") || localStorage.getItem("token") || "";
  const getTenantId = () =>
    localStorage.getItem("Employee.tenant-id") || localStorage.getItem("tenant-id") || "";
  const getLocale = () =>
    localStorage.getItem("Employee.locale") || localStorage.getItem("locale") || "en_IN";

  /**
   * Build the ERP URL for the form action.
   *
   * Cross-origin form POSTs are allowed by browsers (no CORS preflight).
   * Posting directly to suda.digitalgovernance.digital ensures all relative
   * CSS/JS paths in the response resolve correctly from the ERP server.
   *
   * On localhost:  https://suda.digitalgovernance.digital/services/EGF/...
   * On production: /services/EGF/... (same-origin)
   */
  const getErpUrl = () => {
    // location.pathname is /suda-ui/employee/services/EGF/...
    // Strip /suda-ui/employee so the ERP path becomes /services/EGF/...
    const erpPath = location.pathname.replace(/^\/suda-ui\/employee/, "");

    const loc = window.location;
    if (loc.hostname === "localhost" || loc.hostname === "127.0.0.1") {
      // Cross-origin form POST (allowed by browsers, no CORS preflight)
      // Direct URL ensures CSS/JS relative paths resolve correctly
      return `https://suda.digitalgovernance.digital${erpPath}`;
    }

    // Production: same-origin POST
    return erpPath;
  };

  // Submit the form into the iframe on mount and whenever the route changes
  useEffect(() => {
    if (formRef.current) {
      formRef.current.submit();
    }
  }, [location.pathname]);

  const winheight = window.innerHeight - 100;

  return (
    <div style={{ width: "100%", height: winheight }}>
      <iframe
        name="erp_iframe"
        id="erp_iframe"
        height={winheight}
        width="100%"
        title="Finance ERP"
        style={{ border: "none" }}
      />
      <form
        ref={formRef}
        action={getErpUrl()}
        method="post"
        target="erp_iframe"
        style={{ display: "none" }}
      >
        <input type="hidden" name="auth_token" value={getAuthToken()} />
        <input type="hidden" name="tenantId" value={getTenantId()} />
        <input type="hidden" name="locale" value={getLocale()} />
        <input type="hidden" name="formPage" value="true" />
      </form>
    </div>
  );
};

export default ERPFinance;
