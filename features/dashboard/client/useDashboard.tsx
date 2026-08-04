"use client"

import { useQuery } from "@tanstack/react-query"

import { unwrapQuery } from "@/lib/common/query-helpers"
import { getDashboardData, getSalesDashboardData, type DashboardData, type SalesDashboardData } from "../api/dashboard.action"

const defaultDashboardData: DashboardData = {
  ordersCount: 0,
  customersCount: 0,
  suppliersCount: 0,
  lowStock: [],
  topProducts: [],
  categories: [],
  totalCategoryProducts: 0,
  revenueByDay: [],
  totalSales: 0,
  totalSalesReturn: 0,
  totalPurchase: 0,
  totalPurchaseReturn: 0,
  profit: 0,
  invoiceDue: 0,
  recentSales: [],
  topCustomers: [],
}

const dashboardKey = (tenant: string) => ["dashboard", tenant] as const
export const useDashboard = (tenant: string, initialData: DashboardData = defaultDashboardData) =>
  useQuery({
    queryKey: dashboardKey(tenant),
    queryFn: async () => unwrapQuery(await getDashboardData(tenant), "Failed to load dashboard data"),
    initialData,
  })

const defaultSalesDashboardData: SalesDashboardData = {
  userName: "",
  topProducts: [],
  weeklyEarning: 0,
  totalSales: 0,
  totalRevenue: 0,
  purchasedGoods: 0,
  salesByStore: [],
  maxStoreTotal: 1,
  recent: [],
  revenueByDay: [],
}

const salesDashboardKey = (tenant: string) => ["sales-dashboard", tenant] as const
export const useSalesDashboard = (
  tenant: string,
  initialData: SalesDashboardData = defaultSalesDashboardData
) =>
  useQuery({
    queryKey: salesDashboardKey(tenant),
    queryFn: async () =>
      unwrapQuery(await getSalesDashboardData(tenant), "Failed to load sales dashboard data"),
    initialData,
  })
