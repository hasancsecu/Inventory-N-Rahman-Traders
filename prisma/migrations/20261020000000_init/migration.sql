CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "public"."ApplicationSegment" AS ENUM ('HEAVY_COMMERCIAL', 'PASSENGER_CAR', 'MOTORCYCLE_4T_2T', 'INDUSTRIAL', 'MARINE');

CREATE TYPE "public"."CustomerTransactionType" AS ENUM ('INVOICE', 'PAYMENT_COLLECTION', 'SALES_RETURN', 'DEBIT_ADJUSTMENT', 'CREDIT_ADJUSTMENT', 'OPENING_BALANCE');

CREATE TYPE "public"."DocumentType" AS ENUM ('INVOICE', 'CHALAN', 'MONEY_RECEIPT', 'PURCHASE_ORDER', 'DECANT_BATCH');

CREATE TYPE "public"."InvoiceStatus" AS ENUM ('PAID', 'PARTIAL', 'DUE', 'CANCELLED');

CREATE TYPE "public"."POStatus" AS ENUM ('DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');

CREATE TYPE "public"."PackagingType" AS ENUM ('DRUM_205L', 'BUCKET_20L', 'BUCKET_18L', 'CAN_5L', 'CAN_4L', 'CAN_3L', 'BOTTLE_1L', 'BOTTLE_0_8L', 'LOOSE_LITER');

CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CHEQUE', 'BKASH', 'NAGAD');

CREATE TYPE "public"."SupplierTransactionType" AS ENUM ('PURCHASE_BILL', 'PAYMENT', 'RETURN', 'ADJUSTMENT', 'OPENING_BALANCE');

CREATE TYPE "public"."UnitOfMeasure" AS ENUM ('LITERS', 'PIECES');

CREATE TYPE "public"."UserRole" AS ENUM ('SUPER_ADMIN', 'AGENCY_MANAGER', 'STOREKEEPER', 'CASHIER');

CREATE TYPE "public"."VehicleTypeFocus" AS ENUM ('BUS_FLEET', 'TRUCK_TRANSPORT', 'AUTO_WORKSHOP', 'RETAIL_SHOP', 'INDUSTRIAL_PLANT', 'INDIVIDUAL');

CREATE TYPE "public"."ViscosityGrade" AS ENUM ('SAE_20W_50', 'SAE_15W_40', 'SAE_10W_30', 'SAE_5W_30', 'SAE_0W_20', 'HYDRAULIC_68', 'HYDRAULIC_46', 'GEAR_85W_140', 'GEAR_80W_90', 'ATF_DEXRON_III', 'OTHER');

CREATE TABLE "public"."Agency" (
  "address" text NOT NULL,
  "bankAccountName" text,
  "bankAccountNo" text,
  "bankBranch" text,
  "bankName" text,
  "bankRoutingNo" text,
  "binNo" text NOT NULL,
  "brandColor" text DEFAULT '#0f766e' NOT NULL,
  "brandPrincipal" text NOT NULL,
  "code" text NOT NULL,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "district" text DEFAULT 'Dhaka' NOT NULL,
  "email" text,
  "id" text NOT NULL,
  "isActive" bool DEFAULT true NOT NULL,
  "logoUrl" text,
  "name" text NOT NULL,
  "officialFooter" text,
  "officialHeader" text,
  "phone" text NOT NULL,
  "tinNo" text,
  "tradeLicense" text NOT NULL,
  "updatedAt" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."Brand" (
  "country" text,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "description" text,
  "id" text NOT NULL,
  "isActive" bool DEFAULT true NOT NULL,
  "name" text NOT NULL,
  "updatedAt" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."BulkDecantingLog" (
  "agencyId" text NOT NULL,
  "costBasisPerLtr" float8 NOT NULL,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "decantedById" text,
  "drumCapacityLtr" float8 DEFAULT 205 NOT NULL,
  "id" text NOT NULL,
  "litersYielded" float8 NOT NULL,
  "notes" text,
  "sourceBatchId" text NOT NULL,
  "sourceDrumsCount" float8 NOT NULL,
  "sourceProductId" text NOT NULL,
  "targetBatchId" text NOT NULL,
  "targetProductId" text NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."Customer" (
  "address" text NOT NULL,
  "binNo" text,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "currentDue" float8 DEFAULT 0 NOT NULL,
  "district" text DEFAULT 'Dhaka' NOT NULL,
  "id" text NOT NULL,
  "isActive" bool DEFAULT true NOT NULL,
  "name" text NOT NULL,
  "notes" text,
  "phone" text NOT NULL,
  "proprietor" text,
  "secondaryPhone" text,
  "totalCreditLimit" float8 DEFAULT 0 NOT NULL,
  "tradeLicense" text,
  "updatedAt" timestamp(3) NOT NULL,
  "vehicleTypeFocus" "VehicleTypeFocus" DEFAULT 'BUS_FLEET'::"VehicleTypeFocus" NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."CustomerLedger" (
  "agencyId" text NOT NULL,
  "bankName" text,
  "chequeNo" text,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "credit" float8 DEFAULT 0 NOT NULL,
  "customerId" text NOT NULL,
  "debit" float8 DEFAULT 0 NOT NULL,
  "id" text NOT NULL,
  "notes" text,
  "paymentMethod" "PaymentMethod",
  "referenceId" text,
  "referenceNumber" text,
  "runningBalance" float8 NOT NULL,
  "transactionType" "CustomerTransactionType" NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."DocumentSequence" (
  "agencyId" text NOT NULL,
  "currentNumber" int4 DEFAULT 0 NOT NULL,
  "documentType" "DocumentType" NOT NULL,
  "id" text NOT NULL,
  "prefix" text NOT NULL,
  "updatedAt" timestamp(3) NOT NULL,
  "year" int4 NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."InventoryBatch" (
  "agencyId" text NOT NULL,
  "batchNumber" text NOT NULL,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "expiryDate" timestamp(3),
  "id" text NOT NULL,
  "initialQuantity" float8 NOT NULL,
  "isActive" bool DEFAULT true NOT NULL,
  "minAlertStock" float8 DEFAULT 5 NOT NULL,
  "mrp" float8 NOT NULL,
  "poNumber" text,
  "productId" text NOT NULL,
  "purchaseRate" float8 NOT NULL,
  "receivedDate" timestamp(3) DEFAULT (now()) NOT NULL,
  "stockQuantity" float8 NOT NULL,
  "supplierId" text,
  "tradePrice" float8 NOT NULL,
  "updatedAt" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."Invoice" (
  "agencyId" text NOT NULL,
  "chalanNo" text NOT NULL,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "creatorId" text,
  "customerId" text NOT NULL,
  "deliveryAddress" text,
  "discount" float8 DEFAULT 0 NOT NULL,
  "driverName" text,
  "dueAmount" float8 DEFAULT 0 NOT NULL,
  "id" text NOT NULL,
  "invoiceNo" text NOT NULL,
  "notes" text,
  "paidAmount" float8 DEFAULT 0 NOT NULL,
  "paymentMethod" "PaymentMethod" DEFAULT 'CASH'::"PaymentMethod" NOT NULL,
  "salesDate" timestamp(3) DEFAULT (now()) NOT NULL,
  "status" "InvoiceStatus" DEFAULT 'DUE'::"InvoiceStatus" NOT NULL,
  "subtotal" float8 NOT NULL,
  "totalAmount" float8 NOT NULL,
  "updatedAt" timestamp(3) NOT NULL,
  "vatAmount" float8 DEFAULT 0 NOT NULL,
  "vehicleNumber" text,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."InvoiceItem" (
  "batchId" text NOT NULL,
  "costRate" float8 NOT NULL,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "grossMargin" float8 NOT NULL,
  "id" text NOT NULL,
  "invoiceId" text NOT NULL,
  "lineTotal" float8 NOT NULL,
  "packaging" text NOT NULL,
  "productId" text NOT NULL,
  "quantity" float8 NOT NULL,
  "totalLiters" float8 NOT NULL,
  "unitLiters" float8 NOT NULL,
  "unitRate" float8 NOT NULL,
  "uom" "UnitOfMeasure" NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."LiftingTarget" (
  "achievedVolumeLiters" float8 DEFAULT 0 NOT NULL,
  "agencyId" text NOT NULL,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "id" text NOT NULL,
  "month" int4 NOT NULL,
  "notes" text,
  "targetVolumeLiters" float8 NOT NULL,
  "updatedAt" timestamp(3) NOT NULL,
  "year" int4 NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."PackagingMaster" (
  "code" text NOT NULL,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "defaultLiters" float8 NOT NULL,
  "description" text,
  "id" text NOT NULL,
  "isActive" bool DEFAULT true NOT NULL,
  "name" text NOT NULL,
  "uom" text DEFAULT 'PIECES' NOT NULL,
  "updatedAt" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."Product" (
  "agencyId" text NOT NULL,
  "applicationSegment" "ApplicationSegment" NOT NULL,
  "barcode" text,
  "brand" text NOT NULL,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "description" text,
  "id" text NOT NULL,
  "isActive" bool DEFAULT true NOT NULL,
  "isDecantable" bool DEFAULT false NOT NULL,
  "isLoose" bool DEFAULT false NOT NULL,
  "litersPerUnit" float8 NOT NULL,
  "minAlertStock" float8 DEFAULT 5 NOT NULL,
  "name" text NOT NULL,
  "packaging" text NOT NULL,
  "sku" text NOT NULL,
  "uom" "UnitOfMeasure" NOT NULL,
  "updatedAt" timestamp(3) NOT NULL,
  "viscosityGrade" text NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."PurchaseOrder" (
  "agencyId" text NOT NULL,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "id" text NOT NULL,
  "notes" text,
  "orderedDate" timestamp(3) DEFAULT (now()) NOT NULL,
  "poNumber" text NOT NULL,
  "receivedDate" timestamp(3),
  "status" "POStatus" DEFAULT 'DRAFT'::"POStatus" NOT NULL,
  "supplierId" text NOT NULL,
  "totalAmount" float8 NOT NULL,
  "updatedAt" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."PurchaseOrderItem" (
  "batchId" text,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "id" text NOT NULL,
  "orderedQty" float8 NOT NULL,
  "productId" text NOT NULL,
  "purchaseOrderId" text NOT NULL,
  "receivedQty" float8 DEFAULT 0 NOT NULL,
  "totalCost" float8 NOT NULL,
  "unitCost" float8 NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."RoleDefinition" (
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "description" text,
  "id" text NOT NULL,
  "isSystem" bool DEFAULT false NOT NULL,
  "name" text NOT NULL,
  "permissions" text[],
  "title" text NOT NULL,
  "updatedAt" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."Supplier" (
  "address" text NOT NULL,
  "agencyId" text NOT NULL,
  "code" text NOT NULL,
  "contactPerson" text,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "currentBalance" float8 DEFAULT 0 NOT NULL,
  "email" text,
  "id" text NOT NULL,
  "isActive" bool DEFAULT true NOT NULL,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "updatedAt" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."SupplierLedger" (
  "agencyId" text NOT NULL,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "credit" float8 DEFAULT 0 NOT NULL,
  "debit" float8 DEFAULT 0 NOT NULL,
  "id" text NOT NULL,
  "notes" text,
  "paymentMethod" "PaymentMethod",
  "referenceId" text,
  "referenceNumber" text,
  "runningBalance" float8 NOT NULL,
  "supplierId" text NOT NULL,
  "transactionType" "SupplierTransactionType" NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."User" (
  "avatarUrl" text,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "customRoleId" text,
  "defaultAgencyId" text,
  "email" text NOT NULL,
  "id" text NOT NULL,
  "isActive" bool DEFAULT true NOT NULL,
  "name" text NOT NULL,
  "passwordHash" text,
  "role" "UserRole" DEFAULT 'STOREKEEPER'::"UserRole" NOT NULL,
  "updatedAt" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."UserAgencyAccess" (
  "agencyId" text NOT NULL,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "id" text NOT NULL,
  "isPrimary" bool DEFAULT false NOT NULL,
  "role" "UserRole" DEFAULT 'STOREKEEPER'::"UserRole" NOT NULL,
  "updatedAt" timestamp(3) NOT NULL,
  "userId" text NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."ViscosityMaster" (
  "code" text NOT NULL,
  "createdAt" timestamp(3) DEFAULT (now()) NOT NULL,
  "description" text,
  "id" text NOT NULL,
  "isActive" bool DEFAULT true NOT NULL,
  "name" text NOT NULL,
  "updatedAt" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE INDEX "Agency_code_idx" ON "public"."Agency" ("code");

CREATE UNIQUE INDEX "Agency_code_key" ON "public"."Agency" ("code");

CREATE INDEX "Brand_name_idx" ON "public"."Brand" ("name");

CREATE UNIQUE INDEX "Brand_name_key" ON "public"."Brand" ("name");

CREATE INDEX "BulkDecantingLog_agencyId_createdAt_idx" ON "public"."BulkDecantingLog" ("agencyId", "createdAt");

CREATE INDEX "Customer_currentDue_idx" ON "public"."Customer" ("currentDue");

CREATE INDEX "Customer_district_idx" ON "public"."Customer" ("district");

CREATE INDEX "Customer_phone_idx" ON "public"."Customer" ("phone");

CREATE INDEX "CustomerLedger_agencyId_createdAt_idx" ON "public"."CustomerLedger" ("agencyId", "createdAt");

CREATE INDEX "CustomerLedger_customerId_agencyId_createdAt_idx" ON "public"."CustomerLedger" ("customerId", "agencyId", "createdAt");

CREATE INDEX "CustomerLedger_referenceId_idx" ON "public"."CustomerLedger" ("referenceId");

CREATE INDEX "DocumentSequence_agencyId_documentType_idx" ON "public"."DocumentSequence" ("agencyId", "documentType");

CREATE UNIQUE INDEX "DocumentSequence_agencyId_documentType_year_key" ON "public"."DocumentSequence" ("agencyId", "documentType", "year");

CREATE UNIQUE INDEX "InventoryBatch_agencyId_productId_batchNumber_key" ON "public"."InventoryBatch" ("agencyId", "productId", "batchNumber");

CREATE INDEX "InventoryBatch_agencyId_stockQuantity_idx" ON "public"."InventoryBatch" ("agencyId", "stockQuantity");

CREATE INDEX "InventoryBatch_batchNumber_idx" ON "public"."InventoryBatch" ("batchNumber");

CREATE INDEX "InventoryBatch_productId_idx" ON "public"."InventoryBatch" ("productId");

CREATE INDEX "InventoryBatch_supplierId_idx" ON "public"."InventoryBatch" ("supplierId");

CREATE UNIQUE INDEX "Invoice_agencyId_chalanNo_key" ON "public"."Invoice" ("agencyId", "chalanNo");

CREATE UNIQUE INDEX "Invoice_agencyId_invoiceNo_key" ON "public"."Invoice" ("agencyId", "invoiceNo");

CREATE INDEX "Invoice_agencyId_salesDate_idx" ON "public"."Invoice" ("agencyId", "salesDate");

CREATE INDEX "Invoice_customerId_idx" ON "public"."Invoice" ("customerId");

CREATE INDEX "Invoice_status_idx" ON "public"."Invoice" ("status");

CREATE INDEX "InvoiceItem_batchId_idx" ON "public"."InvoiceItem" ("batchId");

CREATE INDEX "InvoiceItem_invoiceId_idx" ON "public"."InvoiceItem" ("invoiceId");

CREATE INDEX "InvoiceItem_productId_idx" ON "public"."InvoiceItem" ("productId");

CREATE UNIQUE INDEX "LiftingTarget_agencyId_month_year_key" ON "public"."LiftingTarget" ("agencyId", "month", "year");

CREATE INDEX "LiftingTarget_agencyId_year_month_idx" ON "public"."LiftingTarget" ("agencyId", "year", "month");

CREATE INDEX "PackagingMaster_code_idx" ON "public"."PackagingMaster" ("code");

CREATE UNIQUE INDEX "PackagingMaster_code_key" ON "public"."PackagingMaster" ("code");

CREATE INDEX "Product_agencyId_brand_idx" ON "public"."Product" ("agencyId", "brand");

CREATE UNIQUE INDEX "Product_agencyId_sku_key" ON "public"."Product" ("agencyId", "sku");

CREATE INDEX "Product_applicationSegment_idx" ON "public"."Product" ("applicationSegment");

CREATE INDEX "Product_packaging_idx" ON "public"."Product" ("packaging");

CREATE INDEX "Product_viscosityGrade_idx" ON "public"."Product" ("viscosityGrade");

CREATE INDEX "PurchaseOrder_agencyId_orderedDate_idx" ON "public"."PurchaseOrder" ("agencyId", "orderedDate");

CREATE UNIQUE INDEX "PurchaseOrder_agencyId_poNumber_key" ON "public"."PurchaseOrder" ("agencyId", "poNumber");

CREATE INDEX "PurchaseOrderItem_productId_idx" ON "public"."PurchaseOrderItem" ("productId");

CREATE INDEX "PurchaseOrderItem_purchaseOrderId_idx" ON "public"."PurchaseOrderItem" ("purchaseOrderId");

CREATE INDEX "RoleDefinition_name_idx" ON "public"."RoleDefinition" ("name");

CREATE UNIQUE INDEX "RoleDefinition_name_key" ON "public"."RoleDefinition" ("name");

CREATE UNIQUE INDEX "Supplier_agencyId_code_key" ON "public"."Supplier" ("agencyId", "code");

CREATE INDEX "Supplier_agencyId_idx" ON "public"."Supplier" ("agencyId");

CREATE INDEX "SupplierLedger_agencyId_createdAt_idx" ON "public"."SupplierLedger" ("agencyId", "createdAt");

CREATE INDEX "SupplierLedger_supplierId_agencyId_createdAt_idx" ON "public"."SupplierLedger" ("supplierId", "agencyId", "createdAt");

CREATE INDEX "User_email_idx" ON "public"."User" ("email");

CREATE UNIQUE INDEX "User_email_key" ON "public"."User" ("email");

CREATE INDEX "User_role_idx" ON "public"."User" ("role");

CREATE INDEX "UserAgencyAccess_agencyId_idx" ON "public"."UserAgencyAccess" ("agencyId");

CREATE UNIQUE INDEX "UserAgencyAccess_userId_agencyId_key" ON "public"."UserAgencyAccess" ("userId", "agencyId");

CREATE INDEX "UserAgencyAccess_userId_idx" ON "public"."UserAgencyAccess" ("userId");

CREATE INDEX "ViscosityMaster_code_idx" ON "public"."ViscosityMaster" ("code");

CREATE UNIQUE INDEX "ViscosityMaster_code_key" ON "public"."ViscosityMaster" ("code");

ALTER TABLE "public"."BulkDecantingLog"
ADD CONSTRAINT "BulkDecantingLog_agencyId_fkey"
FOREIGN KEY ("agencyId")
REFERENCES "public"."Agency" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "public"."BulkDecantingLog"
ADD CONSTRAINT "BulkDecantingLog_sourceProductId_fkey"
FOREIGN KEY ("sourceProductId")
REFERENCES "public"."Product" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "public"."BulkDecantingLog"
ADD CONSTRAINT "BulkDecantingLog_sourceBatchId_fkey"
FOREIGN KEY ("sourceBatchId")
REFERENCES "public"."InventoryBatch" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "public"."BulkDecantingLog"
ADD CONSTRAINT "BulkDecantingLog_targetProductId_fkey"
FOREIGN KEY ("targetProductId")
REFERENCES "public"."Product" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "public"."BulkDecantingLog"
ADD CONSTRAINT "BulkDecantingLog_targetBatchId_fkey"
FOREIGN KEY ("targetBatchId")
REFERENCES "public"."InventoryBatch" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "public"."BulkDecantingLog"
ADD CONSTRAINT "BulkDecantingLog_decantedById_fkey"
FOREIGN KEY ("decantedById")
REFERENCES "public"."User" ("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "public"."CustomerLedger"
ADD CONSTRAINT "CustomerLedger_customerId_fkey"
FOREIGN KEY ("customerId")
REFERENCES "public"."Customer" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "public"."CustomerLedger"
ADD CONSTRAINT "CustomerLedger_agencyId_fkey"
FOREIGN KEY ("agencyId")
REFERENCES "public"."Agency" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "public"."DocumentSequence"
ADD CONSTRAINT "DocumentSequence_agencyId_fkey"
FOREIGN KEY ("agencyId")
REFERENCES "public"."Agency" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "public"."InventoryBatch"
ADD CONSTRAINT "InventoryBatch_agencyId_fkey"
FOREIGN KEY ("agencyId")
REFERENCES "public"."Agency" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "public"."InventoryBatch"
ADD CONSTRAINT "InventoryBatch_productId_fkey"
FOREIGN KEY ("productId")
REFERENCES "public"."Product" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "public"."InventoryBatch"
ADD CONSTRAINT "InventoryBatch_supplierId_fkey"
FOREIGN KEY ("supplierId")
REFERENCES "public"."Supplier" ("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "public"."Invoice"
ADD CONSTRAINT "Invoice_agencyId_fkey"
FOREIGN KEY ("agencyId")
REFERENCES "public"."Agency" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "public"."Invoice"
ADD CONSTRAINT "Invoice_customerId_fkey"
FOREIGN KEY ("customerId")
REFERENCES "public"."Customer" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "public"."Invoice"
ADD CONSTRAINT "Invoice_creatorId_fkey"
FOREIGN KEY ("creatorId")
REFERENCES "public"."User" ("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "public"."InvoiceItem"
ADD CONSTRAINT "InvoiceItem_invoiceId_fkey"
FOREIGN KEY ("invoiceId")
REFERENCES "public"."Invoice" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "public"."InvoiceItem"
ADD CONSTRAINT "InvoiceItem_productId_fkey"
FOREIGN KEY ("productId")
REFERENCES "public"."Product" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "public"."InvoiceItem"
ADD CONSTRAINT "InvoiceItem_batchId_fkey"
FOREIGN KEY ("batchId")
REFERENCES "public"."InventoryBatch" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "public"."LiftingTarget"
ADD CONSTRAINT "LiftingTarget_agencyId_fkey"
FOREIGN KEY ("agencyId")
REFERENCES "public"."Agency" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "public"."Product"
ADD CONSTRAINT "Product_agencyId_fkey"
FOREIGN KEY ("agencyId")
REFERENCES "public"."Agency" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "public"."PurchaseOrder"
ADD CONSTRAINT "PurchaseOrder_agencyId_fkey"
FOREIGN KEY ("agencyId")
REFERENCES "public"."Agency" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "public"."PurchaseOrder"
ADD CONSTRAINT "PurchaseOrder_supplierId_fkey"
FOREIGN KEY ("supplierId")
REFERENCES "public"."Supplier" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "public"."PurchaseOrderItem"
ADD CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey"
FOREIGN KEY ("purchaseOrderId")
REFERENCES "public"."PurchaseOrder" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "public"."PurchaseOrderItem"
ADD CONSTRAINT "PurchaseOrderItem_productId_fkey"
FOREIGN KEY ("productId")
REFERENCES "public"."Product" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "public"."PurchaseOrderItem"
ADD CONSTRAINT "PurchaseOrderItem_batchId_fkey"
FOREIGN KEY ("batchId")
REFERENCES "public"."InventoryBatch" ("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "public"."Supplier"
ADD CONSTRAINT "Supplier_agencyId_fkey"
FOREIGN KEY ("agencyId")
REFERENCES "public"."Agency" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "public"."SupplierLedger"
ADD CONSTRAINT "SupplierLedger_supplierId_fkey"
FOREIGN KEY ("supplierId")
REFERENCES "public"."Supplier" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "public"."SupplierLedger"
ADD CONSTRAINT "SupplierLedger_agencyId_fkey"
FOREIGN KEY ("agencyId")
REFERENCES "public"."Agency" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "public"."User"
ADD CONSTRAINT "User_customRoleId_fkey"
FOREIGN KEY ("customRoleId")
REFERENCES "public"."RoleDefinition" ("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "public"."UserAgencyAccess"
ADD CONSTRAINT "UserAgencyAccess_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "public"."User" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "public"."UserAgencyAccess"
ADD CONSTRAINT "UserAgencyAccess_agencyId_fkey"
FOREIGN KEY ("agencyId")
REFERENCES "public"."Agency" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
