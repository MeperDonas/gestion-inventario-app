import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'audit_action';

export function AuditAction(action: string) {
  return SetMetadata(AUDIT_ACTION_KEY, action);
}
