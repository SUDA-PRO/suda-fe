import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { Toast } from "@upyog/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import Header from "../../citizen/Home/Header";
import Footer from "../../citizen/Home/Footer";

/* ── captcha ──────────────────────────────────────────────── */
const renderCaptcha = (text, canvasRef) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = 110; canvas.height = 42;
  ctx.fillStyle = "#f8f4ed";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(${Math.random()*160},${Math.random()*160},${Math.random()*160},0.4)`;
    ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(Math.random()*canvas.width, Math.random()*canvas.height);
    ctx.lineTo(Math.random()*canvas.width, Math.random()*canvas.height);
    ctx.stroke();
  }
  ctx.textBaseline = "middle";
  for (let i = 0; i < text.length; i++) {
    ctx.save();
    ctx.translate(11 + i*16, 21 + (Math.random()*5-2.5));
    ctx.rotate((Math.random()-0.5)*0.4);
    ctx.font = `bold ${19+Math.floor(Math.random()*4)}px 'Courier New',monospace`;
    ctx.fillStyle = `hsl(${210+Math.random()*40},60%,32%)`;
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
};

const makeCaptchaText = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random()*chars.length)]).join("");
};

/* ── session helpers ──────────────────────────────────────── */
const setEmployeeDetail = (userObject, token) => {
  const locale = JSON.parse(sessionStorage.getItem("Digit.locale"))?.value || "en_IN";
  localStorage.setItem("Employee.tenant-id", userObject?.tenantId);
  localStorage.setItem("tenant-id", userObject?.tenantId);
  localStorage.setItem("citizen.userRequestObject", JSON.stringify(userObject));
  localStorage.setItem("locale", locale);
  localStorage.setItem("Employee.locale", locale);
  localStorage.setItem("token", token);
  localStorage.setItem("Employee.token", token);
  localStorage.setItem("user-info", JSON.stringify(userObject));
  localStorage.setItem("Employee.user-info", JSON.stringify(userObject));
};

const setCitizenDetail = (userObject, token, tenantId) => {
  const locale = JSON.parse(sessionStorage.getItem("Digit.initData"))?.value?.selectedLanguage;
  localStorage.setItem("Citizen.tenant-id", tenantId);
  localStorage.setItem("tenant-id", tenantId);
  localStorage.setItem("citizen.userRequestObject", JSON.stringify(userObject));
  localStorage.setItem("locale", locale);
  localStorage.setItem("Citizen.locale", locale);
  localStorage.setItem("token", token);
  localStorage.setItem("Citizen.token", token);
  localStorage.setItem("user-info", JSON.stringify(userObject));
  localStorage.setItem("Citizen.user-info", JSON.stringify(userObject));
};

/* ── icons ────────────────────────────────────────────────── */
const EyeIcon = ({ show, onClick }) => (
  <button type="button" className="suda-icon-btn" onClick={onClick} tabIndex={-1} aria-label="Toggle">
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

const PhoneIcon = () => (
  <span className="suda-phone-icon">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.43 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
    </svg>
  </span>
);

const USER_TYPES = [
  { key: "citizen", label: "TYPE_CITIZEN" },
  { key: "officer", label: "TYPE_OFFICER" },
  { key: "admin",   label: "TYPE_ADMIN"   },
  { key: "guest",   label: "TYPE_GUEST"   },
];

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
  .suda-pills { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:22px; }
  .suda-pill {
    display:flex; align-items:center; gap:6px;
    padding:6px 14px; border-radius:999px;
    border:1.5px solid #ccc; cursor:pointer;
    font-size:13px; font-weight:500; color:#444; background:#fff;
    transition:border-color 0.15s,color 0.15s; user-select:none;
  }
  .suda-pill--active { border-color:#D4860B; color:#D4860B; }
  .suda-pill input[type="radio"] { display:none; }
  .suda-dot {
    width:13px; height:13px; border-radius:50%;
    border:2px solid #ccc; display:inline-flex; align-items:center;
    justify-content:center; flex-shrink:0;
    transition:border-color 0.15s,background 0.15s;
  }
  .suda-dot--active { border-color:#D4860B; background:#D4860B; box-shadow:inset 0 0 0 2.5px #fff; }
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
  .suda-verify-btn {
    flex-shrink:0; background:#1a1a3e; color:#fff;
    border:none; padding:0 16px; height:44px;
    font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap;
    transition:background 0.15s;
  }
  .suda-verify-btn:hover:not(:disabled) { background:#2a2a5e; }
  .suda-verify-btn:disabled { cursor:not-allowed; opacity:0.7; }
  .suda-icon-btn {
    background:none; border:none; cursor:pointer;
    padding:0 12px; color:#888; display:flex; align-items:center; height:44px;
  }
  .suda-phone-icon { display:flex; align-items:center; padding:0 12px; color:#888; }
  .suda-row-end { display:flex; justify-content:flex-end; margin-top:5px; }
  .suda-text-btn {
    background:none; border:none; color:#D4860B;
    cursor:pointer; font-size:12.5px; padding:0; text-decoration:underline;
  }
  .suda-timer { font-size:12.5px; color:#888; }
  .suda-captcha-row { display:flex; gap:10px; align-items:stretch; }
  .suda-captcha-row .suda-input-wrap { flex:1; }
  .suda-captcha-canvas-btn {
    flex-shrink:0; background:#f8f4ed;
    border:1.5px solid #ccc; border-radius:8px; cursor:pointer;
    padding:4px 6px; display:flex; align-items:center; justify-content:center;
    transition:border-color 0.15s;
  }
  .suda-captcha-canvas-btn:hover { border-color:#D4860B; }
  .suda-submit {
    width:100%; background:#D4860B; color:#fff;
    border:none; border-radius:8px; padding:13px;
    font-size:15px; font-weight:700; cursor:pointer;
    margin-top:6px; letter-spacing:0.5px; transition:background 0.15s;
  }
  .suda-submit:hover:not(:disabled) { background:#b8720a; }
  .suda-submit:disabled { opacity:0.7; cursor:default; }
  .suda-privacy-row {
    display:flex; align-items:center; gap:10px;
    margin-bottom:14px; margin-top:8px;
  }
  .suda-privacy-row input[type="checkbox"] {
    width:16px; height:16px; flex-shrink:0; accent-color:#D4860B; cursor:pointer;
  }
  .suda-privacy-row label {
    font-size:13px; color:#444; line-height:1.5; cursor:pointer; user-select:none;
  }
  .suda-privacy-link {
    color:#D4860B; text-decoration:underline; cursor:pointer;
    background:none; border:none; padding:0; font-size:13px; font-weight:500;
  }
  .suda-modal-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,0.55);
    display:flex; align-items:center; justify-content:center;
    z-index:9999; padding:16px; box-sizing:border-box;
  }
  .suda-modal {
    background:#fff; border-radius:12px;
    box-shadow:0 8px 48px rgba(0,0,0,0.32);
    width:100%; max-width:640px; max-height:85vh;
    display:flex; flex-direction:column; overflow:hidden;
  }
  .suda-modal-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:18px 24px 14px; border-bottom:1px solid #eee; flex-shrink:0;
  }
  .suda-modal-header h3 { margin:0; font-size:17px; font-weight:700; color:#1a1a1a; }
  .suda-modal-close {
    background:none; border:none; cursor:pointer; padding:4px;
    color:#666; display:flex; align-items:center;
    border-radius:4px; transition:background 0.15s;
  }
  .suda-modal-close:hover { background:#f0f0f0; }
  .suda-modal-body {
    padding:20px 24px; overflow-y:auto; flex:1;
    font-size:13.5px; color:#333; line-height:1.7;
  }
  .suda-modal-body h4 { font-size:13.5px; font-weight:700; margin:18px 0 6px; color:#1a1a1a; }
  .suda-modal-body p  { margin:0 0 10px; }
  .suda-modal-footer {
    padding:14px 24px; border-top:1px solid #eee; flex-shrink:0;
    display:flex; justify-content:flex-end;
  }
  .suda-modal-accept-btn {
    background:#D4860B; color:#fff; border:none;
    border-radius:8px; padding:10px 28px;
    font-size:14px; font-weight:700; cursor:pointer;
    transition:background 0.15s;
  }
  .suda-modal-accept-btn:hover { background:#b8720a; }
`;

const SudaLoginPage = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const { data: cities } = Digit.Hooks.useTenants();
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const stateCode = Digit.ULBService.getStateId();
  const bannerUrl = "https://tfstatee8aog.blob.core.windows.net/filestore/SudaLogin.svg";

  const [userType,     setUserType]     = useState("citizen");
  const [mobile,       setMobile]       = useState("");
  const [otp,          setOtp]          = useState("");
  const [password,     setPassword]     = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaText,  setCaptchaText]  = useState("");
  const [otpSent,      setOtpSent]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp,      setShowOtp]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [otpLoading,   setOtpLoading]   = useState(false);
  const [toast,        setToast]        = useState(null);
  const [resendTimer,  setResendTimer]  = useState(0);
  const [phase,        setPhase]        = useState("mobile"); // "mobile" | "register" | "otp"
  const [isNewUser,    setIsNewUser]    = useState(false);
  const [regName,      setRegName]      = useState("");
  const [regDob,       setRegDob]       = useState("");
  const [privacyAccepted,  setPrivacyAccepted]  = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const canvasRef = useRef(null);
  const timerRef  = useRef(null);
  const isCitizen = userType === "citizen";

  /* preload banner so it's cached when the component paints */
  useEffect(() => { const img = new window.Image(); img.src = bannerUrl; }, []);

  /* inject page styles */
  useEffect(() => {
    const existing = document.getElementById("suda-page-styles");
    if (existing) return;
    const el = document.createElement("style");
    el.id = "suda-page-styles";
    el.textContent = PAGE_STYLES;
    document.head.appendChild(el);
    return () => { const t = document.getElementById("suda-page-styles"); if (t) t.remove(); };
  }, []);

  const freshCaptcha = () => {
    const text = makeCaptchaText();
    setCaptchaText(text);
    setCaptchaInput("");
    setTimeout(() => renderCaptcha(text, canvasRef), 0);
  };
  useEffect(() => { freshCaptcha(); }, [userType]);
  useEffect(() => { if (captchaText && canvasRef.current) renderCaptcha(captchaText, canvasRef); }, [captchaText]);
  useEffect(() => {
    if (resendTimer > 0) { timerRef.current = setTimeout(() => setResendTimer(v => v - 1), 1000); }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);

  const showErr = (msg) => { setToast({ error: true, label: msg }); setTimeout(() => setToast(null), 4000); };

  const handleVerify = async () => {
    if (mobile.length !== 10) { showErr("Please enter a valid 10-digit mobile number."); return; }
    setOtpLoading(true);
    if (isNewUser) {
      if (!regName.trim()) { showErr("Please enter your name."); setOtpLoading(false); return; }
      if (!regDob) { showErr("Please enter your date of birth."); setOtpLoading(false); return; }
      const dob = new Date(regDob);
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 18);
      if (dob > cutoff) { showErr("Minimum age should be 18 years."); setOtpLoading(false); return; }
      try {
        await Digit.UserService.sendOtp(
          { otp: { mobileNumber: mobile, tenantId: stateCode, userType: "citizen", type: "register", name: regName, dob: regDob } },
          stateCode
        );
        setPhase("otp"); setOtpSent(true); setResendTimer(30); setOtp("");
      } catch (e) { showErr(e?.response?.data?.error_description || "Failed to send OTP."); }
      setOtpLoading(false);
      return;
    }
    try {
      await Digit.UserService.sendOtp({ otp: { mobileNumber: mobile, tenantId: stateCode, userType: "citizen", type: "login" } }, stateCode);
      setPhase("otp"); setIsNewUser(false); setOtpSent(true); setResendTimer(30); setOtp("");
    } catch (e) {
      const errFields = e?.response?.data?.error?.fields || [];
      const isUnknown = errFields.some((f) => f.code === "OTP_UNKNOWN_CREDENTIAL") || e?.response?.status === 400;
      if (isUnknown) {
        setPhase("register"); setIsNewUser(true);
      } else {
        showErr(e?.response?.data?.error_description || "Failed to send OTP.");
      }
    }
    setOtpLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!privacyAccepted) { showErr(t("PLEASE_ACCEPT_PRIVACY_POLICY")); return; }
    if (!captchaInput.trim()) { showErr("Please enter the captcha."); return; }
    if (captchaInput !== captchaText) { showErr("Captcha does not match."); freshCaptcha(); return; }
    setLoading(true);
    try {
      if (isCitizen) {
        if (!otpSent) { showErr("Please send OTP first."); setLoading(false); return; }
        if (!otp || otp.length < 4) { showErr("Please enter a valid OTP."); setLoading(false); return; }
        let authResult;
        if (isNewUser) {
          authResult = await Digit.UserService.registerUser(
            { name: regName, username: mobile, otpReference: otp, tenantId: stateCode },
            stateCode
          );
        } else {
          authResult = await Digit.UserService.authenticate({
            username: mobile, password: otp, tenantId: stateCode, userType: "citizen", type: "otp",
          });
        }
        const { UserRequest: info, ...tokens } = authResult;
        Digit.SessionStorage.set("citizen.userRequestObject", { info, ...tokens });
        Digit.UserService.setUser({ info, ...tokens });
        setCitizenDetail(info, tokens.access_token, stateCode);
        history.replace(!Digit.ULBService.getCitizenCurrentTenant(true) ? "/upyog-ui/citizen/select-location" : "/upyog-ui/citizen");
      } else {
        const tenantId = cities?.[0]?.code || stateCode;
        const { UserRequest: info, ...tokens } = await Digit.UserService.authenticate({
          username: mobile, password, tenantId, userType: "EMPLOYEE",
        });
        Digit.SessionStorage.set("Employee.tenantId", info?.tenantId);
        Digit.SessionStorage.set("citizen.userRequestObject", { info, ...tokens });
        Digit.UserService.setUser({ info, ...tokens });
        setEmployeeDetail(info, tokens.access_token);
        let redirect = "/upyog-ui/employee";
        if (window?.location?.href?.includes("from=")) redirect = decodeURIComponent(window.location.href.split("from=")[1]) || redirect;
        history.replace(redirect);
      }
    } catch (err) { showErr(err?.response?.data?.error_description || "Invalid credentials."); freshCaptcha(); }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <div className="suda-page-bg" style={{ backgroundImage: `url(${bannerUrl})`, flex: 1, marginTop: "78px" }}>
      <div className="suda-page-card">
        <h2 className="suda-title">{t("WELCOME_TO")} <span className="suda-title-accent">SUDA</span></h2>
        <p className="suda-subtitle">{t("LOGIN_WITH_YOUR_CREDENTIALS_TO_ACCESS_YOUR_SUDA_ACCOUNT")}</p>

        <div className="suda-pills" role="radiogroup">
          {USER_TYPES.map(({ key, label }) => {
            const disabled = key === "admin" || key === "guest";
            return (
              <label key={key}
                className={"suda-pill" + (userType === key ? " suda-pill--active" : "")}
                style={disabled ? { opacity: 0.4, cursor: "not-allowed", pointerEvents: "none" } : {}}>
                <input type="radio" name="suda-user-type" value={key} checked={userType === key} disabled={disabled}
                  onChange={() => { setUserType(key); setPhase("mobile"); setIsNewUser(false); setOtpSent(false); setMobile(""); setOtp(""); setPassword(""); setRegName(""); setRegDob(""); }} />
                <span className={"suda-dot" + (userType === key ? " suda-dot--active" : "")} />
                {t(label)}
              </label>
            );
          })}
        </div>
e
        <form onSubmit={handleLogin} noValidate>
          <div className="suda-field">
            <label className="suda-label">{isCitizen ? t("MOBILE_NUMBER") : t("USERNAME")} <span className="suda-req">*</span></label>
            <div className="suda-input-wrap">
              <input className="suda-input" type="text" maxLength={isCitizen ? 10 : undefined}
                placeholder={isCitizen ? t("ENTER_MOBILE_NUMBER") : t("ENTER_USERNAME")}
                value={mobile} onChange={(e) => { setMobile(e.target.value); setPhase("mobile"); setIsNewUser(false); setOtpSent(false); setRegName(""); setRegDob(""); }} />
              {isCitizen && phase === "mobile" ? (
                <button type="button" className="suda-verify-btn" onClick={handleVerify} disabled={otpLoading}>
                  {otpLoading ? t("SENDING") : t("SEND_OTP")}
                </button>
              ) : isCitizen ? null : <PhoneIcon />}
            </div>
          </div>

          {isCitizen && phase === "register" && (
            <React.Fragment>
              <div className="suda-field">
                <label className="suda-label">{t("NAME")} <span className="suda-req">*</span></label>
                <div className="suda-input-wrap">
                  <input className="suda-input" type="text" placeholder={t("ENTER_YOUR_FULL_NAME")}
                    value={regName} onChange={(e) => setRegName(e.target.value)} />
                </div>
              </div>
              <div className="suda-field">
                <label className="suda-label">{t("DATE_OF_BIRTH")} <span className="suda-req">*</span></label>
                <div className="suda-input-wrap">
                  <input className="suda-input" type="date"
                    max={new Date(Date.now() - 568036800000).toISOString().split("T")[0]}
                    value={regDob} onChange={(e) => setRegDob(e.target.value)} />
                </div>
              </div>
              <button type="button" className="suda-submit" style={{ marginBottom: "8px" }}
                onClick={handleVerify} disabled={otpLoading}>
                {otpLoading ? t("SENDING") : t("SEND_OTP")}
              </button>
            </React.Fragment>
          )}

          {isCitizen && (
            <div className="suda-field">
              <label className="suda-label">{t("ENTER_OTP")} <span className="suda-req">*</span></label>
              <div className="suda-input-wrap">
                <input className="suda-input" type={showOtp ? "text" : "password"} maxLength={8}
                  placeholder={t("ENTER_OTP")} value={otp} onChange={(e) => setOtp(e.target.value)}
                  disabled={!otpSent} />
                <EyeIcon show={showOtp} onClick={() => setShowOtp(v => !v)} />
              </div>
              {phase === "otp" && (
                <div className="suda-row-end">
                  {resendTimer > 0
                    ? <span className="suda-timer">{t("RESEND_OTP_IN", { count: resendTimer })}</span>
                    : <button type="button" className="suda-text-btn" onClick={() => { setOtp(""); setOtpSent(false); setPhase(isNewUser ? "register" : "mobile"); }}>{t("RESEND_OTP")}</button>}
                </div>
              )}
            </div>
          )}

          {!isCitizen && (
            <div className="suda-field">
              <label className="suda-label">{t("PASSWORD")} <span className="suda-req">*</span></label>
              <div className="suda-input-wrap">
                <input className="suda-input" type={showPassword ? "text" : "password"}
                  placeholder={t("ENTER_PASSWORD")} value={password} onChange={(e) => setPassword(e.target.value)} />
                <EyeIcon show={showPassword} onClick={() => setShowPassword(v => !v)} />
              </div>
              <div className="suda-row-end">
                <button type="button" className="suda-text-btn" disabled style={{ opacity: 0.4, cursor: "not-allowed", textDecoration: "none" }}>
                  {t("FORGOT_PASSWORD")}
                </button>
              </div>
            </div>
          )}

          <div className="suda-field">
            <label className="suda-label">{t("CAPTCHA")} <span className="suda-req">*</span></label>
            <div className="suda-captcha-row">
              <div className="suda-input-wrap">
                <input className="suda-input" type="text" placeholder={t("ENTER_CAPTCHA")}
                  value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} />
              </div>
              <button type="button" className="suda-captcha-canvas-btn" title={t("CLICK_TO_REFRESH")} onClick={freshCaptcha}>
                <canvas ref={canvasRef} />
              </button>
            </div>
          </div>

          <div className="suda-privacy-row">
            <input
              type="checkbox"
              id="suda-privacy-cb"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
            />
            <label htmlFor="suda-privacy-cb">
              {t("I_AGREE_TO_THE_SUDAS")}{" "}
              <button type="button" className="suda-privacy-link" onClick={() => setShowPrivacyModal(true)}>
                {t("PRIVACY_POLICY")}
              </button>
            </label>
          </div>

          <button type="submit" className="suda-submit" disabled={loading}>
            {loading ? t("PLEASE_WAIT") : t("LOGIN")}
          </button>
        </form>

        {showPrivacyModal && (
          <div className="suda-modal-overlay" onClick={() => setShowPrivacyModal(false)}>
            <div className="suda-modal" onClick={(e) => e.stopPropagation()}>
              <div className="suda-modal-header">
                <h3>SUDA – {t("PRIVACY_POLICY")}</h3>
                <button className="suda-modal-close" onClick={() => setShowPrivacyModal(false)} aria-label="Close">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="suda-modal-body">
                <p>We respect the privacy of our users. Hence, we maintain the highest standards for secure activities, user information/data privacy and security.</p>
                <p>This Privacy Policy describes and determines how we deal with your personal and usage information in accordance with the applicable laws of India.</p>
                <h4>ADHERENCE TO DATA PRIVACY PRINCIPLES</h4>
                <p>We adhere to the principles of accountability, transparency, purposeful and proportional collection, usage, storage and disclosure of personally identifiable information (“PII”).</p>
                <h4>WHAT DATA DO WE COLLECT?</h4>
                <p>We collect information/data (“data”) to improve and provide better services to you. We collect and process PII such as your first name, last name, parent’s / guardian’s name, address, email address, telephone number, age, gender, identification documents. We may collect your educational, demographic, location, device and other similar information. Data from administrative record systems, such as revenue survey number or other property identifier, connection number, meter number etc. may also be recorded.</p>
                <p>We collect information such as Internet Protocol (IP) addresses, domain name, browser type, Operating System, Date and Time of the visit, pages visited, IMEI/IMSI number, device ID, location information, language settings, handset make &amp; model etc. However, no attempt is made to link these with the true identity of individuals visiting UPYOG app, website, or Whatsapp Chatbot.</p>
                <h4>HOW DO WE COLLECT THIS DATA?</h4>
                <p>We collect data directly from you (when you use our services) and when you register and login into the app/website. We may also collect data from Union, State, and Local governments, including their agents/employees, as well as receive data that is available openly for public use.</p>
                <h4>HOW DO WE STORE THIS DATA?</h4>
                <p>Your data is stored in a secure manner. UPYOG platform has embedded privacy settings (such as encryption), which does not allow your data to be visible to anyone, except persons who are authorized to do so.</p>
                <h4>HOW DO WE USE THIS DATA?</h4>
                <p>The data collected by us will be used for the purpose of providing services to you and will not be shared with any third party, except where required by law.</p>
                <h4>YOUR RIGHTS</h4>
                <p>You have the right to access, rectify, and request deletion of your personal data at any time by contacting the relevant Urban Local Body or State authority.</p>
              </div>
              <div className="suda-modal-footer">
                <button className="suda-modal-accept-btn" onClick={() => { setPrivacyAccepted(true); setShowPrivacyModal(false); }}>
                  {t("I_AGREE")}
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && <Toast error={toast.error} label={toast.label} onClose={() => setToast(null)} />}
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default SudaLoginPage;
