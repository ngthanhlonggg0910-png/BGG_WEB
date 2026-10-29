import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Trophy } from "lucide-react";
import { getCurrentUser } from "../../../shared/auth/session";
import {
  layDanhSachChungLoaiCoItem,
  layDanhSachChungLoaiKoItem,
  layDanhSachMaHang,
  taoPhieuKiemVaiThuCong,
  layDanhSachItem,
  layDanhSachMaMau,
  layDanhSachArt,
  layLot,
  layDanhSachNhaCungCap,
} from "../api/fabric-inspections.api";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../shared/components/ui/CustomToast";
import AppSelect from "../../../shared/components/ui/AppSelect";
import { toast } from "react-toastify";

export default function CreateFabricInspectionForm({ onClose }) {
  const user = getCurrentUser();

  const [formData, setFormData] = useState({
    MaHang: "",
    Item: "",
    ChungLoai: "",
    Art: "",
    TenMau: "",
    LOT: "",
    NhaCungCap: "",
    NgayKiemVai: "yyyy-MM-dd",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [maHang, setMaHang] = useState([]);
  const [loading, setLoading] = useState(false);

  const [chungLoai, setChungLoai] = useState([]);
  const [chungLoaiLoading, setChungLoaiLoading] = useState(false);

  const [item, setItem] = useState([]);
  const [loadingItem, setLoadingItem] = useState(false);

  const [loadingMaMau, setLoadingMaMau] = useState(false);
  const [maMau, setMaMau] = useState([]);

  const [loadingArt, setLoadingArt] = useState(false);
  const [art, setArt] = useState([]);

  const [loadingLot, setLoadingLot] = useState(false);
  const [dsLot, setDsLot] = useState([]);

  const [nhaCungCap, setNhaCungCap] = useState([]);
  const [loadingNhaCungCap, setLoadingNhaCungCap] = useState(false);

  const maHangOptions = useMemo(
    () => createOptions(maHang, ["MaHang", "maHang"], ["TenHang", "tenHang"]),
    [maHang],
  );

  const chungLoaiOptions = useMemo(
    () => createOptions(chungLoai, ["TenChungLoai"], ["TenChungLoai"]),
    [chungLoai],
  );

  const maMauOptions = useMemo(
    () => createOptions(maMau, ["MaMau"], ["MaMau"]),
    [maMau],
  );

  const artOptions = useMemo(
    () => createOptions(art, ["QuyCach"], ["QuyCach"]),
    [art],
  );

  const itemOptions = useMemo(() => createOptions(item, ["Item"], ["Item"]));

  const lotOptions = useMemo(
    () => createOptions(dsLot, ["Lot", "LOT"], ["Lot", "LOT"]),
    [dsLot],
  );

  const nhaCungCapOptions = useMemo(
    () => createOptions(nhaCungCap, ["TenNgan"], ["TenNgan"]),
    [nhaCungCap],
  );

  // Lấy mã hàng
  useEffect(() => {
    let active = true;

    const fetchMaHang = async () => {
      setLoading(true);

      try {
        const response = await layDanhSachMaHang();

        if (!response?.success) {
          throw new Error(response?.message || "Không thể tải mã hàng");
        }

        if (active) {
          setMaHang(response.data || []);
        }
      } catch (error) {
        console.error("Lỗi lấy mã hàng:", error);

        if (active) {
          showErrorToast(
            error?.response?.data?.message ||
              error?.message ||
              "Không thể tải mã hàng",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMaHang();

    return () => {
      active = false;
    };
  }, []);

  // Lấy danh sách nhà cung cấp
  useEffect(() => {
    let active = true;

    const fetchNhaCungCap = async () => {
      setLoadingNhaCungCap(true);

      try {
        const response = await layDanhSachNhaCungCap();

        if (!response?.success) {
          throw new Error(response?.message || "Không thể tải nhà cung cấp");
        }

        if (active) setNhaCungCap(response.data || []);
      } catch (error) {
        if (!active) return;

        setNhaCungCap([]);
        showErrorToast(
          error?.response?.data?.message ||
            error?.message ||
            "Không thể tải nhà cung cấp",
        );
      } finally {
        if (active) setLoadingNhaCungCap(false);
      }
    };

    fetchNhaCungCap();

    return () => {
      active = false;
    };
  }, []);

  // Lấy chủng loại
  useEffect(() => {
    let active = true;

    const fetchChungLoai = async () => {
      // ĐÃ SỬA 1: Không báo lỗi khi chưa chọn mã hàng
      if (!formData.MaHang?.trim()) {
        setChungLoai([]);
        setChungLoaiLoading(false);
        return;
      }

      // ĐÃ SỬA 2: Chờ tải danh sách Item xong
      if (loadingItem) {
        setChungLoaiLoading(false);
        return;
      }

      const itemValue = formData.Item?.trim() || "";

      setChungLoaiLoading(true);
      setChungLoai([]);

      setFormData((previous) => ({
        ...previous,
        ChungLoai: "",
      }));

      try {
        const response = itemValue
          ? await layDanhSachChungLoaiCoItem(formData.MaHang, itemValue)
          : await layDanhSachChungLoaiKoItem(formData.MaHang);

        if (!response?.success) {
          throw new Error(
            response?.message || "Không thể tải danh sách chủng loại",
          );
        }

        if (active) {
          setChungLoai(response.data || []);
        }
      } catch (error) {
        if (!active) return;

        setChungLoai([]);

        showErrorToast(
          error?.response?.data?.message ||
            error?.message ||
            "Không thể tải danh sách chủng loại",
        );
      } finally {
        if (active) setChungLoaiLoading(false);
      }
    };

    fetchChungLoai();

    return () => {
      active = false;
    };
  }, [formData.MaHang, formData.Item, loadingItem]);

  // Lấy mã màu
  useEffect(() => {
    let active = true;

    const fetchMaMau = async () => {
      const { MaHang, Item, ChungLoai } = formData;

      if (!MaHang?.trim()) {
        setMaMau([]);
        setLoadingMaMau(false);
        return;
      }

      setLoadingMaMau(true);
      setMaMau([]);

      try {
        const response = await layDanhSachMaMau(
          MaHang,
          Item || "",
          ChungLoai || "",
        );

        if (active) {
          setMaMau(response.success ? response.data || [] : []);
        }
      } catch (error) {
        if (active) {
          console.error("Lỗi lấy danh sách mã màu:", error);
          setMaMau([]);
        }
      } finally {
        if (active) {
          setLoadingMaMau(false);
        }
      }
    };

    fetchMaMau();

    return () => {
      active = false;
    };
  }, [formData.MaHang, formData.Item, formData.ChungLoai]);

  // Lấy Item
  useEffect(() => {
    let active = true;

    const fetchItem = async () => {
      // ĐÃ SỬA 5: Không hiện toast khi form mới mở
      if (!formData.MaHang?.trim()) {
        setItem([]);
        setLoadingItem(false);
        return;
      }

      setLoadingItem(true);
      setItem([]);

      try {
        const response = await layDanhSachItem(formData.MaHang);

        if (!response?.success) {
          throw new Error(response?.message || "Không thể tải Item");
        }

        if (active) {
          setItem(response.data || []);
        }
      } catch (error) {
        if (!active) return;

        setItem([]);

        showErrorToast(
          error?.response?.data?.message ||
            error?.message ||
            "Không thể tải Item",
        );
      } finally {
        if (active) setLoadingItem(false);
      }
    };

    fetchItem();

    return () => {
      active = false;
    };
  }, [formData.MaHang]);

  //Lấy Art
  useEffect(() => {
    let active = true;

    const fetchArt = async () => {
      const { MaHang, Item, ChungLoai, TenMau } = formData;

      if (!MaHang?.trim()) {
        setArt([]);
        setLoadingArt(false);
        return;
      }

      setLoadingArt(true);
      setArt([]);

      try {
        const response = await layDanhSachArt(
          MaHang,
          Item || "",
          ChungLoai || "",
          TenMau || "",
        );

        console.log("Response Art:", response);

        if (!response?.success) {
          throw new Error(response?.message || "Không thể tải Art");
        }

        if (active) {
          setArt(response.data || []);
        }
      } catch (error) {
        if (active) {
          console.error("Lỗi lấy Art:", error);
          setArt([]);
        }
      } finally {
        if (active) {
          setLoadingArt(false);
        }
      }
    };

    fetchArt();

    return () => {
      active = false;
    };
  }, [formData.MaHang, formData.Item, formData.ChungLoai, formData.TenMau]);

  //Lấy Lot
  useEffect(() => {
    let active = true;

    const fetchLot = async () => {
      const { MaHang, Item, ChungLoai, TenMau, Art } = formData;

      setFormData((previous) => ({ ...previous, LOT: "" }));

      if (!MaHang?.trim()) {
        setDsLot([]);
        setLoadingLot(false);
        return;
      }

      setLoadingLot(true);
      setDsLot([]);

      try {
        const res = await layLot(
          MaHang,
          Item || "",
          ChungLoai || "",
          TenMau || "",
          Art || "",
        );

        if (!res?.success) {
          throw new Error(res?.message || "Không thể tải danh sách Lot");
        }

        if (active) {
          setDsLot(res.data);
        }
      } catch (error) {
        if (!active) return;

        setDsLot([]);
        console.error("Lỗi lấy danh sách Lot:", error);
      } finally {
        if (active) setLoadingLot(false);
      }
    };

    fetchLot();

    return () => {
      active = false;
    };
  }, [
    formData.MaHang,
    formData.Item,
    formData.ChungLoai,
    formData.TenMau,
    formData.Art,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const payload = {
      ...formData,
      TKId: Number(user.data.TKId),
    };

    setLoading(true);

    try {
      console.log("Dữ liệu tạo phiếu:", payload);

      const response = await taoPhieuKiemVaiThuCong(payload);

      if (response.success) {
        showSuccessToast(response.message || "Tạo phiếu kiểm vải thành công");

        const soPhieuKiem = response.data?.SoPhieuKiem;
        console.log("Số phiếu vừa tạo:", soPhieuKiem);

        onClose();
      } else {
        showErrorToast(response.message || "Tạo phiếu kiểm vải thất bại");
      }
    } catch (error) {
      console.error("Lỗi tạo phiếu kiểm vải:", error);

      showErrorToast(
        error.response?.data?.message || "Có lỗi xảy ra khi tạo phiếu kiểm vải",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      id="create-fabric-inspection-form"
      onSubmit={handleSubmit}
      className="space-y-4 p-4 sm:p-5"
    >
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <SelectField
          label="Mã hàng"
          name="MaHang"
          value={formData.MaHang}
          options={maHangOptions}
          loading={loading}
          onChange={(value) =>
            setFormData((previous) => ({
              ...previous,
              MaHang: value,
              Item: "",
              ChungLoai: "",
              TenMau: "",
              Art: "",
              LOT: "",
            }))
          }
        />

        <SelectField
          label="Item"
          name="Item"
          value={formData.Item}
          options={itemOptions}
          loading={loadingItem}
          searchable
          onChange={(value) => handleChange("Item", value)}
        />

        <SelectField
          label="Chủng loại"
          name="ChungLoai"
          value={formData.ChungLoai}
          options={chungLoaiOptions}
          loading={loading || chungLoaiLoading}
          searchable
          onChange={(value) => handleChange("ChungLoai", value)}
        />

        <SelectField
          label="Tên màu"
          name="TenMau"
          value={formData.TenMau}
          options={maMauOptions}
          loading={loadingMaMau}
          searchable
          onChange={(value) => handleChange("TenMau", value)}
        />

        <SelectField
          label="Art"
          name="Art"
          value={formData.Art}
          options={artOptions}
          loading={loadingArt}
          searchable
          onChange={(value) => handleChange("Art", value)}
        />

        <SelectField
          label="Lot"
          name="LOT"
          value={formData.LOT}
          options={lotOptions}
          loading={loadingLot}
          searchable
          onChange={(value) => handleChange("LOT", value)}
        />

        <SelectField
          label="Nhà cung cấp"
          name="NhaCungCap"
          value={formData.NhaCungCap}
          options={nhaCungCapOptions}
          loading={loadingNhaCungCap}
          searchable
          onChange={(value) => handleChange("NhaCungCap", value)}
        />
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-[13px] font-bold text-egmf-ink-secondary">
          <CalendarDays size={17} className="text-egmf-primary" />
          Ngày kiểm vải
        </label>

        <input
          type="date"
          value={formData.NgayKiemVai}
          onChange={(e) => handleChange("NgayKiemVai", e.target.value)}
          className="h-12 w-full rounded-xl border border-egmf-border bg-white px-3.5 text-[15px] font-semibold text-egmf-ink outline-none transition focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10"
        />
      </div>
    </form>
  );
}

function getOptionValue(row, keys) {
  if (typeof row === "string" || typeof row === "number") return String(row);

  for (const key of keys) {
    const value = row?.[key];
    if (value != null && String(value).trim()) return String(value);
  }

  return "";
}

function createOptions(rows, valueKeys, labelKeys) {
  const seen = new Set();

  return (Array.isArray(rows) ? rows : []).flatMap((row) => {
    const value = getOptionValue(row, valueKeys);
    if (!value || seen.has(value)) return [];

    seen.add(value);
    const label = getOptionValue(row, labelKeys);

    return [
      {
        value,
        label: label && label !== value ? `${value} — ${label}` : value,
      },
    ];
  });
}

function SelectField({
  label,
  name,
  value,
  options,
  loading,
  searchable = true,
  onChange,
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label
        htmlFor={name}
        className="block text-[13px] font-bold text-egmf-ink-secondary"
      >
        {label}
      </label>
      <AppSelect
        inputId={name}
        value={value}
        options={options}
        loading={loading}
        allowClear
        minHeight={48}
        menuMaxHeight={224}
        searchable={searchable}
        placeholder={`Tìm và chọn ${label.toLowerCase()}`}
        aria-label={label}
        onChange={(selectedValue) => onChange(selectedValue || "")}
      />
    </div>
  );
}
