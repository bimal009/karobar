"use client"

import { useQuery } from "@tanstack/react-query"

import { unwrapQuery } from "@/lib/common/query-helpers"
import {
  getCustomerReportData,
  getInventoryReportData,
  getInvoiceReportData,
  getProductReportData,
  getPurchaseReportData,
  getSalesReportData,
  getSupplierReportData,
  type CustomerReportData,
  type InventoryReportData,
  type InvoiceReportData,
  type ProductReportData,
  type PurchaseReportData,
  type SalesReportData,
  type SupplierReportData,
} from "../api/reports.action"

const defaultSalesReportData: SalesReportData = {
  rows: [],
  newSales: 0,
  unitsSold: 0,
  ordersCount: 0,
  customersCount: 0,
  productOptions: [],
}

const salesReportKey = (tenant: string) => ["sales-report", tenant] as const
export const useSalesReport = (tenant: string, initialData: SalesReportData = defaultSalesReportData) =>
  useQuery({
    queryKey: salesReportKey(tenant),
    queryFn: async () => unwrapQuery(await getSalesReportData(tenant), "Failed to load sales report"),
    initialData,
  })

const defaultPurchaseReportData: PurchaseReportData = { suppliers: [], totalOrders: 0, totalDue: 0 }

const purchaseReportKey = (tenant: string) => ["purchase-report", tenant] as const
export const usePurchaseReport = (tenant: string, initialData: PurchaseReportData = defaultPurchaseReportData) =>
  useQuery({
    queryKey: purchaseReportKey(tenant),
    queryFn: async () =>
      unwrapQuery(await getPurchaseReportData(tenant), "Failed to load purchase report"),
    initialData,
  })

const defaultInventoryReportData: InventoryReportData = { products: [], outOfStock: 0, lowStock: 0, stockValue: 0 }

const inventoryReportKey = (tenant: string) => ["inventory-report", tenant] as const
export const useInventoryReport = (
  tenant: string,
  initialData: InventoryReportData = defaultInventoryReportData
) =>
  useQuery({
    queryKey: inventoryReportKey(tenant),
    queryFn: async () =>
      unwrapQuery(await getInventoryReportData(tenant), "Failed to load inventory report"),
    initialData,
  })

const defaultInvoiceReportData: InvoiceReportData = {
  rows: [],
  totalInvoices: 0,
  totalAmount: 0,
  paidCount: 0,
  dueCount: 0,
}

const invoiceReportKey = (tenant: string) => ["invoice-report", tenant] as const
export const useInvoiceReport = (tenant: string, initialData: InvoiceReportData = defaultInvoiceReportData) =>
  useQuery({
    queryKey: invoiceReportKey(tenant),
    queryFn: async () => unwrapQuery(await getInvoiceReportData(tenant), "Failed to load invoice report"),
    initialData,
  })

const defaultSupplierReportData: SupplierReportData = {
  rows: [],
  totalSuppliers: 0,
  activeSuppliers: 0,
  totalDue: 0,
  avgDue: 0,
}

const supplierReportKey = (tenant: string) => ["supplier-report", tenant] as const
export const useSupplierReport = (tenant: string, initialData: SupplierReportData = defaultSupplierReportData) =>
  useQuery({
    queryKey: supplierReportKey(tenant),
    queryFn: async () =>
      unwrapQuery(await getSupplierReportData(tenant), "Failed to load supplier report"),
    initialData,
  })

const defaultCustomerReportData: CustomerReportData = {
  rows: [],
  totalCustomers: 0,
  activeCustomers: 0,
  totalSpent: 0,
  avgSpent: 0,
}

const customerReportKey = (tenant: string) => ["customer-report", tenant] as const
export const useCustomerReport = (tenant: string, initialData: CustomerReportData = defaultCustomerReportData) =>
  useQuery({
    queryKey: customerReportKey(tenant),
    queryFn: async () =>
      unwrapQuery(await getCustomerReportData(tenant), "Failed to load customer report"),
    initialData,
  })

const defaultProductReportData: ProductReportData = {
  rows: [],
  totalProducts: 0,
  totalRevenue: 0,
  totalUnitsSold: 0,
  avgMargin: 0,
}

const productReportKey = (tenant: string) => ["product-report", tenant] as const
export const useProductReport = (tenant: string, initialData: ProductReportData = defaultProductReportData) =>
  useQuery({
    queryKey: productReportKey(tenant),
    queryFn: async () => unwrapQuery(await getProductReportData(tenant), "Failed to load product report"),
    initialData,
  })
