const ROLE_PERMISSIONS = {
  Admin: [
    'manage_tenants', 'manage_users', 'manage_warehouses',
    'manage_products', 'manage_inventory', 'manage_orders',
    'manage_shipments', 'manage_vehicles', 'manage_drivers',
    'manage_payments', 'manage_invoices', 'view_analytics',
    'create_orders', 'create_payments',
  ],
  Manager: [
    'manage_warehouses', 'manage_products', 'manage_inventory',
    'manage_orders', 'manage_shipments', 'manage_vehicles',
    'manage_drivers', 'manage_payments', 'manage_invoices',
    'view_analytics', 'create_orders', 'create_payments',
  ],
  Staff: [
    'view_analytics', 'create_orders', 'create_payments','manage_inventory'
  ],
};

export const can = (role, permission) => {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
};