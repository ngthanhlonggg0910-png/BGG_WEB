import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

import { MappingQrService } from './mapping-qr.service.js';
import type { IMapingQrRepository } from '../../domain/repositories/mapping-qr.interface.repository.js';
import type { DatabaseService } from '../../infrastructure/database/database.service.js';

function makeService(repo: Partial<IMapingQrRepository>) {
  return new MappingQrService(
    repo as IMapingQrRepository,
    {} as DatabaseService,
  );
}

const tem = (overrides: Record<string, unknown> = {}) =>
  ({
    CTPGDId: 10,
    SL: 5,
    QrTrangMapping: 'GPA26110306',
    ...overrides,
  }) as never;

describe('MappingQrService.saveMappingBatch', () => {
  it('saves every tem through the repository in one call', async () => {
    const saveMappingBatch = vi.fn().mockResolvedValue({
      ok: true,
      rows: [{ KetQua: 1 }, { KetQua: 1 }],
    });
    const service = makeService({ saveMappingBatch });

    const result = await service.saveMappingBatch({ items: [tem(), tem({ SL: 2.5 })] });

    expect(saveMappingBatch).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ success: true, savedCount: 2 });
  });

  it('reports which tem failed and that nothing was saved', async () => {
    const service = makeService({
      saveMappingBatch: vi.fn().mockResolvedValue({
        ok: false,
        failedIndex: 1,
        failedRow: { KetQua: 0 },
      }),
    });

    const result = await service.saveMappingBatch({ items: [tem(), tem({ CTPGDId: 11 })] });

    expect(result.success).toBe(false);
    expect(result.savedCount).toBe(0);
    expect(result.message).toContain('tem 2, item 11');
    expect(result.message).toContain('Chưa lưu tem nào');
  });

  it('rejects empty batches and invalid tems before touching the database', async () => {
    const saveMappingBatch = vi.fn();
    const service = makeService({ saveMappingBatch });

    await expect(service.saveMappingBatch({ items: [] })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.saveMappingBatch({ items: [tem({ SL: 0 })] })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.saveMappingBatch({ items: [tem({ SL: 'abc' })] })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.saveMappingBatch({ items: [tem({ QrTrangMapping: ' ' })] })).rejects.toBeInstanceOf(BadRequestException);
    expect(saveMappingBatch).not.toHaveBeenCalled();
  });

  it('turns database errors into a 500 that says nothing was saved', async () => {
    const service = makeService({
      saveMappingBatch: vi.fn().mockRejectedValue(new Error('deadlock')),
    });
    await expect(service.saveMappingBatch({ items: [tem()] })).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});

describe('MappingQrService.updateScannedRoll', () => {
  it('refuses a quantity below what was already exported', async () => {
    const service = makeService({
      updateScannedRoll: vi.fn().mockResolvedValue({ status: 'below_exported', soLuongXuat: 50 }),
    });
    const result = await service.updateScannedRoll(10, 1, 2);
    expect(result.success).toBe(false);
    expect(result.message).toContain('50');
  });

  it('rejects zero, negative and non-numeric quantities without calling the database', async () => {
    const updateScannedRoll = vi.fn();
    const service = makeService({ updateScannedRoll });
    for (const sl of [0, -1, Number.NaN]) {
      expect((await service.updateScannedRoll(sl, 1, 2)).success).toBe(false);
    }
    expect(updateScannedRoll).not.toHaveBeenCalled();
  });

  it('reports success when the roll was updated', async () => {
    const service = makeService({
      updateScannedRoll: vi.fn().mockResolvedValue({ status: 'updated', soLuongXuat: 0 }),
    });
    expect((await service.updateScannedRoll(33.3, 1, 2)).success).toBe(true);
  });
});

describe('MappingQrService.deleteScannedRoll', () => {
  it('requires CayId and CTPGDId', async () => {
    const service = makeService({ deleteScannedRoll: vi.fn() });
    await expect(service.deleteScannedRoll({ MaCay: 'PAH1' } as never)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it.each([
    ['exported', 'đã xuất kho'],
    ['picked', 'phiếu soạn hàng'],
    ['not_found', 'Không tìm thấy'],
  ])('refuses to delete when the roll is %s', async (status, text) => {
    const service = makeService({
      deleteScannedRoll: vi.fn().mockResolvedValue({ status, soLuongXuat: 3 }),
    });
    const result = await service.deleteScannedRoll({ CayId: 1, CTPGDId: 2, MaCay: 'PAH1' });
    expect(result.success).toBe(false);
    expect(result.message).toContain(text);
  });

  it('deletes by CayId + CTPGDId', async () => {
    const deleteScannedRoll = vi.fn().mockResolvedValue({ status: 'deleted', soLuongXuat: 0 });
    const service = makeService({ deleteScannedRoll });
    const result = await service.deleteScannedRoll({ CayId: 1, CTPGDId: 2, MaCay: 'PAH1' });
    expect(deleteScannedRoll).toHaveBeenCalledWith(1, 2);
    expect(result.success).toBe(true);
  });
});
