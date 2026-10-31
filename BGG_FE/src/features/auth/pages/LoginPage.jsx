import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Eye,
  EyeOff,
  Factory,
  Layers3,
  LoaderCircle,
  LockKeyhole,
  Network,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { login } from "../api/authApi";
import { saveUser } from "../../../shared/auth/session";
import "./LoginPage.css";

const COPYRIGHT_YEAR = new Date().getFullYear();

function BrandMark({ compact = false }) {
  return (
    <div className={`hi-garment-brand-mark ${compact ? "is-compact" : ""}`}>
      <span className="hi-garment-brand-glyph" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="hi-garment-brand-copy">
        <strong>HI-GARMENT</strong>
        {!compact && <small>SMART MATERIAL FLOW</small>}
      </span>
    </div>
  );
}

function LoginSplashScreen() {
  return (
    <div className="login-splash" aria-label="Hi-GARMENT đang sẵn sàng">
      <div className="login-splash-orb login-splash-orb-one" />
      <div className="login-splash-orb login-splash-orb-two" />
      <div className="login-splash-grid" aria-hidden="true" />
      <div className="login-splash-network" aria-hidden="true">
        <i className="splash-line splash-line-one" />
        <i className="splash-line splash-line-two" />
        <i className="splash-line splash-line-three" />
        <i className="splash-node splash-node-one" />
        <i className="splash-node splash-node-two" />
        <i className="splash-node splash-node-three" />
        <i className="splash-node splash-node-four" />
      </div>
      <div className="login-splash-content">
        <div className="login-splash-icon" aria-hidden="true">
          <Layers3 size={34} strokeWidth={1.7} />
        </div>
        <BrandMark />
        <p>PHẦN MỀM QUẢN LÝ DÒNG CHẢY NPL</p>
        <div className="login-splash-progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}

function BrandingPanel() {
  return (
    <section className="login-branding-panel" aria-label="Hi-GARMENT">
      <div className="login-branding-grid" aria-hidden="true" />
      <div
        className="login-branding-glow login-branding-glow-one"
        aria-hidden="true"
      />
      <div
        className="login-branding-glow login-branding-glow-two"
        aria-hidden="true"
      />
      <div className="login-branding-content">
        <BrandMark />
        <div className="login-branding-message">
          <span className="login-eyebrow">
            <Sparkles size={15} /> Nền tảng vận hành số
          </span>
          <h1>Quản lý dòng chảy nguyên phụ liệu thông minh</h1>
          <p>Kết nối dữ liệu – Tối ưu quy trình – Nâng cao hiệu suất.</p>
        </div>
        <div className="login-flow-visual" aria-hidden="true">
          <div className="login-flow-line login-flow-line-one" />
          <div className="login-flow-line login-flow-line-two" />
          <div className="login-flow-line login-flow-line-three" />
          <div className="login-flow-node login-flow-node-factory">
            <Factory size={24} />
          </div>
          <div className="login-flow-node login-flow-node-layers">
            <Layers3 size={26} />
          </div>
          <div className="login-flow-node login-flow-node-boxes">
            <Boxes size={23} />
          </div>
          <div className="login-flow-node login-flow-node-network">
            <Network size={21} />
          </div>
          <div className="login-data-pulse login-data-pulse-one" />
          <div className="login-data-pulse login-data-pulse-two" />
          <div className="login-data-pulse login-data-pulse-three" />
          <div className="login-flow-card login-flow-card-inventory">
            <span>Kho NPL</span>
            <strong>Đồng bộ</strong>
            <i />
          </div>
          <div className="login-flow-card login-flow-card-production">
            <span>Sản xuất</span>
            <strong>Trực tuyến</strong>
            <i />
          </div>
        </div>
        <div className="login-branding-footnote">
          <ShieldCheck size={17} /> Vận hành an toàn, dữ liệu nhất quán
        </div>
      </div>
    </section>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const splashTimer = window.setTimeout(() => setShowSplash(false), 2400);
    return () => window.clearTimeout(splashTimer);
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (isLoading) return;
    if (!username.trim()) {
      toast.warning("Vui lòng nhập tên đăng nhập");
      return;
    }
    if (!password) {
      toast.warning("Vui lòng nhập mật khẩu");
      return;
    }
    try {
      setIsLoading(true);
      const result = await login(username.trim(), password);
      if (result.success) {
        saveUser(result, rememberMe);
        toast.success("Đăng nhập thành công");
        const returnTo = location.state?.returnTo;
        navigate(
          typeof returnTo === "string" &&
            returnTo.startsWith("/") &&
            !returnTo.startsWith("//")
            ? returnTo
            : "/",
          { replace: true },
        );
      } else {
        toast.error(result.message || "Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Có lỗi khi kết nối đến máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={`hi-garment-login ${showSplash ? "is-splashing" : ""}`}>
      {showSplash && <LoginSplashScreen />}
      <div className="login-shell">
        <BrandingPanel />
        <section className="login-form-panel" aria-labelledby="login-heading">
          <div className="login-form-wrap">
            <div className="login-mobile-brand flex">
              <BrandMark compact />
              <div className="login-heading-icon">
                <ShieldCheck size={22} />
              </div>
            </div>
            <header className="login-form-heading">
              <h2 id="login-heading">Chào mừng trở lại</h2>
              <p>Đăng nhập để tiếp tục sử dụng Hi-GARMENT</p>
            </header>
            <form
              onSubmit={handleLogin}
              autoComplete="on"
              className="login-form"
            >
              <div className="login-field">
                <label htmlFor="username">Tên đăng nhập</label>
                <div className="login-input-wrap">
                  <UserRound size={20} aria-hidden="true" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    disabled={isLoading}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập"
                  />
                </div>
              </div>
              <div className="login-field">
                <label htmlFor="password">Mật khẩu</label>
                <div className="login-input-wrap">
                  <LockKeyhole size={20} aria-hidden="true" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    aria-pressed={showPassword}
                    className="login-password-toggle"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="login-options">
                <label className="login-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span aria-hidden="true" />
                  <em>Nhớ mật khẩu</em>
                </label>
                <Link to="/forgot-password">Đổi mật khẩu</Link>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="login-submit"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle size={21} className="login-spinner" /> Đang
                    đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập <ArrowRight size={21} />
                  </>
                )}
              </button>
            </form>
            <p className="login-security-note">
              <CheckCircle2 size={16} /> Dành cho nhân viên được cấp tài khoản
            </p>
          </div>
          <footer className="login-footer">
            <span>© {COPYRIGHT_YEAR} HI-GARMENT</span>
            <span>Phần mềm quản lý dòng chảy NPL</span>
          </footer>
        </section>
      </div>
    </main>
  );
}
