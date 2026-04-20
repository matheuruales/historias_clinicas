"use client"

import { useEffect, useMemo, useState } from "react"
import { Pill } from "lucide-react"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select"
import { useMedicamentos } from "@/hooks/use-clinical-data"
import { MedicamentosTable } from "@/components/dashboard/medicamentos-table"
import { NuevoMedicamentoDialog } from "@/components/dashboard/nuevo-medicamento-dialog"
import { exportToCsv, exportToPdf } from "@/lib/utils"

export default function MedicamentosPage() {
  const { medicamentos, loading, error, addMedicamento, removeMedicamento, editMedicamento } = useMedicamentos()
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("nombre-asc")
  const [pageSize, setPageSize] = useState("8")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const base = term
      ? medicamentos.filter((m) =>
          m.nombre.toLowerCase().includes(term) ||
          (m.descripcion ?? "").toLowerCase().includes(term) ||
          m.unidad.toLowerCase().includes(term),
        )
      : medicamentos
    const sorted = [...base]
    if (sortBy === "nombre-asc") sorted.sort((a, b) => a.nombre.localeCompare(b.nombre))
    if (sortBy === "nombre-desc") sorted.sort((a, b) => b.nombre.localeCompare(a.nombre))
    if (sortBy === "unidad-asc") sorted.sort((a, b) => a.unidad.localeCompare(b.unidad))
    if (sortBy === "unidad-desc") sorted.sort((a, b) => b.unidad.localeCompare(a.unidad))
    return sorted
  }, [medicamentos, search, sortBy])

  const perPage = Number(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  useEffect(() => {
    setPage(1)
  }, [search, sortBy, pageSize])

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Pill className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Medicamentos</h1>
          <p className="text-muted-foreground">Catálogo de medicamentos disponibles</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Catálogo</h2>
            <p className="text-sm text-muted-foreground">
              {filtered.length} medicamento{filtered.length !== 1 ? "s" : ""} registrado
              {filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                exportToCsv("medicamentos.csv", filtered.map((m) => ({
                  nombre: m.nombre,
                  descripcion: m.descripcion ?? "",
                  unidad: m.unidad,
                })))
              }
              disabled={filtered.length === 0}
            >
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                exportToPdf("Medicamentos", filtered.map((m) => ({
                  nombre: m.nombre,
                  descripcion: m.descripcion ?? "",
                  unidad: m.unidad,
                })))
              }
              disabled={filtered.length === 0}
            >
              Exportar PDF
            </Button>
            <NuevoMedicamentoDialog onCreated={addMedicamento} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Buscar por nombre, descripcion o unidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Orden" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nombre-asc">Nombre A-Z</SelectItem>
              <SelectItem value="nombre-desc">Nombre Z-A</SelectItem>
              <SelectItem value="unidad-asc">Unidad A-Z</SelectItem>
              <SelectItem value="unidad-desc">Unidad Z-A</SelectItem>
            </SelectContent>
          </Select>
          <Select value={pageSize} onValueChange={setPageSize}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Por pagina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6 / pagina</SelectItem>
              <SelectItem value="8">8 / pagina</SelectItem>
              <SelectItem value="12">12 / pagina</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <MedicamentosTable
          medicamentos={paginated}
          loading={loading}
          onUpdated={editMedicamento}
          onDeleted={removeMedicamento}
        />

        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Pagina {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
