import { redirect } from "next/navigation";
import { getActiveAgency, getAllAgencies } from "@/actions/agency";
import { getCurrentUser } from "@/lib/auth";
import { getDbCustomers, getDbProducts } from "@/lib/db-service";
import { PosClient } from "./pos-client";

export default async function PosPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  const currentAgency = await getActiveAgency();
  const agencies = await getAllAgencies();
  const customers = await getDbCustomers();
  const products = await getDbProducts(currentAgency?.id);

  return (
    <div className="flex-1 max-w-[90rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PosClient
        currentAgency={currentAgency}
        agencies={agencies}
        customers={customers}
        products={products}
        currentUser={currentUser}
      />
    </div>
  );
}
