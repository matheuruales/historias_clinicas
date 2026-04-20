"use client"

import Link from "next/link"
import { use, useEffect, useMemo, useState } from "react"
import { ArrowLeft, Pill, User } from "lucide-react"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select"
import { Card, CardContent } from "@/ui/card"
import { Badge } from "@/ui/badge"
import { usePatientHistorias, usePatientPrescripciones, useMedicamentos } from "@/hooks/use-clinical-data"
import { HistoriasTable } from "@/components/dashboard/historias-table"
import { NuevaHistoriaDialog } from "@/components/dashboard/nueva-historia-dialog"
import { PrescripcionesTable } from "@/components/dashboard/prescripciones-table"
import { NuevaPrescripcionDialog } from "@/components/dashboard/nueva-prescripcion-dialog"
import { exportToCsv, exportToPdf } from "@/lib/utils"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PacienteDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { paciente, historias, loading, error, addHistoria, removeHistoria, editHistoria } = usePatientHistorias(id)
  const { prescripciones, loading: loadingP, error: errorP, addPrescripcion, removePrescripcion, editPrescripcion } = usePatientPrescripciones(id)
  const { medicamentos } = useMedicamentos()
  const [searchHistoria, setSearchHistoria] = useState("")
  const [searchPrescripcion, setSearchPrescripcion] = useState("")
  const [pageSizeH, setPageSizeH] = useState("6")
  const [pageSizeP, setPageSizeP] = useState("6")
  const [pageH, setPageH] = useState(1)
  const [pageP, setPageP] = useState(1)

  const filteredHistorias = useMemo(() => {
    const term = searchHistoria.trim().toLowerCase()
    if (!term) return historias
    return historias.filter((h) =>
      h.diagnostico.toLowerCase().includes(term) ||
      h.sintomas.toLowerCase().includes(term) ||
      h.tratamiento.toLowerCase().includes(term),
    )
  }, [historias, searchHistoria])

  const filteredPrescripciones = useMemo(() => {
    const term = searchPrescripcion.trim().toLowerCase()
    if (!term) return prescripciones
    return prescripciones.filter((p) =>
      p.medicamento.nombre.toLowerCase().includes(term) ||
      p.dosis.toLowerCase().includes(term) ||
      p.frecuencia.toLowerCase().includes(term),
    )
  }, [prescripciones, searchPrescripcion])

  const perPageH = Number(pageSizeH)
  const perPageP = Number(pageSizeP)
  const totalPagesH = Math.max(1, Math.ceil(filteredHistorias.length / perPageH))
  const totalPagesP = Math.max(1, Math.ceil(filteredPrescripciones.length / perPageP))
  const paginatedHistorias = filteredHistorias.slice((pageH - 1) * perPageH, pageH * perPageH)
  const paginatedPrescripciones = filteredPrescripciones.slice((pageP - 1) * perPageP, pageP * perPageP)

  useEffect(() => {
    setPageH(1)
  }, [searchHistoria, pageSizeH])

  useEffect(() => {
    setPageP(1)
  }, [searchPrescripcion, pageSizeP])

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
          <h1 className="text-2xl font-bold tracking-tight">Expediente del Paciente</h1>
          <p className="text-muted-foreground">Historias clínicas y medicamentos</p>
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
                <Badge variant="secondary">
                  <Pill className="mr-1 h-3 w-3" />
                  {prescripciones.length} prescripción{prescripciones.length !== 1 ? "es" : ""}
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

      {/* Historias clínicas */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Registros Médicos</h2>
            <p className="text-sm text-muted-foreground">
              {filteredHistorias.length} historia{filteredHistorias.length !== 1 ? "s" : ""} clinica
              {filteredHistorias.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                exportToCsv("historias.csv", filteredHistorias.map((h) => ({
                  fecha: h.fecha,
                  diagnostico: h.diagnostico,
                  sintomas: h.sintomas,
                  tratamiento: h.tratamiento,
                })))
              }
              disabled={filteredHistorias.length === 0}
            >
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                exportToPdf("Historias Clinicas", filteredHistorias.map((h) => ({
                  fecha: h.fecha,
                  diagnostico: h.diagnostico,
                  sintomas: h.sintomas,
                  tratamiento: h.tratamiento,
                })))
              }
              disabled={filteredHistorias.length === 0}
            >
              Exportar PDF
            </Button>
            {paciente && (
              <NuevaHistoriaDialog
                pacienteId={id}
                onCreated={addHistoria}
                medicamentos={medicamentos}
                onPrescripcionCreated={addPrescripcion}
              />
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Buscar diagnostico, sintomas o tratamiento..."
            value={searchHistoria}
            onChange={(e) => setSearchHistoria(e.target.value)}
            className="max-w-sm"
          />
          <Select value={pageSizeH} onValueChange={setPageSizeH}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Por pagina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4 / pagina</SelectItem>
              <SelectItem value="6">6 / pagina</SelectItem>
              <SelectItem value="10">10 / pagina</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <HistoriasTable
          historias={paginatedHistorias}
          loading={loading}
          onUpdated={editHistoria}
          onDeleted={removeHistoria}
        />
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Pagina {pageH} de {totalPagesH}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageH((prev) => Math.max(1, prev - 1))}
              disabled={pageH === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageH((prev) => Math.min(totalPagesH, prev + 1))}
              disabled={pageH === totalPagesH}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      {/* Prescripciones */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Prescripciones</h2>
            <p className="text-sm text-muted-foreground">
              {filteredPrescripciones.length} prescripcion{filteredPrescripciones.length !== 1 ? "es" : ""} asignada
              {filteredPrescripciones.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                exportToCsv("prescripciones.csv", filteredPrescripciones.map((p) => ({
                  medicamento: p.medicamento.nombre,
                  dosis: p.dosis,
                  frecuencia: p.frecuencia,
                  fecha_inicio: p.fecha_inicio,
                  fecha_fin: p.fecha_fin ?? "",
                  notas: p.notas ?? "",
                })))
              }
              disabled={filteredPrescripciones.length === 0}
            >
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                exportToPdf("Prescripciones", filteredPrescripciones.map((p) => ({
                  medicamento: p.medicamento.nombre,
                  dosis: p.dosis,
                  frecuencia: p.frecuencia,
                  fecha_inicio: p.fecha_inicio,
                  fecha_fin: p.fecha_fin ?? "",
                  notas: p.notas ?? "",
                })))
              }
              disabled={filteredPrescripciones.length === 0}
            >
              Exportar PDF
            </Button>
            {paciente && (
              <NuevaPrescripcionDialog
                pacienteId={id}
                medicamentos={medicamentos}
                onCreated={addPrescripcion}
              />
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Buscar medicamento, dosis o frecuencia..."
            value={searchPrescripcion}
            onChange={(e) => setSearchPrescripcion(e.target.value)}
            className="max-w-sm"
          />
          <Select value={pageSizeP} onValueChange={setPageSizeP}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Por pagina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4 / pagina</SelectItem>
              <SelectItem value="6">6 / pagina</SelectItem>
              <SelectItem value="10">10 / pagina</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {errorP && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {errorP}
          </div>
        )}
        <PrescripcionesTable
          prescripciones={paginatedPrescripciones}
          loading={loadingP}
          medicamentos={medicamentos}
          onUpdated={editPrescripcion}
          onDeleted={removePrescripcion}
        />
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Pagina {pageP} de {totalPagesP}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageP((prev) => Math.max(1, prev - 1))}
              disabled={pageP === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageP((prev) => Math.min(totalPagesP, prev + 1))}
              disabled={pageP === totalPagesP}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
