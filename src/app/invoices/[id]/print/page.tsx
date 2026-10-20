import { getActiveAgency } from "@/actions/agency";
import {
  getDbInvoiceById,
  getDbInvoices,
  getDbAgencyById,
  getDbAgencies,
} from "@/lib/db-service";
import Link from "next/link";
import { InvoicePrintClient } from "./invoice-print-client";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activeAgency = await getActiveAgency();
  const invoice = (await getDbInvoiceById(id)) || (await getDbInvoices())[0];
  const agency =
    (invoice ? await getDbAgencyById(invoice.agencyId) : null) ||
    activeAgency ||
    (await getDbAgencies())[0];

  if (!invoice || !agency) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
            Invoice not found
          </p>
          <Link
            href="/pos"
            className="mt-4 inline-block text-xs text-red-600 font-bold hover:underline"
          >
            Return to POS
          </Link>
        </div>
      </div>
    );
  }

  return <InvoicePrintClient invoice={invoice} agency={agency} />;
}
