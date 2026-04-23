"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useOrganization, useUpdateOrganizationStatus, useUpdateOrganizationPlan } from "@/hooks/useAdmin";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Building2, Users, CreditCard, FileText, Phone, MapPin } from "lucide-react";

const statusOptions = [
  { value: "TRIAL", label: "Trial" },
  { value: "ACTIVE", label: "Activa" },
  { value: "PAST_DUE", label: "Vencida" },
  { value: "SUSPENDED", label: "Suspendida" },
];

const planOptions = [
  { value: "BASIC", label: "Básico" },
  { value: "PRO", label: "Pro" },
];

const statusBadgeVariant: Record<string, "warning" | "success" | "danger" | "default"> = {
  TRIAL: "warning",
  ACTIVE: "success",
  PAST_DUE: "danger",
  SUSPENDED: "danger",
};

export default function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: org, isLoading } = useOrganization(id);
  const updateStatus = useUpdateOrganizationStatus();
  const updatePlan = useUpdateOrganizationPlan();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Organización no encontrada</p>
        <Button variant="outline" onClick={() => router.push("/admin/organizations")}>
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/organizations")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{org.name}</h2>
          <p className="text-sm text-muted-foreground">{org.slug}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">Información General</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Estado</p>
                  <Badge variant={statusBadgeVariant[org.status] ?? "default"} className="mt-0.5">
                    {org.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Plan</p>
                  <p className="text-sm font-semibold text-foreground">{org.plan}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">NIT</p>
                  <p className="text-sm font-semibold text-foreground">{org.taxId ?? "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Teléfono</p>
                  <p className="text-sm font-semibold text-foreground">{org.phone ?? "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Dirección</p>
                  <p className="text-sm font-semibold text-foreground">{org.address ?? "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Estado de facturación</p>
                  <p className="text-sm font-semibold text-foreground">{org.billingStatus ?? "—"}</p>
                </div>
              </div>
            </div>

            {org.trialEndsAt && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">Trial finaliza</p>
                <p className="text-sm font-semibold text-foreground">{formatDate(org.trialEndsAt)}</p>
              </div>
            )}

            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">Creada</p>
              <p className="text-sm font-semibold text-foreground">{formatDate(org.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">Acciones</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cambiar Estado
              </label>
              <Select
                value={org.status}
                options={statusOptions}
                onChange={(e) => updateStatus.mutate({ id: org.id, status: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cambiar Plan
              </label>
              <Select
                value={org.plan}
                options={planOptions}
                onChange={(e) => updatePlan.mutate({ id: org.id, plan: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Usuarios de la organización</h3>
          </div>
        </CardHeader>
        <CardContent>
          {org.users && org.users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Nombre</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Rol</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Primary Owner</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Unido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {org.users.map((ou: {
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
                  }) => (
                    <tr key={ou.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground">{ou.user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{ou.user.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{ou.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {ou.isPrimaryOwner ? (
                          <Badge variant="success">Sí</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(ou.joinedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">No hay usuarios en esta organización</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
