import { PushAuthService } from './push-auth.service.js';
import { AuthTokenService } from './auth-token.service.js';
import { Inject, Injectable } from '@nestjs/common';

import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import type { IAuthService } from '../interfaces/auth-service.interface.js';

import { LoginRequestDTO } from '../dtos/login-request.dto.js';
import { LoginResponseDTO } from '../dtos/login-response.dto.js';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly pushAuth: PushAuthService,
    private readonly authToken: AuthTokenService,
  ) {}

  async login(dto: LoginRequestDTO): Promise<LoginResponseDTO> {
    if (typeof dto?.TenTaiKhoan !== 'string' || typeof dto?.MatKhau !== 'string') {
      return new LoginResponseDTO(false, 'Sai tài khoản hoặc mật khẩu');
    }

    const user = await this.userRepository.login(dto.TenTaiKhoan, dto.MatKhau);

    if (!user) {
      return new LoginResponseDTO(false, 'Sai tài khoản hoặc mật khẩu');
    }

    return new LoginResponseDTO(true, 'Đăng nhập thành công', {
      UEId: user.UEId,
      TenDangNhap: user.TenDangNhap,
      NVId: user.NVId,
      NgayHetHan: user.NgayHetHan,
      MaNhanVien: user.MaNhanVien,
      HoVaTenLot: user.HoVaTenLot,
      Ten: user.Ten,
      Email: user.Email,
      PbId: user.PbId,
      HinhAnh: user.HinhAnh,
      SoNoiBo: user.SoNoiBo,
      SoDienThoai: user.SoDienThoai,
      TKId: user.TKId,
      accessToken: this.authToken.issue(user.TKId),
      pushToken: this.pushAuth.issue(user.TKId),
    });
  }
}
