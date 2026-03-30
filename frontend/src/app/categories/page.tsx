"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
import type { CategoryPayload } from "@/hooks/useCategories";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Search, Plus, Trash2, FolderTree, Pencil, Package, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { useToast } from "@/contexts/ToastContext";
import { getApiErrorMessage } from "@/lib/api";

const PALETTE = [
  "from-primary/20 to-primary/5",
  "from-accent/20 to-accent/5",
  "from-emerald-500/20 to-emerald-500/5",
  "from-purple-500/20 to-purple-500/5",
  "from-cyan-500/20 to-cyan-500/5",
  "from-rose-500/20 to-rose-500/5",
];

export default function CategoriesPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryPayload>({});

  const { data, isLoading } = useCategories({ page, limit: 12, search: search || undefined });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const categories = data?.data || [];
  const meta = data?.meta;

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description ?? "",
      active: category.active,
      defaultTaxRate: category.defaultTaxRate ?? undefined,
    });
    setShowModal(true);
  };
  const handleCreate = () => { setEditingCategory(null); setFormData({ name: "", description: "" }); setShowModal(true); };
  const handleDelete = (id: string) => { setCategoryToDelete(id); setShowConfirmModal(true); };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory.mutateAsync(categoryToDelete);
        toast.success("Categoría eliminada correctamente");
        setShowConfirmModal(false);
        setCategoryToDelete(null);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "No se pudo eliminar la categoría. Verifica si tiene productos asociados."));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, data: formData });
        toast.success("Categoría actualizada correctamente");
      } else {
        await createCategory.mutateAsync(formData);
        toast.success("Categoría creada correctamente");
      }
      setShowModal(false);
      setFormData({});
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Error al guardar la categoría"));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 lg:space-y-7">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-7 rounded-full bg-primary shrink-0" />
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Categorías</h1>
              {meta && (
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  {meta.total}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground ml-4">Organiza tu catálogo de productos</p>
          </div>
          <Button onClick={handleCreate} className="w-full sm:w-auto shrink-0">
            <Plus className="w-4 h-4" /> Nueva Categoría
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50 border border-border/60">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categorías..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
                <FolderTree className="w-4 h-4 text-primary/50" />
              </div>
              <p className="text-xs text-muted-foreground">Cargando categorías...</p>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-64 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
              <FolderTree className="w-6 h-6 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No hay categorías</p>
            <p className="text-xs text-muted-foreground">Crea la primera categoría para empezar</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 stagger-children">
              {categories.map((category, i) => {
                const gradient = PALETTE[i % PALETTE.length];
                return (
                  <div
                    key={category.id}
                    className="group relative rounded-xl border border-border/60 bg-card p-4 cursor-pointer transition-all duration-200 hover:border-primary/25 hover:shadow-md hover:shadow-primary/5"
                    onClick={() => handleEdit(category)}
                  >
                    {/* Actions */}
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(category); }}
                        className="p-1.5 rounded-lg bg-card border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors shadow-sm"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(category.id); }}
                        className="p-1.5 rounded-lg bg-card border border-border/60 text-muted-foreground hover:text-red-500 hover:border-red-500/30 transition-colors shadow-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3",
                      gradient
                    )}>
                      <FolderTree className="w-5 h-5 text-foreground/70" />
                    </div>

                    <h3 className="text-sm font-semibold text-foreground mb-1 pr-14 leading-tight">
                      {category.name}
                    </h3>
                    {category.description ? (
                      <p className="text-xs text-muted-foreground line-clamp-2">{category.description}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground/40 italic">Sin descripción</p>
                    )}

                    {/* Tax rate & Product count */}
                    <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border/40">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span className={cn(
                          "text-xs font-medium",
                          (category.productCount ?? 0) > 0
                            ? "text-foreground/70"
                            : "text-muted-foreground/50"
                        )}>
                          {category.productCount ?? 0} {(category.productCount ?? 0) === 1 ? "producto" : "productos"}
                        </span>
                      </div>
                      {category.defaultTaxRate != null ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                          <Percent className="w-2.5 h-2.5" />
                          {category.defaultTaxRate}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/40">Sin impuesto</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button>
                <span className="text-xs text-muted-foreground px-2">{page} / {meta.totalPages}</span>
                <Button variant="secondary" disabled={page === meta.totalPages} onClick={() => setPage(page + 1)}>Siguiente</Button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCategory ? "Editar Categoría" : "Nueva Categoría"} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Descripción" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} textarea rows={4} />
          <div>
            <Input
              label="Impuesto por defecto (%)"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="Ej: 19"
              value={formData.defaultTaxRate ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ ...formData, defaultTaxRate: val === "" ? undefined : Number(val) });
              }}
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground/70">
              Se aplica automáticamente a productos nuevos de esta categoría
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-border/60">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button type="submit" loading={createCategory.isPending || updateCategory.isPending} className="w-full sm:w-auto">{editingCategory ? "Actualizar" : "Crear"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={confirmDelete} title="Eliminar Categoría" message="¿Estás seguro? Esta acción no se puede deshacer." confirmText="Eliminar" cancelText="Cancelar" />
    </DashboardLayout>
  );
}
