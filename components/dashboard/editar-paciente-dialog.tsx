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
import type { Paciente, NuevoPacienteInput } from "@/lib/types"

interface EditarPacienteDialogProps {
  paciente: Paciente
  onUpdated: (id: string, input: NuevoPacienteInput) => Promise<void>
}

export function EditarPacienteDialog({ paciente, onUpdated }: EditarPacienteDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    nombre: paciente.nombre,
    edad: String(paciente.edad),
    cedula: paciente.cedula,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validate() {
    if (!form.nombre.trim()) return "El nombre es requerido"
    const edad = Number(form.edad)
    if (!form.edad || isNaN(edad) || edad < 1 || edad > 149)
      return "La edad debe estar entre 1 y 149"
    if (!form.cedula.trim()) return "La cédula es requerida"
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setSubmitting(true)
    setError(null)
    try {
      await onUpdated(paciente.id, {
        nombre: form.nombre.trim(),
        edad: Number(form.edad),
        cedula: form.cedula.trim(),
      })
      setOpen(false)
    } catch {
      setError("Error al actualizar el paciente.")
    } finally {
      setSubmitting(false)
    }
  }

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen) {
      setForm({ nombre: paciente.nombre, edad: String(paciente.edad), cedula: paciente.cedula })
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
          <DialogTitle>Editar Paciente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre completo</label>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              disabled={submitting}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Edad</label>
            <Input
              type="number"
              min={1}
              max={149}
              value={form.edad}
              onChange={(e) => setForm({ ...form, edad: e.target.value })}
              disabled={submitting}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Cédula</label>
            <Input
              value={form.cedula}
              onChange={(e) => setForm({ ...form, cedula: e.target.value })}
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
