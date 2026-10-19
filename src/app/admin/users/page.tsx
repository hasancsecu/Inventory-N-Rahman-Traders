import { getCurrentUser } from "@/lib/auth";
import { getAllAgencies } from "@/actions/agency";
import { getUsersList, getRolesList } from "@/actions/users";
import { redirect } from "next/navigation";
import { UsersClient } from "./users-client";

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();

  // Guard: Only Super Admin can access
  if (
    !currentUser ||
    (currentUser.role !== "SUPER_ADMIN" &&
      !currentUser.permissions.includes("admin:manage_users") &&
      !currentUser.permissions.includes("*"))
  ) {
    redirect("/");
  }

  const agencies = await getAllAgencies();
  const users = await getUsersList();
  const roles = await getRolesList();

  return (
    <div className="flex-1 max-w-[90rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <UsersClient
        currentUser={currentUser}
        agencies={agencies}
        initialUsers={users}
        initialRoles={roles}
      />
    </div>
  );
}
