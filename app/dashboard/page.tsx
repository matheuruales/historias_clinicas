"use client"

import { useClinicalData } from "@/hooks/use-clinical-data"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { PacientesTable } from "@/components/dashboard/pacientes-table"
import { NuevoPacienteDialog } from "@/components/dashboard/nuevo-paciente-dialog"

export default function DashboardPage() {
  const { pacientes, totalStats, loading, error, addPaciente } = useClinicalData()

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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Pacientes</h2>
            <p className="text-sm text-muted-foreground">
              {pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""} registrado
              {pacientes.length !== 1 ? "s" : ""}
            </p>
          </div>
          <NuevoPacienteDialog onCreated={addPaciente} />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <PacientesTable pacientes={pacientes} loading={loading} />
      </div>
    </div>
  )
}
