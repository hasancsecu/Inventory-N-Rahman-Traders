// Pure In-Memory Backend Store & Types (NO filesystem JSON storage)
// Serverless / Vercel-ready with zero demo seed data.

export interface StoredAgency {
  id: string;
  name: string;
  code: string;
  brandPrincipal: string;
  tradeLicense: string;
  binNo: string;
  tinNo?: string;
  address: string;
  district: string;
  phone: string;
  email: string;
  brandColor?: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNo: string;
  bankBranch: string;
  bankRoutingNo: string;
  isActive: boolean;
}

export interface StoredBatch {
  id: string;
  agencyId: string;
  productId: string;
  batchNumber: string;
  supplierId?: string;
  purchaseRate: number;
  tradePrice: number;
  mrp?: number;
  stockQuantity: number;
  initialQuantity?: number;
  minAlertStock: number;
  manufactureDate?: string;
  expiryDate?: string;
  receivedDate?: string;
  isActive: boolean;
}

export interface StoredProduct {
  id: string;
  agencyId: string;
  brand: string;
  name: string;
  sku: string;
  viscosityGrade: string;
  applicationSegment: string;
  packaging: string;
  uom: string;
  litersPerUnit: number;
  minAlertStock: number;
  isDecantable: boolean;
  isLoose: boolean;
  isActive: boolean;
  batches?: StoredBatch[];
}

export interface StoredBrand {
  id: string;
  name: string;
  country?: string;
  description?: string;
  isActive: boolean;
}

export interface StoredViscosityGrade {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface StoredPackagingType {
  id: string;
  code: string;
  name: string;
  defaultLiters: number;
  uom: string;
  description?: string;
  isActive: boolean;
}

export interface StoredCustomer {
  id: string;
  name: string;
  proprietor: string;
  phone: string;
  secondaryPhone?: string;
  address: string;
  district: string;
  vehicleTypeFocus: string;
  totalCreditLimit: number;
  currentDue: number;
  isActive: boolean;
}

export interface StoredInvoiceItem {
  id: string;
  productId: string;
  productName: string;
  batchId: string;
  batchNumber: string;
  packaging: string;
  uom: string;
  unitLiters: number;
  quantity: number;
  totalLiters: number;
  unitRate: number;
  fifoPurchaseRate: number;
  grossMargin: number;
  lineTotal: number;
}

export interface StoredInvoice {
  id: string;
  agencyId: string;
  agencyCode: string;
  customerId: string;
  customerName: string;
  phone?: string;
  deliveryDate?: string;
  invoiceNo: string;
  chalanNo: string;
  salesDate: string;
  driverName?: string;
  vehicleNumber?: string;
  deliveryAddress?: string;
  subtotal: number;
  discount: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  totalLiters: number;
  paymentMethod: string;
  status: "PAID" | "PARTIAL" | "DUE" | "CANCELLED" | "VOID";
  notes?: string;
  items: StoredInvoiceItem[];
}

export interface StoredCustomerLedger {
  id: string;
  customerId: string;
  agencyId: string;
  agencyCode: string;
  date: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  referenceNumber: string;
  invoiceId?: string;
  paymentMethod?: string;
  bankName?: string;
  chequeNo?: string;
  runningBalance: number;
  notes?: string;
}

export interface StoredSupplier {
  id: string;
  name: string;
  agencyId?: string;
  agencyCode?: string;
  code?: string;
  companyName?: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  brandPrincipal?: string;
  currentPayable: number;
  currentBalance?: number;
  isActive: boolean;
}

export interface StoredSupplierLedger {
  id: string;
  supplierId: string;
  agencyId: string;
  date: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  referenceNumber: string;
  purchaseOrderId?: string;
  runningBalance: number;
  notes?: string;
}

export interface StoredPurchaseItem {
  id?: string;
  productId: string;
  productName: string;
  batchNumber: string;
  packaging: string;
  uom?: string;
  unitLiters: number;
  quantity: number;
  totalLiters: number;
  unitCost: number;
  totalCost: number;
  tradePrice?: number;
  mrp?: number;
  lineTotal?: number;
}

export interface StoredPurchaseOrder {
  id: string;
  agencyId: string;
  agencyCode: string;
  supplierId: string;
  supplierName: string;
  poNumber: string;
  chalanNo?: string;
  orderDate: string;
  receivedDate?: string;
  subtotal?: number;
  transportCost?: number;
  otherExpenses?: number;
  totalAmount: number;
  paidAmount?: number;
  dueAmount?: number;
  totalLiters: number;
  status:
    | "DRAFT"
    | "ORDERED"
    | "PARTIALLY_RECEIVED"
    | "RECEIVED"
    | "PENDING"
    | "CANCELLED";
  paymentMethod?: string;
  notes?: string;
  items: StoredPurchaseItem[];
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: "SUPER_ADMIN" | "AGENCY_MANAGER" | "STOREKEEPER" | "CASHIER";
  roleTitle: string;
  customRoleId?: string;
  allowedAgencyIds: string[];
  activeAgencyId: string;
  permissions: string[];
  isActive: boolean;
}

export interface StoredRole {
  id: string;
  name: string;
  title: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  userCount?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AnalyticsQuery {
  agencyId?: string;
  timeframe?: "DAILY" | "MONTHLY" | "YEARLY";
  selectedDate?: string;
  selectedMonth?: number;
  selectedYear?: number;
}

export interface ComprehensiveAnalyticsResult {
  timeframe: "DAILY" | "MONTHLY" | "YEARLY";
  selectedDate: string;
  selectedMonth: number;
  selectedYear: number;
  agencyId?: string;

  buyMetrics: {
    totalAmount: number;
    totalLiters: number;
    orderCount: number;
    avgRatePerLiter: number;
    supplierBreakdown: { supplier: string; liters: number; amount: number }[];
    recentPurchases: StoredPurchaseOrder[];
  };

  sellMetrics: {
    totalRevenue: number;
    totalLiters: number;
    invoiceCount: number;
    avgSellingPricePerLiter: number;
    totalGrossProfit: number;
    grossMarginPercent: number;
    viscosityBreakdown: {
      grade: string;
      liters: number;
      revenue: number;
      share: number;
    }[];
    brandBreakdown: { brand: string; liters: number; revenue: number }[];
    recentSales: StoredInvoice[];
  };

  dueMetrics: {
    newDueCreated: number;
    dueCollected: number;
    netDueChange: number;
    totalOutstandingDue: number;
    collectionEfficiencyPercent: number;
    recentCollections: StoredCustomerLedger[];
  };

  timeline: {
    key: string;
    label: string;
    buyAmount: number;
    buyLiters: number;
    sellAmount: number;
    sellLiters: number;
    dueCollected: number;
  }[];
}

export function paginateList<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 10,
): PaginatedResponse<T> {
  const safePageSize = Math.max(
    1,
    Math.min(100, Math.floor(Number(pageSize)) || 10),
  );
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(
    Math.max(1, Math.floor(Number(page)) || 1),
    totalPages,
  );
  const startIndex = (safePage - 1) * safePageSize;
  const paginatedItems = items.slice(startIndex, startIndex + safePageSize);

  return {
    items: paginatedItems,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
}

// -----------------------------------------------------------------------------
// In-Memory Database Schema (Clean zero demo data; Super Admin only)
// -----------------------------------------------------------------------------

interface DatabaseSchema {
  agencies: StoredAgency[];
  products: StoredProduct[];
  batches: StoredBatch[];
  customers: StoredCustomer[];
  invoices: StoredInvoice[];
  customerLedgers: StoredCustomerLedger[];
  suppliers: StoredSupplier[];
  purchases: StoredPurchaseOrder[];
  liftingTargets: any[];
  brands: StoredBrand[];
  viscosityGrades: StoredViscosityGrade[];
  packagingTypes: StoredPackagingType[];
  users: StoredUser[];
  roles: StoredRole[];
}

declare global {
  // eslint-disable-next-line no-var
  var __lubriflowInMemoryDb: DatabaseSchema | undefined;
}

function getInitialDatabase(): DatabaseSchema {
  return {
    agencies: [],
    products: [],
    batches: [],
    customers: [],
    invoices: [],
    customerLedgers: [],
    suppliers: [],
    purchases: [],
    liftingTargets: [],
    brands: [],
    viscosityGrades: [],
    packagingTypes: [],
    users: [
      {
        id: "usr-super-admin",
        name: "Naimur Rahman (Proprietor)",
        email: "admin@nrahmantraders.com",
        role: "SUPER_ADMIN",
        roleTitle: "Super Admin (Proprietor)",
        allowedAgencyIds: ["*"],
        activeAgencyId: "",
        permissions: ["*"],
        isActive: true,
      },
    ],
    roles: [
      {
        id: "role-super-admin",
        name: "SUPER_ADMIN",
        title: "Super Admin (Proprietor)",
        description: "Unrestricted administrative and financial authority",
        permissions: ["*"],
        isSystem: true,
      },
      {
        id: "role-agency-manager",
        name: "AGENCY_MANAGER",
        title: "Agency Manager",
        description:
          "Full operational management for authorized dealership brand",
        permissions: [
          "pos:create_invoice",
          "pos:override_credit",
          "inventory:view",
          "inventory:decant",
          "khata:view",
          "khata:collect_due",
          "analytics:view",
          "agency:cross_switch",
        ],
        isSystem: true,
      },
      {
        id: "role-storekeeper",
        name: "STOREKEEPER",
        title: "Storekeeper & Warehouse Decanter",
        description: "Depot warehouse stock receipt and batch allocations",
        permissions: ["inventory:view", "inventory:decant", "inventory:adjust"],
        isSystem: true,
      },
      {
        id: "role-cashier",
        name: "CASHIER",
        title: "Counter Sales & Billing Cashier",
        description: "Retail POS chalan generation and due collections",
        permissions: ["pos:create_invoice", "khata:view", "khata:collect_due"],
        isSystem: true,
      },
    ],
  };
}

export function getDatabase(): DatabaseSchema {
  if (!globalThis.__lubriflowInMemoryDb) {
    globalThis.__lubriflowInMemoryDb = getInitialDatabase();
  }
  return globalThis.__lubriflowInMemoryDb;
}

// -----------------------------------------------------------------------------
// In-Memory Accessors (No disk I/O)
// -----------------------------------------------------------------------------

export function getStoredAgencies(): StoredAgency[] {
  return getDatabase().agencies.filter((a) => a.isActive);
}

export function getStoredAgencyById(id: string): StoredAgency | null {
  return getDatabase().agencies.find((a) => a.id === id) || null;
}

export function saveStoredAgency(agency: StoredAgency): StoredAgency {
  const db = getDatabase();
  const idx = db.agencies.findIndex((a) => a.id === agency.id);
  if (idx >= 0) {
    db.agencies[idx] = agency;
  } else {
    db.agencies.push(agency);
  }
  return agency;
}

export function deleteStoredAgency(id: string): boolean {
  const db = getDatabase();
  const agency = db.agencies.find((a) => a.id === id);
  if (agency) {
    agency.isActive = false;
    return true;
  }
  return false;
}

export function getStoredProducts(agencyId?: string): StoredProduct[] {
  const db = getDatabase();
  let products = db.products.filter((p) => p.isActive);
  if (agencyId && agencyId !== "ALL") {
    products = products.filter((p) => p.agencyId === agencyId);
  }
  return products.map((p) => ({
    ...p,
    batches: db.batches.filter((b) => b.productId === p.id && b.isActive),
  }));
}

export function getStoredProductById(id: string): StoredProduct | null {
  const db = getDatabase();
  const product = db.products.find((p) => p.id === id);
  if (!product) return null;
  return {
    ...product,
    batches: db.batches.filter((b) => b.productId === product.id && b.isActive),
  };
}

export function saveStoredProduct(product: StoredProduct): StoredProduct {
  const db = getDatabase();
  const idx = db.products.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    db.products[idx] = product;
  } else {
    db.products.push(product);
  }
  return product;
}

export function deleteStoredProduct(id: string): boolean {
  const db = getDatabase();
  const p = db.products.find((prod) => prod.id === id);
  if (p) {
    p.isActive = false;
    return true;
  }
  return false;
}

export function getStoredBatches(
  agencyId?: string,
): (StoredBatch & { productName: string; sku: string })[] {
  const db = getDatabase();
  let batches = db.batches.filter((b) => b.isActive);
  if (agencyId && agencyId !== "ALL") {
    batches = batches.filter((b) => b.agencyId === agencyId);
  }
  return batches.map((b) => {
    const prod = db.products.find((p) => p.id === b.productId);
    return {
      ...b,
      productName: prod?.name || "Unknown Product",
      sku: prod?.sku || "SKU-UNKNOWN",
    };
  });
}

export function getStoredBatchById(id: string): StoredBatch | null {
  return getDatabase().batches.find((b) => b.id === id) || null;
}

export function saveStoredBatch(batch: StoredBatch): StoredBatch {
  const db = getDatabase();
  const idx = db.batches.findIndex((b) => b.id === batch.id);
  if (idx >= 0) {
    db.batches[idx] = batch;
  } else {
    db.batches.push(batch);
  }
  return batch;
}

export function deleteStoredBatch(id: string): boolean {
  const db = getDatabase();
  const batch = db.batches.find((b) => b.id === id);
  if (batch) {
    batch.isActive = false;
    return true;
  }
  return false;
}

export function getStoredCustomers(): StoredCustomer[] {
  return getDatabase().customers.filter((c) => c.isActive);
}

export function getStoredCustomerById(id: string): StoredCustomer | null {
  return getDatabase().customers.find((c) => c.id === id) || null;
}

export function saveStoredCustomer(customer: StoredCustomer): StoredCustomer {
  const db = getDatabase();
  const idx = db.customers.findIndex((c) => c.id === customer.id);
  if (idx >= 0) {
    db.customers[idx] = customer;
  } else {
    db.customers.push(customer);
  }
  return customer;
}

export function deleteStoredCustomer(id: string): boolean {
  const db = getDatabase();
  const c = db.customers.find((cust) => cust.id === id);
  if (c) {
    c.isActive = false;
    return true;
  }
  return false;
}

export function getStoredInvoices(agencyId?: string): StoredInvoice[] {
  const db = getDatabase();
  let invoices = db.invoices;
  if (agencyId && agencyId !== "ALL") {
    invoices = invoices.filter((i) => i.agencyId === agencyId);
  }
  return invoices.sort(
    (a, b) => new Date(b.salesDate).getTime() - new Date(a.salesDate).getTime(),
  );
}

export function getStoredInvoiceById(id: string): StoredInvoice | null {
  return getDatabase().invoices.find((i) => i.id === id) || null;
}

export function saveStoredInvoice(invoice: StoredInvoice): StoredInvoice {
  const db = getDatabase();
  const idx = db.invoices.findIndex((i) => i.id === invoice.id);
  if (idx >= 0) {
    db.invoices[idx] = invoice;
  } else {
    db.invoices.unshift(invoice);
  }
  return invoice;
}

export function voidStoredInvoice(id: string): boolean {
  const db = getDatabase();
  const invoice = db.invoices.find((i) => i.id === id);
  if (invoice) {
    invoice.status = "VOID";
    return true;
  }
  return false;
}

export function getStoredCustomerLedgers(
  customerId?: string,
  agencyId?: string,
): StoredCustomerLedger[] {
  const db = getDatabase();
  let ledgers = db.customerLedgers;
  if (customerId && customerId !== "ALL") {
    ledgers = ledgers.filter((l) => l.customerId === customerId);
  }
  if (agencyId && agencyId !== "ALL") {
    ledgers = ledgers.filter((l) => l.agencyId === agencyId);
  }
  return ledgers.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function recordStoredCustomerPayment(data: {
  customerId: string;
  agencyId: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  bankName?: string;
  chequeNo?: string;
  notes?: string;
}): StoredCustomerLedger & {
  settledInvoices: {
    id: string;
    invoiceId: string;
    invoiceNo: string;
    settledAmount: number;
    newPaid: number;
    newDue: number;
    status: string;
  }[];
} {
  const db = getDatabase();
  const customer = db.customers.find((c) => c.id === data.customerId);
  const agency = db.agencies.find((a) => a.id === data.agencyId);

  const currentDue = customer?.currentDue || 0;
  const newDue = Math.max(0, currentDue - data.amount);
  if (customer) {
    customer.currentDue = newDue;
  }

  // FIFO Due Payment Settlement
  let remainingPayment = data.amount;
  const settledInvoices: {
    id: string;
    invoiceId: string;
    invoiceNo: string;
    settledAmount: number;
    newPaid: number;
    newDue: number;
    status: string;
  }[] = [];
  const customerInvoices = db.invoices
    .filter(
      (inv) =>
        inv.customerId === data.customerId &&
        inv.dueAmount > 0 &&
        inv.status !== "VOID" &&
        inv.status !== "CANCELLED",
    )
    .sort(
      (a, b) =>
        new Date(a.salesDate).getTime() - new Date(b.salesDate).getTime(),
    );

  for (const inv of customerInvoices) {
    if (remainingPayment <= 0) break;
    const allocate = Math.min(inv.dueAmount, remainingPayment);
    inv.paidAmount += allocate;
    inv.dueAmount -= allocate;
    remainingPayment -= allocate;

    if (inv.dueAmount <= 0) {
      inv.status = "PAID";
    } else {
      inv.status = "PARTIAL";
    }

    settledInvoices.push({
      id: inv.id,
      invoiceId: inv.id,
      invoiceNo: inv.invoiceNo,
      settledAmount: allocate,
      newPaid: inv.paidAmount,
      newDue: inv.dueAmount,
      status: inv.status,
    });
  }

  const refNo =
    data.referenceNumber ||
    `MR-${agency?.code || "CTX"}-${Date.now().toString().slice(-4)}`;
  const ledgerEntry: StoredCustomerLedger = {
    id: `ledg-pay-${Date.now()}`,
    customerId: data.customerId,
    agencyId: data.agencyId,
    agencyCode: agency?.code || "CTX",
    date: new Date().toISOString(),
    type: "CREDIT",
    amount: data.amount,
    referenceNumber: refNo,
    paymentMethod: data.paymentMethod,
    bankName: data.bankName,
    chequeNo: data.chequeNo,
    runningBalance: newDue,
    notes: data.notes || `Due payment receipt ${refNo}`,
  };

  db.customerLedgers.unshift(ledgerEntry);
  return {
    ...ledgerEntry,
    settledInvoices,
  };
}

export function getStoredSuppliers(agencyId?: string): StoredSupplier[] {
  const db = getDatabase();
  let suppliers = db.suppliers.filter((s) => s.isActive);
  if (agencyId && agencyId !== "ALL") {
    suppliers = suppliers.filter((s) => s.agencyId === agencyId);
  }
  return suppliers;
}

export function getStoredSupplierById(id: string): StoredSupplier | null {
  return getDatabase().suppliers.find((s) => s.id === id) || null;
}

export function saveStoredSupplier(supplier: StoredSupplier): StoredSupplier {
  const db = getDatabase();
  const idx = db.suppliers.findIndex((s) => s.id === supplier.id);
  if (idx >= 0) {
    db.suppliers[idx] = supplier;
  } else {
    db.suppliers.push(supplier);
  }
  return supplier;
}

export function deleteStoredSupplier(id: string): boolean {
  const db = getDatabase();
  const supplier = db.suppliers.find((s) => s.id === id);
  if (supplier) {
    supplier.isActive = false;
    return true;
  }
  return false;
}

export function getStoredPurchases(agencyId?: string): StoredPurchaseOrder[] {
  const db = getDatabase();
  let purchases = db.purchases;
  if (agencyId && agencyId !== "ALL") {
    purchases = purchases.filter((p) => p.agencyId === agencyId);
  }
  return purchases.sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
  );
}

export function saveStoredPurchase(
  purchase: StoredPurchaseOrder,
): StoredPurchaseOrder {
  const db = getDatabase();
  const idx = db.purchases.findIndex((p) => p.id === purchase.id);
  if (idx >= 0) {
    db.purchases[idx] = purchase;
  } else {
    db.purchases.unshift(purchase);
  }
  return purchase;
}

export function deleteStoredPurchase(id: string): boolean {
  const db = getDatabase();
  const idx = db.purchases.findIndex((p) => p.id === id);
  if (idx >= 0) {
    db.purchases.splice(idx, 1);
    return true;
  }
  return false;
}

export function getStoredUsers(): StoredUser[] {
  return getDatabase().users.filter((u) => u.isActive);
}

export function getStoredUserById(id: string): StoredUser | null {
  return getDatabase().users.find((u) => u.id === id) || null;
}

export function getStoredUserByEmail(email: string): StoredUser | null {
  const cleanEmail = email.trim().toLowerCase();
  return (
    getDatabase().users.find((u) => u.email.toLowerCase() === cleanEmail) ||
    null
  );
}

export function saveStoredUser(user: StoredUser): StoredUser {
  const db = getDatabase();
  const idx = db.users.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    db.users[idx] = user;
  } else {
    db.users.push(user);
  }
  return user;
}

export function toggleStoredUserStatus(id: string, isActive: boolean): boolean {
  const db = getDatabase();
  const user = db.users.find((u) => u.id === id);
  if (user) {
    user.isActive = isActive;
    return true;
  }
  return false;
}

export function getStoredRoles(): StoredRole[] {
  const db = getDatabase();
  return db.roles.map((r) => ({
    ...r,
    userCount: db.users.filter((u) => u.role === r.name).length,
  }));
}

export function saveStoredRole(role: StoredRole): StoredRole {
  const db = getDatabase();
  const idx = db.roles.findIndex((r) => r.id === role.id);
  if (idx >= 0) {
    db.roles[idx] = role;
  } else {
    db.roles.push(role);
  }
  return role;
}

export function getStoredBrands(): StoredBrand[] {
  return getDatabase().brands.filter((b) => b.isActive);
}

export function saveStoredBrand(brand: StoredBrand): StoredBrand {
  const db = getDatabase();
  const idx = db.brands.findIndex((b) => b.id === brand.id);
  if (idx >= 0) {
    db.brands[idx] = brand;
  } else {
    db.brands.push(brand);
  }
  return brand;
}

export function deleteStoredBrand(id: string): boolean {
  const db = getDatabase();
  const brand = db.brands.find((b) => b.id === id);
  if (brand) {
    brand.isActive = false;
    return true;
  }
  return false;
}

export function getStoredViscosityGrades(): StoredViscosityGrade[] {
  return getDatabase().viscosityGrades.filter((v) => v.isActive);
}

export function saveStoredViscosityGrade(
  visc: StoredViscosityGrade,
): StoredViscosityGrade {
  const db = getDatabase();
  const idx = db.viscosityGrades.findIndex((v) => v.id === visc.id);
  if (idx >= 0) {
    db.viscosityGrades[idx] = visc;
  } else {
    db.viscosityGrades.push(visc);
  }
  return visc;
}

export function deleteStoredViscosityGrade(id: string): boolean {
  const db = getDatabase();
  const v = db.viscosityGrades.find((item) => item.id === id);
  if (v) {
    v.isActive = false;
    return true;
  }
  return false;
}

export function getStoredPackagingTypes(): StoredPackagingType[] {
  return getDatabase().packagingTypes.filter((p) => p.isActive);
}

export function saveStoredPackagingType(
  pkg: StoredPackagingType,
): StoredPackagingType {
  const db = getDatabase();
  const idx = db.packagingTypes.findIndex((p) => p.id === pkg.id);
  if (idx >= 0) {
    db.packagingTypes[idx] = pkg;
  } else {
    db.packagingTypes.push(pkg);
  }
  return pkg;
}

export function deleteStoredPackagingType(id: string): boolean {
  const db = getDatabase();
  const pkg = db.packagingTypes.find((p) => p.id === id);
  if (pkg) {
    pkg.isActive = false;
    return true;
  }
  return false;
}

// -----------------------------------------------------------------------------
// Pagination Helpers
// -----------------------------------------------------------------------------

export function getPaginatedStoredProducts(params: {
  page?: number;
  pageSize?: number;
  agencyId?: string;
  search?: string;
  brand?: string;
  viscosityGrade?: string;
}): PaginatedResponse<StoredProduct> {
  let list = getStoredProducts(params.agencyId);
  if (params.brand && params.brand !== "ALL") {
    list = list.filter(
      (p) => p.brand.toLowerCase() === params.brand?.toLowerCase(),
    );
  }
  if (params.viscosityGrade && params.viscosityGrade !== "ALL") {
    list = list.filter((p) => p.viscosityGrade === params.viscosityGrade);
  }
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q),
    );
  }
  return paginateList(list, params.page, params.pageSize);
}

export function getPaginatedStoredBatches(params: {
  page?: number;
  pageSize?: number;
  agencyId?: string;
  productId?: string;
  search?: string;
}): PaginatedResponse<StoredBatch & { productName: string; sku: string }> {
  let list = getStoredBatches(params.agencyId);
  if (params.productId && params.productId !== "ALL") {
    list = list.filter((b) => b.productId === params.productId);
  }
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter((b) => b.batchNumber.toLowerCase().includes(q));
  }
  return paginateList(list, params.page, params.pageSize);
}

export function getPaginatedStoredAgencies(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}): PaginatedResponse<StoredAgency> {
  let list = getStoredAgencies();
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.brandPrincipal.toLowerCase().includes(q),
    );
  }
  return paginateList(list, params.page, params.pageSize);
}

export function getPaginatedStoredBrands(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}): PaginatedResponse<StoredBrand> {
  let list = getStoredBrands();
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter((b) => b.name.toLowerCase().includes(q));
  }
  return paginateList(list, params.page, params.pageSize);
}

export function getPaginatedStoredViscosities(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}): PaginatedResponse<StoredViscosityGrade> {
  let list = getStoredViscosityGrades();
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (v) =>
        v.name.toLowerCase().includes(q) || v.code.toLowerCase().includes(q),
    );
  }
  return paginateList(list, params.page, params.pageSize);
}

export function getPaginatedStoredPackagingTypes(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}): PaginatedResponse<StoredPackagingType> {
  let list = getStoredPackagingTypes();
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
    );
  }
  return paginateList(list, params.page, params.pageSize);
}

export function getPaginatedStoredCustomers(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}): PaginatedResponse<StoredCustomer> {
  let list = getStoredCustomers();
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.proprietor.toLowerCase().includes(q) ||
        c.phone.includes(q),
    );
  }
  return paginateList(list, params.page, params.pageSize);
}

export function getPaginatedStoredInvoices(params: {
  page?: number;
  pageSize?: number;
  agencyId?: string;
  search?: string;
  status?: string;
}): PaginatedResponse<StoredInvoice> {
  let list = getStoredInvoices(params.agencyId);
  if (params.status && params.status !== "ALL") {
    list = list.filter((i) => i.status === params.status);
  }
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (i) =>
        i.invoiceNo.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q),
    );
  }
  return paginateList(list, params.page, params.pageSize);
}

export function getPaginatedStoredSuppliers(params: {
  page?: number;
  pageSize?: number;
  agencyId?: string;
  search?: string;
}): PaginatedResponse<StoredSupplier> {
  let list = getStoredSuppliers(params.agencyId);
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(q)),
    );
  }
  return paginateList(list, params.page, params.pageSize);
}

export function getPaginatedStoredUsers(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
}): PaginatedResponse<StoredUser> {
  let list = getStoredUsers();
  if (params.role && params.role !== "ALL") {
    list = list.filter((u) => u.role === params.role);
  }
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }
  return paginateList(list, params.page, params.pageSize);
}

export function getStoredComprehensiveAnalytics(
  query: AnalyticsQuery,
): ComprehensiveAnalyticsResult {
  const db = getDatabase();
  const agencyId =
    query.agencyId && query.agencyId !== "ALL" ? query.agencyId : undefined;
  const timeframe = query.timeframe || "MONTHLY";

  const now = new Date();
  const selectedYear = query.selectedYear || now.getFullYear();
  const selectedMonth = query.selectedMonth || now.getMonth() + 1;
  const selectedDate = query.selectedDate || now.toISOString().slice(0, 10);

  let purchases = db.purchases;
  if (agencyId) {
    purchases = purchases.filter((p) => p.agencyId === agencyId);
  }

  let invoices = db.invoices.filter((i) => i.status !== "VOID");
  if (agencyId) {
    invoices = invoices.filter((i) => i.agencyId === agencyId);
  }

  let ledgers = db.customerLedgers;
  if (agencyId) {
    ledgers = ledgers.filter((l) => l.agencyId === agencyId);
  }

  const isMatchPeriod = (dateStr: string): boolean => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dayStr = `${y}-${String(m).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    if (timeframe === "DAILY") {
      return dayStr === selectedDate;
    } else if (timeframe === "MONTHLY") {
      return y === selectedYear && m === selectedMonth;
    } else {
      return y === selectedYear;
    }
  };

  const periodPurchases = purchases.filter((p) => isMatchPeriod(p.orderDate));
  const periodInvoices = invoices.filter((i) => isMatchPeriod(i.salesDate));
  const periodCollections = ledgers.filter(
    (l) => l.type === "CREDIT" && isMatchPeriod(l.date),
  );
  const periodCreditSales = ledgers.filter(
    (l) => l.type === "DEBIT" && isMatchPeriod(l.date),
  );

  let totalBuyAmount = 0;
  let totalBuyLiters = 0;
  const supplierMap: Record<string, { liters: number; amount: number }> = {};

  periodPurchases.forEach((p) => {
    totalBuyAmount += p.totalAmount;
    totalBuyLiters += p.totalLiters;
    const sName = p.supplierName || "Other";
    if (!supplierMap[sName]) supplierMap[sName] = { liters: 0, amount: 0 };
    supplierMap[sName].liters += p.totalLiters;
    supplierMap[sName].amount += p.totalAmount;
  });

  let totalSellRevenue = 0;
  let totalSellLiters = 0;
  let totalGrossProfit = 0;
  const brandMap: Record<string, { liters: number; revenue: number }> = {};
  const viscMap: Record<string, { liters: number; revenue: number }> = {};

  periodInvoices.forEach((inv) => {
    totalSellRevenue += inv.totalAmount;
    totalSellLiters += inv.totalLiters;

    inv.items.forEach((item) => {
      const margin =
        item.grossMargin ||
        item.lineTotal - (item.fifoPurchaseRate || 0) * item.quantity;
      totalGrossProfit += margin;

      const bName = "Lubricants";
      if (!brandMap[bName]) brandMap[bName] = { liters: 0, revenue: 0 };
      brandMap[bName].liters += item.totalLiters;
      brandMap[bName].revenue += item.lineTotal;

      const vGrade = "All-Grades";
      if (!viscMap[vGrade]) viscMap[vGrade] = { liters: 0, revenue: 0 };
      viscMap[vGrade].liters += item.totalLiters;
      viscMap[vGrade].revenue += item.lineTotal;
    });
  });

  const grossMarginPercent =
    totalSellRevenue > 0
      ? Math.round((totalGrossProfit / totalSellRevenue) * 100)
      : 0;

  const customers = db.customers.filter((c) => c.isActive);
  const totalOutstandingDue = customers.reduce(
    (sum, c) => sum + (c.currentDue || 0),
    0,
  );
  const dueCollected = periodCollections.reduce((sum, c) => sum + c.amount, 0);
  const newDueCreated = periodCreditSales.reduce((sum, c) => sum + c.amount, 0);
  const netDueChange = newDueCreated - dueCollected;

  const timeline: {
    key: string;
    label: string;
    buyAmount: number;
    buyLiters: number;
    sellAmount: number;
    sellLiters: number;
    dueCollected: number;
  }[] = [];

  if (timeframe === "YEARLY") {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    monthNames.forEach((name, idx) => {
      const mNum = idx + 1;
      const pInMonth = purchases.filter((p) => {
        const d = new Date(p.orderDate);
        return d.getFullYear() === selectedYear && d.getMonth() + 1 === mNum;
      });
      const sInMonth = invoices.filter((i) => {
        const d = new Date(i.salesDate);
        return d.getFullYear() === selectedYear && d.getMonth() + 1 === mNum;
      });
      const cInMonth = ledgers.filter((l) => {
        const d = new Date(l.date);
        return (
          l.type === "CREDIT" &&
          d.getFullYear() === selectedYear &&
          d.getMonth() + 1 === mNum
        );
      });

      timeline.push({
        key: `month-${mNum}`,
        label: name,
        buyAmount: pInMonth.reduce((sum, p) => sum + p.totalAmount, 0),
        buyLiters: pInMonth.reduce((sum, p) => sum + p.totalLiters, 0),
        sellAmount: sInMonth.reduce((sum, s) => sum + s.totalAmount, 0),
        sellLiters: sInMonth.reduce((sum, s) => sum + s.totalLiters, 0),
        dueCollected: cInMonth.reduce((sum, c) => sum + c.amount, 0),
      });
    });
  } else if (timeframe === "MONTHLY") {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const intervals = [
      { label: "Week 1 (1-7)", start: 1, end: 7 },
      { label: "Week 2 (8-14)", start: 8, end: 14 },
      { label: "Week 3 (15-21)", start: 15, end: 21 },
      { label: `Week 4 (22-${daysInMonth})`, start: 22, end: daysInMonth },
    ];

    intervals.forEach((interval, idx) => {
      const pInPeriod = periodPurchases.filter((p) => {
        const d = new Date(p.orderDate).getDate();
        return d >= interval.start && d <= interval.end;
      });
      const sInPeriod = periodInvoices.filter((i) => {
        const d = new Date(i.salesDate).getDate();
        return d >= interval.start && d <= interval.end;
      });
      const cInPeriod = periodCollections.filter((c) => {
        const d = new Date(c.date).getDate();
        return d >= interval.start && d <= interval.end;
      });

      timeline.push({
        key: `week-${idx + 1}`,
        label: interval.label,
        buyAmount: pInPeriod.reduce((sum, p) => sum + p.totalAmount, 0),
        buyLiters: pInPeriod.reduce((sum, p) => sum + p.totalLiters, 0),
        sellAmount: sInPeriod.reduce((sum, s) => sum + s.totalAmount, 0),
        sellLiters: sInPeriod.reduce((sum, s) => sum + s.totalLiters, 0),
        dueCollected: cInPeriod.reduce((sum, c) => sum + c.amount, 0),
      });
    });
  } else {
    // DAILY
    timeline.push({
      key: "today",
      label: "Today",
      buyAmount: totalBuyAmount,
      buyLiters: totalBuyLiters,
      sellAmount: totalSellRevenue,
      sellLiters: totalSellLiters,
      dueCollected,
    });
  }

  return {
    timeframe,
    selectedDate,
    selectedMonth,
    selectedYear,
    agencyId,
    buyMetrics: {
      totalAmount: totalBuyAmount,
      totalLiters: Math.round(totalBuyLiters),
      orderCount: periodPurchases.length,
      avgRatePerLiter:
        totalBuyLiters > 0
          ? Math.round((totalBuyAmount / totalBuyLiters) * 10) / 10
          : 0,
      supplierBreakdown: Object.entries(supplierMap).map(([supplier, val]) => ({
        supplier,
        liters: Math.round(val.liters),
        amount: Math.round(val.amount),
      })),
      recentPurchases: periodPurchases.slice(0, 10),
    },
    sellMetrics: {
      totalRevenue: totalSellRevenue,
      totalLiters: Math.round(totalSellLiters),
      invoiceCount: periodInvoices.length,
      avgSellingPricePerLiter:
        totalSellLiters > 0
          ? Math.round((totalSellRevenue / totalSellLiters) * 10) / 10
          : 0,
      totalGrossProfit: Math.round(totalGrossProfit),
      grossMarginPercent,
      viscosityBreakdown: Object.entries(viscMap).map(([grade, val]) => ({
        grade,
        liters: Math.round(val.liters),
        revenue: Math.round(val.revenue),
        share:
          totalSellLiters > 0
            ? Math.round((val.liters / totalSellLiters) * 100)
            : 0,
      })),
      brandBreakdown: Object.entries(brandMap).map(([brand, val]) => ({
        brand,
        liters: Math.round(val.liters),
        revenue: Math.round(val.revenue),
      })),
      recentSales: periodInvoices.slice(0, 10),
    },
    dueMetrics: {
      newDueCreated,
      dueCollected,
      netDueChange,
      totalOutstandingDue,
      collectionEfficiencyPercent:
        newDueCreated > 0
          ? Math.round((dueCollected / newDueCreated) * 100)
          : 100,
      recentCollections: periodCollections.slice(0, 10),
    },
    timeline,
  };
}
