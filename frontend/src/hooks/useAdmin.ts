"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface OrganizationUser {
  id: string;
  role: string;
  isPrimaryOwner: boolean;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    active: boolean;
  };
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  trialEndsAt: string | null;
  billingStatus: string | null;
  taxId: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  users?: OrganizationUser[];
  sequences?: Array<{
    id: string;
    type: string;
    prefix: string | null;
    currentNumber: number;
    year: number | null;
  }>;
}

export interface AdminMetrics {
  totalOrganizations: number;
  activeOrganizations: number;
  trialOrganizations: number;
  suspendedOrganizations: number;
  totalUsers: number;
  organizationsByPlan: Record<string, number>;
}

export function useOrganizations() {
  return useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: () =>
      api.get<Organization[]>('/admin/organizations').then((res) => res.data),
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: ['admin', 'organization', id],
    queryFn: () =>
      api.get<Organization>(`/admin/organizations/${id}`).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) =>
      api.post('/admin/organizations', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
}

export function useUpdateOrganizationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/organizations/${id}/status`, { status }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'organization'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
}

export function useUpdateOrganizationPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: string }) =>
      api.patch(`/admin/organizations/${id}/plan`, { plan }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'organization'] });
    },
  });
}

export function useAdminMetrics() {
  return useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: () =>
      api.get<AdminMetrics>('/admin/metrics').then((res) => res.data),
  });
}
