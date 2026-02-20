"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useUploadProductImage, useUploadProductImageById } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Select } from "@/components/ui/Select";
import { ProductCard } from "@/components/products/ProductCard";
import {
  Search,
  Plus,
  AlertTriangle,
  Filter,
  X,
} from "lucide-react";
import type { Product } from "@/types";
import { useToast } from "@/contexts/ToastContext";
import { getApiErrorMessage } from "@/lib/api";

export default function InventoryPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});

  const { data, isLoading } = useProducts({
    page: showLowStockOnly || selectedCategory ? 1 : page,
    limit: showLowStockOnly || selectedCategory ? 1000 : 10,
    search: search || undefined,
    categoryId: selectedCategory || undefined,
  });
  const { data: categoriesData } = useCategories();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const uploadProductImage = useUploadProductImage();
  const uploadProductImageById = useUploadProductImageById(editingProduct?.id || "");

  const products = data?.data || [];
  const meta = data?.meta;
  const categories = categoriesData?.data ?? [];

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const displayProducts = showLowStockOnly 
    ? lowStockProducts.sort((a, b) => a.stock - b.stock)
    : [...products].sort((a, b) => {
        const aLow = a.stock <= a.minStock ? 0 : 1;
        const bLow = b.stock <= b.minStock ? 0 : 1;
        return aLow - bLow;
      });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      sku: "",
      barcode: "",
      description: "",
      costPrice: 0,
      salePrice: 0,
      taxRate: 19,
      stock: 0,
      minStock: 5,
      categoryId: "",
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct.mutateAsync(productToDelete);
        toast.success("Producto eliminado correctamente");
        setShowConfirmModal(false);
        setProductToDelete(null);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "No se pudo eliminar el producto"));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedCategoryId = formData.categoryId?.toString().trim() || undefined;

    try {
      if (editingProduct) {
        const updateData = { ...formData };
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        delete updateData.category;
        delete updateData.imageUrl;
        delete updateData.version;
        delete updateData.categoryId;

        const cleanedData = {
          ...updateData,
          ...(normalizedCategoryId ? { categoryId: normalizedCategoryId } : {}),
          costPrice: updateData.costPrice ?? 0,
          salePrice: updateData.salePrice ?? 0,
          taxRate: updateData.taxRate ?? 19,
          stock: updateData.stock ?? 0,
          minStock: updateData.minStock ?? 5,
        };

        await updateProduct.mutateAsync({
          id: editingProduct.id,
          data: cleanedData,
        });
      } else {
        if (!normalizedCategoryId) {
          toast.error("Debes seleccionar una categoria");
          return;
        }

        const cleanedFormData = {
          ...formData,
          categoryId: normalizedCategoryId,
          costPrice: formData.costPrice ?? 0,
          salePrice: formData.salePrice ?? 0,
          taxRate: formData.taxRate ?? 19,
          stock: formData.stock ?? 0,
          minStock: formData.minStock ?? 5,
        };
        await createProduct.mutateAsync(cleanedFormData as Product);
        toast.success("Producto creado correctamente");
      }
      if (editingProduct) {
        toast.success("Producto actualizado correctamente");
      }
      setShowModal(false);
      setFormData({});
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Error al guardar el producto"));
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    if (editingProduct) {
      const result = await uploadProductImageById.mutateAsync(file);
      return result.imageUrl || "";
    } else {
      const result = await uploadProductImage.mutateAsync(file);
      return result.imageUrl;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 lg:mb-2">
              Inventario
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              Gestiona tus productos y stock
            </p>
          </div>
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <Select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full sm:w-44"
                  options={[
                    { value: "", label: "Todas las categorías" },
                    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
                  ]}
                />
                <Button
                  variant={showLowStockOnly ? "danger" : "secondary"}
                  onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                  className="w-full sm:w-auto whitespace-nowrap"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {showLowStockOnly ? "Todos" : "Stock Bajo"}
                </Button>
                {(selectedCategory || showLowStockOnly) && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedCategory(null);
                      setShowLowStockOnly(false);
                      setPage(1);
                    }}
                    className="w-full sm:w-24"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {(selectedCategory || showLowStockOnly) && (
              <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                {showLowStockOnly && <span>Stock Bajo: {lowStockProducts.length} productos</span>}
                {selectedCategory && (
                  <span>
                    Categoría: {categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                )}
                <span className="hidden sm:inline">|</span>
                <span>Total mostrados: {displayProducts.length}</span>
              </div>
            )}

            {lowStockProducts.length > 0 && !showLowStockOnly && !selectedCategory && (
              <Card className="border-red-500 bg-red-50 dark:bg-red-900/10">
                <CardContent className="p-3 lg:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 dark:text-red-100 text-sm lg:text-base">
                        Productos con Stock Bajo
                      </h3>
                      <p className="text-xs lg:text-sm text-red-700 dark:text-red-300">
                        {lowStockProducts.length} producto(s) necesitan reabastecimiento
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setShowLowStockOnly(true)}
                      className="w-full sm:w-auto mt-2 sm:mt-0"
                    >
                      Ver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  mode="inventory"
                  product={product}
                  onClick={() => handleEdit(product)}
                  onDelete={() => handleDelete(product.id)}
                />
              ))}
            </div>

            {meta && meta.totalPages > 1 && !showLowStockOnly && !selectedCategory && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {meta.totalPages}
                </span>
                <Button
                  variant="secondary"
                  disabled={page === meta.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2">Imagen del producto</label>
              <ImageUpload
                value={formData.imageUrl || ""}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                onUpload={handleImageUpload}
                disabled={uploadProductImage.isPending || uploadProductImageById.isPending}
              />
            </div>
            <div className="md:col-span-1 space-y-3 lg:space-y-4">
              <Input
                label="Nombre"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="SKU"
                value={formData.sku || ""}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
              <Input
                label="Código de Barras"
                value={formData.barcode || ""}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
              <Select
                label="Categoría"
                value={formData.categoryId || ""}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                options={[
                  { value: "", label: "Seleccionar categoría" },
                  ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
                ]}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Precio de Costo"
                  type="number"
                  step="0.01"
                  value={formData.costPrice || ""}
                  onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                  required
                />
                <Input
                  label="Precio de Venta"
                  type="number"
                  step="0.01"
                  value={formData.salePrice || ""}
                  onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Impuesto (%)"
                  type="number"
                  step="0.01"
                  value={formData.taxRate || 19}
                  onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                />
                <Input
                  label="Stock"
                  type="number"
                  value={formData.stock || 0}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  required
                />
                <Input
                  label="Stock Mín."
                  type="number"
                  value={formData.minStock || 5}
                  onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
          </div>

          <Input
            label="Descripción"
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            textarea
            rows={3}
          />

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={createProduct.isPending || updateProduct.isPending}
              className="w-full sm:w-auto"
            >
              {editingProduct ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </DashboardLayout>
  );
}
