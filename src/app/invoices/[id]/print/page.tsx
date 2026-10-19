import { getActiveAgency } from '@/actions/agency'
import {
  getStoredInvoiceById,
  getStoredInvoices,
  getStoredAgencyById,
  getStoredAgencies,
} from '@/lib/backend-store'
import { Printer, ArrowLeft, ShieldCheck, Truck, Droplet } from 'lucide-react'
import Link from 'next/link'

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const activeAgency = await getActiveAgency()
  const invoice = getStoredInvoiceById(id) || getStoredInvoices()[0]
  const agency =
    (invoice ? getStoredAgencyById(invoice.agencyId) : null) ||
    activeAgency ||
    getStoredAgencies()[0]

  if (!invoice || !agency) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Invoice not found</p>
          <Link href="/pos" className="mt-4 inline-block text-xs text-red-600 font-bold hover:underline">
            ← Return to POS
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-4 sm:p-8 text-zinc-900 print:bg-white print:p-0">
      {/* Non-printed Toolbar */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/pos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to POS Terminal
        </Link>

        <button
          onClick={() => {}}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md hover:bg-red-700 cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          Print Commercial Invoice & Chalan
        </button>
      </div>

      {/* Official Printable Document Container */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-lg border border-zinc-200 print:shadow-none print:border-none print:p-6 print:rounded-none text-zinc-900">
        {/* Dealership Letterhead */}
        <div className="border-b-2 border-red-600 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-50 text-red-700 font-mono text-[11px] font-bold tracking-wider mb-1">
                AUTHORIZED PRINCIPAL DEALERSHIP • {agency.code}
              </div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                {agency.name}
              </h1>
              <p className="text-xs text-zinc-600 mt-1 max-w-lg">
                Official Distributor of {agency.brandPrincipal} in Bangladesh.
                <br />
                {agency.address} • Hotline: {agency.phone}
              </p>
            </div>

            <div className="text-right text-xs font-mono space-y-1">
              <div>
                <span className="text-zinc-500">BIN No:</span>{' '}
                <strong className="text-zinc-900">{agency.binNo}</strong>
              </div>
              <div>
                <span className="text-zinc-500">Trade License:</span>{' '}
                <strong className="text-zinc-900">{agency.tradeLicense}</strong>
              </div>
              <div>
                <span className="text-zinc-500">TIN:</span>{' '}
                <strong className="text-zinc-900">4829-1048-2910</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Title & Meta */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Document Type
            </span>
            <h2 className="text-lg font-bold text-zinc-900">
              Commercial Tax Invoice & Delivery Chalan
            </h2>
          </div>

          <div className="text-right">
            <div className="text-base font-extrabold font-mono text-red-600">
              Invoice #{invoice.invoiceNo}
            </div>
            <div className="text-xs font-mono text-zinc-600">
              Chalan #{invoice.chalanNo} • Date: 19 Oct 2026
            </div>
          </div>
        </div>

        {/* Customer & Logistics Info */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-xs">
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
            <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">
              Customer / Billing Info
            </span>
            <div className="font-bold text-sm text-zinc-900">{invoice.customerName}</div>
            <div className="text-zinc-600">Gabtoli Bus Terminal Workshop, Mirpur, Dhaka</div>
            <div className="font-mono text-zinc-600">Phone: {invoice.phone || '+880 1711-234567'}</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
            <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">
              Logistics & Delivery Vehicle
            </span>
            <div className="font-semibold text-zinc-900">
              Carrier Vehicle: <span className="font-mono">{invoice.vehicleNumber}</span>
            </div>
            <div className="text-zinc-600">Driver: {invoice.driverName}</div>
            <div className="font-mono text-zinc-600">Payment: {invoice.paymentMethod}</div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left text-xs mb-8">
          <thead className="bg-zinc-100 text-zinc-700 uppercase font-bold text-[10px] tracking-wider border-y border-zinc-300">
            <tr>
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Product Description</th>
              <th className="py-2.5 px-3">Batch No</th>
              <th className="py-2.5 px-3 text-right">Qty</th>
              <th className="py-2.5 px-3 text-right">Liters</th>
              <th className="py-2.5 px-3 text-right">Unit Rate (৳)</th>
              <th className="py-2.5 px-3 text-right">Total (৳)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 font-medium">
            {invoice.items.map((it, idx) => (
              <tr key={idx}>
                <td className="py-3 px-3 font-mono">{idx + 1}</td>
                <td className="py-3 px-3">
                  <div className="font-bold text-zinc-900">{it.productName}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    Packaging: {it.packaging} • {it.unitLiters}L/unit
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-zinc-600">{it.batchNumber}</td>
                <td className="py-3 px-3 text-right font-mono font-bold">{it.quantity}</td>
                <td className="py-3 px-3 text-right font-mono">{it.totalLiters} L</td>
                <td className="py-3 px-3 text-right font-mono">
                  ৳{it.unitRate.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold">
                  ৳{it.lineTotal.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Financial Summary & Bank Details */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          {/* Bank Details */}
          <div className="p-4 rounded-2xl border border-zinc-200 text-xs space-y-1.5">
            <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">
              Authorized Settlement Bank
            </span>
            <div className="font-bold text-zinc-900">{agency.bankName}</div>
            <div className="text-zinc-600">A/C: {agency.bankAccountName}</div>
            <div className="font-mono text-zinc-800">No: {agency.bankAccountNo}</div>
            <div className="font-mono text-[11px] text-zinc-500">
              Branch: {agency.bankBranch} • Routing: {agency.bankRoutingNo}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal:</span>
              <span>৳{invoice.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Trade Discount:</span>
              <span>-৳{invoice.discount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>VAT (Mushak 6.3):</span>
              <span>৳0.00</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-zinc-900 border-t border-zinc-300 pt-2">
              <span>Grand Total:</span>
              <span className="text-red-600">৳{invoice.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Paid Amount:</span>
              <span>৳{invoice.paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-red-600 font-bold border-t border-zinc-200 pt-1">
              <span>Remaining Due:</span>
              <span>৳{invoice.dueAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Signature Blocks */}
        <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs border-t border-zinc-200">
          <div>
            <div className="border-t border-zinc-400 w-36 mx-auto mb-1" />
            <span className="text-zinc-600">Customer Received By</span>
          </div>
          <div>
            <div className="border-t border-zinc-400 w-36 mx-auto mb-1" />
            <span className="text-zinc-600">Storekeeper / Decanter</span>
          </div>
          <div>
            <div className="border-t border-zinc-400 w-36 mx-auto mb-1" />
            <span className="text-zinc-600 font-semibold">Authorized Dealership Signatory</span>
          </div>
        </div>
      </div>
    </div>
  )
}
