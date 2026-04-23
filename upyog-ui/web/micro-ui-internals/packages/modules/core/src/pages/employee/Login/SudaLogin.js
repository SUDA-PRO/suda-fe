import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useHistory } from "react-router-dom";
import { Toast } from "@upyog/digit-ui-react-components";

/* ── styles injected into <head> so portal content can use them ─ */
const STYLES = `
  .suda-overlay {
    position: fixed !important;
    top: 0 !important; left: 0 !important;
    width: 100vw !important; height: 100vh !important;
    z-index: 99999 !important;
    display: flex !important;
    align-items: center;
    justify-content: center;
    animation: sudaFadeIn 0.18s ease;
  }
  @keyframes sudaFadeIn { from { opacity:0; } to { opacity:1; } }

  .suda-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 48px rgba(0,0,0,0.28);
    padding: 36px 40px 28px;
    width: 100%;
    max-width: 460px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    animation: sudaSlideUp 0.2s ease;
  }
  @keyframes sudaSlideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }

  .suda-close {
    position: absolute; top:14px; right:16px;
    background:none; border:none; cursor:pointer; color:#888;
    padding:4px; display:flex; align-items:center; border-radius:4px;
    transition: color 0.15s, background 0.15s;
  }
  .suda-close:hover { color:#333; background:#f0f0f0; }

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
  .suda-verify-btn:disabled { background:#4caf50; cursor:default; }

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

  .suda-footer { text-align:center; margin-top:16px; font-size:13px; color:#555; }
  .suda-register-link { color:#D4860B; cursor:pointer; font-weight:600; text-decoration:underline; }
`;

/* ── inject/remove styles from <head> ───────────────────────── */
const useGlobalStyles = (css) => {
  useEffect(() => {
    const existing = document.getElementById("suda-global-styles");
    if (existing) return; /* already injected */
    const el = document.createElement("style");
    el.id = "suda-global-styles";
    el.textContent = css;
    document.head.appendChild(el);
    return () => {
      const tag = document.getElementById("suda-global-styles");
      if (tag) tag.remove();
    };
  }, []);
};

/* ── session helpers ─────────────────────────────────────────── */
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

/* ── captcha ─────────────────────────────────────────────────── */
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

/* ── icons ───────────────────────────────────────────────────── */
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
  { key: "citizen", label: "Citizen" },
  { key: "officer", label: "Officer" },
  { key: "admin",   label: "Admin"   },
  { key: "guest",   label: "Guest"   },
];

/* ══════════════════════════════════════════════════════════════
   SudaLoginCard — the modal card (rendered via portal)
   ══════════════════════════════════════════════════════════════ */
const SudaLoginCard = ({ onClose, position }) => {
  const history   = useHistory();
  const { data: cities } = Digit.Hooks.useTenants();
  const stateCode = Digit.ULBService.getStateId();

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
  const canvasRef = useRef(null);
  const timerRef  = useRef(null);
  const isCitizen = userType === "citizen";

  const freshCaptcha = () => {
    const text = makeCaptchaText();
    setCaptchaText(text);
    setCaptchaInput("");
    setTimeout(() => renderCaptcha(text, canvasRef), 0);
  };
  useEffect(() => { freshCaptcha(); }, [userType]);
  useEffect(() => { if (captchaText && canvasRef.current) renderCaptcha(captchaText, canvasRef); }, [captchaText]);
  useEffect(() => {
    if (resendTimer > 0) { timerRef.current = setTimeout(() => setResendTimer(v => v-1), 1000); }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const showErr = (msg) => { setToast({ error: true, label: msg }); setTimeout(() => setToast(null), 4000); };

  const handleVerify = async () => {
    if (mobile.length !== 10) { showErr("Please enter a valid 10-digit mobile number."); return; }
    setOtpLoading(true);
    try {
      await Digit.UserService.sendOtp({ mobileNumber: mobile, tenantId: stateCode, userType: "citizen", type: "login" });
      setOtpSent(true); setResendTimer(30);
    } catch (e) { showErr(e?.response?.data?.error_description || "Failed to send OTP."); }
    setOtpLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!captchaInput.trim()) { showErr("Please enter the captcha."); return; }
    if (captchaInput !== captchaText) { showErr("Captcha does not match."); freshCaptcha(); return; }
    setLoading(true);
    try {
      if (isCitizen) {
        if (!otpSent) { showErr("Please verify your mobile number first."); setLoading(false); return; }
        if (!otp || otp.length < 4) { showErr("Please enter a valid OTP."); setLoading(false); return; }
        const { UserRequest: info, ...tokens } = await Digit.UserService.authenticate({
          username: mobile, password: otp, tenantId: stateCode, userType: "citizen", type: "otp",
        });
        Digit.SessionStorage.set("citizen.userRequestObject", { info, ...tokens });
        Digit.UserService.setUser({ info, ...tokens });
        setCitizenDetail(info, tokens.access_token, stateCode);
        onClose();
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
        onClose();
        let redirect = "/upyog-ui/employee";
        if (window?.location?.href?.includes("from=")) redirect = decodeURIComponent(window.location.href.split("from=")[1]) || redirect;
        history.replace(redirect);
      }
    } catch (err) { showErr(err?.response?.data?.error_description || "Invalid credentials."); freshCaptcha(); }
    setLoading(false);
  };

  return (
    <div className="suda-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="suda-card" role="dialog" aria-modal="true" style={{ top: position.top, left: position.left }}>
        <button type="button" className="suda-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <h2 className="suda-title">Welcome to&nbsp;<span className="suda-title-accent">SUDA</span></h2>
        <p className="suda-subtitle">Login with your credentials to access your SUDA account</p>
        <div className="suda-pills" role="radiogroup">
          {USER_TYPES.map(({ key, label }) => (
            <label key={key} className={"suda-pill" + (userType === key ? " suda-pill--active" : "")}>
              <input type="radio" name="suda-user-type" value={key} checked={userType === key}
                onChange={() => { setUserType(key); setOtpSent(false); setMobile(""); setOtp(""); setPassword(""); }} />
              <span className={"suda-dot" + (userType === key ? " suda-dot--active" : "")} />
              {label}
            </label>
          ))}
        </div>
        <form onSubmit={handleLogin} noValidate>
          <div className="suda-field">
            <label className="suda-label">Mobile Number <span className="suda-req">*</span></label>
            <div className="suda-input-wrap">
              <input className="suda-input" type="tel" maxLength={10} placeholder="Enter Mobile Number"
                value={mobile} onChange={(e) => { if (/^\d{0,10}$/.test(e.target.value)) setMobile(e.target.value); }} />
              {isCitizen ? (
                <button type="button" className="suda-verify-btn" onClick={handleVerify} disabled={otpSent || otpLoading}>
                  {otpLoading ? "Sending..." : otpSent ? "Sent" : "Verify"}
                </button>
              ) : <PhoneIcon />}
            </div>
          </div>
          {isCitizen && (
            <div className="suda-field">
              <label className="suda-label">Enter OTP <span className="suda-req">*</span></label>
              <div className="suda-input-wrap">
                <input className="suda-input" type={showOtp ? "text" : "password"} maxLength={8}
                  placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <EyeIcon show={showOtp} onClick={() => setShowOtp(v => !v)} />
              </div>
              <div className="suda-row-end">
                {resendTimer > 0
                  ? <span className="suda-timer">Resend OTP in {resendTimer}s</span>
                  : <button type="button" className="suda-text-btn" onClick={() => { setOtpSent(false); handleVerify(); }}>Resend OTP</button>}
              </div>
            </div>
          )}
          {!isCitizen && (
            <div className="suda-field">
              <label className="suda-label">Password <span className="suda-req">*</span></label>
              <div className="suda-input-wrap">
                <input className="suda-input" type={showPassword ? "text" : "password"}
                  placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <EyeIcon show={showPassword} onClick={() => setShowPassword(v => !v)} />
              </div>
              <div className="suda-row-end">
                <button type="button" className="suda-text-btn"
                  onClick={() => { onClose(); history.push("/upyog-ui/employee/user/forgot-password"); }}>
                  Forgot Password?
                </button>
              </div>
            </div>
          )}
          <div className="suda-field">
            <label className="suda-label">Captcha <span className="suda-req">*</span></label>
            <div className="suda-captcha-row">
              <div className="suda-input-wrap">
                <input className="suda-input" type="text" placeholder="Enter Captcha"
                  value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} />
              </div>
              <button type="button" className="suda-captcha-canvas-btn" title="Click to refresh" onClick={freshCaptcha}>
                <canvas ref={canvasRef} />
              </button>
            </div>
          </div>
          <button type="submit" className="suda-submit" disabled={loading}>
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>
        <p className="suda-footer">
          Don't have an account?&nbsp;
          <span className="suda-register-link" onClick={() => { onClose(); history.push("/upyog-ui/citizen/register"); }}>
            Register Now
          </span>
        </p>
        {toast && <Toast error={toast.error} label={toast.label} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   SudaLogin — self-contained trigger + portal modal
   ══════════════════════════════════════════════════════════════ */
const SudaLogin = () => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  useGlobalStyles(STYLES);

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const CARD_WIDTH = 460;
      const GAP = 8;
      /* default: open below, left-aligned to button */
      let top = rect.bottom + GAP;
      let left = rect.left;
      /* flip left if card would overflow right edge */
      if (left + CARD_WIDTH > window.innerWidth - 12) {
        left = rect.right - CARD_WIDTH;
      }
      /* clamp left so card never goes off left edge */
      if (left < 8) left = 8;
      /* flip above button if card would overflow bottom */
      const CARD_HEIGHT_ESTIMATE = 580;
      if (top + CARD_HEIGHT_ESTIMATE > window.innerHeight - 12) {
        top = rect.top - CARD_HEIGHT_ESTIMATE - GAP;
      }
      /* clamp top so card never goes off top edge */
      if (top < 8) top = rect.bottom + GAP;
      setPosition({ top, left });
    }
    setOpen(true);
  };

  return (
    <React.Fragment>
      {/* Inline style guarantees this button is always on top and clickable */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#D4860B",
          color: "#fff",
          border: "none",
          padding: "12px 36px",
          fontSize: "15px",
          fontWeight: "700",
          cursor: "pointer",
          borderRadius: "8px",
          boxShadow: "0 4px 16px rgba(212,134,11,0.35)",
          whiteSpace: "nowrap",
          alignSelf: "center",
          position: "relative",
          zIndex: 10000,
        }}
      >
        Login
      </button>

      {open && ReactDOM.createPortal(
        <SudaLoginCard onClose={() => setOpen(false)} position={position} />,
        document.body
      )}
    </React.Fragment>
  );
};

export default SudaLogin;

