import { getCurrentUser } from "@/lib/auth";
import {
  getMasterDataStats,
  getMasterAgencies,
  getMasterProducts,
  getMasterBatches,
  getMasterCustomers,
  getMasterInvoices,
  getMasterSuppliers,
  getMasterBrands,
  getMasterViscosityGrades,
  getMasterPackagingTypes,
} from "@/actions/master-data";
import { redirect } from "next/navigation";
import { MasterDataClient } from "./master-data-client";
import { Crown, ShieldAlert } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Master Data CRUD Hub • Super Admin Control Center",
  description:
    "Unrestricted CRUD operations across all dealership agencies, products, inventory batches, customers, invoices, suppliers, brands, viscosities, and packaging types.",
};

export default async function MasterDataPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "SUPER_ADMIN") {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-600 dark:text-red-400">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
          Super Admin Clearance Required
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          You are currently signed in as{" "}
          <strong className="text-zinc-900 dark:text-zinc-100">
            {currentUser.name}
          </strong>{" "}
          ({currentUser.role}). Master Data CRUD operations across all
          dealership entities are strictly restricted to the Distributorship
          Proprietor & Super Admin.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs shadow-md"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const [
    stats,
    agencies,
    products,
    batches,
    customers,
    invoices,
    suppliers,
    brands,
    viscosities,
    packagingTypes,
  ] = await Promise.all([
    getMasterDataStats(),
    getMasterAgencies(),
    getMasterProducts(),
    getMasterBatches(),
    getMasterCustomers(),
    getMasterInvoices(),
    getMasterSuppliers(),
    getMasterBrands(),
    getMasterViscosityGrades(),
    getMasterPackagingTypes(),
  ]);

  return (
    <div className="flex-1 max-w-[90rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <MasterDataClient
        currentUser={currentUser}
        initialStats={stats}
        initialAgencies={agencies}
        initialProducts={products}
        initialBatches={batches}
        initialCustomers={customers}
        initialInvoices={invoices}
        initialSuppliers={suppliers}
        initialBrands={brands}
        initialViscosities={viscosities}
        initialPackagingTypes={packagingTypes}
      />
    </div>
  );
}
