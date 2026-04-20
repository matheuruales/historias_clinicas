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
import type { Medicamento, NuevoMedicamentoInput } from "@/lib/types"

interface EditarMedicamentoDialogProps {
  medicamento: Medicamento
  onUpdated: (id: string, input: NuevoMedicamentoInput) => Promise<void>
}

export function EditarMedicamentoDialog({ medicamento, onUpdated }: EditarMedicamentoDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    nombre: medicamento.nombre,
    descripcion: medicamento.descripcion ?? "",
    unidad: medicamento.unidad,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validate() {
    if (!form.nombre.trim()) return "El nombre es requerido"
    if (!form.unidad.trim()) return "La unidad es requerida"
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setSubmitting(true)
    setError(null)
    try {
      await onUpdated(medicamento.id, {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        unidad: form.unidad.trim(),
      })
      setOpen(false)
    } catch {
      setError("Error al actualizar el medicamento.")
    } finally {
      setSubmitting(false)
    }
  }

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen) {
      setForm({ nombre: medicamento.nombre, descripcion: medicamento.descripcion ?? "", unidad: medicamento.unidad })
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Medicamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre</label>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              disabled={submitting}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Descripción <span className="text-muted-foreground">(opcional)</span></label>
            <Textarea
              rows={2}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              disabled={submitting}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Unidad</label>
            <Input
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
              {submitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
