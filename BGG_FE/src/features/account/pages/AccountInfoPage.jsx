import PushSettings from "../../push/components/PushSettings";
import { Download, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearSession, getCurrentProfile } from "../../../shared/auth/session";
import Card from "../../../shared/components/ui/Card";
import Icon from "../../../shared/components/ui/Icon";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { usePwa } from "../../pwa/hooks/usePwa";

const labels = {
  UEId: "UEId",
  PbId: "Phòng ban ID",
  TKId: "Tài khoản ID",
  MaNhanVien: "Mã nhân viên",
  HoVaTenLot: "Họ và tên lót",
  Ten: "Tên",
  TenDangNhap: "Tên đăng nhập",
  FullName: "Họ và tên",
  Email: "Email",
  SoDienThoai: "Số điện thoại",
  NgayHetHan: "Ngày hết hạn",
};

const hiddenFields = /password|matkhau|token|access|refresh|secret/i;

function AccountInfo() {
  const navigate = useNavigate();
  const pwa = usePwa();
  const profile = getCurrentProfile();
  const accountName =
    `${profile?.HoVaTenLot ?? ""} ${profile?.Ten ?? ""}`.trim();

  const username = profile?.TenDangNhap ?? "";
  const initial = accountName.charAt(0).toUpperCase() || "U";

  const details = Object.entries(profile || {}).filter(
    ([key, value]) =>
      !hiddenFields.test(key) &&
      value !== null &&
      value !== undefined &&
      typeof value !== "object",
  );

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <MainLayout screenTitle="THÔNG TIN TÀI KHOẢN">
      <div className="mx-auto max-w-[1100px] px-4 py-3 sm:px-6 sm:py-4 md:px-8">
        {profile ? (
          <>
            <div className="grid gap-3 lg:grid-cols-[minmax(270px,0.8fr)_minmax(0,1.2fr)] lg:gap-4">
              <Card className="overflow-hidden shadow-sm">
                <div className="h-16 bg-gradient-to-r from-egmf-primary to-blue-500" />
                <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                  <div className="-mt-8 grid size-16 place-items-center rounded-2xl border-4 border-white bg-egmf-primary-soft text-xl font-extrabold text-egmf-primary-strong shadow-[0_8px_18px_rgba(47,45,105,0.12)]">
                    {initial}
                  </div>
                  <h2 className="mt-3 text-lg font-extrabold tracking-[-0.025em] text-egmf-ink">
                    {accountName || "Tài khoản BGG Kho"}
                  </h2>
                  <p className="mt-0.5 text-sm text-egmf-muted">
                    Tài khoản hệ thống
                  </p>
                  {username && (
                    <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-egmf-border-muted bg-egmf-surface-subtle px-3 py-2.5">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
                        <Icon name="user" size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-egmf-muted-soft">
                          Tài khoản
                        </p>
                        <p className="break-all text-sm font-semibold text-egmf-ink-secondary">
                          {username}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* NÚT CÀI ĐẶT ỨNG DỤNG PWA & ĐĂNG XUẤT (GIỐNG WEB_KYDUYET) */}
                  <div className="mt-4 space-y-2 border-t border-egmf-border-subtle pt-3.5">
                    <button
                      type="button"
                      onClick={pwa.installApp}
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#dde4ef] bg-white px-4 py-2 text-sm font-bold text-[#46536a] transition hover:border-egmf-primary hover:bg-[#f8faff] hover:text-egmf-primary"
                    >
                      <Download size={17} />
                      <span>Cài đặt ứng dụng (PWA)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#fff3f3] px-4 py-2 text-sm font-bold text-[#c54949] transition hover:bg-red-100"
                    >
                      <LogOut size={17} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </Card>

              <Card className="shadow-sm">
                <div className="flex items-center gap-2.5 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-4 py-3 sm:px-5">
                  <span className="grid size-8 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
                    <Icon name="settings" size={16} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.1em] text-egmf-muted-soft">
                      THÔNG TIN
                    </p>
                    <h2 className="mt-0.5 text-sm font-extrabold text-egmf-ink">
                      Chi tiết tài khoản
                    </h2>
                  </div>
                </div>
                <dl className="grid grid-cols-1 gap-2.5 p-3.5 sm:grid-cols-2 sm:p-4">
                  {details.length ? (
                    details.map(([key, value]) => (
                      <div
                        className="min-w-0 rounded-lg border border-egmf-border-subtle bg-egmf-surface-subtle px-3 py-2.5"
                        key={key}
                      >
                        <dt className="text-[11px] font-bold uppercase tracking-[0.05em] text-egmf-muted">
                          {labels[key] || key}
                        </dt>
                        <dd className="mt-0.5 break-words text-sm font-semibold leading-5 text-egmf-ink-secondary">
                          {String(value)}
                        </dd>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-sm text-egmf-muted">
                      Chưa có thông tin chi tiết cho tài khoản này.
                    </div>
                  )}
                </dl>
              </Card>
            </div>
            <div className="mt-4">
              <PushSettings />
            </div>
          </>
        ) : (
          <Card className="max-w-2xl border-dashed px-6 py-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-egmf-primary-soft text-egmf-primary">
              <Icon name="user" size={22} />
            </span>
            <h2 className="mt-4 text-lg font-bold text-egmf-ink">
              Chưa có thông tin tài khoản
            </h2>
            <p className="mt-2 text-sm leading-6 text-egmf-muted">
              Vui lòng đăng nhập để xem thông tin tài khoản của bạn.
            </p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

export default AccountInfo;
