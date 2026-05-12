import React, { Component } from "react";
import { getTenantId, getAccessToken } from "egov-ui-kit/utils/localStorageUtils";

class EGFFinance extends Component {
  constructor(props) {
    super(props);
    this.onFrameLoad = this.onFrameLoad.bind(this);
    this.resetIframe = this.resetIframe.bind(this);
  }
  onFrameLoad() {
    document.getElementById("erp_iframe").style.display = "block";
  }

  render() {
    let auth_token = getAccessToken(),
    locale = localStorage.getItem("locale"),
    menuUrl = this.props.location.pathname,
    loc = window.location,
    winheight = window.innerHeight - 100,
    erp_url,
    tenantId = getTenantId();

    // Finance is exposed on the same host under /services via ingress.
    // Normalize routed UI path (/employee/services/...) to backend path (/services/...).
    const employeeIndex = menuUrl.indexOf("/employee/");
    if (employeeIndex > -1) {
      menuUrl = menuUrl.substring(employeeIndex + "/employee".length);
    }
    if (!menuUrl.startsWith("/services/")) {
      const servicesIndex = menuUrl.indexOf("/services/");
      menuUrl = servicesIndex > -1 ? menuUrl.substring(servicesIndex) : `/services/EGF/inbox`;
    }

    const tenantCode = (tenantId || "").split(".")[1] || "";
    const currentHost = loc.hostname || "";
    const currentBaseDomain = currentHost.substring(currentHost.indexOf(".") + 1);
    const configuredBaseDomain = this.globalConfigExists() ? window.globalConfigs.getConfig("FINANCE_BASE_DOMAIN") : "";
    const financeBaseDomain = configuredBaseDomain || currentBaseDomain;
    const financeHost = tenantCode ? `${tenantCode}.${financeBaseDomain}` : loc.host;

    erp_url = `${loc.protocol}//${financeHost}${menuUrl}`;

    return (
      <div>
        <iframe name="erp_iframe" id="erp_iframe" height={winheight} width="100%" />
        <form action={erp_url} id="erp_form" method="post" target="erp_iframe">
          <input readOnly hidden="true" name="auth_token" value={auth_token} />
          <input readOnly hidden="true" name="tenantId" value={tenantId} />
          <input readOnly hidden="true" name="locale" value={locale} />
	  <input readOnly hidden="true" name="formPage" value="true" />
        </form>
      </div>
    );
  }
  componentDidMount() {
    window.addEventListener("message", this.onMessage, false);
    window.addEventListener("loacaleChangeEvent", this.resetIframe, false);
    document.getElementById("erp_iframe").addEventListener("load", this.onFrameLoad);
  }
  componentDidUpdate() {
    let isSecure = window.location.protocol === "https";
    let localeCookie = "locale=" + localStorage.getItem("locale") + ";path=/;domain=." + this.getSubdomain();
    if (isSecure) {
      localeCookie += ";secure";
    }
    window.document.cookie = localeCookie;
    document.forms["erp_form"].submit();
  }
  onMessage = (event) => {
    if (event.data != "close") return;
    // document.getElementById('erp_iframe').style.display='none';
    this.props.history.push("/inbox");
  };
  resetIframe() {
    this.forceUpdate();
  }
  getSubdomain() {
    let hostname = window.location.hostname;
    return hostname.substring(hostname.indexOf(".") + 1);
  }
  globalConfigExists() {
    return typeof window.globalConfigs !== "undefined" && typeof window.globalConfigs.getConfig === "function";
  }
}

export default EGFFinance;
