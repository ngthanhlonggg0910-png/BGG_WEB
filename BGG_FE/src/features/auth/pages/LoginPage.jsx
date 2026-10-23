import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { login } from "../api/authApi";
import { saveUser } from "../../../shared/auth/session";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        navigate(typeof returnTo === "string" && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/", { replace: true });
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
    <main className="flex min-h-dvh flex-col bg-[#F8FAFD]">
      {/* MAIN CONTENT */}
      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-[460px]">
          {/* LOGO & BRAND */}
          <header className="mb-9 flex flex-col items-center text-center">
            <div className="flex w-full max-w-[380px] items-center justify-center">
              <img
                src="/ic_launcher_512.png"
                alt="Công ty CP TCT May Bắc Giang BGG"
                className="max-h-[145px] w-full object-contain"
              />
            </div>

            <h1 className="mt-6 text-[28px] font-extrabold leading-tight tracking-[-0.8px] text-[#172B4D] sm:text-[32px]">
              Welcome to
              <span className="text-[#477FE5]"> BGG-Garment</span>
            </h1>

            <p className="mt-3 text-[15px] font-medium text-[#74839B]">
              Hệ thống quản lý sản xuất may mặc
            </p>
          </header>

          {/* LOGIN CARD */}
          <section className="rounded-[24px] border border-[#E7ECF4] bg-white px-5 py-8 shadow-[0_12px_45px_rgba(32,62,112,0.055)] sm:px-9 sm:py-9">
            <div className="mb-7">
              <h2 className="text-[23px] font-extrabold text-[#1E304D]">
                Đăng nhập
              </h2>
              <p className="mt-1.5 text-[14px] text-[#7A879A]">
                Vui lòng nhập thông tin tài khoản
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              autoComplete="on"
              className="space-y-5"
            >
              {/* USERNAME */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-[15px] font-semibold text-[#34445E]"
                >
                  Tên đăng nhập
                </label>

                <div className="relative">
                  <UserRound
                    size={21}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8290A7]"
                  />

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
                    className="h-[56px] w-full rounded-xl border border-[#DCE4EF] bg-[#FAFBFE] pl-12 pr-4 text-[16px] font-medium text-[#243650] outline-none transition-all placeholder:font-normal placeholder:text-[#9AA7B9] hover:border-[#91B4EF] focus:border-[#548BF0] focus:bg-white focus:ring-[3px] focus:ring-[#548BF0]/10 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-[15px] font-semibold text-[#34445E]"
                >
                  Mật khẩu
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={21}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8290A7]"
                  />

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
                    className="h-[56px] w-full rounded-xl border border-[#DCE4EF] bg-[#FAFBFE] pl-12 pr-14 text-[16px] font-medium text-[#243650] outline-none transition-all placeholder:font-normal placeholder:text-[#9AA7B9] hover:border-[#91B4EF] focus:border-[#548BF0] focus:bg-white focus:ring-[3px] focus:ring-[#548BF0]/10 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-[#8290A7] transition-colors hover:bg-[#EAF2FF] hover:text-[#477FE5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#548BF0]"
                  >
                    {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
                  </button>
                </div>
              </div>

              {/* REMEMBER & FORGOT */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="peer sr-only"
                  />

                  <span className="relative h-[25px] w-[45px] shrink-0 rounded-full bg-[#DCE3EE] transition-colors after:absolute after:left-[3px] after:top-[3px] after:h-[19px] after:w-[19px] after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-[#548BF0] peer-checked:after:translate-x-5 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#548BF0]" />

                  <span className="text-[14px] font-medium text-[#52627A]">
                    Nhớ mật khẩu
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-[14px] font-semibold text-[#477FE5] transition-colors hover:text-[#2866D6] hover:underline"
                >
                  Đổi mật khẩu
                </Link>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={isLoading}
                className="group mt-3 flex h-[58px] w-full items-center justify-center gap-3 rounded-xl bg-[#5B91F5] px-5 text-[17px] font-extrabold uppercase tracking-[0.5px] text-white shadow-[0_7px_18px_rgba(91,145,245,0.22)] transition-all duration-200 hover:bg-[#477FE5] hover:shadow-[0_9px_22px_rgba(91,145,245,0.30)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5B91F5]/25 disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle size={22} className="animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight
                      size={22}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>
          </section>

          {/* SECURITY TEXT */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[13px] font-medium text-[#8290A7]">
            <ShieldCheck size={17} className="text-[#548BF0]" />
            Dành cho nhân viên được cấp tài khoản
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E9EDF4] bg-white px-5 py-4 text-[12px] font-medium text-[#8290A7] sm:px-8">
        <span>Copyright © {new Date().getFullYear()} - BGG-Garment</span>
        <span>Hệ thống quản lý sản xuất</span>
      </footer>
    </main>
  );
}
