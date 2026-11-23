import { describe, expect, it } from 'vitest';

import {
  buildMaterialDisplay,
  classifyLoaiKho,
  matchesColor,
  matchesSize,
} from './material-rules.js';

describe('classifyLoaiKho', () => {
  it.each([
    ['NGUYÊN LIỆU', '', 'NguyenLieu'],
    ['Nguyen lieu', '', 'NguyenLieu'],
    ['Vải chính', '', 'NguyenLieu'],
    ['MEX', '', 'NguyenLieu'],
    ['VAI LOT', '', 'NguyenLieu'],
    ['PHỤ LIỆU', '', 'PhuLieu'],
    ['Phụ liệu - nhãn vải', '', 'PhuLieu'],
    ['Đệm vai', '', 'PhuLieu'],
    ['Chỉ may', '', 'PhuLieu'],
    ['', 'N.VAI01', 'NguyenLieu'],
    ['', 'P.CHI', 'PhuLieu'],
    ['', '', 'PhuLieu'],
  ])('%s / %s -> %s', (loai, mc, expected) => {
    expect(classifyLoaiKho(loai, mc)).toBe(expected);
  });
});

describe('matchesColor', () => {
  const row = { tenMau: 'RED', codeMau: '01' };

  it('matches whole values only', () => {
    expect(matchesColor('', 'DARK RED', row)).toBe(false);
    expect(matchesColor('101', '', row)).toBe(false);
    expect(matchesColor('', 'RED, BLUE', row)).toBe(true);
    expect(matchesColor('01 02', '', row)).toBe(true);
    expect(matchesColor('', 'RED - 01', row)).toBe(true);
  });

  it('applies colourless or ALL lines to every row', () => {
    expect(matchesColor('', '', row)).toBe(true);
    expect(matchesColor('ALL', '', row)).toBe(true);
  });

  it('does not apply a coloured line to a row without colour', () => {
    expect(matchesColor('', 'RED', {})).toBe(false);
  });
});

describe('matchesSize', () => {
  it('matches exact size tokens', () => {
    expect(matchesSize('', 'XS, XL', { tenSize: 'S' })).toBe(false);
    expect(matchesSize('', 'XS, XL', { tenSize: 'L' })).toBe(false);
    expect(matchesSize('', 'XS, XL', { tenSize: 'XL' })).toBe(true);
    expect(matchesSize('S/M', '', { tenSize: 'M' })).toBe(true);
    expect(matchesSize('M', 'S M L', { tenSize: 'L' })).toBe(true);
  });

  it('applies ALL / FREE / empty to every size', () => {
    expect(matchesSize('', '', { tenSize: 'M' })).toBe(true);
    expect(matchesSize('FREE', '', { tenSize: 'M' })).toBe(true);
    expect(matchesSize('', 'ALL', { tenSize: 'M' })).toBe(true);
  });

  it('does not apply a sized line to a row without size', () => {
    expect(matchesSize('M', '', {})).toBe(false);
  });
});

describe('buildMaterialDisplay', () => {
  it('builds code and name like the BOM screen', () => {
    expect(
      buildMaterialDisplay({ Item: 'ITM1', MaMau: '01', MaChungLoai: 'N.VAI', DienGiai: 'Vải chính', Size: 'M' }),
    ).toEqual({ maVatTu: 'ITM1 (01)', tenVatTu: 'N.VAI - Vải chính [Cỡ: M]' });
  });
});

