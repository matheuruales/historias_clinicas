"use client"

import { Pill } from "lucide-react"
import { useMedicamentos } from "@/hooks/use-clinical-data"
import { MedicamentosTable } from "@/components/dashboard/medicamentos-table"
import { NuevoMedicamentoDialog } from "@/components/dashboard/nuevo-medicamento-dialog"

export default function MedicamentosPage() {
  const { medicamentos, loading, error, addMedicamento } = useMedicamentos()

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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Catálogo</h2>
            <p className="text-sm text-muted-foreground">
              {medicamentos.length} medicamento{medicamentos.length !== 1 ? "s" : ""} registrado
              {medicamentos.length !== 1 ? "s" : ""}
            </p>
          </div>
          <NuevoMedicamentoDialog onCreated={addMedicamento} />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <MedicamentosTable medicamentos={medicamentos} loading={loading} />
      </div>
    </div>
  )
}
