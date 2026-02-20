"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useProducts } from "@/hooks/useProducts";
import { useCustomers } from "@/hooks/useCustomers";
import { useCreateSale } from "@/hooks/useSales";
import { usePausedSales } from "@/hooks/usePausedSales";
import { printInvoice } from "@/hooks/useInvoice";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PaymentConfirmationModal } from "@/components/pos/PaymentConfirmationModal";
import { PaymentMethodCards } from "@/components/pos/PaymentMethodCards";
import { ProductCard } from "@/components/products/ProductCard";
import {
  Search,
  Star,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Printer,
  Package,
  Percent,
  Pause,
  Play,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CartItem, Product, Sale } from "@/types";
import { useToast } from "@/contexts/ToastContext";
import { getApiErrorMessage } from "@/lib/api";

interface PaymentMethod {
  type: "CASH" | "CARD" | "TRANSFER";
  amount: number;
}

const FAVORITE_PRODUCTS_KEY = "pos_favorite_product_ids";

export default function POSPage() {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteProductIds, setFavoriteProductIds] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const saved = localStorage.getItem(FAVORITE_PRODUCTS_KEY);
    if (!saved) {
      return [];
    }

    try {
      const parsed = JSON.parse(saved) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "CASH" | "CARD" | "TRANSFER"
  >("CASH");
  const [amountPaid, setAmountPaid] = useState<number | undefined>(undefined);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [editingDiscount, setEditingDiscount] = useState<string | null>(null);
  const [customDiscount, setCustomDiscount] = useState("");
  const [showPausedSalesModal, setShowPausedSalesModal] = useState(false);
  const [pausedSaleToDelete, setPausedSaleToDelete] = useState<string | null>(null);
  const [showDeletePausedModal, setShowDeletePausedModal] = useState(false);

  const { data: productsData, isLoading: searching } = useProducts({
    page: 1,
    limit: 200,
    search: searchQuery.trim() || undefined,
  });
  const { data: customersData } = useCustomers();
  const { pausedSales, pauseSale, resumeSale, deletePausedSale } =
    usePausedSales();
  const createSale = useCreateSale();

  const customers = customersData?.data || [];
  const products = useMemo(() => productsData?.data ?? [], [productsData?.data]);

  useEffect(() => {
    localStorage.setItem(FAVORITE_PRODUCTS_KEY, JSON.stringify(favoriteProductIds));
  }, [favoriteProductIds]);

  const visibleProducts = useMemo(() => {
    if (!showFavoritesOnly) {
      return products;
    }

    return products.filter((product) => favoriteProductIds.includes(product.id));
  }, [products, showFavoritesOnly, favoriteProductIds]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          product,
          quantity,
          unitPrice: product.salePrice,
          discountAmount: 0,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
  }, [removeFromCart]);

  const updateItemDiscount = useCallback((productId: string, discountAmount: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, discountAmount: Math.max(0, discountAmount) }
          : item,
      ),
    );
    setEditingDiscount(null);
    setCustomDiscount("");
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice - item.discountAmount,
    0,
  );
  const taxAmount = cart.reduce(
    (sum, item) =>
      sum +
      (item.quantity * item.unitPrice - item.discountAmount) *
        (item.product.taxRate / 100),
    0,
  );
  const total = subtotal + taxAmount - discountAmount;

  const toggleFavoriteProduct = useCallback((productId: string) => {
    setFavoriteProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const totalPaid = paymentMethods.reduce((sum, method) => sum + method.amount, 0);

    if (totalPaid < total) {
      toast.error("El monto total pagado debe cubrir el total de la venta");
      return;
    }

    if (paymentMethods.length === 0) {
      toast.error("Debes seleccionar al menos un metodo de pago");
      return;
    }

    try {
      const result = await createSale.mutateAsync({
        customerId: selectedCustomer || undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount,
        })),
        discountAmount,
        payments: paymentMethods.map((method) => ({
          method: method.type,
          amount: method.amount,
        })),
      });

      setLastSale(result);
      setCart([]);
      setDiscountAmount(0);
      setAmountPaid(undefined);
      setSelectedCustomer("");
      setSearchQuery("");
      setPaymentMethods([]);
      setShowPaymentModal(false);
      setShowInvoiceModal(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Error al realizar la venta"));
    }
  };

  const handlePrintInvoice = async () => {
    if (lastSale) {
      try {
        await printInvoice(lastSale.id);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Error al imprimir la factura"));
      }
    }
  };

  const handlePauseSale = () => {
    if (cart.length === 0) {
      toast.info("No hay productos en el carrito");
      return;
    }

    try {
      const customerName = selectedCustomer
        ? customers.find((c) => c.id === selectedCustomer)?.name
        : "Cliente General";

      pauseSale(cart, selectedCustomer, discountAmount, customerName);

      setCart([]);
      setDiscountAmount(0);
      setAmountPaid(undefined);
      setSelectedCustomer("");
      setSearchQuery("");
      setPaymentMethods([]);
      setEditingDiscount(null);
      setCustomDiscount("");

      toast.success("Venta pausada correctamente");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al pausar la venta",
      );
    }
  };

  const handleResumeSale = (saleId: string) => {
    try {
      const resumedSale = resumeSale(saleId);

      setCart(resumedSale.cart);
      setSelectedCustomer(resumedSale.customerId);
      setDiscountAmount(resumedSale.discountAmount);

      setShowPausedSalesModal(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al reanudar la venta",
      );
    }
  };

  const handleDeletePausedSale = (saleId: string) => {
    setPausedSaleToDelete(saleId);
    setShowDeletePausedModal(true);
  };

  const confirmDeletePausedSale = () => {
    if (!pausedSaleToDelete) return;

    deletePausedSale(pausedSaleToDelete);
    toast.success("Venta pausada eliminada");
    setPausedSaleToDelete(null);
  };

  const openPaymentModal = () => {
    setPaymentMethods([
      {
        type: selectedPaymentMethod,
        amount: selectedPaymentMethod === "CASH" ? amountPaid ?? 0 : total,
      },
    ]);
    setShowPaymentModal(true);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 lg:grid lg:h-[calc(100vh-6rem)] lg:grid-cols-12 lg:gap-6">
        {/* Products Section */}
        <div className="lg:col-span-8 lg:h-full">
          <Card className="h-auto overflow-hidden lg:h-full lg:flex lg:flex-col">
            <CardHeader className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg lg:text-xl font-semibold text-foreground flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Productos
                </h2>
                <Badge
                  variant={cart.length > 0 ? "primary" : "secondary"}
                  className="animate-pulse"
                >
                  {cart.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-4 lg:flex-1 lg:min-h-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos por nombre, SKU o codigo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full min-w-[12rem] pl-12"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCustomerModal(true)}
                  className="w-full whitespace-nowrap sm:w-auto sm:max-w-[15rem]"
                >
                  <span className="truncate">
                    {selectedCustomer
                      ? customers.find((c) => c.id === selectedCustomer)?.name ||
                        "Cliente"
                      : "Seleccionar Cliente"}
                  </span>
                </Button>
                <Button
                  type="button"
                  variant={showFavoritesOnly ? "primary" : "secondary"}
                  onClick={() => setShowFavoritesOnly((current) => !current)}
                  className="w-full sm:w-auto"
                >
                  <Star className={`mr-2 h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                  {showFavoritesOnly ? "Favoritos" : "Todos"}
                </Button>
              </div>

              <div className="scrollbar-app min-h-[20rem] overflow-y-auto rounded-xl border border-border/70 bg-background/50 p-3 lg:flex-1 lg:min-h-0">
                <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
                {searching ? (
                  <div className="col-span-full py-8 text-center text-muted-foreground">
                    Buscando productos...
                  </div>
                ) : visibleProducts.length > 0 ? (
                  visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      mode="pos"
                      product={product}
                      onClick={() => addToCart(product as Product)}
                      isFavorite={favoriteProductIds.includes(product.id)}
                      onToggleFavorite={() => toggleFavoriteProduct(product.id)}
                    />
                  ))
                ) : searchQuery.length > 2 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No se encontraron productos para tu busqueda
                  </div>
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    {showFavoritesOnly
                      ? "No tienes productos favoritos todavia"
                      : "Escribe para buscar productos"}
                  </div>
                )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-4">
          <Card className="h-auto lg:h-full flex flex-col lg:sticky lg:top-4 overflow-hidden">
            <CardHeader className="border-b border-border p-4">
              <h2 className="text-lg lg:text-xl font-semibold text-foreground">Carrito</h2>
            </CardHeader>
            <CardContent className="scrollbar-app flex-1 overflow-y-auto p-3 lg:p-4 space-y-2 lg:space-y-3 max-h-[40vh] lg:max-h-none">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-base lg:text-lg">El carrito está vacío</p>
                  <p className="text-sm mt-2">Agrega productos para comenzar</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-start gap-2 lg:gap-3 p-2 lg:p-4 bg-background rounded-xl border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-primary/10 to-terracotta/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 lg:w-7 lg:h-7 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-xs lg:text-sm line-clamp-1 mb-1">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {formatCurrency(item.unitPrice)} x {item.quantity}
                        </span>
                        {item.discountAmount > 0 && (
                          <Badge variant="success" className="text-xs">
                            -{formatCurrency(item.discountAmount)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-card rounded-lg border border-border">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            className="w-8 h-8 lg:w-10 lg:h-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 lg:w-10 text-center font-semibold text-foreground text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            className="w-8 h-8 lg:w-10 lg:h-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingDiscount(item.productId)}
                          className="w-8 h-8 lg:w-10 lg:h-8 p-0"
                          title="Agregar descuento"
                        >
                          <Percent className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground text-sm lg:text-base">
                        {formatCurrency(
                          item.quantity * item.unitPrice - item.discountAmount,
                        )}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.productId)}
                        className="w-8 h-8 lg:w-10 lg:h-8 p-0 mt-4 lg:mt-6"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter className="border-t border-border p-4 lg:p-6 space-y-3 lg:space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Impuestos</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(taxAmount)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento</span>
                    <span className="font-medium">
                      -{formatCurrency(discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg lg:text-xl font-bold pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowPausedSalesModal(true)}
                    className="flex-1 text-xs lg:text-sm"
                  >
                    <Play className="w-4 h-4 mr-1 lg:mr-2" />
                    Reanudar ({pausedSales.length})
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handlePauseSale}
                    disabled={cart.length === 0}
                    className="flex-1 text-xs lg:text-sm"
                  >
                    <Pause className="w-4 h-4 mr-1 lg:mr-2" />
                    Pausar
                  </Button>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2 lg:mb-3">
                    Método de Pago
                  </p>
                  <PaymentMethodCards
                    selectedMethod={selectedPaymentMethod}
                    onMethodChange={(method) =>
                      setSelectedPaymentMethod(method)
                    }
                  />
                </div>

                {selectedPaymentMethod === "CASH" && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2 lg:mb-3">
                      Monto Recibido
                    </p>
                    <p className="rounded-lg border border-border bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
                      El efectivo se confirma en el paso final de pago.
                    </p>
                  </div>
                )}

                {selectedPaymentMethod !== "CASH" && (
                  <p className="rounded-lg border border-border bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
                    Para {selectedPaymentMethod === "CARD" ? "tarjeta" : "transferencia"}, se tomara pago exacto automaticamente.
                  </p>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={openPaymentModal}
                  disabled={cart.length === 0}
                  loading={createSale.isPending}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Finalizar Venta
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Seleccionar Cliente"
        size="sm"
      >
        <div className="space-y-4">
          <Input placeholder="Buscar cliente..." className="w-full" />
          <div className="scrollbar-app max-h-96 overflow-y-auto space-y-2">
            <div
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedCustomer === ""
                  ? "bg-primary text-white"
                  : "bg-background hover:bg-terracotta/10"
              }`}
              onClick={() => {
                setSelectedCustomer("");
                setShowCustomerModal(false);
              }}
            >
              <p className="font-medium">Cliente General</p>
              <p className="text-sm opacity-75">Sin cliente asignado</p>
            </div>
            {customers.map((customer) => (
              <div
                key={customer.id}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedCustomer === customer.id
                    ? "bg-primary text-white"
                    : "bg-background hover:bg-terracotta/10"
                }`}
                onClick={() => {
                  setSelectedCustomer(customer.id);
                  setShowCustomerModal(false);
                }}
              >
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm opacity-75">{customer.documentNumber}</p>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <PaymentConfirmationModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleCheckout}
        cart={cart}
        subtotal={subtotal}
        taxAmount={taxAmount}
        total={total}
        selectedMethod={selectedPaymentMethod}
        paymentMethods={paymentMethods}
        onPaymentMethodChange={setPaymentMethods}
        loading={createSale.isPending}
        customerName={
          selectedCustomer
            ? customers.find((c) => c.id === selectedCustomer)?.name
            : "Cliente General"
        }
        saleNumber={lastSale?.saleNumber}
      />

      {lastSale && (
        <Modal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          title="¡Venta Completada!"
          size="lg"
        >
          <div className="space-y-6">
            <div className="text-center py-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
                <Printer className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                Venta Exitosa
              </h3>
              <p className="text-muted-foreground">
                Factura #{lastSale.saleNumber}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                <p className="font-semibold text-foreground">
                  {lastSale.customer
                    ? lastSale.customer.name
                    : "Cliente General"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Método de Pago
                </p>
                <p className="font-semibold text-foreground">
                  {lastSale.payments && lastSale.payments.length > 1
                    ? "Mixto"
                    : lastSale.payments &&
                        lastSale.payments[0]?.method === "CASH"
                      ? "Efectivo"
                      : lastSale.payments &&
                          lastSale.payments[0]?.method === "CARD"
                        ? "Tarjeta"
                        : "Transferencia"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total</p>
                <p className="font-bold text-xl text-primary">
                  {formatCurrency(lastSale.total)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Items</p>
                <p className="font-semibold text-foreground">
                  {lastSale.items.length} producto(s)
                </p>
              </div>
            </div>

            {lastSale.amountPaid && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Pagado:</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(lastSale.amountPaid)}
                  </span>
                </div>
                {lastSale.change !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cambio:</span>
                    <span className="font-bold text-terracotta">
                      {formatCurrency(lastSale.change)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 justify-end pt-4 border-t border-border">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowInvoiceModal(false);
                  setLastSale(null);
                }}
              >
                Cerrar
              </Button>
              <Button onClick={handlePrintInvoice}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir Factura
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {editingDiscount && (
        <Modal
          isOpen={!!editingDiscount}
          onClose={() => {
            setEditingDiscount(null);
            setCustomDiscount("");
          }}
          title="Agregar Descuento"
          size="sm"
        >
          <div className="space-y-4">
            <Input
              type="number"
              step="0.01"
              label="Monto del descuento"
              value={customDiscount}
              onChange={(e) => setCustomDiscount(e.target.value)}
              placeholder="0.00"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  const item = cart.find(
                    (i) => i.productId === editingDiscount,
                  );
                  if (item) {
                    const discount = item.quantity * item.unitPrice * 0.1;
                    updateItemDiscount(editingDiscount, discount);
                  }
                }}
              >
                10%
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const item = cart.find(
                    (i) => i.productId === editingDiscount,
                  );
                  if (item) {
                    const discount = item.quantity * item.unitPrice * 0.2;
                    updateItemDiscount(editingDiscount, discount);
                  }
                }}
              >
                20%
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const item = cart.find(
                    (i) => i.productId === editingDiscount,
                  );
                  if (item) {
                    const discount = item.quantity * item.unitPrice * 0.5;
                    updateItemDiscount(editingDiscount, discount);
                  }
                }}
              >
                50%
              </Button>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingDiscount(null);
                  setCustomDiscount("");
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (editingDiscount) {
                    updateItemDiscount(editingDiscount, Number(customDiscount));
                  }
                }}
                className="flex-1"
                disabled={!customDiscount}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={showPausedSalesModal}
        onClose={() => setShowPausedSalesModal(false)}
        title="Ventas Pausadas"
        size="xl"
      >
        <div className="space-y-4">
          {pausedSales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Pause className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No hay ventas pausadas</p>
              <p className="text-sm mt-2">
                Pausa una venta para que aparezca aquí
              </p>
            </div>
          ) : (
            <div className="scrollbar-app max-h-96 overflow-y-auto space-y-4">
              {pausedSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-4 bg-background rounded-lg border border-border"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        {sale.customerName || "Cliente General"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {sale.cart.length} producto(s) • Pausado:{" "}
                        {new Date(sale.pausedAt).toLocaleString("es-CO")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-lg">
                        {formatCurrency(
                          sale.cart.reduce(
                            (sum, item) =>
                              sum +
                              item.quantity * item.unitPrice -
                              item.discountAmount,
                            0,
                          ),
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleResumeSale(sale.id)}
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Reanudar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeletePausedSale(sale.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeletePausedModal}
        onClose={() => {
          setShowDeletePausedModal(false);
          setPausedSaleToDelete(null);
        }}
        onConfirm={confirmDeletePausedSale}
        title="Eliminar venta pausada"
        message="Se eliminara la venta pausada de forma definitiva."
        confirmText="Eliminar"
      />
    </DashboardLayout>
  );
}
