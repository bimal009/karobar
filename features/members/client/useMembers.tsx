"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { unwrapQuery } from "@/lib/common/query-helpers"
import type { MemberInsert, MemberUpdate } from "@/lib/database/zod/members"
import {
  createMember,
  deleteMember,
  getMemberFormOptions,
  getMembers,
  updateMember,
  type MemberFormOptions,
  type MemberRow,
} from "../api/member.action"

const membersKey = (tenant: string) => ["members", tenant] as const
const memberOptionsKey = (tenant: string) => ["members", tenant, "options"] as const

export const useMembers = (tenant: string, initialData: MemberRow[] = []) => {
  return useQuery({
    queryKey: membersKey(tenant),
    queryFn: async () => unwrapQuery(await getMembers(tenant), "Failed to load members"),
    initialData,
  })
}

export const useMemberFormOptions = (tenant: string, initialData?: MemberFormOptions) => {
  return useQuery({
    queryKey: memberOptionsKey(tenant),
    queryFn: async () =>
      unwrapQuery(await getMemberFormOptions(tenant), "Failed to load member form options"),
    initialData,
  })
}

export const useCreateMember = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: MemberInsert) => createMember(tenant, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: membersKey(tenant) })
    },
  })
}

export const useUpdateMember = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MemberUpdate }) => updateMember(tenant, id, data),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: membersKey(tenant) })
    },
  })
}

export const useDeleteMember = (tenant: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMember(tenant, id),
    onSuccess: (res) => {
      if (!res.error) queryClient.invalidateQueries({ queryKey: membersKey(tenant) })
    },
  })
}
