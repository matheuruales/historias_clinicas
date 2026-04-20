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
import { cn } from "@/lib/utils"
import type { Medicamento, NuevaPrescripcionInput } from "@/lib/types"

interface NuevaPrescripcionDialogProps {
  pacienteId: string
  medicamentos: Medicamento[]
  onCreated: (input: NuevaPrescripcionInput) => Promise<void>
}

function today() {
  return new Date().toISOString().split("T")[0]
}

const emptyForm = {
  medicamento_id: "",
  dosis: "",
  frecuencia: "",
  fecha_inicio: today(),
  fecha_fin: "",
  notas: "",
}

export function NuevaPrescripcionDialog({ pacienteId, medicamentos, onCreated }: NuevaPrescripcionDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validate() {
    if (!form.medicamento_id) return "Selecciona un medicamento"
    if (!form.dosis.trim()) return "La dosis es requerida (ej: 500mg)"
    if (!form.frecuencia.trim()) return "La frecuencia es requerida (ej: Cada 8 horas)"
    if (!form.fecha_inicio) return "La fecha de inicio es requerida"
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setSubmitting(true)
    setError(null)
    try {
      await onCreated({
        paciente_id: pacienteId,
        medicamento_id: form.medicamento_id,
        dosis: form.dosis.trim(),
        frecuencia: form.frecuencia.trim(),
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin || null,
        notas: form.notas.trim() || null,
      })
      setOpen(false)
      setForm({ ...emptyForm, fecha_inicio: today() })
    } catch {
      setError("Error al guardar la prescripción. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Asignar Medicamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Prescribir Medicamento</DialogTitle>
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
            {medicamentos.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No hay medicamentos. Agrégalos primero en la sección Medicamentos.
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Dosis</label>
              <Input
                placeholder="Ej: 500mg"
                value={form.dosis}
                onChange={(e) => setForm({ ...form, dosis: e.target.value })}
                disabled={submitting}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Frecuencia</label>
              <Input
                placeholder="Ej: Cada 8 horas"
                value={form.frecuencia}
                onChange={(e) => setForm({ ...form, frecuencia: e.target.value })}
                disabled={submitting}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Fecha inicio</label>
              <DatePicker
                value={form.fecha_inicio}
                onChange={(value) => setForm({ ...form, fecha_inicio: value })}
                disabled={submitting}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Fecha fin <span className="text-muted-foreground">(opcional)</span>
              </label>
              <DatePicker
                value={form.fecha_fin}
                onChange={(value) => setForm({ ...form, fecha_fin: value })}
                disabled={submitting}
                clearable
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Notas <span className="text-muted-foreground">(opcional)</span>
            </label>
            <Textarea
              placeholder="Instrucciones especiales, advertencias, etc."
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
              {submitting ? "Guardando..." : "Prescribir"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
