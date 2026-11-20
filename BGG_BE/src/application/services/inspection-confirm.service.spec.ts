import { ForbiddenException, InternalServerErrorException } from '@nestjs/common';

import { InspectionConfirmService } from './inspection-confirm.service.js';
import type { InspectionConfirmRepository } from '../../infrastructure/repositories/inspection-confirm.repository.js';

const nguoi = { tkId: 7, hoTen: 'Nguyễn Văn A', tenDangNhap: 'nva' };

function makeService(overrides: Partial<Record<keyof InspectionConfirmRepository, unknown>> = {}) {
  const repo = {
    getPermissions: vi.fn().mockResolvedValue({ xacNhan: true, huyXacNhan: true }),
    getNguoiThaoTac: vi.fn().mockResolvedValue(nguoi),
    getPhieuInfo: vi.fn(),
    xacNhan: vi.fn(),
    huyXacNhan: vi.fn(),
    ...overrides,
  };
  return { service: new InspectionConfirmService(repo as unknown as InspectionConfirmRepository), repo };
}

describe('InspectionConfirmService.xacNhan', () => {
  it('refuses accounts without the desktop btnXacNhan permission', async () => {
    const { service, repo } = makeService({
      getPermissions: vi.fn().mockResolvedValue({ xacNhan: false, huyXacNhan: true }),
    });
    await expect(service.xacNhan(1, 7, false)).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.xacNhan).not.toHaveBeenCalled();
  });

  it('uses the account from the token, never a client-supplied name', async () => {
    const { service, repo } = makeService({
      xacNhan: vi.fn().mockResolvedValue({ status: 'confirmed', daXoaDong: 0, phieuNhapKho: 'created' }),
    });
    const result = await service.xacNhan(15, 7, false);
    expect(repo.getNguoiThaoTac).toHaveBeenCalledWith(7);
    expect(repo.xacNhan).toHaveBeenCalledWith(15, nguoi, false);
    expect(result).toMatchObject({ success: true, code: 'OK', trangThai: 'DAXACNHAN' });
    expect(result.message).toContain('đã tạo phiếu nhập kho');
    expect(result.message).toContain('người giám định: Nguyễn Văn A');
  });

  it('only deletes uninspected lines when explicitly asked (boolean true)', async () => {
    const xacNhan = vi.fn().mockResolvedValue({ status: 'chua_giam_dinh', rows: [{ CTPGDId: 1 }] });
    const { service } = makeService({ xacNhan });
    const result = await service.xacNhan(15, 7, 'true');
    expect(xacNhan).toHaveBeenCalledWith(15, nguoi, false);
    expect(result).toMatchObject({ success: false, code: 'CHUA_GIAM_DINH' });
  });

  it.each([
    [{ status: 'vuot_chung_tu', rows: [{}] }, 'VUOT_CHUNG_TU'],
    [{ status: 'thieu_kho', rows: [{}] }, 'THIEU_KHO'],
    [{ status: 'invalid_state', trangThai: 'DAXACNHAN' }, 'TRANG_THAI'],
    [{ status: 'thuoc_phieu_tong' }, 'THUOC_PHIEU_TONG'],
  ])('reports blocking check %j as %s', async (repoResult, code) => {
    const { service } = makeService({ xacNhan: vi.fn().mockResolvedValue(repoResult) });
    expect(await service.xacNhan(15, 7, false)).toMatchObject({ success: false, code });
  });

  it('says the phiếu was not confirmed when the database fails', async () => {
    const { service } = makeService({ xacNhan: vi.fn().mockRejectedValue(new Error('boom')) });
    await expect(service.xacNhan(15, 7, true)).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});

describe('InspectionConfirmService.huyXacNhan', () => {
  it('refuses accounts without btnHuyXacNhan', async () => {
    const { service } = makeService({
      getPermissions: vi.fn().mockResolvedValue({ xacNhan: true, huyXacNhan: false }),
    });
    await expect(service.huyXacNhan(1, 7)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it.each([
    [{ status: 'da_kiem_vai', soCay: 2 }, 'DA_KIEM_VAI'],
    [{ status: 'da_xuat', rows: [{ MaCay: 'X' }] }, 'DA_XUAT'],
    [{ status: 'invalid_state', trangThai: 'MOITAO' }, 'TRANG_THAI'],
  ])('blocks %j', async (repoResult, code) => {
    const { service } = makeService({ huyXacNhan: vi.fn().mockResolvedValue(repoResult) });
    expect(await service.huyXacNhan(15, 7)).toMatchObject({ success: false, code });
  });

  it('cancels a confirmed phiếu', async () => {
    const { service } = makeService({ huyXacNhan: vi.fn().mockResolvedValue({ status: 'cancelled' }) });
    expect(await service.huyXacNhan(15, 7)).toMatchObject({ success: true, trangThai: 'HUYXACNHAN' });
  });
});

describe('InspectionConfirmService.getStatus', () => {
  it('only offers actions the account may perform in the current state', async () => {
    const { service } = makeService({
      getPermissions: vi.fn().mockResolvedValue({ xacNhan: true, huyXacNhan: false }),
      getPhieuInfo: vi.fn().mockResolvedValue({
        PGDId: 15, MaPhieu: 'PGD1', TrangThai: 'MOITAO', LoaiGiamDinh: 'pl', ThuocPhieuTong: false,
      }),
    });
    const { data } = await service.getStatus(15, 7);
    expect(data.coTheXacNhan).toBe(true);
    expect(data.coTheHuyXacNhan).toBe(false);
  });
});
