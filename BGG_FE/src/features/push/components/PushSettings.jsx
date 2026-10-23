import { useEffect, useState } from 'react';
import { Bell, BellOff, Search, Send } from 'lucide-react';
import { applicationServerKey, pushRequest } from '../api/pushAPI';

const buttonClass = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-base font-semibold text-slate-700 disabled:opacity-50';

export default function PushSettings() {
  const [config, setConfig] = useState(null);
  const [settings, setSettings] = useState(null);
  const [selected, setSelected] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const supported = window.isSecureContext && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const permissionDenied = 'Notification' in window && Notification.permission === 'denied';

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch('/api/push/config');
        if (!response.ok) throw new Error('Không tải được cấu hình thông báo.');
        const data = await response.json();
        if (!active) return;
        setConfig(data);
        if (data.enabled) {
          const result = await pushRequest('settings');
          if (!active) return;
          setSettings(result);
          setSelected(result.accounts.filter(account => account.Selected).map(account => account.TKId));
        }
        if (supported) {
          const registration = await navigator.serviceWorker.getRegistration();
          const existing = await registration?.pushManager.getSubscription();
          if (existing && data.enabled) await pushRequest('subscribe', existing.toJSON());
          if (active) setSubscription(existing || null);
        }
      } catch (err) { if (active) setError(err.message); }
    }
    void load();
    return () => { active = false; };
  }, [supported]);

  async function enable() {
    setBusy(true); setError(''); setNotice('');
    try {
      // Permission is requested directly from this tap, before network requests.
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Bạn chưa cho phép thông báo. Có thể bật lại trong cài đặt thông báo của điện thoại.');
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration?.active) throw new Error('Ứng dụng chưa sẵn sàng. Hãy cập nhật ứng dụng rồi thử lại.');
      const key = applicationServerKey(config.publicKey);
      let current = await registration.pushManager.getSubscription();
      const previousKey = current?.options?.applicationServerKey;
      if (current && previousKey && [...new Uint8Array(previousKey)].join(',') !== [...key].join(',')) {
        await current.unsubscribe(); current = null;
      }
      current ||= await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
      await pushRequest('subscribe', current.toJSON());
      setSubscription(current);
      setNotice('Đã bật trên thiết bị này. Tài khoản cần nằm trong danh sách người nhận để nhận đơn mới.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function disable() {
    setBusy(true); setError(''); setNotice('');
    try {
      await subscription.unsubscribe(); setSubscription(null);
      await pushRequest('unsubscribe', { endpoint: subscription.endpoint });
      setNotice('Đã tắt thông báo trên thiết bị này.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function save() {
    setBusy(true); setError(''); setNotice('');
    try {
      await pushRequest('recipients', { tkIds: selected });
      setDirty(false); setNotice(`Đã lưu ${selected.length} tài khoản nhận đơn đặt hàng mới.`);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function test() {
    setBusy(true); setError(''); setNotice('');
    try {
      await pushRequest('test', { endpoint: subscription.endpoint });
      setNotice('Đã gửi thông báo thử đến thiết bị này.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  const accounts = settings?.accounts.filter(account => String(account.TenDangNhap || '').toLocaleLowerCase('vi-VN').includes(search.toLocaleLowerCase('vi-VN'))) || [];
  return (
    <section aria-labelledby="push-settings-title" className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4 sm:p-5">
        <h2 id="push-settings-title" className="flex items-center gap-2 text-lg font-bold text-slate-900"><Bell size={22} className="text-blue-600" />Thông báo đơn đặt hàng</h2>
        <p className="mt-1 text-sm text-slate-600">Nhận thông báo khi có đơn mới từ BGG_WEB. Bấm thông báo để mở đơn.</p>
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        {!config && !error && <p role="status">Đang tải cấu hình...</p>}
        {config && !config.enabled && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Máy chủ chưa bật thông báo. Cần cấu hình Web Push trước khi đăng ký thiết bị.</p>}
        {config?.enabled && <>
          {!supported && <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">Trên iPhone/iPad, hãy mở ứng dụng từ biểu tượng đã thêm vào màn hình chính (iOS 16.4 trở lên). Android và máy tính dùng trình duyệt hỗ trợ thông báo. Địa chỉ ứng dụng phải là HTTPS.</p>}
          {permissionDenied && <p className="text-sm text-amber-800">Thông báo đã bị chặn. Hãy vào cài đặt thông báo của ứng dụng/trình duyệt để cho phép lại.</p>}
          <div className="flex flex-wrap gap-2">
            {subscription ? <>
              <button type="button" onClick={disable} disabled={busy} className={buttonClass}><BellOff size={18} />Tắt trên thiết bị này</button>
              <button type="button" onClick={test} disabled={busy} className={buttonClass}><Send size={18} />Gửi thử</button>
            </> : <button type="button" onClick={enable} disabled={busy || !supported || permissionDenied || !settings} className={`${buttonClass} !border-blue-600 !bg-blue-600 !text-white`}><Bell size={18} />{busy ? 'Đang xử lý...' : 'Bật thông báo trên thiết bị này'}</button>}
          </div>
          {settings && !settings.canManage && <p className="text-sm text-slate-600">{settings.selected ? 'Tài khoản của bạn đang trong danh sách người nhận.' : 'Tài khoản của bạn chưa được chọn nhận đơn mới.'}</p>}
          {settings?.canManage && <div className="space-y-3 border-t border-slate-100 pt-4">
            <h3 className="text-base font-bold text-slate-900">Chọn tài khoản nhận thông báo</h3>
            <p className="text-sm text-slate-600">Áp dụng cho đơn đặt hàng mới của toàn hệ thống. Người được chọn cần bật thông báo trên thiết bị của mình.</p>
            <label className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 px-3"><Search size={18} className="text-slate-500" /><input aria-label="Tìm tài khoản nhận thông báo" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên đăng nhập..." className="min-w-0 flex-1 bg-transparent text-base outline-none" /></label>
            <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200">
              {accounts.length === 0 ? <p className="p-4 text-sm text-slate-500">Không tìm thấy tài khoản.</p> : accounts.map(account => <label key={account.TKId} className="flex min-h-16 cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0">
                <input type="checkbox" checked={selected.includes(account.TKId)} disabled={busy} onChange={e => { setSelected(previous => e.target.checked ? [...previous, account.TKId] : previous.filter(id => id !== account.TKId)); setDirty(true); }} className="h-5 w-5 shrink-0 accent-blue-600" />
                <span className="min-w-0"><strong className="block break-words text-base text-slate-900">{account.TenDangNhap}</strong><span className="text-sm text-slate-500">{account.Devices > 0 ? `${account.Devices} thiết bị đã đăng ký` : 'Chưa đăng ký thiết bị'}</span></span>
              </label>)}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-600">Đã chọn {selected.length} tài khoản{dirty ? ' · Chưa lưu' : ''}</p><button type="button" onClick={save} disabled={busy || !dirty} className={`${buttonClass} !border-blue-600 !bg-blue-600 !text-white`}>Lưu người nhận</button></div>
          </div>}
        </>}
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
        {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      </div>
    </section>
  );
}
