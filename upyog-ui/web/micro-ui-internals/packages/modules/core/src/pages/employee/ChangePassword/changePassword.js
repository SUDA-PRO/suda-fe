import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Toast, Loader } from "@upyog/digit-ui-react-components";
import Header from "../../citizen/Home/Header";
import Footer from "../../citizen/Home/Footer";

const bannerUrl = "https://tfstatee8aog.blob.core.windows.net/filestore/SudaLogin.svg";

const EyeIcon = ({ show, onClick }) => (
  <button type="button" className="suda-icon-btn" onClick={onClick} tabIndex={-1} aria-label="Toggle password visibility">
    {show ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    )}
  </button>
);

const ChangePasswordComponent = () => {
  const { t } = useTranslation();
  const { mobile_number: mobileNumber, tenantId } = Digit.Hooks.useQueryParams();
  const history = useHistory();

  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [userName, setUserName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Digit.UserService.setType("employee");
  }, []);

  /* preload banner */
  useEffect(() => {
    const img = new window.Image();
    img.src = bannerUrl;
  }, []);

  /* inject / refresh shared page styles */
  useEffect(() => {
    const PAGE_STYLES = `
      .suda-page-bg {
        min-height: 100vh; width: 100%;
        background-color: #c9c5dc; background-size: cover; background-position: center;
        display: flex; align-items: center; justify-content: flex-end;
        padding: 40px; box-sizing: border-box;
      }
      .suda-page-card {
        background: #fff; border-radius: 12px;
        box-shadow: 0 8px 48px rgba(0,0,0,0.28);
        padding: 36px 40px 28px; width: 100%; max-width: 500px;
        max-height: 90vh; overflow-y: auto; position: relative;
      }
      @media (max-width: 600px) { .suda-page-bg { justify-content: center; padding: 16px; } }
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
      .suda-icon-btn {
        background:none; border:none; cursor:pointer;
        padding:0 12px; color:#888; display:flex; align-items:center; height:44px;
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
      .suda-timer { font-size:12.5px; color:#888; }
      .suda-row-end { display:flex; justify-content:flex-end; margin-top:5px; }
      .suda-otp-hint { font-size:12px; color:#666; margin:0 0 16px; }
    `;
    const existing = document.getElementById("suda-page-styles");
    if (existing) { existing.textContent = PAGE_STYLES; return; }
    const el = document.createElement("style");
    el.id = "suda-page-styles";
    el.textContent = PAGE_STYLES;
    document.head.appendChild(el);
    return () => { const s = document.getElementById("suda-page-styles"); if (s) s.remove(); };
  }, []);

  /* resend countdown */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer(v => v - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  const getUserType = () => Digit.UserService.getType();

  const showErr = (msg) => {
    setToast({ error: true, label: msg });
    setTimeout(() => setToast(null), 5000);
  };

  const showInfo = (msg) => {
    setToast({ error: false, label: msg });
    setTimeout(() => setToast(null), 5000);
  };

  const onResendOTP = async () => {
    try {
      await Digit.UserService.sendOtp(
        { otp: { mobileNumber, userType: getUserType().toUpperCase(), type: "passwordreset", tenantId } },
        tenantId
      );
      showInfo(t("ES_OTP_RESEND"));
      setResendTimer(30);
    } catch (err) {
      showErr(err?.response?.data?.error_description || t("ES_INVALID_LOGIN_CREDENTIALS"));
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) { showErr(t("PLEASE_ENTER_VALID_OTP")); return; }
    if (!newPassword) { showErr(t("CORE_COMMON_REQUIRED_ERRMSG")); return; }
    if (newPassword !== confirmPassword) { showErr(t("ERR_PASSWORD_DO_NOT_MATCH")); return; }
    setLoading(true);
    try {
      await Digit.UserService.changePassword(
        { userName, newPassword, confirmPassword, otpReference: otp, tenantId, type: getUserType().toUpperCase() },
        tenantId
      );
      showInfo(t("PASSWORD_CHANGED_SUCCESSFULLY"));
      setTimeout(() => history.replace("/suda-ui/login"), 2000);
    } catch (err) {
      const errData = err?.response?.data;
      const message =
        errData?.Errors?.[0]?.message ||
        errData?.error?.fields?.[0]?.message ||
        errData?.error_description ||
        t("ES_SOMETHING_WRONG");
      showErr(message);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <div className="suda-page-bg" style={{ backgroundImage: `url(${bannerUrl})`, flex: 1, marginTop: "78px" }}>
        <div className="suda-page-card">
          <h2 className="suda-title">
            {t("CORE_COMMON_RESET_PASSWORD_LABEL")}
          </h2>
          <p className="suda-otp-hint">
            {t("CS_LOGIN_OTP_TEXT")} <strong>+91 - {mobileNumber}</strong>
          </p>

          <form onSubmit={onChangePassword} noValidate>
            {/* OTP */}
            <div className="suda-field" style={{ marginBottom: 6 }}>
              <label className="suda-label">{t("CORE_OTP_OTP")} <span className="suda-req">*</span></label>
              <div className="suda-input-wrap">
                <input
                  className="suda-input"
                  type={showOtp ? "text" : "password"}
                  maxLength={6}
                  placeholder={t("ENTER_OTP")}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <EyeIcon show={showOtp} onClick={() => setShowOtp(v => !v)} />
              </div>
              <div className="suda-row-end">
                {resendTimer > 0
                  ? <span className="suda-timer">{t("RESEND_OTP_IN", { count: resendTimer })}</span>
                  : <button type="button" className="suda-text-btn" onClick={onResendOTP}>{t("CORE_OTP_RESEND")}</button>
                }
              </div>
            </div>

            {/* Username */}
            <div className="suda-field">
              <label className="suda-label">{t("CORE_LOGIN_USERNAME")} <span className="suda-req">*</span></label>
              <div className="suda-input-wrap">
                <input
                  className="suda-input"
                  type="text"
                  autoComplete="off"
                  placeholder={t("ENTER_USERNAME")}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
            </div>

            {/* New Password */}
            <div className="suda-field">
              <label className="suda-label">{t("CORE_LOGIN_NEW_PASSWORD")} <span className="suda-req">*</span></label>
              <div className="suda-input-wrap">
                <input
                  className="suda-input"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={t("CORE_LOGIN_NEW_PASSWORD")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <EyeIcon show={showNew} onClick={() => setShowNew(v => !v)} />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="suda-field">
              <label className="suda-label">{t("CORE_LOGIN_CONFIRM_NEW_PASSWORD")} <span className="suda-req">*</span></label>
              <div className="suda-input-wrap">
                <input
                  className="suda-input"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={t("CORE_LOGIN_CONFIRM_NEW_PASSWORD")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <EyeIcon show={showConfirm} onClick={() => setShowConfirm(v => !v)} />
              </div>
            </div>

            <button type="submit" className="suda-submit" disabled={loading}>
              {loading ? t("PLEASE_WAIT") : t("CORE_COMMON_CHANGE_PASSWORD")}
            </button>
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

export default ChangePasswordComponent;
