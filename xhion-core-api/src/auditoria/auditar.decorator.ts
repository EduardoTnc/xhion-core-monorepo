import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'audit:accion';

export const Auditar = (accion: string) => SetMetadata(AUDIT_ACTION_KEY, accion);
