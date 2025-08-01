// Thin wrapper that forwards to the strongly-typed authorize in common middleware,
// while still allowing routes that pass string role names to compile.
import { UserRole } from '@prisma/client';
import { authorize as baseAuthorize } from '../common/middleware/authorize';

export const authorize = (roles: (UserRole | string)[]) => {
  const allowed = roles.map((r) => (typeof r === 'string' ? (r as UserRole) : r));
  return baseAuthorize(allowed as UserRole[]);
};

export default authorize; 