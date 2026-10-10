import type {LoginRequestDTO} from "../dtos/login-request.dto.js"
import type { LoginResponseDTO } from "../dtos/login-response.dto.js"

export interface IAuthService {
    login(dto: LoginRequestDTO): Promise<LoginResponseDTO>;
}
