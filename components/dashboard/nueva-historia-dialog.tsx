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
import type { NuevaHistoriaInput } from "@/lib/types"

interface NuevaHistoriaDialogProps {
  pacienteId: string
  onCreated: (input: NuevaHistoriaInput) => Promise<void>
}

function today() {
  return new Date().toISOString().split("T")[0]
}

const emptyForm = { diagnostico: "", sintomas: "", tratamiento: "", fecha: today() }

export function NuevaHistoriaDialog({ pacienteId, onCreated }: NuevaHistoriaDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validate() {
    if (!form.diagnostico.trim()) return "El diagnóstico es requerido"
    if (!form.sintomas.trim()) return "Los síntomas son requeridos"
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
      await onCreated({
        paciente_id: pacienteId,
        diagnostico: form.diagnostico.trim(),
        sintomas: form.sintomas.trim(),
        tratamiento: form.tratamiento.trim(),
        fecha: form.fecha,
      })
      setOpen(false)
      setForm({ ...emptyForm, fecha: today() })
    } catch {
      setError("Error al guardar la historia clínica. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
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
            <Input
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
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
