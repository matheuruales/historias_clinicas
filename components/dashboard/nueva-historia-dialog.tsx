"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog"
import { Input } from "@/ui/input"
import { Textarea } from "@/ui/textarea"
import { DatePicker } from "@/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select"
import type { Medicamento, NuevaHistoriaInput, NuevaPrescripcionInput } from "@/lib/types"

interface NuevaHistoriaDialogProps {
  pacienteId: string
  onCreated: (input: NuevaHistoriaInput) => Promise<void>
  medicamentos?: Medicamento[]
  onPrescripcionCreated?: (input: NuevaPrescripcionInput) => Promise<void>
}

function today() {
  return new Date().toISOString().split("T")[0]
}

const emptyForm = { diagnostico: "", sintomas: "", tratamiento: "", fecha: today() }
type PrescripcionForm = {
  medicamento_id: string
  dosis: string
  frecuencia: string
  fecha_inicio: string
  fecha_fin: string
  notas: string
}

const emptyPrescripcion: PrescripcionForm = {
  medicamento_id: "",
  dosis: "",
  frecuencia: "",
  fecha_inicio: today(),
  fecha_fin: "",
  notas: "",
}

export function NuevaHistoriaDialog({
  pacienteId,
  onCreated,
  medicamentos = [],
  onPrescripcionCreated,
}: NuevaHistoriaDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [prescripciones, setPrescripciones] = useState<PrescripcionForm[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validate() {
    if (!form.diagnostico.trim()) return "El diagnóstico es requerido"
    if (!form.sintomas.trim()) return "Los síntomas son requeridos"
    if (!form.tratamiento.trim()) return "El tratamiento es requerido"
    if (!form.fecha) return "La fecha es requerida"
    if (onPrescripcionCreated && prescripciones.length > 0) {
      for (const prescripcion of prescripciones) {
        if (!prescripcion.medicamento_id) return "Selecciona un medicamento"
        if (!prescripcion.dosis.trim()) return "La dosis es requerida"
        if (!prescripcion.frecuencia.trim()) return "La frecuencia es requerida"
        if (!prescripcion.fecha_inicio) return "La fecha de inicio es requerida"
      }
    }
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onCreated({
        paciente_id: pacienteId,
        diagnostico: form.diagnostico.trim(),
        sintomas: form.sintomas.trim(),
        tratamiento: form.tratamiento.trim(),
        fecha: form.fecha,
      })
      if (onPrescripcionCreated) {
        for (const prescripcion of prescripciones) {
          await onPrescripcionCreated({
            paciente_id: pacienteId,
            medicamento_id: prescripcion.medicamento_id,
            dosis: prescripcion.dosis.trim(),
            frecuencia: prescripcion.frecuencia.trim(),
            fecha_inicio: prescripcion.fecha_inicio,
            fecha_fin: prescripcion.fecha_fin || null,
            notas: prescripcion.notas.trim() || null,
          })
        }
      }
      setOpen(false)
      setForm({ ...emptyForm, fecha: today() })
      setPrescripciones([])
    } catch {
      setError("Error al guardar la historia clínica. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  function addPrescripcion() {
    setPrescripciones((prev) => [...prev, { ...emptyPrescripcion, fecha_inicio: today() }])
  }

  function updatePrescripcion(index: number, patch: Partial<PrescripcionForm>) {
    setPrescripciones((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)),
    )
  }

  function removePrescripcion(index: number) {
    setPrescripciones((prev) => prev.filter((_, idx) => idx !== index))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Historia Clínica
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva Historia Clínica</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Fecha</label>
            <DatePicker
              value={form.fecha}
              onChange={(value) => setForm({ ...form, fecha: value })}
              disabled={submitting}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Diagnóstico</label>
            <Textarea
              placeholder="Descripción del diagnóstico..."
              rows={2}
              value={form.diagnostico}
              onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
              disabled={submitting}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Síntomas</label>
            <Textarea
              placeholder="Síntomas presentados..."
              rows={2}
              value={form.sintomas}
              onChange={(e) => setForm({ ...form, sintomas: e.target.value })}
              disabled={submitting}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Tratamiento</label>
            <Textarea
              placeholder="Tratamiento indicado..."
              rows={2}
              value={form.tratamiento}
              onChange={(e) => setForm({ ...form, tratamiento: e.target.value })}
              disabled={submitting}
            />
          </div>
          {onPrescripcionCreated && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Medicamentos (opcional)</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPrescripcion}
                  disabled={submitting || medicamentos.length === 0}
                >
                  Agregar medicamento
                </Button>
              </div>
              {medicamentos.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No hay medicamentos en el catalogo. Agregalos en la seccion Medicamentos.
                </p>
              )}
              {prescripciones.map((item, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Medicamento #{index + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePrescripcion(index)}
                      disabled={submitting}
                    >
                      Quitar
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Medicamento</label>
                    <Select
                      value={item.medicamento_id}
                      onValueChange={(value) => updatePrescripcion(index, { medicamento_id: value })}
                      disabled={submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un medicamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicamentos.map((med) => (
                          <SelectItem key={med.id} value={med.id}>
                            {med.nombre} ({med.unidad})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Dosis</label>
                      <Input
                        value={item.dosis}
                        onChange={(e) => updatePrescripcion(index, { dosis: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Frecuencia</label>
                      <Input
                        value={item.frecuencia}
                        onChange={(e) => updatePrescripcion(index, { frecuencia: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Fecha inicio</label>
                      <DatePicker
                        value={item.fecha_inicio}
                        onChange={(value) => updatePrescripcion(index, { fecha_inicio: value })}
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Fecha fin</label>
                      <DatePicker
                        value={item.fecha_fin}
                        onChange={(value) => updatePrescripcion(index, { fecha_fin: value })}
                        disabled={submitting}
                        clearable
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Notas</label>
                    <Textarea
                      rows={2}
                      value={item.notas}
                      onChange={(e) => updatePrescripcion(index, { notas: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
