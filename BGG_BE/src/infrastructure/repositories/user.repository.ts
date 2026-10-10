import { Injectable } from '@nestjs/common';
import sql from 'mssql';
import { encryptPassword } from '../../utils/password-encryption.util.js';
import { DatabaseService } from '../database/database.service.js';
import { User } from '../../domain/entities/user.entity.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async login(username: string, password: string): Promise<User | null> {
    const pool = await this.databaseService.getPool();
    const encryptedPassword = encryptPassword(password);

    const result = await pool
      .request()
      .input('TenTaiKhoan', sql.NVarChar(100), username)
      .input('MatKhau', sql.NVarChar(100), encryptedPassword)
      .execute('lib_KiemTraDangNhap');

    if (result.recordset.length === 0) return null;

    const row = result.recordset[0];

    return new User(
      row.UEId,
      row.TenDangNhap,
      row.NVId,
      row.NgayHetHan,
      row.MaNhanVien,
      row.HoVaTenLot,
      row.Ten,
      row.Email,
      row.PbId,
      row.HinhAnh,
      row.SoNoiBo,
      row.SoDienThoai,
      row.TKId,
    );
  }
}
