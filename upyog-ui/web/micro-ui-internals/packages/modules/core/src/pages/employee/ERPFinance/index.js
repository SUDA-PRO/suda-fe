import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const ERPFinance = () => {
  const location = useLocation();
  const formRef = useRef(null);

  const getAuthToken = () =>
    localStorage.getItem("Employee.token") || localStorage.getItem("token") || "";
  const getTenantId = () =>
    localStorage.getItem("Employee.tenant-id") || localStorage.getItem("tenant-id") || "";
  const getLocale = () =>
    localStorage.getItem("Employee.locale") || localStorage.getItem("locale") || "en_IN";

  const getErpUrl = () => {
    // Strip /suda-ui/employee so the ERP path becomes /services/EGF/...
    const erpPath = location.pathname.replace(/^\/suda-ui\/employee/, "");
    const loc = window.location;
    if (loc.hostname === "localhost" || loc.hostname === "127.0.0.1") {
      return `https://suda.digitalgovernance.digital${erpPath}`;
    }
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
        id="erp_form"
        method="post"
        action={getErpUrl()}
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
