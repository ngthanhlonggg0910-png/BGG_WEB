import { describe, expect, it, vi } from 'vitest';
import { InspectionRollQrController, receiptId, rollQrCode, rollQuantity } from '../src/presentation/controllers/inspection-roll-qr.controller.js';
import type { DatabaseService } from '../src/infrastructure/database/database.service.js';

describe('raw material QR validation', () => {
  it('accepts issued-format QR, trimming scanner whitespace', () => {
    const code = 'GNA' + 'a'.repeat(32);
    expect(rollQrCode(' ' + code + '\r\n')).toBe(code.toUpperCase());
  });
  it('accepts GNA with the same numeric suffix as NAH', () => { expect(rollQrCode(' gna261100001 ')).toBe('GNA261100001'); });
  it('accepts the existing NAH roll structure', () => { expect(rollQrCode(' nah261100001 ')).toBe('NAH261100001'); });
  it.each(['', 'NAH123', 'GPA' + 'a'.repeat(32), null, 12, 'GNA' + 'x'.repeat(32)])('rejects non-label input %s', value => {
    expect(() => rollQrCode(value)).toThrow();
  });
  it.each(['0', '-1', '1e3', '1.12345', '', null, true, '10000000000'])('rejects invalid quantity %s', value => {
    expect(() => rollQuantity(value)).toThrow();
  });
  it.each([['91,44', 91.44], ['1.2345', 1.2345], [100, 100]])('accepts decimal quantity %s', (input, expected) => {
    expect(rollQuantity(input)).toBe(expected);
  });
  it('rejects missing roll or user before making a database call', async () => {
    const controller = new InspectionRollQrController({} as DatabaseService);
    await expect(controller.map({ Qr: 'GNA' + 'a'.repeat(32), Quantity: 1, SoRoll: '' })).rejects.toThrow('Số roll');
    await expect(controller.map({ Qr: 'GNA' + 'a'.repeat(32), Quantity: 1, SoRoll: 'R1' })).rejects.toThrow('tài khoản');
  });
  it.each([null, '', 0, -1, 'abc', 1.5])('rejects invalid receipt ID %s', value => expect(() => receiptId(value)).toThrow());
  it('accepts receipt ID stored in URL query', () => expect(receiptId('439')).toBe(439));
});

function controllerWith(result: object) {
  const request = { input: vi.fn(), query: vi.fn().mockResolvedValue(result), execute: vi.fn().mockResolvedValue(result) };
  request.input.mockReturnValue(request);
  const database = { getPool: async () => ({ request: () => request }) } as unknown as DatabaseService;
  return { controller: new InspectionRollQrController(database), request };
}
describe('receipt-scoped QR workflow', () => {
  it('rejects a scan from another receipt', async () => {
    const { controller } = controllerWith({ recordset: [{ PGDId: 439 }] });
    await expect(controller.lookup({ Qr: 'NAH261100705', PGDId: 440 })).rejects.toThrow('không thuộc');
  });
  it('loads receipt metadata and persistent scanned/pending rows', async () => {
    const receipt = { PGDId: 439, MaPhieu: '112600010' }, rows = [{ Qr: 'NAH261100705', CayId: 1 }];
    const { controller } = controllerWith({ recordsets: [[receipt], rows] });
    const result = await controller.receipt({ PGDId: 439 });
    expect(result.receipt).toEqual(receipt); expect(result.data).toEqual(rows);
  });
  it('passes selected receipt to SQL when saving', async () => {
    const { controller, request } = controllerWith({ recordset: [{ Qr: 'NAH261100705' }] });
    await controller.map({ Qr: 'NAH261100705', PGDId: 439, Quantity: '91,44', SoRoll: ' R1 ', AccountId: 1, EmployeeId: 1, User: 'TEST' });
    expect(request.input.mock.calls.some(call => call[0] === 'ExpectedPGDId' && call[2] === 439)).toBe(true);
    expect(request.execute).toHaveBeenCalledWith('dbo.WH_InspectionRollQr_Map');
  });
  it('edits through the update procedure with expected original values', async () => {
    const { controller, request } = controllerWith({ recordset: [{ Qr: 'NAH261100705', Quantity: 92 }] });
    await controller.update({ Qr: 'NAH261100705', PGDId: 439, Quantity: 92, SoRoll: 'R2', ExpectedQuantity: 91.44, ExpectedRoll: 'R1', AccountId: 1, User: 'TEST' });
    expect(request.execute).toHaveBeenCalledWith('dbo.WH_InspectionRollQr_Update');
    expect(request.input.mock.calls.some(call => call[0] === 'ExpectedRoll' && call[2] === 'R1')).toBe(true);
  });
  it('rejects an edit without original quantity before contacting SQL', async () => {
    const controller = new InspectionRollQrController({} as DatabaseService);
    await expect(controller.update({ Qr: 'NAH261100705', PGDId: 439, Quantity: 92, SoRoll: 'R2', AccountId: 1, User: 'TEST' })).rejects.toThrow('số lượng gốc');
  });
});
