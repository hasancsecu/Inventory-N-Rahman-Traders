import { getActiveAgency, getAllAgencies } from "@/actions/agency";
import { getCurrentUser } from "@/lib/auth";
import { getStoredCustomers, getStoredProducts } from "@/lib/backend-store";
import { PosClient } from "./pos-client";

export default async function PosPage() {
  const currentAgency = await getActiveAgency();
  const agencies = await getAllAgencies();
  const currentUser = await getCurrentUser();

  const customers = getStoredCustomers();
  const products = getStoredProducts(currentAgency?.id);

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
