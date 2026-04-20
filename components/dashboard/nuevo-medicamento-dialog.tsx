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
import type { NuevoMedicamentoInput } from "@/lib/types"

interface NuevoMedicamentoDialogProps {
  onCreated: (input: NuevoMedicamentoInput) => Promise<void>
}

const emptyForm = { nombre: "", descripcion: "", unidad: "mg" }

export function NuevoMedicamentoDialog({ onCreated }: NuevoMedicamentoDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validate() {
    if (!form.nombre.trim()) return "El nombre del medicamento es requerido"
    if (!form.unidad.trim()) return "La unidad es requerida (ej: mg, ml, comprimido)"
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setSubmitting(true)
    setError(null)
    try {
      await onCreated({ nombre: form.nombre.trim(), descripcion: form.descripcion.trim(), unidad: form.unidad.trim() })
      setOpen(false)
      setForm(emptyForm)
    } catch {
      setError("Error al guardar el medicamento. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Medicamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Medicamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre</label>
            <Input
              placeholder="Ej: Ibuprofeno"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              disabled={submitting}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Descripción <span className="text-muted-foreground">(opcional)</span></label>
            <Textarea
              placeholder="Indicaciones, grupo farmacológico, etc."
              rows={2}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              disabled={submitting}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Unidad</label>
            <Input
              placeholder="Ej: mg, ml, comprimido"
              value={form.unidad}
              onChange={(e) => setForm({ ...form, unidad: e.target.value })}
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
