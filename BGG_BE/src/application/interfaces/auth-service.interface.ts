import type { LoginRequestDTO } from '../dtos/login-request.dto.js';
import type { LoginResponseDTO } from '../dtos/login-response.dto.js';
import { GetUsernameAndPassword_ResponseDTO } from '../dtos/login-response.dto.js';

export interface IAuthService {
  login(dto: LoginRequestDTO): Promise<LoginResponseDTO>;

  getUsernameAndPassword(
    TenDangNhap: string,
  ): Promise<GetUsernameAndPassword_ResponseDTO>;
}
