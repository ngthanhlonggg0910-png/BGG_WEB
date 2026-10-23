import { getCurrentProfile } from '../../../shared/auth/session';

export async function pushRequest(path, body) {
  const token = getCurrentProfile()?.pushToken;
  if (!token) throw new Error('Vui lòng đăng xuất và đăng nhập lại để sử dụng thông báo.');
  const response = await fetch(`/api/push/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(response.status === 401 ? 'Phiên thông báo đã hết hạn. Vui lòng đăng nhập lại.' : result.message || 'Không thể cập nhật thông báo.');
  return result;
}

export function applicationServerKey(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(normalized + '='.repeat((4 - normalized.length % 4) % 4)), char => char.charCodeAt(0));
}
