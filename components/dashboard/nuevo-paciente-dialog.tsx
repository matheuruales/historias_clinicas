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
import type { NuevoPacienteInput } from "@/lib/types"

interface NuevoPacienteDialogProps {
  onCreated: (input: NuevoPacienteInput) => Promise<void>
}

const emptyForm = { nombre: "", edad: "", cedula: "" }

export function NuevoPacienteDialog({ onCreated }: NuevoPacienteDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
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
    if (validationError) {
      setError(validationError)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onCreated({ nombre: form.nombre.trim(), edad: Number(form.edad), cedula: form.cedula.trim() })
      setOpen(false)
      setForm(emptyForm)
    } catch {
      setError("Error al guardar el paciente. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Paciente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre completo</label>
            <Input
              placeholder="Ej: Juan García"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              disabled={submitting}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Edad</label>
            <Input
              type="number"
              placeholder="Ej: 35"
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
              placeholder="Ej: 1234567890"
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
              {submitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
