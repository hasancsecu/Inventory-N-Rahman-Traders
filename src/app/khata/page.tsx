import { getActiveAgency, getAllAgencies } from "@/actions/agency";
import { getStoredCustomers, getStoredInvoices } from "@/lib/backend-store";
import { getCurrentUser } from "@/lib/auth";
import { KhataClient } from "./khata-client";

export default async function KhataPage() {
  const currentAgency = await getActiveAgency();
  const agencies = await getAllAgencies();
  const currentUser = await getCurrentUser();
  const customers = getStoredCustomers();
  const invoices = getStoredInvoices();

  return (
    <div className="flex-1 max-w-[90rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <KhataClient
        currentAgency={currentAgency}
        agencies={agencies}
        customers={customers}
        invoices={invoices}
        currentUser={currentUser}
      />
    </div>
  );
}
