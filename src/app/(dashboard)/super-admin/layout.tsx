import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/types";

const ADMIN_ROLES: UserRole[] = ["super_admin", "admin", "content_manager", "teacher"];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={ADMIN_ROLES}>
      {children}
    </RoleGuard>
  );
}
