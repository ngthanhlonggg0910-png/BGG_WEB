import { AlertTriangle, CheckCircle2, GitMerge, Ruler } from "lucide-react";
import { useEffect, useState } from "react";

// Dữ liệu mẫu: thay các giá trị này bằng dữ liệu API khi luồng nghiệp vụ sẵn sàng.
const GIA_TRI_MAC_DINH = {
  soLop: "1",
};

export default function FabricSplicingMetrics({
  cayVai,
  thongTinPhieu,
  onThayDoiKetQua,
  mode,
}) {
  const laHachToanThuong = mode === "HOACH_TOAN_THUONG";
  const laNoiCay = mode === "TAO_CAY_GOC" || mode === "THEM_CAY_NOI";

  const [soMetTrai, setSoMetTrai] = useState(null);
  const [soLopTrai, setSoLopTrai] = useState(null);

  const soMetTraiNhap = Number(soMetTrai) || 0;
  const soLopTraiNhap = Number(soLopTrai) || 0;

  const [thuHoi, setThuHoi] = useState(["0", "0", "0", "0", "0"]);
  const [luaChonPhanConLai, setLuaChonPhanConLai] = useState(null);
  const daiBanTraiThucTe = Number(thongTinPhieu?.daiBanTrai) || 0;

  const tieuHao = laHachToanThuong
    ? Math.round(soLopTraiNhap * daiBanTraiThucTe * 100) / 100
    : soMetTraiNhap;

  const tongThuHoi = thuHoi.reduce(
    (tong, giaTri) => tong + (Number(giaTri) || 0),
    0,
  );

  const btpMoiLop = (thongTinPhieu?.soDo ?? "")
    .split(",")
    .reduce((tong, item) => {
      const phan = item.trim().split("/");
      return tong + (Number(phan[phan.length - 1]) || 0);
    }, 0);

  const soBTP = laHachToanThuong ? soLopTraiNhap * btpMoiLop : 0;

  const thuHoiKhongHopLe = thuHoi.some((giaTri) => {
    const soMet = Number(giaTri) || 0;

    return soMet < 0 || soMet > 50;
  });
  const conLai = (Number(cayVai?.Met) || 0) - tieuHao - tongThuHoi;

  const daNhapGiaTri = laHachToanThuong
    ? soLopTrai !== null && soLopTrai !== ""
    : soMetTrai !== null && soMetTrai !== "";

  const canChonCachXuLyPhanConLai =
    daNhapGiaTri &&
    conLai > 0 &&
    daiBanTraiThucTe > 0 &&
    conLai >= daiBanTraiThucTe;

  //TÍNH VƯỢT ĐỊNH MỨC
  const metBanDau = Number(cayVai?.MetBanDau) || 0;
  const daHoachToan = Number(cayVai?.SoLuongHoachToan) || 0;
  const phanTram = Number(cayVai?.PhanTram) || 0;
  const tongHoachToan = tieuHao + daHoachToan;
  const metToiDa = metBanDau * (1 + phanTram / 100); //SỐ MÉT TỐI ĐA CHO PHÉP HOẠCH TOÁN
  const vuotDinhMuc = tongHoachToan > metToiDa;

  let thieu = 0;
  let thua = 0;
  let nguyenCay = 0;

  const chonPhanConLai = (luaChon) => setLuaChonPhanConLai(luaChon);

  const thayDoiThuHoi = (viTri, giaTri) => {
    setThuHoi((danhSachCu) =>
      danhSachCu.map((giaTriCu, chiSo) =>
        chiSo === viTri ? giaTri : giaTriCu,
      ),
    );
    setLuaChonPhanConLai(null);
  };

  if (conLai < 0) {
    //thừa: SL hoạch toán bị vượt so với số mét của cây
    thua = Math.abs(conLai);
    thieu = 0;
    nguyenCay = 0;
  } else if (canChonCachXuLyPhanConLai) {
    nguyenCay = luaChonPhanConLai === "NGUYEN_CAY" ? conLai : 0;
    thieu = luaChonPhanConLai === "THIEU" ? conLai : 0;
  } else if (daNhapGiaTri && conLai > 0) {
    thua = 0;
    thieu = conLai;
    nguyenCay = 0;
  }

  useEffect(() => {
    onThayDoiKetQua?.({
      soMetTrai: laNoiCay ? soMetTraiNhap : 0,
      soLopTrai: laHachToanThuong ? soLopTraiNhap : 0,
      thucTe: tieuHao,
      tieuHaoThucTe: tieuHao,
      thua,
      thieu,
      nguyenCay,
      thuHoi,
      tongThuHoi,
      thuHoiKhongHopLe,
      daiBanTraiThucTe,
      luaChonPhanConLai,
      canChonCachXuLyPhanConLai,
      vuotDinhMuc,
      metToiDa,
      tongHoachToan,
      phanTram,
      soBTP,
    });
  }, [
    tieuHao,
    thua,
    thieu,
    nguyenCay,
    vuotDinhMuc,
    metToiDa,
    daiBanTraiThucTe,
    tongHoachToan,
    thuHoi,
    tongThuHoi,
    thuHoiKhongHopLe,
    luaChonPhanConLai,
    canChonCachXuLyPhanConLai,
    phanTram,
    soBTP,
  ]);

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-egmf-card">
        <header className="flex items-center justify-between gap-3 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
              <Ruler size={17} strokeWidth={2.3} />
            </span>
            <h2 className="m-0 text-sm font-extrabold text-egmf-ink">
              Thông số nối cây
            </h2>
          </div>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-egmf-muted shadow-sm">
            Dữ liệu mẫu
          </span>
        </header>

        <div className="space-y-3 p-3 sm:p-4">
          <MetricGroup title="Đầu cây (mét)" columns="grid-cols-3">
            <MetricCell label="Yard" value={cayVai?.Yard} />
            <MetricCell label="Mét" value={cayVai?.Met} />
            <MetricCell
              label="Thực tế"
              value={tieuHao}
              valueClassName="text-egmf-primary"
            />
          </MetricGroup>

          <MetricGroup title="Chênh lệch (mét)" columns="grid-cols-2">
            <MetricCell
              label="Thừa"
              value={thua}
              className="border-amber-200 bg-amber-50"
              valueClassName="text-amber-700"
            />
            <MetricCell
              label="Thiếu"
              value={thieu}
            />
          </MetricGroup>

          <div className="grid grid-cols-2 gap-2">
            <MetricCell label="Nguyên cây" value={nguyenCay} />

            {laNoiCay && (
              <label className="box-border flex h-16 min-w-0 flex-col rounded-lg border border-egmf-primary-border bg-egmf-primary-soft px-2.5 py-2 transition focus-within:ring-4 focus-within:ring-egmf-primary/15">
                <span className="text-[11px] font-bold uppercase leading-3 tracking-wide text-egmf-muted">
                  Số mét trải
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={soMetTrai ?? ""}
                  onChange={(suKien) => {
                    const giaTri = suKien.target.value;
                    setSoMetTrai(giaTri);
                    setLuaChonPhanConLai(null);
                  }}
                  placeholder="0"
                  aria-label="Số mét trải"
                  className="m-0 mt-0.5 h-5 w-full appearance-none bg-transparent p-0 text-left text-base font-extrabold leading-5 text-egmf-ink outline-none placeholder:font-bold placeholder:text-egmf-placeholder"
                />
              </label>
            )}

            {mode === "HOACH_TOAN_THUONG" && (
              <label className="box-border flex h-16 min-w-0 flex-col rounded-lg border border-egmf-primary-border bg-egmf-primary-soft px-2.5 py-2 transition focus-within:ring-4 focus-within:ring-egmf-primary/15">
                <span className="text-[11px] font-bold uppercase leading-3 tracking-wide text-egmf-muted">
                  Số lớp trải
                </span>
                <span className="mt-0.5 flex h-5 min-w-0 items-baseline gap-1">
                  <input
                    type="text"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={soLopTrai ?? ""}
                    onChange={(suKien) => {
                      setSoLopTrai(suKien.target.value);
                      setLuaChonPhanConLai(null);
                    }}
                    placeholder="0"
                    aria-label="Số lớp trải"
                    className="h-5 min-w-0 flex-1 appearance-none bg-transparent p-0 text-left text-base font-extrabold leading-5 text-egmf-ink outline-none placeholder:font-bold placeholder:text-egmf-placeholder"
                  />
                  <span className="shrink-0 text-xs font-extrabold leading-5 text-egmf-primary">
                    lớp
                  </span>
                </span>
              </label>
            )}
          </div>

          {laHachToanThuong && (
            <fieldset>
              <legend className="mb-1.5 text-xs font-bold uppercase tracking-wide text-egmf-muted">
                Thu hồi (mét)
              </legend>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {thuHoi.map((giaTri, viTri) => (
                  <input
                    key={viTri}
                    type="number"
                    min="0"
                    max="50"
                    step="0.01"
                    inputMode="decimal"
                    value={giaTri}
                    onChange={(suKien) =>
                      thayDoiThuHoi(viTri, suKien.target.value)
                    }
                    aria-label={`Vải thu hồi đoạn ${viTri + 1}`}
                    placeholder="0"
                    className="h-10 min-w-0 rounded-lg border border-egmf-border bg-egmf-surface-subtle px-1 text-center text-sm font-extrabold text-egmf-ink outline-none transition placeholder:font-medium placeholder:text-egmf-placeholder focus:border-egmf-primary focus:bg-white focus:ring-4 focus:ring-egmf-primary/15"
                  />
                ))}
              </div>
              <p className="m-0 mt-2 text-right text-xs font-medium text-egmf-ink-secondary">
                Tổng thu hồi:{" "}
                <strong className="text-egmf-ink">{tongThuHoi} m</strong>
              </p>
            </fieldset>
          )}

          <MetricGroup title="Tiêu hao & định mức" columns="grid-cols-3">
            <MetricCell label="Tiêu hao" value={tieuHao} />
            <MetricCell
              label="Số lớp"
              value={laHachToanThuong ? soLopTraiNhap : 1}
            />
            <MetricCell
              label="% Cho phép vượt"
              value={`${cayVai?.PhanTram}%`}
            />
          </MetricGroup>
        </div>
      </section>

      {canChonCachXuLyPhanConLai && !luaChonPhanConLai && (
        <LuaChonPhanConLai soMetConLai={conLai} onChon={chonPhanConLai} />
      )}
    </>
  );
}

function LuaChonPhanConLai({ soMetConLai, onChon }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-egmf-card">
      <header className="flex items-center justify-between gap-3 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
            <GitMerge size={17} strokeWidth={2.3} />
          </span>
          <div className="min-w-0">
            <h3 className="m-0 truncate text-sm font-extrabold text-egmf-ink">
              Xử lý vải còn lại
            </h3>
            <p className="m-0 mt-0.5 truncate text-xs font-medium text-egmf-ink-secondary">
              Chọn cách ghi nhận phần vải dư sau khi trải
            </p>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-egmf-primary-border bg-gradient-to-r from-egmf-primary-soft to-white px-3 py-2.5">
          <p className="m-0 text-xs font-bold uppercase tracking-wide text-egmf-ink-secondary">
            Số mét còn lại
          </p>
          <p className="m-0 shrink-0 text-xl font-extrabold tracking-tight text-egmf-primary">
            {soMetConLai} <span className="text-xs font-bold">m</span>
          </p>
        </div>

        <p className="m-0 mt-3 text-xs font-medium leading-5 text-egmf-ink-secondary">
          Phần vải này đủ một bàn trải. Hãy chọn trạng thái phù hợp trước khi
          lưu.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChon("NGUYEN_CAY")}
            className="flex min-h-20 items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-emerald-600 shadow-sm">
              <CheckCircle2 size={18} strokeWidth={2.4} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-emerald-700">
                Nguyên cây
              </span>
              <span className="mt-0.5 block text-[11px] font-medium leading-4 text-emerald-700/80">
                Giữ lại để nối tiếp
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => onChon("THIEU")}
            className="flex min-h-20 items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-left transition hover:border-rose-300 hover:bg-rose-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-rose-600 shadow-sm">
              <AlertTriangle size={18} strokeWidth={2.4} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-rose-700">
                Thiếu vải
              </span>
              <span className="mt-0.5 block text-[11px] font-medium leading-4 text-rose-700/80">
                Ghi nhận vào chênh lệch
              </span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

function MetricGroup({ title, columns, children }) {
  return (
    <div>
      <h3 className="m-0 mb-1.5 text-xs font-bold uppercase tracking-wide text-egmf-muted">
        {title}
      </h3>
      <div className={`grid gap-2 ${columns}`}>{children}</div>
    </div>
  );
}

function MetricCell({ label, value, className = "", valueClassName = "" }) {
  return (
    <div
      className={`box-border h-16 min-w-0 rounded-lg border border-egmf-border bg-egmf-surface-subtle px-2.5 py-2 ${className}`}
    >
      <p className="m-0 truncate text-[11px] font-bold uppercase tracking-wide text-egmf-muted">
        {label}
      </p>
      <p
        className={`m-0 mt-0.5 truncate text-base font-extrabold text-egmf-ink ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}
