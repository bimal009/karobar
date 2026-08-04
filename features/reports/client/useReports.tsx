"use client"

import { useQuery } from "@tanstack/react-query"

import {
  getCustomerReportData,
  getInventoryReportData,
  getInvoiceReportData,
  getProductReportData,
  getPurchaseReportData,
  getSalesReportData,
  getSupplierReportData,
  type CustomerReportRow,
  type InventoryReportData,
  type InvoiceRow,
  type ProductReportRow,
  type PurchaseReportData,
  type SalesReportData,
  type SupplierReportRow,
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
    queryFn: async () => {
      const res = await getSalesReportData(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })

const defaultPurchaseReportData: PurchaseReportData = { suppliers: [], totalOrders: 0, totalDue: 0 }

const purchaseReportKey = (tenant: string) => ["purchase-report", tenant] as const
export const usePurchaseReport = (tenant: string, initialData: PurchaseReportData = defaultPurchaseReportData) =>
  useQuery({
    queryKey: purchaseReportKey(tenant),
    queryFn: async () => {
      const res = await getPurchaseReportData(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
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
    queryFn: async () => {
      const res = await getInventoryReportData(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })

const invoiceReportKey = (tenant: string) => ["invoice-report", tenant] as const
export const useInvoiceReport = (tenant: string, initialData: InvoiceRow[] = []) =>
  useQuery({
    queryKey: invoiceReportKey(tenant),
    queryFn: async () => {
      const res = await getInvoiceReportData(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })

const supplierReportKey = (tenant: string) => ["supplier-report", tenant] as const
export const useSupplierReport = (tenant: string, initialData: SupplierReportRow[] = []) =>
  useQuery({
    queryKey: supplierReportKey(tenant),
    queryFn: async () => {
      const res = await getSupplierReportData(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })

const customerReportKey = (tenant: string) => ["customer-report", tenant] as const
export const useCustomerReport = (tenant: string, initialData: CustomerReportRow[] = []) =>
  useQuery({
    queryKey: customerReportKey(tenant),
    queryFn: async () => {
      const res = await getCustomerReportData(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })

const productReportKey = (tenant: string) => ["product-report", tenant] as const
export const useProductReport = (tenant: string, initialData: ProductReportRow[] = []) =>
  useQuery({
    queryKey: productReportKey(tenant),
    queryFn: async () => {
      const res = await getProductReportData(tenant)
      if (res.error || !res.data) throw new Error(res.message)
      return res.data
    },
    initialData,
  })
