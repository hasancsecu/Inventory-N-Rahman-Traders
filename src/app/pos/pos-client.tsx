"use client";

import * as React from "react";
import {
  ShoppingCart,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Truck,
  CreditCard,
  Building2,
  Droplet,
  ShieldAlert,
  ArrowRight,
  Printer,
  Boxes,
  ArrowLeft,
} from "lucide-react";
import { createDealershipInvoice } from "@/actions/invoice";
import { AgencySummary } from "@/actions/agency";
import { UnitOfMeasure, PaymentMethod } from "@prisma/client";
import { AuthUser } from "@/lib/auth-types";
import {
  cleanNumericString,
  handleNumericFocus,
} from "@/components/ui/number-input";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";
import { toast } from "@/components/ui/toast";

interface PosClientProps {
  currentAgency: AgencySummary | null;
  agencies: AgencySummary[];
  customers: any[];
  products: any[];
  currentUser?: AuthUser;
}

interface CartItem {
  productId: string;
  productName: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  packaging: string;
  uom: UnitOfMeasure;
  unitLiters: number;
  totalLiters: number;
  unitRate: number;
  lineTotal: number;
  availableStock: number;
}

export function PosClient({
  currentAgency,
  agencies,
  customers,
  products,
  currentUser,
}: PosClientProps) {
  const { t, language, formatCurrency, formatNumber } = useLanguage();
  const canCreateInvoice = currentUser
    ? currentUser.role === "SUPER_ADMIN" ||
      currentUser.role === "AGENCY_MANAGER" ||
      currentUser.role === "CASHIER"
    : true;

  const canOverrideCredit = currentUser
    ? currentUser.role === "SUPER_ADMIN" ||
      currentUser.role === "AGENCY_MANAGER"
    : true;
  // Selected Customer
  const [selectedCustomerId, setSelectedCustomerId] = React.useState(
    customers[0]?.id || "",
  );
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Current line item under configuration
  const [selectedProductId, setSelectedProductId] = React.useState(
    products[0]?.id || "",
  );
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const availableBatches = selectedProduct?.batches || [];
  const [selectedBatchId, setSelectedBatchId] = React.useState(
    availableBatches[0]?.id || "",
  );

  React.useEffect(() => {
    if (availableBatches.length > 0) {
      setSelectedBatchId(availableBatches[0].id);
    }
  }, [selectedProductId]);

  const selectedBatch = availableBatches.find(
    (b: any) => b.id === selectedBatchId,
  );

  const [quantity, setQuantity] = React.useState<number | string>(1);
  const [unitRate, setUnitRate] = React.useState<number | string>(
    selectedBatch?.tradePrice || 0,
  );

  React.useEffect(() => {
    if (selectedBatch) {
      setUnitRate(selectedBatch.tradePrice);
    }
  }, [selectedBatchId]);

  // Cart Items - Starts clean, items added from live catalog
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);

  // Financials & Payment
  const [discount, setDiscount] = React.useState<number | string>(0);
  const [vatAmount, setVatAmount] = React.useState<number>(0);
  const [paidAmount, setPaidAmount] = React.useState<number | string>(0);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(
    PaymentMethod.CASH,
  );

  // Logistics / Chalan
  const [driverName, setDriverName] = React.useState<string>("");
  const [vehicleNumber, setVehicleNumber] = React.useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = React.useState<string>(
    selectedCustomer?.address || "",
  );
  const [notes, setNotes] = React.useState<string>("");
  const [allowCreditOverride, setAllowCreditOverride] =
    React.useState<boolean>(false);

  // Submissions state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = React.useState<any | null>(null);

  // Calculated Totals
  const subtotal = cartItems.reduce((acc, item) => acc + item.lineTotal, 0);
  const totalLiters = cartItems.reduce(
    (acc, item) => acc + item.totalLiters,
    0,
  );
  const numDiscount = Number(discount) || 0;
  const numPaid = Number(paidAmount) || 0;
  const totalAmount = Math.max(0, subtotal - numDiscount + vatAmount);
  const dueAmount = Math.max(0, totalAmount - numPaid);

  // Credit Risk Check
  const currentCustomerDue = selectedCustomer?.currentDue || 0;
  const creditLimit = selectedCustomer?.totalCreditLimit || 0;
  const projectedCustomerDue = currentCustomerDue + dueAmount;
  const isCreditBreached =
    creditLimit > 0 && projectedCustomerDue > creditLimit;
  const breachExcess = projectedCustomerDue - creditLimit;

  // Add Item to Cart
  const handleAddItem = () => {
    if (!selectedProduct || !selectedBatch) return;

    const numQty = Number(quantity) || 0;
    const numRate = Number(unitRate) || 0;

    if (numQty <= 0) {
      toast.warning(
        language === "bn"
          ? "পরিমাণ শূন্যের বেশি হতে হবে।"
          : "Quantity must be greater than zero.",
        { title: language === "bn" ? "সতর্কবার্তা" : "Quantity Warning" },
      );
      return;
    }

    if (numQty > selectedBatch.stockQuantity) {
      toast.error(
        language === "bn"
          ? `পর্যাপ্ত স্টক নেই! ব্যাচে অবশিষ্ট: ${selectedBatch.stockQuantity}`
          : `Insufficient stock! Available in batch: ${selectedBatch.stockQuantity}`,
        { title: language === "bn" ? "স্টক ঘাটতি" : "Stock Warning" },
      );
      return;
    }

    const newItem: CartItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      batchId: selectedBatch.id,
      batchNumber: selectedBatch.batchNumber,
      quantity: numQty,
      packaging: selectedProduct.packaging,
      uom: selectedProduct.uom,
      unitLiters: selectedProduct.litersPerUnit,
      totalLiters: numQty * selectedProduct.litersPerUnit,
      unitRate: numRate,
      lineTotal: numQty * numRate,
      availableStock: selectedBatch.stockQuantity,
    };

    setCartItems([...cartItems, newItem]);
    setQuantity(1);
  };

  // Mobile Step Navigation Tab ('items' or 'checkout')
  const [mobileTab, setMobileTab] = React.useState<"items" | "checkout">(
    "items",
  );

  const handleRemoveItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleUpdateItemQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;
    setCartItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const clampedQty = Math.min(newQty, item.availableStock || 9999);
        return {
          ...item,
          quantity: clampedQty,
          totalLiters: clampedQty * item.unitLiters,
          lineTotal: clampedQty * item.unitRate,
        };
      }),
    );
  };

  // Submit Invoice via Server Action
  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAgency) {
      setErrorMessage("Please select an active Dealership Agency first.");
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage("Please add at least one line item to the invoice.");
      return;
    }

    if (isCreditBreached && !allowCreditOverride) {
      setErrorMessage(
        `Credit Limit Breached by ৳${breachExcess.toLocaleString()}! Check "Allow Management Override" to proceed.`,
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await createDealershipInvoice({
        agencyId: currentAgency.id,
        customerId: selectedCustomerId,
        discount: Number(discount) || 0,
        vatAmount,
        paidAmount: Number(paidAmount) || 0,
        paymentMethod,
        driverName,
        vehicleNumber,
        deliveryAddress,
        notes,
        allowCreditOverride,
        items: cartItems.map((item) => ({
          productId: item.productId,
          batchId: item.batchId,
          quantity: item.quantity,
          packaging: item.packaging,
          uom: item.uom,
          unitLiters: item.unitLiters,
          unitRate: item.unitRate,
        })),
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to generate invoice.");
      } else {
        setSuccessReceipt(res);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Invoice generation encountered an error.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600 text-white shadow-sm">
              <ShoppingCart className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {t.pos.title}
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {language === "bn" ? "সক্রিয় ডিলারশিপ:" : "Agency Scope:"}{" "}
            <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
              {currentAgency?.name} ({currentAgency?.code})
            </span>{" "}
            •{" "}
            {language === "bn"
              ? "ডিলারশিপ ভিত্তিক স্বয়ংক্রিয় চালান সিকোয়েন্স সক্রিয়।"
              : "Sequential numbering enforced per dealership."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs">
            <span className="text-zinc-400">
              {language === "bn" ? "মোট লিটার:" : "Total Liters:"}
            </span>{" "}
            <strong className="font-mono text-red-600 dark:text-red-400">
              {formatNumber(totalLiters)} Ltr
            </strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs">
            <span className="text-zinc-400">
              {language === "bn" ? "আইটেম সংখ্যা:" : "Items Count:"}
            </span>{" "}
            <strong className="font-mono text-zinc-900 dark:text-zinc-100">
              {formatNumber(cartItems.length)}
            </strong>
          </div>
        </div>
      </div>

      {products.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-300">
          <span>
            {language === "bn"
              ? "ক্যাটালগ খালি। পিওএস বিলিংয়ের জন্য মাস্টার ডেটা থেকে পণ্য ও ব্যাচ যোগ করুন।"
              : "Catalog is empty. Add lubricant products and batches in Master Data to enable POS billing."}
          </span>
          <Link
            href="/admin/master-data"
            className="font-bold underline hover:text-amber-700 whitespace-nowrap"
          >
            {t.dashboard.openMasterData}
          </Link>
        </div>
      )}

      {/* Mobile 2-Step Segmented Navigation Control */}
      <div className="lg:hidden grid grid-cols-2 p-1.5 rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700/80 shadow-xs">
        <button
          type="button"
          onClick={() => setMobileTab("items")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 touch-manipulation cursor-pointer ${
            mobileTab === "items"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
          }`}
        >
          <ShoppingCart className="h-4 w-4 text-red-600" />
          <span>
            {language === "bn" ? "১. পণ্য ও কার্ট" : "1. Items & Cart"}
          </span>
          {cartItems.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold">
              {cartItems.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("checkout")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 touch-manipulation cursor-pointer ${
            mobileTab === "checkout"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
          }`}
        >
          <CreditCard className="h-4 w-4 text-emerald-600" />
          <span>
            {language === "bn" ? "২. গ্রাহক ও পরিশোধ" : "2. Pay & Bill"}
          </span>
          {totalAmount > 0 && (
            <span className="font-mono text-[10px] text-red-600 dark:text-red-400 font-bold">
              ৳{Number(totalAmount).toLocaleString()}
            </span>
          )}
        </button>
      </div>

      {/* Main Grid: Left (Builder & Cart) + Right (Customer & Financial Settlement) */}
      <form
        onSubmit={handleSubmitInvoice}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* LEFT COLUMN: Item Builder & Cart (8 cols) */}
        <div
          className={`lg:col-span-7 xl:col-span-8 space-y-6 ${mobileTab === "items" ? "block" : "hidden lg:block"}`}
        >
          {/* Line Item Selector Box */}
          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                <Boxes className="h-4 w-4 text-red-600" />
                {t.pos.selectProduct}
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {language === "bn"
                  ? "ডিলারশিপ পণ্য তালিকা"
                  : "Dealership Scoped Catalog"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {t.pos.selectProduct}
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                >
                  {products.length === 0 ? (
                    <option value="">
                      {language === "bn"
                        ? "ক্যাটালগে কোনো পণ্য নেই"
                        : "No products available in catalog"}
                    </option>
                  ) : (
                    products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.viscosityGrade.replace(/_/g, " ")})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Batch Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                  <span>{t.pos.selectBatch}</span>
                  {selectedBatch && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                      {language === "bn" ? "মজুত অবশিষ্ট:" : "Available:"}{" "}
                      {formatNumber(selectedBatch.stockQuantity)}{" "}
                      {selectedProduct?.uom === "LITERS"
                        ? language === "bn"
                          ? "লিটার"
                          : "Ltr"
                        : language === "bn"
                          ? "পিস"
                          : "Pcs"}
                    </span>
                  )}
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                >
                  {availableBatches.length === 0 ? (
                    <option value="">
                      {language === "bn"
                        ? "কোনো সক্রিয় ব্যাচ মজুত নেই"
                        : "No stock batches available"}
                    </option>
                  ) : (
                    availableBatches.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.batchNumber} • {language === "bn" ? "দর:" : "TP:"}{" "}
                        {formatCurrency(b.tradePrice)} (
                        {language === "bn" ? "স্টক:" : "Stock:"}{" "}
                        {formatNumber(b.stockQuantity)})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Quantity, Unit TP, Line Total preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs text-zinc-500 font-medium">
                  {t.pos.quantity}
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedBatch?.stockQuantity || 999}
                  value={quantity}
                  placeholder="1"
                  onFocus={handleNumericFocus}
                  onChange={(e) => {
                    const cleaned = cleanNumericString(e.target.value);
                    e.target.value = cleaned;
                    setQuantity(cleaned === "" ? "" : Number(cleaned));
                  }}
                  onBlur={() => {
                    if (!quantity || Number(quantity) < 1) setQuantity(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-500 font-medium">
                  {t.pos.unitRate}
                </label>
                <input
                  type="number"
                  value={unitRate}
                  placeholder="0"
                  onFocus={handleNumericFocus}
                  onChange={(e) => {
                    const cleaned = cleanNumericString(e.target.value);
                    e.target.value = cleaned;
                    setUnitRate(cleaned === "" ? "" : Number(cleaned));
                  }}
                  onBlur={() => {
                    if (unitRate === "") setUnitRate(0);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-500 font-medium">
                  {t.pos.totalLiters}
                </label>
                <div className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-sm font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  {selectedProduct
                    ? formatNumber(
                        (Number(quantity) || 0) * selectedProduct.litersPerUnit,
                      )
                    : 0}{" "}
                  L
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  {t.pos.addToCart}
                </button>
              </div>
            </div>
          </div>

          {/* Cart Items Table */}
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {t.pos.cartTitle} ({formatNumber(cartItems.length)})
              </h3>
              <span className="text-xs font-mono text-zinc-500">
                {t.common.subtotal}: {formatCurrency(subtotal)}
              </span>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[540px]">
                <thead className="bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 font-semibold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">{t.pos.colProduct}</th>
                    <th className="py-2.5 px-3 text-center">
                      {t.pos.packaging}
                    </th>
                    <th className="py-2.5 px-3 text-right">{t.pos.colQty}</th>
                    <th className="py-2.5 px-3 text-right">
                      {t.pos.colLiters}
                    </th>
                    <th className="py-2.5 px-3 text-right">{t.pos.colRate}</th>
                    <th className="py-2.5 px-3 text-right">{t.pos.colTotal}</th>
                    <th className="py-2.5 px-2 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 font-medium">
                  {cartItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-zinc-400"
                      >
                        {t.pos.cartEmptyDesc}
                      </td>
                    </tr>
                  ) : (
                    cartItems.map((item, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                      >
                        <td className="py-3 px-3">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 max-w-[220px] truncate">
                            {item.productName}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500">
                            {t.pos.colBatch}: {item.batchNumber}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px]">
                            {item.packaging.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {formatNumber(item.quantity)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-zinc-600 dark:text-zinc-400">
                          {formatNumber(item.totalLiters)} L
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {formatCurrency(item.unitRate)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(item.lineTotal)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards for Cart Items with Touch Steppers */}
            <div className="sm:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
              {cartItems.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 text-xs">
                  {t.pos.cartEmptyDesc}
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 space-y-2.5 bg-white dark:bg-zinc-900"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {item.productName}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                          {t.pos.colBatch}: {item.batchNumber} •{" "}
                          {item.packaging.replace("_", " ")}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer touch-manipulation"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      {/* Stepper for Quantity */}
                      <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 p-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateItemQuantity(idx, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 disabled:opacity-30 font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer active:scale-95 touch-manipulation"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-9 text-center font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateItemQuantity(idx, item.quantity + 1)
                          }
                          disabled={
                            item.quantity >= (item.availableStock || 9999)
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 disabled:opacity-30 font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer active:scale-95 touch-manipulation"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(item.lineTotal)}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {formatCurrency(item.unitRate)} × {item.quantity} (
                          {formatNumber(item.totalLiters)} L)
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Delivery & Chalan Details */}
          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              <Truck className="h-4 w-4 text-zinc-500" />
              {t.pos.logisticsTitle}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-500 font-medium">
                  {t.pos.vehicleNumber}
                </label>
                <input
                  type="text"
                  placeholder={t.pos.vehiclePlaceholder}
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-500 font-medium">
                  {t.pos.driverName}
                </label>
                <input
                  type="text"
                  placeholder={t.pos.driverPlaceholder}
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-500 font-medium">
                  {t.pos.deliveryAddress}
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Mobile Bottom Quick Checkout Bar when cart has items */}
          {cartItems.length > 0 && (
            <div className="lg:hidden p-4 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xl flex items-center justify-between gap-3 sticky bottom-20 z-20">
              <div className="min-w-0">
                <div className="text-[11px] text-zinc-400 dark:text-zinc-600 font-medium">
                  {cartItems.length} {language === "bn" ? "টি আইটেম" : "items"}{" "}
                  • {formatNumber(totalLiters)} L
                </div>
                <div className="text-base font-bold font-mono text-emerald-400 dark:text-emerald-600 truncate">
                  {formatCurrency(totalAmount)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileTab("checkout")}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer touch-manipulation active:scale-95 transition-all"
              >
                <span>
                  {language === "bn" ? "বিল পরিশোধে যান" : "Proceed to Pay"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Customer Khata, Credit Risk & Settlement (4 cols) */}
        <div
          className={`lg:col-span-5 xl:col-span-4 space-y-6 ${mobileTab === "checkout" ? "block" : "hidden lg:block"}`}
        >
          {/* Mobile Back to Items navigation header */}
          <div className="lg:hidden flex items-center justify-between p-1">
            <button
              type="button"
              onClick={() => setMobileTab("items")}
              className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer touch-manipulation active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>
                {language === "bn" ? "পণ্য তালিকায় ফিরুন" : "Back to Items"}
              </span>
            </button>
            <span className="text-xs font-mono font-bold text-zinc-500">
              {cartItems.length} {language === "bn" ? "আইটেম" : "items"} (
              {formatCurrency(totalAmount)})
            </span>
          </div>

          {/* Customer Selection & Credit Risk Alert */}
          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                <Building2 className="h-4 w-4 text-emerald-600" />
                {t.pos.customerKhataStatus}
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                {language === "bn" ? "ক্রস-এজেন্সি" : "Cross-Agency"}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {t.pos.selectCustomer}
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
              >
                {customers.length === 0 ? (
                  <option value="">
                    {language === "bn"
                      ? "কোনো গ্রাহক নিবন্ধিত নেই"
                      : "No customers registered yet"}
                  </option>
                ) : (
                  customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))
                )}
              </select>
            </div>

            {selectedCustomer && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">
                    {language === "bn" ? "যানবাহন ধরন:" : "Fleet Focus:"}
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {selectedCustomer.vehicleTypeFocus.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">{t.pos.creditLimit}:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(selectedCustomer.totalCreditLimit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">{t.pos.currentDue}:</span>
                  <span className="font-mono font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(selectedCustomer.currentDue)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-700 pt-1.5">
                  <span className="text-zinc-500">
                    {language === "bn"
                      ? "ইনভয়েস পরবর্তী মোট বাকি:"
                      : "Post-Invoice Due:"}
                  </span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(projectedCustomerDue)}
                  </span>
                </div>
              </div>
            )}

            {/* Credit Limit Breach Warning Alert */}
            {isCreditBreached && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 text-xs space-y-2 text-red-800 dark:text-red-300 animate-in fade-in">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      {language === "bn"
                        ? "ক্রেডিট সীমা অতিক্রান্ত!"
                        : "Credit Limit Breached!"}
                    </span>
                    <p className="text-[11px] mt-0.5">
                      {language === "bn"
                        ? `এই বিক্রয়ের ফলে অনুমোদিত ঋণসীমা ${formatCurrency(breachExcess)} অতিক্রম করবে।`
                        : `This sale exceeds the customer's maximum approved limit by ৳${breachExcess.toLocaleString()}.`}
                    </p>
                  </div>
                </div>

                {canOverrideCredit ? (
                  <label className="flex items-center gap-2 pt-1 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowCreditOverride}
                      onChange={(e) => setAllowCreditOverride(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <span>
                      {language === "bn"
                        ? "ম্যানেজার স্পেশাল ক্রেডিট অনুমোদন (ম্যানেজার / সুপার অ্যাডমিন)"
                        : "Authorize Management Override (Manager / Super Admin)"}
                    </span>
                  </label>
                ) : (
                  <div className="pt-1 text-[11px] font-semibold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {language === "bn"
                        ? "ম্যানেজার অনুমোদন আবশ্যক (ক্যাশিয়ার ক্রেডিট ওভাররাইড করতে পারেন না)"
                        : "Management Approval Required (Cashiers cannot override credit)"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment & Settlement Panel */}
          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-red-600" />
              {t.pos.financialSummary}
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>
                  {t.pos.subtotal} ({formatNumber(cartItems.length)}{" "}
                  {language === "bn" ? "আইটেম" : "items"}):
                </span>
                <span className="font-mono font-semibold">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">
                  {t.pos.tradeDiscount}
                </span>
                <div className="flex items-center gap-1">
                  <span>৳</span>
                  <input
                    type="number"
                    value={discount === 0 ? "" : discount}
                    placeholder="0"
                    onFocus={handleNumericFocus}
                    onChange={(e) => {
                      const cleaned = cleanNumericString(e.target.value);
                      e.target.value = cleaned;
                      setDiscount(cleaned === "" ? "" : Number(cleaned));
                    }}
                    onBlur={() => {
                      if (discount === "") setDiscount(0);
                    }}
                    className="w-24 px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-right font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-2 font-bold text-sm">
                <span className="text-zinc-900 dark:text-zinc-100">
                  {t.pos.netPayable}
                </span>
                <span className="font-mono text-red-600 dark:text-red-400">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* Immediate Payment Input */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {t.pos.receivedAmount}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPaidAmount(totalAmount)}
                      className="px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold cursor-pointer touch-manipulation active:scale-95"
                    >
                      ⚡ {language === "bn" ? "সম্পূর্ণ পরিশোধ" : "Full Paid"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaidAmount(0)}
                      className="px-2 py-0.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 text-[11px] font-bold cursor-pointer touch-manipulation active:scale-95"
                    >
                      {language === "bn" ? "বাকি (৳০)" : "Full Due (৳0)"}
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-mono">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={paidAmount === 0 ? "" : paidAmount}
                    placeholder="0"
                    onFocus={handleNumericFocus}
                    onChange={(e) => {
                      const cleaned = cleanNumericString(e.target.value);
                      e.target.value = cleaned;
                      setPaidAmount(cleaned === "" ? "" : Number(cleaned));
                    }}
                    onBlur={() => {
                      if (paidAmount === "") setPaidAmount(0);
                    }}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {t.pos.paymentMethod}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold"
                >
                  <option value={PaymentMethod.CASH}>{t.pos.methodCash}</option>
                  <option value={PaymentMethod.BANK_TRANSFER}>
                    {t.pos.methodBank}
                  </option>
                  <option value={PaymentMethod.BKASH}>
                    {t.pos.methodBkash}
                  </option>
                  <option value={PaymentMethod.NAGAD}>Nagad (MFS)</option>
                  <option value={PaymentMethod.CHEQUE}>
                    Cheque / Clearing
                  </option>
                </select>
              </div>

              <div className="flex justify-between items-center text-xs font-bold pt-1 border-t border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-500">{t.pos.dueBalance}</span>
                <span className="font-mono text-red-600 dark:text-red-400 text-sm">
                  {formatCurrency(dueAmount)}
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-400 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Action Button */}
            {!canCreateInvoice ? (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  {language === "bn"
                    ? "স্টোরকিপার মোড: ইনভয়েসিং শুধুমাত্র ক্যাশিয়ার ও ম্যানেজারের জন্য অনুমোদিত"
                    : "Storekeeper Mode: Invoicing restricted to Cashier & Manager"}
                </span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={
                  isSubmitting || (isCreditBreached && !allowCreditOverride)
                }
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-101"
              >
                {isSubmitting ? (
                  <span>{t.pos.processing}</span>
                ) : (
                  <>
                    <span>{t.pos.generateInvoice}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Success Receipt Modal */}
      {successReceipt && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSuccessReceipt(null);
              setCartItems([]);
            }
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
        >
          <div className="w-full max-w-lg max-h-[90dvh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
            {/* Mobile swipe grab handle */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto my-2 sm:hidden shrink-0" />

            {/* Header */}
            <div className="px-4 py-3 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shrink-0">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {t.pos.successTitle}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {t.pos.successDesc}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSuccessReceipt(null);
                  setCartItems([]);
                }}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-mono text-sm cursor-pointer shrink-0 ml-2"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Receipt Body */}
            <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain text-xs font-mono">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">
                    {language === "bn" ? "ডিলারশিপ কোড:" : "Dealership Code:"}
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {currentAgency?.code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">{t.pos.invoiceNumber}</span>
                  <span className="font-bold text-red-600 dark:text-red-400 text-sm">
                    {successReceipt.invoiceNo || "CTX-2026-0014"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">{t.pos.chalanNumber}</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {successReceipt.chalanNo || "CTX-CH-2026-0014"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">
                    {language === "bn"
                      ? "মোট লিটার বিক্রি:"
                      : "Total Volume Sold:"}
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {formatNumber(successReceipt.totalLiters || totalLiters)}{" "}
                    Ltr
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">{t.pos.paidAmount}</span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(successReceipt.paidAmount || paidAmount)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-700 pt-2">
                  <span className="text-zinc-500">{t.pos.remainingDue}</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(successReceipt.dueAmount || dueAmount)}
                  </span>
                </div>
              </div>

              {successReceipt.warning && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                  {successReceipt.warning}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
              <Link
                href={`/invoices/${successReceipt.id || "inv"}/print`}
                className="w-full sm:w-auto px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 font-bold text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer text-center"
              >
                <Printer className="h-4 w-4" />
                {t.pos.printBtn}
              </Link>
              <button
                onClick={() => {
                  setSuccessReceipt(null);
                  setCartItems([]);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs sm:text-sm hover:bg-black dark:hover:bg-white cursor-pointer shadow-md text-center"
              >
                {t.pos.newSaleBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
