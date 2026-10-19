import { redirect } from "next/navigation";
import { getActiveAgency, getAllAgencies } from "@/actions/agency";
import { getDbCustomers, getDbInvoices } from "@/lib/db-service";
import { getCurrentUser } from "@/lib/auth";
import { KhataClient } from "./khata-client";

export default async function KhataPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  const currentAgency = await getActiveAgency();
  const agencies = await getAllAgencies();
  const customers = await getDbCustomers();
  const invoices = await getDbInvoices();

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
