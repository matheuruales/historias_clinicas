"use client"

import Link from "next/link"
import { use } from "react"
import { ArrowLeft, User } from "lucide-react"
import { Button } from "@/ui/button"
import { Card, CardContent } from "@/ui/card"
import { Badge } from "@/ui/badge"
import { usePatientHistorias } from "@/hooks/use-clinical-data"
import { HistoriasTable } from "@/components/dashboard/historias-table"
import { NuevaHistoriaDialog } from "@/components/dashboard/nueva-historia-dialog"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PacienteDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { paciente, historias, loading, error, addHistoria } = usePatientHistorias(id)

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Historias Clínicas</h1>
          <p className="text-muted-foreground">Registros médicos del paciente</p>
        </div>
      </div>

      {loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
      ) : paciente ? (
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-lg font-semibold">{paciente.nombre}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Cédula: {paciente.cedula}</Badge>
                <Badge variant="outline">{paciente.edad} años</Badge>
                <Badge variant="secondary">
                  {historias.length} historia{historias.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          Paciente no encontrado
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Registros Médicos</h2>
            <p className="text-sm text-muted-foreground">
              {historias.length} historia{historias.length !== 1 ? "s" : ""} clínica
              {historias.length !== 1 ? "s" : ""}
            </p>
          </div>
          {paciente && <NuevaHistoriaDialog pacienteId={id} onCreated={addHistoria} />}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <HistoriasTable historias={historias} loading={loading} />
      </div>
    </div>
  )
}
