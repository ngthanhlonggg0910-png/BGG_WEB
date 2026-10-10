import { Body, Controller, Inject, Post } from '@nestjs/common';

import type { IAuthService } from '../../application/interfaces/auth-service.interface.js';
import { LoginRequestDTO } from '../../application/dtos/login-request.dto.js';
import { dot } from 'node:test/reporters';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('IAuthService')
    private readonly authService: IAuthService,
  ) {}

  @Post('login')
  login(@Body() dto: LoginRequestDTO) {
    return this.authService.login(dto);
  }
}
