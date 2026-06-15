import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Toast, Loader } from "@upyog/digit-ui-react-components";
import Header from "../../citizen/Home/Header";
import Footer from "../../citizen/Home/Footer";

const PAGE_STYLES = `
  .suda-page-bg {
    min-height: 100vh;
    width: 100%;
    background-color: #c9c5dc;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 40px;
    box-sizing: border-box;
  }
  .suda-page-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 48px rgba(0,0,0,0.28);
    padding: 36px 40px 28px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }
  @media (max-width: 600px) {
    .suda-page-bg { justify-content: center; padding: 16px; }
  }
  .suda-title { font-size:22px; font-weight:700; color:#1a1a1a; margin:0 0 6px; }
  .suda-title-accent { color:#D4860B; }
  .suda-subtitle { font-size:13px; color:#555; margin:0 0 20px; line-height:1.5; }
  .suda-field { margin-bottom:16px; }
  .suda-label { display:block; font-size:13px; font-weight:600; color:#333; margin-bottom:5px; }
  .suda-req { color:#e53e3e; }
  .suda-input-wrap {
    display:flex; align-items:center;
    border:1.5px solid #ccc; border-radius:8px;
    background:#fff; overflow:hidden; transition:border-color 0.15s;
  }
  .suda-input-wrap:focus-within { border-color:#D4860B; }
  .suda-input {
    flex:1; border:none; outline:none;
    padding:11px 14px; font-size:14px; color:#222; background:transparent;
  }
  .suda-input::placeholder { color:#aaa; }
  .suda-select {
    flex:1; border:none; outline:none;
    padding:11px 14px; font-size:14px; color:#222; background:transparent;
    appearance:none; -webkit-appearance:none; cursor:pointer;
  }
  .suda-select:invalid, .suda-select option[value=""] { color:#aaa; }
  .suda-select-arrow {
    pointer-events:none; padding:0 12px; color:#888;
    display:flex; align-items:center; flex-shrink:0;
  }
  .suda-submit {
    width:100%; background:#D4860B; color:#fff;
    border:none; border-radius:8px; padding:13px;
    font-size:15px; font-weight:700; cursor:pointer;
    margin-top:6px; letter-spacing:0.5px; transition:background 0.15s;
  }
  .suda-submit:hover:not(:disabled) { background:#b8720a; }
  .suda-submit:disabled { opacity:0.7; cursor:default; }
  .suda-text-btn {
    background:none; border:none; color:#D4860B;
    cursor:pointer; font-size:12.5px; padding:0; text-decoration:underline;
  }
`;

const bannerUrl = "https://tfstatee8aog.blob.core.windows.net/filestore/SudaLogin.svg";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { data: cities, isLoading } = Digit.Hooks.useTenants();
  const history = useHistory();
  const [mobile, setMobile] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Digit.UserService.setType("employee");
  }, []);

  /* preload banner */
  useEffect(() => {
    const img = new window.Image();
    img.src = bannerUrl;
  }, []);

  /* inject shared page styles (same id as SudaLoginPage — no duplication) */
  useEffect(() => {
    const existing = document.getElementById("suda-page-styles");
    if (existing) {
      existing.textContent = PAGE_STYLES;
      return;
    }
    const el = document.createElement("style");
    el.id = "suda-page-styles";
    el.textContent = PAGE_STYLES;
    document.head.appendChild(el);
    return () => {
      const s = document.getElementById("suda-page-styles");
      if (s) s.remove();
    };
  }, []);

  const showErr = (msg) => {
    setToast({ error: true, label: msg });
    setTimeout(() => setToast(null), 5000);
  };

  const onForgotPassword = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.length !== 10) {
      showErr(t("PLEASE_ENTER_VALID_MOBILE_NUMBER"));
      return;
    }
    if (!selectedCity) {
      showErr(t("PLEASE_SELECT_CITY"));
      return;
    }
    setLoading(true);
    try {
      await Digit.UserService.sendOtp(
        { otp: { mobileNumber: mobile, userType: "citizen", type: "passwordreset", tenantId: selectedCity.code } },
        selectedCity.code
      );
      history.push(`/suda-ui/employee/user/change-password?mobile_number=${mobile}&tenantId=${selectedCity.code}`);
    } catch (err) {
      showErr(err?.response?.data?.error?.fields?.[0]?.message || t("INVALID_LOGIN_CREDENTIALS"));
    }
    setLoading(false);
  };

  if (isLoading) return <Loader />;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <div className="suda-page-bg" style={{ backgroundImage: `url(${bannerUrl})`, flex: 1, marginTop: "78px" }}>
        <div className="suda-page-card">
          <h2 className="suda-title">
            {t("CORE_COMMON_FORGOT_PASSWORD_LABEL").replace("?", "")} <span className="suda-title-accent">?</span>
          </h2>
          <p className="suda-subtitle">{t("ES_FORGOT_PASSWORD_DESC")}</p>

          <form onSubmit={onForgotPassword} noValidate>
            <div className="suda-field">
              <label className="suda-label">
                {t("CORE_COMMON_MOBILE_NUMBER")} <span className="suda-req">*</span>
              </label>
              <div className="suda-input-wrap">
                <input
                  className="suda-input"
                  type="text"
                  maxLength={10}
                  placeholder={t("ENTER_MOBILE_NUMBER")}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
            </div>

            <div className="suda-field">
              <label className="suda-label">
                {t("CORE_COMMON_CITY")} <span className="suda-req">*</span>
              </label>
              <div className="suda-input-wrap">
                <select
                  className="suda-select"
                  value={selectedCity?.code || ""}
                  onChange={(e) => {
                    const found = cities?.find((c) => c.code === e.target.value) || null;
                    setSelectedCity(found);
                  }}
                >
                  <option value="" disabled>{t("SELECT_CITY")}</option>
                  {(cities || []).map((city) => (
                    <option key={city.code} value={city.code}>{city.name}</option>
                  ))}
                </select>
                <span className="suda-select-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: 25 }}>
            <button type="submit" className="suda-submit" disabled={loading}>
              {loading ? t("PLEASE_WAIT") : t("CORE_COMMON_CONTINUE")}
            </button>
            </div>
          </form>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button
              type="button"
              className="suda-text-btn"
              onClick={() => history.replace("/suda-ui/login")}
            >
              {t("BACK_TO_LOGIN")}
            </button>
          </div>
        </div>
      </div>
      {toast && <Toast error={toast.error} label={toast.label} onClose={() => setToast(null)} />}
      <Footer />
    </div>
  );
};

export default ForgotPassword;
