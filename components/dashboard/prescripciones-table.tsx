import { Pill, Trash2 } from "lucide-react"
import { Badge } from "@/ui/badge"
import { Button } from "@/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table"
import type { Medicamento, NuevaPrescripcionInput, PrescripcionConMedicamento } from "@/lib/types"
import { EditarPrescripcionDialog } from "@/components/dashboard/editar-prescripcion-dialog"
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog"

interface PrescripcionesTableProps {
  prescripciones: PrescripcionConMedicamento[]
  loading: boolean
  medicamentos: Medicamento[]
  onUpdated: (id: string, input: NuevaPrescripcionInput) => Promise<void>
  onDeleted: (id: string) => Promise<void>
}

function formatDate(fecha: string) {
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function isActiva(fechaFin: string | null): boolean {
  if (!fechaFin) return true
  return new Date(fechaFin + "T00:00:00") >= new Date()
}

export function PrescripcionesTable({ prescripciones, loading, medicamentos, onUpdated, onDeleted }: PrescripcionesTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (prescripciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <Pill className="h-10 w-10 text-muted-foreground/40" />
        <p className="font-medium text-muted-foreground">Sin prescripciones registradas</p>
        <p className="text-sm text-muted-foreground">Asigna el primer medicamento con el botón de arriba</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medicamento</TableHead>
            <TableHead>Dosis</TableHead>
            <TableHead>Frecuencia</TableHead>
            <TableHead>Inicio</TableHead>
            <TableHead>Fin</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Notas</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prescripciones.map((p) => {
            const activa = isActiva(p.fecha_fin)
            return (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  {p.medicamento.nombre}
                  <span className="ml-1 text-xs text-muted-foreground">({p.medicamento.unidad})</span>
                </TableCell>
                <TableCell>{p.dosis}</TableCell>
                <TableCell className="text-muted-foreground">{p.frecuencia}</TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(p.fecha_inicio)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {p.fecha_fin ? formatDate(p.fecha_fin) : "Indefinido"}
                </TableCell>
                <TableCell>
                  <Badge variant={activa ? "default" : "secondary"}>
                    {activa ? "Activa" : "Terminada"}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="line-clamp-2 text-sm text-muted-foreground">{p.notas ?? "—"}</p>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <EditarPrescripcionDialog prescripcion={p} medicamentos={medicamentos} onUpdated={onUpdated} />
                    <ConfirmDeleteDialog
                      title="Eliminar prescripcion"
                      description="Esta accion eliminara la prescripcion del paciente."
                      onConfirm={() => onDeleted(p.id)}
                      trigger={
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
