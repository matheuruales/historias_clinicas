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
import { DatePicker } from "@/ui/date-picker"
import type { HistoriaClinica, NuevaHistoriaInput } from "@/lib/types"

interface EditarHistoriaDialogProps {
  historia: HistoriaClinica
  onUpdated: (id: string, input: NuevaHistoriaInput) => Promise<void>
}

export function EditarHistoriaDialog({ historia, onUpdated }: EditarHistoriaDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    fecha: historia.fecha,
    diagnostico: historia.diagnostico,
    sintomas: historia.sintomas,
    tratamiento: historia.tratamiento,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validate() {
    if (!form.diagnostico.trim()) return "El diagnostico es requerido"
    if (!form.sintomas.trim()) return "Los sintomas son requeridos"
    if (!form.tratamiento.trim()) return "El tratamiento es requerido"
    if (!form.fecha) return "La fecha es requerida"
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
      await onUpdated(historia.id, {
        paciente_id: historia.paciente_id,
        diagnostico: form.diagnostico.trim(),
        sintomas: form.sintomas.trim(),
        tratamiento: form.tratamiento.trim(),
        fecha: form.fecha,
      })
      setOpen(false)
    } catch {
      setError("Error al actualizar la historia clinica.")
    } finally {
      setSubmitting(false)
    }
  }

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen) {
      setForm({
        fecha: historia.fecha,
        diagnostico: historia.diagnostico,
        sintomas: historia.sintomas,
        tratamiento: historia.tratamiento,
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
          <DialogTitle>Editar Historia Clinica</DialogTitle>
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
            <label className="text-sm font-medium">Diagnostico</label>
            <Textarea
              rows={2}
              value={form.diagnostico}
              onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
              disabled={submitting}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Sintomas</label>
            <Textarea
              rows={2}
              value={form.sintomas}
              onChange={(e) => setForm({ ...form, sintomas: e.target.value })}
              disabled={submitting}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Tratamiento</label>
            <Textarea
              rows={2}
              value={form.tratamiento}
              onChange={(e) => setForm({ ...form, tratamiento: e.target.value })}
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
