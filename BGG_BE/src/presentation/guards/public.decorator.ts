import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Skips the global login check (AuthGuard) for a route or a whole controller. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
