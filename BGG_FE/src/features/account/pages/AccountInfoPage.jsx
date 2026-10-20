import { getCurrentProfile } from "../../../shared/auth/session";
import Card from "../../../shared/components/ui/Card";
import Icon from "../../../shared/components/ui/Icon";
import MainLayout from "../../../layouts/MainLayout/MainLayout";

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

  return (
    <MainLayout screenTitle="THÔNG TIN TÀI KHOẢN">
      <div className="mx-auto max-w-[1100px] px-4 py-5 sm:px-6 sm:py-7 md:px-9 md:py-9">
        <header className="mb-6">
          <p className="text-[11px] font-bold tracking-[0.12em] text-egmf-primary">
            HỒ SƠ CÁ NHÂN
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-egmf-ink">
            Tài khoản của bạn
          </h2>
          <p className="mt-1.5 text-[15px] leading-6 text-egmf-muted">
            Thông tin được lưu từ lần đăng nhập gần nhất.
          </p>
        </header>

        {profile ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
            <Card className="overflow-hidden">
              <div className="h-24 bg-egmf-primary" />
              <div className="px-5 pb-6 sm:px-6 sm:pb-7">
                <div className="-mt-10 grid size-20 place-items-center rounded-[22px] border-4 border-white bg-egmf-primary-soft text-2xl font-bold text-egmf-primary-strong shadow-[0_8px_18px_rgba(47,45,105,0.12)]">
                  {initial}
                </div>
                <h2 className="mt-4 text-xl font-bold tracking-[-0.025em] text-egmf-ink">
                  {accountName || "Tài khoản eGMF"}
                </h2>
                <p className="mt-1 text-[15px] text-egmf-muted">
                  Tài khoản hệ thống
                </p>
                {username && (
                  <div className="mt-5 flex items-center gap-3 rounded-2xl border border-egmf-border-muted bg-egmf-surface-subtle px-3.5 py-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                      <Icon name="user" size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-egmf-muted-soft">
                        Tài khoản
                      </p>
                      <p className="break-all text-[15px] font-semibold text-egmf-ink-secondary">
                        {username}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3 border-b border-egmf-border-subtle px-5 py-4 sm:px-6">
                <span className="grid size-10 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                  <Icon name="settings" size={19} />
                </span>
                <div>
                  <p className="text-[11px] font-bold tracking-[0.1em] text-egmf-muted-soft">
                    THÔNG TIN
                  </p>
                  <h2 className="mt-0.5 text-base font-bold text-egmf-ink">
                    Chi tiết tài khoản
                  </h2>
                </div>
              </div>
              <dl className="divide-y divide-egmf-border-subtle px-5 sm:px-6">
                {details.length ? (
                  details.map(([key, value]) => (
                    <div
                      className="grid gap-1 py-4 sm:grid-cols-[160px_1fr] sm:gap-4"
                      key={key}
                    >
                      <dt className="text-[15px] font-medium text-egmf-muted">
                        {labels[key] || key}
                      </dt>
                      <dd className="break-words text-[15px] font-semibold text-egmf-ink-secondary">
                        {String(value)}
                      </dd>
                    </div>
                  ))
                ) : (
                  <div className="py-7 text-sm text-egmf-muted">
                    Chưa có thông tin chi tiết cho tài khoản này.
                  </div>
                )}
              </dl>
            </Card>
          </div>
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
