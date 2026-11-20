import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { AuthTokenService } from '../../application/services/auth-token.service.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

export interface AuthenticatedRequest extends Request {
  user?: { tkId: number };
}

/** Global guard: every /api route needs a valid login token unless marked @Public(). */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: AuthTokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.user = { tkId: this.tokens.verify(request.headers.authorization) };
    return true;
  }
}
