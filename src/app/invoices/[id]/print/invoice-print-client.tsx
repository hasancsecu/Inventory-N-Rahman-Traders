'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Globe } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { Language, translations } from '@/lib/i18n/translations';

interface InvoicePrintClientProps {
  invoice: any;
  agency: any;
}

export function InvoicePrintClient({ invoice, agency }: InvoicePrintClientProps) {
  const { language, setLanguage, formatCurrency, formatNumber } = useLanguage();
  const [printLang, setPrintLang] = React.useState<Language>(language);

  // Sync print language if global changes initially
  React.useEffect(() => {
    setPrintLang(language);
  }, [language]);

  const t = translations[printLang];

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-4 sm:p-8 text-zinc-900 print:bg-white print:p-0">
      {/* Non-printed Toolbar */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/pos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.invoicePrint.backToPos}
        </Link>

        <div className="flex items-center gap-3">
          {/* Document Language Switcher (Bangla / English) */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs">
            <span className="px-2 py-1 text-zinc-500 font-medium hidden sm:inline">
              {t.invoicePrint.printLanguage}
            </span>
            <button
              type="button"
              onClick={() => setPrintLang('bn')}
              className={`px-3 py-1 font-bold rounded-lg transition-all cursor-pointer ${
                printLang === 'bn'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              বাংলা (চালান)
            </button>
            <button
              type="button"
              onClick={() => setPrintLang('en')}
              className={`px-3 py-1 font-bold rounded-lg transition-all cursor-pointer ${
                printLang === 'en'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              English
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md hover:bg-red-700 cursor-pointer transition-all"
          >
            <Printer className="h-4 w-4" />
            {t.invoicePrint.printBtn}
          </button>
        </div>
      </div>

      {/* Official Printable Document Container */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-lg border border-zinc-200 print:shadow-none print:border-none print:p-6 print:rounded-none text-zinc-900">
        {/* Dealership Letterhead */}
        <div className="border-b-2 border-red-600 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-50 text-red-700 font-mono text-[11px] font-bold tracking-wider mb-1">
                {t.invoicePrint.dealershipLetterhead} • {agency.code}
              </div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                {agency.name}
              </h1>
              <p className="text-xs text-zinc-600 mt-1 max-w-lg leading-relaxed">
                {t.invoicePrint.officialDistributor} {agency.brandPrincipal} in Bangladesh.
                <br />
                {agency.address} • {t.invoicePrint.hotline}: {agency.phone}
              </p>
            </div>

            <div className="text-right text-xs font-mono space-y-1">
              <div>
                <span className="text-zinc-500">{t.invoicePrint.binNo}</span>{' '}
                <strong className="text-zinc-900">{agency.binNo}</strong>
              </div>
              <div>
                <span className="text-zinc-500">{t.invoicePrint.tradeLicense}</span>{' '}
                <strong className="text-zinc-900">{agency.tradeLicense}</strong>
              </div>
              <div>
                <span className="text-zinc-500">{t.invoicePrint.tinNo}</span>{' '}
                <strong className="text-zinc-900">4829-1048-2910</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Title & Meta */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              {t.invoicePrint.documentType}
            </span>
            <h2 className="text-lg font-bold text-zinc-900">
              {t.invoicePrint.documentTitle}
            </h2>
          </div>

          <div className="text-right">
            <div className="text-base font-extrabold font-mono text-red-600">
              {t.invoicePrint.invoiceNo} {invoice.invoiceNo}
            </div>
            <div className="text-xs font-mono text-zinc-600">
              {t.invoicePrint.chalanNo} {invoice.chalanNo} • {t.invoicePrint.date} 19 Oct 2026
            </div>
          </div>
        </div>

        {/* Customer & Logistics Info */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-xs">
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
            <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">
              {t.invoicePrint.billingInfo}
            </span>
            <div className="font-bold text-sm text-zinc-900">{invoice.customerName}</div>
            <div className="text-zinc-600">Gabtoli Bus Terminal Workshop, Mirpur, Dhaka</div>
            <div className="font-mono text-zinc-600">
              Phone: {invoice.phone || '+880 1711-234567'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
            <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">
              {t.invoicePrint.logisticsInfo}
            </span>
            <div className="font-semibold text-zinc-900">
              {t.invoicePrint.carrierVehicle}{' '}
              <span className="font-mono">{invoice.vehicleNumber || 'Counter Delivery'}</span>
            </div>
            <div className="text-zinc-600">
              {t.invoicePrint.driver} {invoice.driverName || 'N/A'}
            </div>
            <div className="font-mono text-zinc-600">
              {t.invoicePrint.paymentMode} {invoice.paymentMethod}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left text-xs mb-8">
          <thead className="bg-zinc-100 text-zinc-700 uppercase font-bold text-[10px] tracking-wider border-y border-zinc-300">
            <tr>
              <th className="py-2.5 px-3">{t.invoicePrint.colNo}</th>
              <th className="py-2.5 px-3">{t.invoicePrint.colDesc}</th>
              <th className="py-2.5 px-3">{t.invoicePrint.colBatch}</th>
              <th className="py-2.5 px-3 text-right">{t.invoicePrint.colQty}</th>
              <th className="py-2.5 px-3 text-right">{t.invoicePrint.colLiters}</th>
              <th className="py-2.5 px-3 text-right">{t.invoicePrint.colRate}</th>
              <th className="py-2.5 px-3 text-right">{t.invoicePrint.colTotal}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 font-medium">
            {invoice.items.map((it: any, idx: number) => (
              <tr key={idx}>
                <td className="py-3 px-3 font-mono">{idx + 1}</td>
                <td className="py-3 px-3">
                  <div className="font-bold text-zinc-900">{it.productName}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    Packaging: {it.packaging} • {it.unitLiters}L/unit
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-zinc-600">{it.batchNumber}</td>
                <td className="py-3 px-3 text-right font-mono font-bold">
                  {formatNumber(it.quantity)}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {formatNumber(it.totalLiters)} L
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {formatCurrency(it.unitRate, false)}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold">
                  {formatCurrency(it.lineTotal, false)}
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
              {t.invoicePrint.authorizedBank}
            </span>
            <div className="font-bold text-zinc-900">{agency.bankName}</div>
            <div className="text-zinc-600">
              {t.invoicePrint.accountName} {agency.bankAccountName}
            </div>
            <div className="font-mono text-zinc-800">
              {t.invoicePrint.accountNo} {agency.bankAccountNo}
            </div>
            <div className="font-mono text-[11px] text-zinc-500">
              {t.invoicePrint.branch} {agency.bankBranch} • {t.invoicePrint.routingNo} {agency.bankRoutingNo}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-zinc-600">
              <span>{t.invoicePrint.subtotal}</span>
              <span>{formatCurrency(invoice.subtotal, false)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>{t.invoicePrint.tradeDiscount}</span>
              <span>-{formatCurrency(invoice.discount, false)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>{t.invoicePrint.vatMushak}</span>
              <span>৳ 0.00</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-zinc-900 border-t border-zinc-300 pt-2">
              <span>{t.invoicePrint.grandTotal}</span>
              <span className="text-red-600">{formatCurrency(invoice.totalAmount, false)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>{t.invoicePrint.paidAmount}</span>
              <span>{formatCurrency(invoice.paidAmount, false)}</span>
            </div>
            <div className="flex justify-between text-red-600 font-bold border-t border-zinc-200 pt-1">
              <span>{t.invoicePrint.remainingDue}</span>
              <span>{formatCurrency(invoice.dueAmount, false)}</span>
            </div>
          </div>
        </div>

        {/* Signature Blocks */}
        <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs border-t border-zinc-200">
          <div>
            <div className="border-t border-zinc-400 w-36 mx-auto mb-1" />
            <span className="text-zinc-600">{t.invoicePrint.customerSign}</span>
          </div>
          <div>
            <div className="border-t border-zinc-400 w-36 mx-auto mb-1" />
            <span className="text-zinc-600">{t.invoicePrint.storeSign}</span>
          </div>
          <div>
            <div className="border-t border-zinc-400 w-36 mx-auto mb-1" />
            <span className="text-zinc-600 font-semibold">{t.invoicePrint.authSign}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
