"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select"
import { useActivityFeed, useClinicalData } from "@/hooks/use-clinical-data"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { PacientesTable } from "@/components/dashboard/pacientes-table"
import { NuevoPacienteDialog } from "@/components/dashboard/nuevo-paciente-dialog"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { ActivityChart } from "@/components/dashboard/activity-chart"
import { exportToCsv, exportToPdf } from "@/lib/utils"

export default function DashboardPage() {
  const { pacientes, totalStats, loading, error, addPaciente, removePaciente, editPaciente } = useClinicalData()
  const { activity, loading: activityLoading, error: activityError } = useActivityFeed(20)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("nombre-asc")
  const [pageSize, setPageSize] = useState("8")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const base = term
      ? pacientes.filter((p) =>
          p.nombre.toLowerCase().includes(term) || p.cedula.toLowerCase().includes(term),
        )
      : pacientes
    const sorted = [...base]
    if (sortBy === "nombre-asc") sorted.sort((a, b) => a.nombre.localeCompare(b.nombre))
    if (sortBy === "nombre-desc") sorted.sort((a, b) => b.nombre.localeCompare(a.nombre))
    if (sortBy === "edad-asc") sorted.sort((a, b) => a.edad - b.edad)
    if (sortBy === "edad-desc") sorted.sort((a, b) => b.edad - a.edad)
    if (sortBy === "historias-desc")
      sorted.sort((a, b) => b.historias_count - a.historias_count)
    return sorted
  }, [pacientes, search, sortBy])

  const perPage = Number(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  useEffect(() => {
    setPage(1)
  }, [search, pageSize, sortBy])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel Principal</h1>
        <p className="text-muted-foreground">Gestión de pacientes e historias clínicas</p>
      </div>

      <StatsCards
        totalPacientes={totalStats.totalPacientes}
        totalHistorias={totalStats.totalHistorias}
        loading={loading}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <ActivityChart activity={activity} />
        <ActivityFeed activity={activity} loading={activityLoading} error={activityError} />
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Pacientes</h2>
            <p className="text-sm text-muted-foreground">
              {filtered.length} paciente{filtered.length !== 1 ? "s" : ""} registrado
              {filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                exportToCsv("pacientes.csv", filtered.map((p) => ({
                  nombre: p.nombre,
                  cedula: p.cedula,
                  edad: p.edad,
                  historias: p.historias_count,
                })))
              }
              disabled={filtered.length === 0}
            >
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                exportToPdf("Pacientes", filtered.map((p) => ({
                  nombre: p.nombre,
                  cedula: p.cedula,
                  edad: p.edad,
                  historias: p.historias_count,
                })))
              }
              disabled={filtered.length === 0}
            >
              Exportar PDF
            </Button>
            <NuevoPacienteDialog onCreated={addPaciente} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Buscar por nombre o cedula..."
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
              <SelectItem value="edad-asc">Edad menor a mayor</SelectItem>
              <SelectItem value="edad-desc">Edad mayor a menor</SelectItem>
              <SelectItem value="historias-desc">Mas historias</SelectItem>
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

        <PacientesTable
          pacientes={paginated}
          loading={loading}
          onUpdated={editPaciente}
          onDeleted={removePaciente}
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
