"use client";

import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Pencil,
  RefreshCcw,
  Upload,
  XCircle,
} from "lucide-react";
import { useImport } from "@/hooks/useImport";
import { useToast } from "@/contexts/ToastContext";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import type { ImportRowError } from "@/types";
import { cn } from "@/lib/utils";

type EditableFieldKey =
  | "name"
  | "sku"
  | "barcode"
  | "category"
  | "salePrice"
  | "costPrice"
  | "stock"
  | "minStock"
  | "taxRate"
  | "description";

const editableFields: Array<{ key: EditableFieldKey; label: string }> = [
  { key: "name", label: "Nombre" },
  { key: "sku", label: "SKU" },
  { key: "barcode", label: "Codigo de barras" },
  { key: "category", label: "Categoria" },
  { key: "salePrice", label: "Precio venta" },
  { key: "costPrice", label: "Precio costo" },
  { key: "stock", label: "Stock" },
  { key: "minStock", label: "Stock minimo" },
  { key: "taxRate", label: "Impuesto (%)" },
  { key: "description", label: "Descripcion" },
];

const numberFields: EditableFieldKey[] = [
  "salePrice",
  "costPrice",
  "stock",
  "minStock",
  "taxRate",
];

function toStringValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function mapErrorVariant(errorCode: string) {
  if (errorCode.startsWith("DUPLICATE")) {
    return "danger" as const;
  }

  if (errorCode.startsWith("INVALID")) {
    return "warning" as const;
  }

  return "secondary" as const;
}

export function ImportSection() {
  const toast = useToast();
  const { startImport, statusQuery, startData, retryRow, downloadTemplate, reset } =
    useImport();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<EditableFieldKey, string>>({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    salePrice: "",
    costPrice: "",
    stock: "",
    minStock: "",
    taxRate: "",
    description: "",
  });

  const status = statusQuery.data;
  const isLoadingStatus = statusQuery.isLoading && !!startData;
  const isProcessing =
    status?.status === "PARSING" || status?.status === "PROCESSING";
  const hasStarted = !!startData;

  const unresolvedErrors = useMemo(
    () =>
      (status?.errors ?? []).filter(
        (error) => !(error.retried && error.retriedSuccess)
      ),
    [status?.errors]
  );

  const detectedColumns = status?.detectedColumns ?? startData?.detectedColumns ?? [];
  const totalRows = status?.totalRows ?? startData?.totalRows ?? 0;
  const processedRows = status?.processedRows ?? 0;
  const progress = status?.progress ?? 0;

  const counters = {
    processed: processedRows,
    imported: status?.importedCount ?? 0,
    skipped: status?.skippedCount ?? 0,
    errors: status?.errorCount ?? 0,
  };

  const onFilePicked = (file: File | null) => {
    if (!file) {
      return;
    }

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".csv")) {
      toast.error("Formato no soportado. Usa archivos .xlsx o .csv");
      return;
    }

    setSelectedFile(file);
  };

  const handleInputFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFilePicked(file);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    onFilePicked(file);
  };

  const handleStartImport = async () => {
    if (!selectedFile) {
      toast.error("Selecciona un archivo para iniciar la importacion");
      return;
    }

    try {
      await startImport.mutateAsync(selectedFile);
      toast.success("Importacion iniciada correctamente");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo iniciar la importacion"));
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate.mutateAsync();
      toast.success("Plantilla descargada correctamente");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo descargar la plantilla"));
    }
  };

  const startEditing = (error: ImportRowError) => {
    setEditingRow(error.rowIndex);
    setEditValues({
      name: toStringValue(error.mappedData.name),
      sku: toStringValue(error.mappedData.sku),
      barcode: toStringValue(error.mappedData.barcode),
      category: toStringValue(error.mappedData.category),
      salePrice: toStringValue(error.mappedData.salePrice),
      costPrice: toStringValue(error.mappedData.costPrice),
      stock: toStringValue(error.mappedData.stock),
      minStock: toStringValue(error.mappedData.minStock),
      taxRate: toStringValue(error.mappedData.taxRate),
      description: toStringValue(error.mappedData.description),
    });
  };

  const handleRetryRow = async (rowIndex: number) => {
    const payload: Record<string, unknown> = {
      ...editValues,
    };

    numberFields.forEach((field) => {
      const value = editValues[field].trim();
      if (value === "") {
        payload[field] = "";
        return;
      }

      payload[field] = Number(value);
    });

    try {
      await retryRow.mutateAsync({
        rowIndex,
        correctedData: payload,
      });

      toast.success("Fila reintentada");
      setEditingRow(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo reintentar la fila"));
    }
  };

  return (
    <div className="rounded-3xl border border-accent/30 bg-accent/10 overflow-hidden transition-all duration-300 hover:border-accent/50">
      <div className="px-5 py-4 border-b border-accent/20 flex items-center gap-2">
        <div className="p-1.5 bg-accent/20 rounded-lg">
          <Upload className="w-4 h-4 text-accent" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Importar Inventario</h3>
      </div>

      <div className="p-5 space-y-4">
        {!hasStarted && (
          <>
            <label
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragActive(false);
              }}
              onDrop={handleDrop}
              className={cn(
                "block rounded-2xl border border-dashed px-4 py-8 text-center cursor-pointer transition-colors",
                dragActive
                  ? "border-accent/60 bg-accent/10"
                  : "border-accent/30 bg-background/40 hover:bg-background/60"
              )}
            >
              <input
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                onChange={handleInputFile}
              />
              <FileSpreadsheet className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">
                Arrastra un archivo o haz click para subir
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Formatos soportados: .xlsx y .csv
              </p>
            </label>

            {selectedFile && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-accent/20 bg-background/40 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Limpiar
                </Button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleStartImport}
                disabled={!selectedFile}
                loading={startImport.isPending}
              >
                Iniciar importacion
              </Button>
              <Button
                variant="secondary"
                onClick={handleDownloadTemplate}
                loading={downloadTemplate.isPending}
              >
                <Download className="w-4 h-4" /> Plantilla
              </Button>
            </div>
          </>
        )}

        {hasStarted && (
          <>
            <div className="rounded-2xl border border-accent/20 bg-background/40 p-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                    Archivo
                  </p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {status?.fileName ?? selectedFile?.name ?? "Importacion en curso"}
                  </p>
                </div>

                <Badge variant={isProcessing ? "warning" : "primary"}>
                  {status?.status ?? "PARSING"}
                </Badge>
              </div>

              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>
                    {processedRows.toLocaleString("es-CO")} / {totalRows.toLocaleString("es-CO")} filas
                  </span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-accent/10 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-accent to-accent/60 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Badge variant="secondary" className="justify-center">
                  Procesados: {counters.processed}
                </Badge>
                <Badge variant="success" className="justify-center">
                  Importados: {counters.imported}
                </Badge>
                <Badge variant="warning" className="justify-center">
                  Omitidos: {counters.skipped}
                </Badge>
                <Badge variant="danger" className="justify-center">
                  Errores: {counters.errors}
                </Badge>
              </div>

              {detectedColumns.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {detectedColumns.map((column) => (
                    <Badge key={column} variant="secondary" className="text-[10px]">
                      {column}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-accent/20 bg-background/40 p-3">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCcw className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Eventos recientes
                </p>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {(status?.recentEvents ?? []).length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Esperando eventos de importacion...
                  </p>
                )}

                {(status?.recentEvents ?? []).map((event, index) => (
                  <div key={`${event.timestamp}-${index}`} className="flex items-start gap-2">
                    {event.type === "SUCCESS" && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    )}
                    {event.type === "ERROR" && (
                      <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                    )}
                    {event.type === "WARNING" && (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    )}
                    {event.type === "INFO" && (
                      <Loader2 className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    )}

                    <p className="text-xs text-foreground/90 leading-5">
                      Fila {event.rowIndex}: {event.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {status?.warningCount ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                {status.warningCount} productos importados con precio de costo inferido.
                Revisa esos productos en Inventario.
              </div>
            ) : null}

            {status?.createdCategories?.length ? (
              <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2">
                <p className="text-xs font-semibold text-primary mb-1">
                  Categorias creadas automaticamente
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {status.createdCategories.map((category) => (
                    <Badge key={category} variant="primary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {!!unresolvedErrors.length && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 overflow-hidden">
                <div className="px-3 py-2 border-b border-rose-500/20 bg-rose-500/10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                    Historial de errores
                  </p>
                </div>

                <div className="divide-y divide-rose-500/20 max-h-[340px] overflow-y-auto">
                  {unresolvedErrors.map((error) => (
                    <div key={`${error.rowIndex}-${error.errorCode}`} className="p-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={mapErrorVariant(error.errorCode)}>
                            {error.errorCode}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Fila {error.rowIndex}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => startEditing(error)}
                        >
                          <Pencil className="w-3.5 h-3.5" /> Editar
                        </Button>
                      </div>

                      <p className="text-sm text-foreground">{error.message}</p>

                      {editingRow === error.rowIndex && (
                        <div className="rounded-xl border border-accent/20 bg-background/40 p-3 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {editableFields.map((field) => (
                              <Input
                                key={field.key}
                                label={field.label}
                                value={editValues[field.key]}
                                onChange={(event) =>
                                  setEditValues((previous) => ({
                                    ...previous,
                                    [field.key]: event.target.value,
                                  }))
                                }
                              />
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              loading={retryRow.isPending}
                              onClick={() => handleRetryRow(error.rowIndex)}
                            >
                              Reintentar fila
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingRow(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(status?.status === "COMPLETED" || status?.status === "FAILED") && (
              <div className="flex items-center justify-end gap-2">
                <Button variant="secondary" onClick={handleDownloadTemplate}>
                  <Download className="w-4 h-4" /> Plantilla
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    reset();
                    setSelectedFile(null);
                    setEditingRow(null);
                  }}
                >
                  Nueva importacion
                </Button>
              </div>
            )}

            {isLoadingStatus && (
              <p className="text-xs text-muted-foreground">
                Cargando estado de la importacion...
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
