import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { login } from "../../api/authApi";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Checkbox from "../../components/ui/Checkbox";
import Icon from "../../components/ui/Icon";
import TextField from "../../components/ui/TextField";

function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    console.log(username, password);

    if (!username.trim()) {
      toast.warning("Vui lòng nhập tên đăng nhập");
      return;
    }

    if (!password) {
      toast.warning("Vui lòng nhập mật khẩu");
      return;
    }

    try {
      const result = await login(username, password);

      if (result.success) {
        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(result));
        } else {
          sessionStorage.setItem("user", JSON.stringify(result));
        }
        toast.success("Đăng nhập thành công");
        navigate("/", { replace: true });
      } else {
        toast.error("Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi khi kết nối server");
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#F6F7FA] px-4 py-8 sm:px-6 sm:py-12">
      <span
        aria-hidden="true"
        className="absolute -left-24 top-[-6rem] size-64 rounded-full bg-[#E9E8FB] sm:-left-10 sm:size-80"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-20 -right-24 size-72 rounded-full bg-[#eeedfc] sm:-right-10 sm:size-96"
      />

      <section
        aria-label="Đăng nhập hệ thống eGMF"
        className="relative w-full max-w-[438px]"
      >
        <div className="mb-5 flex items-center justify-center gap-2.5 sm:mb-7">
          <span className="grid size-10 place-items-center rounded-2xl bg-[#6865D9] p-1.5 shadow-[0_8px_16px_rgba(104,101,217,0.22)]">
            <img
              alt="eGMF"
              className="size-full object-contain"
              src="/ic_launcher_512.png"
            />
          </span>
          <span className="text-lg font-bold tracking-[-0.04em] text-[#252530]">
            eGMF
          </span>
        </div>

        <Card className="overflow-hidden border-white bg-white/95 shadow-[0_18px_48px_rgba(47,45,105,0.10)]">
          <div className="h-1.5 bg-[#6865D9]" />
          <div className="px-5 py-7 sm:px-9 sm:py-9">
            <header className="mb-7">
              <p className="text-[11px] font-bold tracking-[0.12em] text-[#6865D9]">
                EGMF PRODUCTION SYSTEM
              </p>
              <h1 className="mt-2 text-[26px] font-bold leading-tight tracking-[-0.035em] text-[#252530]">
                Chào mừng trở lại
              </h1>
              <p className="mt-2 text-[15px] leading-6 text-[#74747f]">
                Đăng nhập để tiếp tục công việc của bạn.
              </p>
            </header>

            <form
              autoComplete="on"
              className="space-y-5"
              onSubmit={handleLogin}
            >
              <TextField
                autoComplete="username"
                icon={<Icon name="user" size={18} />}
                label="Tên đăng nhập"
                name="username"
                placeholder="Nhập tên đăng nhập"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                autoComplete="current-password"
                icon={<Icon name="lock" size={18} />}
                label="Mật khẩu"
                name="password"
                placeholder="Nhập mật khẩu"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <Checkbox
                  className="pb-0.5"
                  name="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                >
                  Ghi nhớ đăng nhập
                </Checkbox>

                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-[#6865D9] transition hover:text-[#5653C5] hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Button
                className="h-[52px] w-full"
                isLoading={isLoading}
                type="submit"
              >
                <Icon name="login" size={18} />
                Đăng nhập
              </Button>
            </form>
          </div>
        </Card>
        <p className="mt-5 text-center text-xs font-medium text-[#858492]">
          eGMF · Hệ thống quản lý sản xuất
        </p>
      </section>
    </main>
  );
}

export default Login;
