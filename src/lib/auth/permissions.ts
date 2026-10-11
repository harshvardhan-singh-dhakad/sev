/**
 * Rasvat Auth & Permission Matrix
 * Defined in ONE authoritative place and strictly enforced on the server.
 */

export type Role = 'owner' | 'manager' | 'editor' | 'support';

export type AppModule =
  | 'dashboard'
  | 'catalog'
  | 'sales'
  | 'enquiries'
  | 'content'
  | 'media'
  | 'settings'
  | 'audit_logs'
  | 'staff';

export type AppAction = 'view' | 'create' | 'edit' | 'delete' | 'publish';

export type PermissionMatrix = {
  [R in Role]: {
    [M in AppModule]: {
      [A in AppAction]: boolean;
    };
  };
};

export const PERMISSION_MATRIX: PermissionMatrix = {
  owner: {
    dashboard: { view: true, create: true, edit: true, delete: true, publish: true },
    catalog: { view: true, create: true, edit: true, delete: true, publish: true },
    sales: { view: true, create: true, edit: true, delete: true, publish: true },
    enquiries: { view: true, create: true, edit: true, delete: true, publish: true },
    content: { view: true, create: true, edit: true, delete: true, publish: true },
    media: { view: true, create: true, edit: true, delete: true, publish: true },
    settings: { view: true, create: true, edit: true, delete: true, publish: true },
    audit_logs: { view: true, create: false, edit: false, delete: false, publish: false },
    staff: { view: true, create: true, edit: true, delete: true, publish: true },
  },
  manager: {
    dashboard: { view: true, create: false, edit: false, delete: false, publish: false },
    catalog: { view: true, create: true, edit: true, delete: true, publish: true },
    sales: { view: true, create: true, edit: true, delete: false, publish: true },
    enquiries: { view: true, create: true, edit: true, delete: true, publish: true },
    content: { view: true, create: true, edit: true, delete: true, publish: true },
    media: { view: true, create: true, edit: true, delete: true, publish: true },
    settings: { view: true, create: false, edit: true, delete: false, publish: false },
    audit_logs: { view: true, create: false, edit: false, delete: false, publish: false },
    staff: { view: true, create: false, edit: false, delete: false, publish: false },
  },
  editor: {
    dashboard: { view: true, create: false, edit: false, delete: false, publish: false },
    catalog: { view: true, create: true, edit: true, delete: false, publish: true },
    sales: { view: true, create: false, edit: false, delete: false, publish: false },
    enquiries: { view: true, create: false, edit: false, delete: false, publish: false },
    content: { view: true, create: true, edit: true, delete: false, publish: true },
    media: { view: true, create: true, edit: true, delete: false, publish: true },
    settings: { view: false, create: false, edit: false, delete: false, publish: false },
    audit_logs: { view: false, create: false, edit: false, delete: false, publish: false },
    staff: { view: false, create: false, edit: false, delete: false, publish: false },
  },
  support: {
    dashboard: { view: true, create: false, edit: false, delete: false, publish: false },
    catalog: { view: true, create: false, edit: false, delete: false, publish: false },
    sales: { view: true, create: false, edit: true, delete: false, publish: false },
    enquiries: { view: true, create: false, edit: true, delete: false, publish: false },
    content: { view: true, create: false, edit: false, delete: false, publish: false },
    media: { view: true, create: false, edit: false, delete: false, publish: false },
    settings: { view: false, create: false, edit: false, delete: false, publish: false },
    audit_logs: { view: false, create: false, edit: false, delete: false, publish: false },
    staff: { view: false, create: false, edit: false, delete: false, publish: false },
  },
};

/**
 * Pure function to check permission on server.
 */
export function hasPermission(
  role: Role,
  module: AppModule,
  action: AppAction
): boolean {
  return Boolean(PERMISSION_MATRIX[role]?.[module]?.[action]);
}

/**
 * Throws a standard 403 Forbidden error if permission check fails.
 */
export function assertPermission(
  role: Role,
  module: AppModule,
  action: AppAction
): void {
  if (!hasPermission(role, module, action)) {
    const error = new Error(`Forbidden: Role '${role}' lacks '${action}' permission on '${module}'`);
    (error as unknown as { status: number }).status = 403;
    throw error;
  }
}
