"use client";

import * as React from "react";
import {
  BookOpenCheck,
  Search,
  Building2,
  DollarSign,
  Plus,
  ShieldCheck,
  CreditCard,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileText,
  Truck,
  ArrowUpRight,
  TrendingDown,
  ArrowLeft,
  Users,
  Phone,
} from "lucide-react";
import { AgencySummary } from "@/actions/agency";
import { collectCustomerPayment } from "@/actions/khata";
import { PaymentMethod } from "@prisma/client";
import { AuthUser } from "@/lib/auth-types";
import { Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pagination, paginateList } from "@/components/ui/pagination";
import {
  cleanNumericString,
  handleNumericFocus,
} from "@/components/ui/number-input";
import { useLanguage } from "@/context/language-context";

interface KhataClientProps {
  currentAgency: AgencySummary | null;
  agencies: AgencySummary[];
  customers: any[];
  invoices?: any[];
  currentUser?: AuthUser;
}

interface StatementEntry {
  id: string;
  date: string;
  agencyCode: string;
  type: string;
  referenceNumber: string;
  debit: number;
  credit: number;
  runningBalance: number;
  notes: string;
}

export function KhataClient({
  currentAgency,
  agencies,
  customers,
  invoices = [],
  currentUser,
}: KhataClientProps) {
  const router = useRouter();
  const { t, language, formatCurrency, formatNumber } = useLanguage();
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const canCollectPayment = currentUser
    ? currentUser.role === "SUPER_ADMIN" ||
      currentUser.role === "AGENCY_MANAGER" ||
      currentUser.role === "CASHIER"
    : true;

  const [customerList, setCustomerList] = React.useState(customers);
  const [invoiceList, setInvoiceList] = React.useState(invoices);

  React.useEffect(() => {
    setCustomerList(customers);
  }, [customers]);

  React.useEffect(() => {
    setInvoiceList(invoices);
  }, [invoices]);

  const [selectedViewAgency, setSelectedViewAgency] = React.useState<string>(
    currentAgency?.id || "ALL",
  );
  const [mobileKhataTab, setMobileKhataTab] = React.useState<
    "customers" | "statement"
  >("customers");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string>(
    customers[0]?.id || "",
  );
  const selectedCustomer = React.useMemo(() => {
    return (
      customerList.find((c) => c.id === selectedCustomerId) ||
      customerList[0] ||
      null
    );
  }, [customerList, selectedCustomerId]);

  // Payment Collection Modal
  const [collectModalOpen, setCollectModalOpen] = React.useState(false);
  const [paymentAmount, setPaymentAmount] = React.useState<number | string>(
    selectedCustomer?.currentDue || 0,
  );
  const [paymentAgencyId, setPaymentAgencyId] = React.useState<string>(
    currentAgency?.id || agencies[0]?.id || "",
  );
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(
    PaymentMethod.CASH,
  );
  const [bankName, setBankName] = React.useState("");
  const [chequeNo, setChequeNo] = React.useState("");
  const [paymentNotes, setPaymentNotes] = React.useState("");
  const [isCollecting, setIsCollecting] = React.useState(false);
  const [collectionSuccess, setCollectionSuccess] = React.useState<any | null>(
    null,
  );
  const [collectionError, setCollectionError] = React.useState<string | null>(
    null,
  );

  // Automatically sync payment amount to current balance due when customer changes
  React.useEffect(() => {
    if (selectedCustomer) {
      setPaymentAmount(selectedCustomer.currentDue || 0);
    }
  }, [selectedCustomer?.id, selectedCustomer?.currentDue]);

  // Dynamically compute ledger statement from real customer invoices and collections
  const customerStatements = React.useMemo<StatementEntry[]>(() => {
    if (!selectedCustomer) return [];
    const matchingInvoices = (invoiceList || []).filter(
      (inv: any) => inv.customerId === selectedCustomer.id,
    );

    let currentBal = 0;
    const entries: StatementEntry[] = [];

    matchingInvoices
      .sort((a: any, b: any) => {
        const dateA = new Date(
          a.salesDate || a.createdAt || a.invoiceDate || 0,
        ).getTime();
        const dateB = new Date(
          b.salesDate || b.createdAt || b.invoiceDate || 0,
        ).getTime();
        return dateA - dateB;
      })
      .forEach((inv: any) => {
        const rawDate = inv.salesDate || inv.createdAt || inv.invoiceDate;
        const formattedDate = rawDate
          ? new Date(rawDate).toISOString().split("T")[0]
          : "2026-10-18";

        currentBal += inv.totalAmount || 0;
        entries.push({
          id: `inv-${inv.id}`,
          date: formattedDate,
          agencyCode:
            inv.agencyCode || inv.agency?.code || currentAgency?.code || "MAIN",
          type: "INVOICE",
          referenceNumber: inv.invoiceNo || "",
          debit: inv.totalAmount || 0,
          credit: 0,
          runningBalance: currentBal,
          notes: `Commercial Invoice (${inv.items?.length || inv.lines?.length || 1} line item${(inv.items?.length || inv.lines?.length || 1) > 1 ? "s" : ""})`,
        });

        if (inv.paidAmount && inv.paidAmount > 0) {
          currentBal -= inv.paidAmount;
          entries.push({
            id: `pay-${inv.id}`,
            date: formattedDate,
            agencyCode:
              inv.agencyCode ||
              inv.agency?.code ||
              currentAgency?.code ||
              "MAIN",
            type: "PAYMENT_COLLECTION",
            referenceNumber: inv.chalanNo
              ? `MR-${inv.chalanNo}`
              : `MR-${inv.invoiceNo}`,
            debit: 0,
            credit: inv.paidAmount,
            runningBalance: currentBal,
            notes: `Paid: ৳${inv.paidAmount.toLocaleString()}${inv.dueAmount > 0 ? ` (Remaining Due: ৳${inv.dueAmount.toLocaleString()})` : " (Full Settled)"}`,
          });
        }
      });

    return entries;
  }, [invoiceList, selectedCustomer, currentAgency]);

  // Filter statement entries if single agency view is selected
  const filteredStatement = customerStatements.filter((s) => {
    if (selectedViewAgency === "ALL") return true;
    const agencyObj = agencies.find((a) => a.id === selectedViewAgency);
    return agencyObj ? s.agencyCode === agencyObj.code : true;
  });

  // Customer Invoices & Due Breakdown
  const matchingCustomerInvoices = React.useMemo(() => {
    if (!selectedCustomer) return [];
    let list = (invoiceList || []).filter(
      (inv: any) => inv.customerId === selectedCustomer.id,
    );
    if (selectedViewAgency !== "ALL") {
      const agencyObj = agencies.find((a) => a.id === selectedViewAgency);
      if (agencyObj) {
        list = list.filter(
          (inv: any) =>
            inv.agencyId === selectedViewAgency ||
            inv.agencyCode === agencyObj.code,
        );
      }
    }
    return list.sort((a: any, b: any) => {
      const dateA = new Date(
        a.salesDate || a.createdAt || a.invoiceDate || 0,
      ).getTime();
      const dateB = new Date(
        b.salesDate || b.createdAt || b.invoiceDate || 0,
      ).getTime();
      return dateB - dateA;
    });
  }, [invoiceList, selectedCustomer, selectedViewAgency, agencies]);

  // Active view tab: 'statement' | 'invoices'
  const [activeViewTab, setActiveViewTab] = React.useState<
    "statement" | "invoices"
  >("statement");

  // Statement Pagination
  const [statementPage, setStatementPage] = React.useState(1);
  const [statementPageSize, setStatementPageSize] = React.useState(10);

  // Invoices Pagination
  const [invoicesPage, setInvoicesPage] = React.useState(1);
  const [invoicesPageSize, setInvoicesPageSize] = React.useState(10);

  React.useEffect(() => {
    setStatementPage(1);
    setInvoicesPage(1);
  }, [selectedCustomer?.id, selectedViewAgency]);

  const paginatedStatement = React.useMemo(
    () => paginateList(filteredStatement, statementPage, statementPageSize),
    [filteredStatement, statementPage, statementPageSize],
  );

  const paginatedCustomerInvoices = React.useMemo(
    () =>
      paginateList(matchingCustomerInvoices, invoicesPage, invoicesPageSize),
    [matchingCustomerInvoices, invoicesPage, invoicesPageSize],
  );

  // Filter customers by search
  const filteredCustomers = customerList.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalAggregateDue = customerList.reduce(
    (sum, c) => sum + (c.currentDue || 0),
    0,
  );

  // Submit Due Collection
  const handleCollectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    setIsCollecting(true);
    setCollectionError(null);

    try {
      const numPaid = Number(paymentAmount) || 0;
      const res = await collectCustomerPayment({
        customerId: selectedCustomer.id,
        agencyId: paymentAgencyId,
        amount: numPaid,
        paymentMethod,
        bankName,
        chequeNo,
        notes: paymentNotes,
      });

      if (!res.success) {
        setCollectionError(res.error || "Payment collection failed.");
      } else {
        setCollectionSuccess(res);

        // 1. Update customer in local state
        setCustomerList((prev) =>
          prev.map((c) =>
            c.id === selectedCustomer.id
              ? { ...c, currentDue: Math.max(0, (c.currentDue || 0) - numPaid) }
              : c,
          ),
        );

        // 2. Update settled invoices in local state
        if (res.settledInvoices && res.settledInvoices.length > 0) {
          setInvoiceList((prev) =>
            prev.map((inv) => {
              const settled = res.settledInvoices?.find(
                (s: any) => s.id === inv.id,
              );
              if (settled) {
                return {
                  ...inv,
                  paidAmount: settled.newPaid,
                  dueAmount: settled.newDue,
                  status:
                    settled.status === "PAID"
                      ? "PAID"
                      : settled.status === "VOID"
                        ? "VOID"
                        : "DUE",
                };
              }
              return inv;
            }),
          );
        }

        router.refresh();
      }
    } catch (err: any) {
      setCollectionError(
        err?.message || "Payment collection encountered an error.",
      );
    } finally {
      setIsCollecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-600 text-white shadow-sm">
              <BookOpenCheck className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {t.khata.title}
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {t.khata.subtitle}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setSelectedViewAgency("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedViewAgency === "ALL"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            {language === "bn" ? "সকল এজেন্সি একত্রিত" : "Consolidated Master"}
          </button>
          {agencies.map((agency) => (
            <button
              key={agency.id}
              onClick={() => setSelectedViewAgency(agency.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedViewAgency === agency.id
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {agency.code} {language === "bn" ? "অডিট" : "Audit"}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile 2-Step Segmented Navigation Control */}
      <div className="lg:hidden grid grid-cols-2 p-1.5 rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700/80 shadow-xs">
        <button
          type="button"
          onClick={() => setMobileKhataTab("customers")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 touch-manipulation cursor-pointer ${
            mobileKhataTab === "customers"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
          }`}
        >
          <Users className="h-4 w-4 text-purple-600" />
          <span>{language === "bn" ? "১. গ্রাহক তালিকা" : "1. Customers"}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-purple-600 text-white font-mono text-[10px] font-bold">
            {filteredCustomers.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMobileKhataTab("statement")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 touch-manipulation cursor-pointer ${
            mobileKhataTab === "statement"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
          }`}
        >
          <BookOpenCheck className="h-4 w-4 text-emerald-600" />
          <span>{language === "bn" ? "২. লেজার হিসাব" : "2. Statement"}</span>
          {selectedCustomer && (
            <span className="font-mono text-[10px] text-red-600 dark:text-red-400 font-bold truncate max-w-[70px]">
              ৳{selectedCustomer.currentDue.toLocaleString()}
            </span>
          )}
        </button>
      </div>

      {/* Main Grid: Left Customers List, Right Customer Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customers List (5 cols) */}
        <div
          className={`lg:col-span-5 space-y-4 ${mobileKhataTab === "customers" ? "block" : "hidden lg:block"}`}
        >
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder={t.khata.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2.5">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <p className="text-xs text-zinc-500">
                  No customer khatas found.
                </p>
                {isSuperAdmin && (
                  <Link
                    href="/admin/master-data"
                    className="inline-block text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline"
                  >
                    Add Customers in Master Data →
                  </Link>
                )}
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                const dueRatio =
                  cust.totalCreditLimit > 0
                    ? Math.round(
                        (cust.currentDue / cust.totalCreditLimit) * 100,
                      )
                    : 0;

                return (
                  <div
                    key={cust.id}
                    onClick={() => {
                      setSelectedCustomerId(cust.id);
                      setMobileKhataTab("statement");
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer touch-manipulation active:scale-[0.99] ${
                      isSelected
                        ? "border-purple-500/80 bg-purple-500/5 dark:bg-purple-950/20 shadow-sm ring-1 ring-purple-500/30"
                        : "border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {cust.name}
                        </div>
                        <div className="text-xs text-zinc-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                          <Truck className="h-3 w-3 text-zinc-400" />
                          <span>{cust.vehicleTypeFocus.replace("_", " ")}</span>
                          <span>•</span>
                          <a
                            href={`tel:${cust.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-mono text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                          >
                            <Phone className="h-2.5 w-2.5" />
                            <span>{cust.phone}</span>
                          </a>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold font-mono text-sm text-red-600 dark:text-red-400">
                          ৳{cust.currentDue.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          Limit: ৳{cust.totalCreditLimit.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Credit Utilization Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                        <span>
                          {language === "bn"
                            ? "ঋণসীমা ব্যবহার"
                            : "Credit Utilization"}
                        </span>
                        <span
                          className={
                            dueRatio > 80 ? "text-red-600 font-bold" : ""
                          }
                        >
                          {dueRatio}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            dueRatio > 80 ? "bg-red-600" : "bg-purple-600"
                          }`}
                          style={{ width: `${Math.min(100, dueRatio)}%` }}
                        />
                      </div>
                    </div>

                    {/* Mobile Tap Hint */}
                    <div className="lg:hidden mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                      <span>
                        {language === "bn"
                          ? "হিসাব ও স্টেটমেন্ট দেখতে ট্যাপ করুন"
                          : "Tap to view ledger & dues"}
                      </span>
                      <span>→</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Customer Khata Statement & Quick Collect (7 cols) */}
        <div
          className={`lg:col-span-7 space-y-6 ${mobileKhataTab === "statement" ? "block" : "hidden lg:block"}`}
        >
          {/* Mobile Back to Customers list header */}
          <div className="lg:hidden flex items-center justify-between p-1">
            <button
              type="button"
              onClick={() => setMobileKhataTab("customers")}
              className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer touch-manipulation active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>
                {language === "bn"
                  ? "গ্রাহক তালিকায় ফিরুন"
                  : "Back to Customers"}
              </span>
            </button>
            {selectedCustomer && (
              <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                {language === "bn" ? "মোট বাকি: " : "Due: "}৳
                {selectedCustomer.currentDue.toLocaleString()}
              </span>
            )}
          </div>

          {selectedCustomer ? (
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
              {/* Customer Profile Header */}
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                      {selectedCustomer.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700">
                      {selectedCustomer.district}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Proprietor: {selectedCustomer.proprietor || "N/A"} •
                    Address: {selectedCustomer.address}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {isSuperAdmin && (
                    <Link
                      href="/admin/master-data"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs shadow-sm cursor-pointer"
                    >
                      <Crown className="h-3.5 w-3.5" />
                      <span>Manage Credit & Master</span>
                    </Link>
                  )}

                  {canCollectPayment ? (
                    <button
                      onClick={() => {
                        setCollectionSuccess(null);
                        setCollectionError(null);
                        setPaymentAmount(selectedCustomer?.currentDue || 0);
                        setCollectModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Collect Due Payment</span>
                    </button>
                  ) : (
                    <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 text-xs font-medium">
                      Collection restricted to Cashier / Manager
                    </div>
                  )}

                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                    aria-label="Print Statement"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Outstanding Due Overview */}
              <div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-800 border-b border-zinc-200 dark:border-zinc-800 p-4 text-xs font-mono">
                <div>
                  <span className="text-zinc-500">Total Credit Limit</span>
                  <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">
                    ৳{selectedCustomer.totalCreditLimit.toLocaleString()}
                  </div>
                </div>
                <div className="pl-4">
                  <span className="text-zinc-500">Current Balance Due</span>
                  <div className="font-bold text-sm text-red-600 dark:text-red-400 mt-0.5">
                    ৳{selectedCustomer.currentDue.toLocaleString()}
                  </div>
                </div>
                <div className="pl-4">
                  <span className="text-zinc-500">Statement Scope</span>
                  <div className="font-bold text-sm text-purple-600 dark:text-purple-400 mt-0.5">
                    {selectedViewAgency === "ALL"
                      ? "CONSOLIDATED"
                      : "SCOPED AUDIT"}
                  </div>
                </div>
              </div>

              {/* Tab Switcher: Statement Ledger vs Customer Invoices */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveViewTab("statement")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      activeViewTab === "statement"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    Statement Ledger ({filteredStatement.length})
                  </button>
                  <button
                    onClick={() => setActiveViewTab("invoices")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      activeViewTab === "invoices"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>
                      Customer Invoices & Dues (
                      {matchingCustomerInvoices.length})
                    </span>
                  </button>
                </div>
              </div>

              {activeViewTab === "statement" ? (
                <>
                  {/* Transactions Ledger Table (Desktop) */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[560px]">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Agency</th>
                          <th className="py-2.5 px-3">Reference No</th>
                          <th className="py-2.5 px-3 text-right">Debit (৳)</th>
                          <th className="py-2.5 px-3 text-right">Credit (৳)</th>
                          <th className="py-2.5 px-3 text-right">
                            Balance (৳)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 font-medium">
                        {paginatedStatement.items.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-8 text-center text-zinc-400"
                            >
                              No statement entries found for this customer.
                            </td>
                          </tr>
                        ) : (
                          paginatedStatement.items.map((entry) => (
                            <tr
                              key={entry.id}
                              className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                            >
                              <td className="py-3 px-3 text-zinc-500 font-mono text-[11px]">
                                {entry.date}
                              </td>
                              <td className="py-3 px-3">
                                <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 font-bold">
                                  {entry.agencyCode}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                                {entry.referenceNumber}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-zinc-900 dark:text-zinc-100">
                                {entry.debit > 0
                                  ? `৳${entry.debit.toLocaleString()}`
                                  : "-"}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                                {entry.credit > 0
                                  ? `৳${entry.credit.toLocaleString()}`
                                  : "-"}
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                ৳{entry.runningBalance.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Transactions Ledger Cards (Mobile View) */}
                  <div className="sm:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                    {paginatedStatement.items.length === 0 ? (
                      <div className="p-8 text-center text-xs text-zinc-400">
                        {language === "bn"
                          ? "কোনো লেজার হিসাব পাওয়া যায়নি।"
                          : "No statement entries found for this customer."}
                      </div>
                    ) : (
                      paginatedStatement.items.map((entry) => {
                        const isInvoice = entry.type === "INVOICE";
                        return (
                          <div
                            key={entry.id}
                            className="p-3.5 space-y-2 bg-white dark:bg-zinc-900"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                    isInvoice
                                      ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900"
                                      : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                                  }`}
                                >
                                  {isInvoice
                                    ? language === "bn"
                                      ? "চালান"
                                      : "INVOICE"
                                    : language === "bn"
                                      ? "জমা"
                                      : "RECEIPT"}
                                </span>
                                <span className="font-mono text-zinc-900 dark:text-zinc-100 font-bold">
                                  {entry.referenceNumber}
                                </span>
                              </div>
                              <span className="text-[11px] font-mono text-zinc-400">
                                {entry.date}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-zinc-500 text-[11px] line-clamp-1">
                                {entry.notes}
                              </span>
                              <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-600 dark:text-zinc-400 shrink-0 ml-2">
                                {entry.agencyCode}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 font-mono text-xs">
                              <div>
                                <div className="text-[10px] text-zinc-400">
                                  {language === "bn" ? "ডেবিট/বাকি" : "Debit"}
                                </div>
                                <div className="font-bold text-zinc-900 dark:text-zinc-100">
                                  {entry.debit > 0
                                    ? `৳${entry.debit.toLocaleString()}`
                                    : "-"}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] text-zinc-400">
                                  {language === "bn" ? "ক্রেডিট/জমা" : "Credit"}
                                </div>
                                <div className="font-bold text-emerald-600 dark:text-emerald-400">
                                  {entry.credit > 0
                                    ? `৳${entry.credit.toLocaleString()}`
                                    : "-"}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-zinc-400">
                                  {language === "bn"
                                    ? "অবশিষ্ট জের"
                                    : "Balance"}
                                </div>
                                <div className="font-bold text-purple-600 dark:text-purple-400">
                                  ৳{entry.runningBalance.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Statement Ledger Pagination */}
                  <Pagination
                    currentPage={statementPage}
                    totalPages={paginatedStatement.totalPages}
                    totalItems={paginatedStatement.total}
                    pageSize={statementPageSize}
                    onPageChange={setStatementPage}
                    onPageSizeChange={(s) => {
                      setStatementPageSize(s);
                      setStatementPage(1);
                    }}
                    itemName="ledger entries"
                  />
                </>
              ) : (
                <>
                  {/* Customer Commercial Invoices Table (Desktop) */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[620px]">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                          <th className="py-2.5 px-3">Invoice & Chalan</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Agency</th>
                          <th className="py-2.5 px-3 text-right">Total (৳)</th>
                          <th className="py-2.5 px-3 text-right">Paid (৳)</th>
                          <th className="py-2.5 px-3 text-right">Due (৳)</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 font-medium">
                        {paginatedCustomerInvoices.items.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="py-8 text-center text-zinc-400"
                            >
                              No commercial invoices recorded for this customer.
                            </td>
                          </tr>
                        ) : (
                          paginatedCustomerInvoices.items.map((inv: any) => {
                            const rawDate =
                              inv.salesDate || inv.createdAt || inv.invoiceDate;
                            const formattedDate = rawDate
                              ? new Date(rawDate).toISOString().split("T")[0]
                              : "2026-10-18";
                            const isPaid =
                              Number(inv.dueAmount || 0) <= 0 ||
                              inv.status === "PAID";
                            return (
                              <tr
                                key={inv.id}
                                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                              >
                                <td className="py-3 px-3">
                                  <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                    {inv.invoiceNo}
                                  </div>
                                  <div className="text-[10px] text-zinc-400 font-mono">
                                    {inv.chalanNo}
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-zinc-500 font-mono text-[11px]">
                                  {formattedDate}
                                </td>
                                <td className="py-3 px-3">
                                  <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 font-bold">
                                    {inv.agencyCode ||
                                      inv.agency?.code ||
                                      "MAIN"}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                  ৳
                                  {Number(
                                    inv.totalAmount || 0,
                                  ).toLocaleString()}
                                </td>
                                <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                                  ৳
                                  {Number(inv.paidAmount || 0).toLocaleString()}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-red-600 dark:text-red-400">
                                  ৳{Number(inv.dueAmount || 0).toLocaleString()}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      isPaid
                                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                        : inv.status === "VOID"
                                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                          : Number(inv.paidAmount || 0) > 0
                                            ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800"
                                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                                    }`}
                                  >
                                    {isPaid
                                      ? "PAID"
                                      : Number(inv.paidAmount || 0) > 0
                                        ? "PARTIAL"
                                        : "DUE"}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <Link
                                    href={`/invoices/${inv.id}/print`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                                  >
                                    <span>Print</span>
                                    <ArrowUpRight className="h-3 w-3" />
                                  </Link>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Customer Commercial Invoices Cards (Mobile View) */}
                  <div className="sm:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                    {paginatedCustomerInvoices.items.length === 0 ? (
                      <div className="p-8 text-center text-xs text-zinc-400">
                        {language === "bn"
                          ? "কোনো বাণিজ্যিক চালান পাওয়া যায়নি।"
                          : "No commercial invoices recorded for this customer."}
                      </div>
                    ) : (
                      paginatedCustomerInvoices.items.map((inv: any) => {
                        const rawDate =
                          inv.salesDate || inv.createdAt || inv.invoiceDate;
                        const formattedDate = rawDate
                          ? new Date(rawDate).toISOString().split("T")[0]
                          : "2026-10-18";
                        const isPaid =
                          Number(inv.dueAmount || 0) <= 0 ||
                          inv.status === "PAID";
                        return (
                          <div
                            key={inv.id}
                            className="p-3.5 space-y-2.5 bg-white dark:bg-zinc-900"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                  {inv.invoiceNo}
                                </div>
                                <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                                  {inv.chalanNo} • {formattedDate}
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                  isPaid
                                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                    : inv.status === "VOID"
                                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                      : Number(inv.paidAmount || 0) > 0
                                        ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800"
                                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                                }`}
                              >
                                {isPaid
                                  ? "PAID"
                                  : Number(inv.paidAmount || 0) > 0
                                    ? "PARTIAL"
                                    : "DUE"}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 font-mono text-xs">
                              <div>
                                <div className="text-[10px] text-zinc-400">
                                  {language === "bn" ? "মোট" : "Total"}
                                </div>
                                <div className="font-bold text-zinc-900 dark:text-zinc-100">
                                  ৳
                                  {Number(
                                    inv.totalAmount || 0,
                                  ).toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] text-zinc-400">
                                  {language === "bn" ? "পরিশোধ" : "Paid"}
                                </div>
                                <div className="font-bold text-emerald-600 dark:text-emerald-400">
                                  ৳
                                  {Number(inv.paidAmount || 0).toLocaleString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-zinc-400">
                                  {language === "bn" ? "বাকি" : "Due"}
                                </div>
                                <div className="font-bold text-red-600 dark:text-red-400">
                                  ৳{Number(inv.dueAmount || 0).toLocaleString()}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-600 dark:text-zinc-400">
                                {inv.agencyCode || inv.agency?.code || "MAIN"}
                              </span>
                              <Link
                                href={`/invoices/${inv.id}/print`}
                                target="_blank"
                                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 cursor-pointer touch-manipulation"
                              >
                                <span>
                                  {language === "bn"
                                    ? "প্রিন্ট চালান"
                                    : "Print Invoice"}
                                </span>
                                <ArrowUpRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Customer Invoices Pagination */}
                  <Pagination
                    currentPage={invoicesPage}
                    totalPages={paginatedCustomerInvoices.totalPages}
                    totalItems={paginatedCustomerInvoices.total}
                    pageSize={invoicesPageSize}
                    onPageChange={setInvoicesPage}
                    onPageSizeChange={(s) => {
                      setInvoicesPageSize(s);
                      setInvoicesPage(1);
                    }}
                    itemName="customer invoices"
                  />
                </>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-400">
              Select a customer to view ledger.
            </div>
          )}
        </div>
      </div>

      {/* Quick Collect Due Modal */}
      {collectModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setCollectModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
        >
          <div className="w-full max-w-md max-h-[90dvh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
            {/* Mobile swipe grab handle */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto my-2 sm:hidden shrink-0" />

            {/* Pinned Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 sm:p-6 shrink-0 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-2 rounded-xl bg-purple-600 text-white shadow-sm shrink-0">
                  <CreditCard className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
                    Collect Due Payment
                  </h3>
                  <p className="text-[11px] text-zinc-500 truncate">
                    {selectedCustomer?.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCollectModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer font-mono text-sm shrink-0 ml-2"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {collectionSuccess ? (
              <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span>Due Payment Recorded Successfully!</span>
                  </div>
                  <div className="space-y-1 font-mono text-emerald-900 dark:text-emerald-200 text-xs">
                    <p>• Money Receipt No: {collectionSuccess.receiptNumber}</p>
                    <p>
                      • Amount Collected: ৳
                      {collectionSuccess.collectedAmount?.toLocaleString()}
                    </p>
                    <p>
                      • Remaining Customer Due: ৳
                      {Number(
                        selectedCustomer?.currentDue || 0,
                      ).toLocaleString()}
                    </p>
                    <p>
                      • New Agency Balance: ৳
                      {collectionSuccess.newAgencyBalance?.toLocaleString()}
                    </p>
                  </div>

                  {collectionSuccess.settledInvoices &&
                    collectionSuccess.settledInvoices.length > 0 && (
                      <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 space-y-1.5">
                        <p className="font-bold text-emerald-950 dark:text-emerald-100 text-xs">
                          Invoices Settled (
                          {collectionSuccess.settledInvoices.length}):
                        </p>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {collectionSuccess.settledInvoices.map((inv: any) => (
                            <div
                              key={inv.id}
                              className="flex items-center justify-between text-xs font-mono bg-white/70 dark:bg-zinc-900/70 p-2 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60"
                            >
                              <div>
                                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                  {inv.invoiceNo}
                                </span>
                                <span className="text-[10px] text-zinc-500 block">
                                  Applied: ৳
                                  {Number(inv.settledAmount).toLocaleString()} •
                                  Rem. Due: ৳
                                  {Number(inv.newDue).toLocaleString()}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  Number(inv.newDue) <= 0
                                    ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
                                    : "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300"
                                }`}
                              >
                                {Number(inv.newDue) <= 0
                                  ? "FULL PAID"
                                  : "PARTIAL"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
                <button
                  onClick={() => setCollectModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-xs sm:text-sm shadow-md"
                >
                  Close & Refresh
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleCollectSubmit}
                className="flex-1 min-h-0 flex flex-col overflow-hidden"
              >
                <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm flex-1 min-h-0 overflow-y-auto overscroll-contain">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Dealership Allocation
                    </label>
                    <select
                      value={paymentAgencyId}
                      onChange={(e) => setPaymentAgencyId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium text-base sm:text-sm"
                    >
                      {agencies.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                        Payment Amount (BDT)
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-500 font-mono">
                          Due:{" "}
                          <span className="font-bold text-red-600 dark:text-red-400">
                            ৳
                            {Number(
                              selectedCustomer?.currentDue || 0,
                            ).toLocaleString()}
                          </span>
                        </span>
                        {Number(selectedCustomer?.currentDue || 0) > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setPaymentAmount(selectedCustomer.currentDue)
                            }
                            className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold hover:bg-purple-200 dark:hover:bg-purple-900 cursor-pointer transition-colors"
                          >
                            Set Full Due
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="number"
                      value={paymentAmount === 0 ? "" : paymentAmount}
                      placeholder="0"
                      onFocus={handleNumericFocus}
                      onChange={(e) => {
                        const cleaned = cleanNumericString(e.target.value);
                        e.target.value = cleaned;
                        setPaymentAmount(cleaned === "" ? "" : Number(cleaned));
                      }}
                      onBlur={() => {
                        if (paymentAmount === "") setPaymentAmount(0);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono font-bold text-emerald-600 text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentMethod)
                      }
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium text-base sm:text-sm"
                    >
                      <option value={PaymentMethod.CASH}>
                        Cash on Counter
                      </option>
                      <option value={PaymentMethod.BANK_TRANSFER}>
                        Bank Transfer
                      </option>
                      <option value={PaymentMethod.BKASH}>
                        bKash Merchant
                      </option>
                      <option value={PaymentMethod.NAGAD}>Nagad</option>
                      <option value={PaymentMethod.CHEQUE}>Cheque</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Bank / Depository Account
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium text-base sm:text-sm"
                    />
                  </div>

                  {collectionError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 text-xs">
                      {collectionError}
                    </div>
                  )}
                </div>

                {/* Pinned Footer */}
                <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-800/90 backdrop-blur-xs shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setCollectModalOpen(false)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold cursor-pointer text-center text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCollecting}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md cursor-pointer disabled:opacity-50 text-center text-xs sm:text-sm"
                  >
                    {isCollecting ? "Posting Credit..." : "Confirm Collection"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
