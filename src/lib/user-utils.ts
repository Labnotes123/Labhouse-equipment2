/**
 * Shared user mapping utilities for /api/users routes.
 */

export function dbToUser(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    username: row.username as string,
    password: "",                                    // never expose the hash
    fullName: row.full_name as string,
    employeeId: (row.employee_id as string) ?? "",
    phone: (row.phone as string) ?? "",
    email: (row.email as string) ?? "",
    // `role` is the auth/access-control role; `position` stores a verbose job title.
    // UserProfile.position represents the auth role in this system.
    position: (row.role as string) ?? "",
    department: (row.department as string) ?? "",
    branch: (row.branch as string) ?? "",
    signature: (row.signature as string) ?? "",
    managedDevices: (row.managed_devices as string[]) ?? [],
    profileIds: (row.profile_ids as string[]) ?? [],
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) ?? undefined,
  };
}
