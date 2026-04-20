"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
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
import { cn } from "@/lib/utils"
import type { Medicamento, NuevaPrescripcionInput, PrescripcionConMedicamento } from "@/lib/types"

interface EditarPrescripcionDialogProps {
  prescripcion: PrescripcionConMedicamento
  medicamentos: Medicamento[]
  onUpdated: (id: string, input: NuevaPrescripcionInput) => Promise<void>
}

export function EditarPrescripcionDialog({ prescripcion, medicamentos, onUpdated }: EditarPrescripcionDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    medicamento_id: prescripcion.medicamento_id,
    dosis: prescripcion.dosis,
    frecuencia: prescripcion.frecuencia,
    fecha_inicio: prescripcion.fecha_inicio,
    fecha_fin: prescripcion.fecha_fin ?? "",
    notas: prescripcion.notas ?? "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validate() {
    if (!form.medicamento_id) return "Selecciona un medicamento"
    if (!form.dosis.trim()) return "La dosis es requerida"
    if (!form.frecuencia.trim()) return "La frecuencia es requerida"
    if (!form.fecha_inicio) return "La fecha de inicio es requerida"
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
      await onUpdated(prescripcion.id, {
        paciente_id: prescripcion.paciente_id,
        medicamento_id: form.medicamento_id,
        dosis: form.dosis.trim(),
        frecuencia: form.frecuencia.trim(),
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin || null,
        notas: form.notas.trim() || null,
      })
      setOpen(false)
    } catch {
      setError("Error al actualizar la prescripcion.")
    } finally {
      setSubmitting(false)
    }
  }

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen) {
      setForm({
        medicamento_id: prescripcion.medicamento_id,
        dosis: prescripcion.dosis,
        frecuencia: prescripcion.frecuencia,
        fecha_inicio: prescripcion.fecha_inicio,
        fecha_fin: prescripcion.fecha_fin ?? "",
        notas: prescripcion.notas ?? "",
      })
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Prescripcion</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Medicamento</label>
            <select
              value={form.medicamento_id}
              onChange={(e) => setForm({ ...form, medicamento_id: e.target.value })}
              disabled={submitting}
              className={cn(
                "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm",
                "transition-colors outline-none",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              <option value="">Selecciona un medicamento...</option>
              {medicamentos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.unidad})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Dosis</label>
              <Input
                value={form.dosis}
                onChange={(e) => setForm({ ...form, dosis: e.target.value })}
                disabled={submitting}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Frecuencia</label>
              <Input
                value={form.frecuencia}
                onChange={(e) => setForm({ ...form, frecuencia: e.target.value })}
                disabled={submitting}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Fecha inicio</label>
              <Input
                type="date"
                value={form.fecha_inicio}
                onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                disabled={submitting}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Fecha fin</label>
              <Input
                type="date"
                value={form.fecha_fin}
                onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                disabled={submitting}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Notas</label>
            <Textarea
              rows={2}
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              disabled={submitting}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
