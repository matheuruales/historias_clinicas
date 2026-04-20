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
import type { Medicamento, NuevoMedicamentoInput } from "@/lib/types"
import { EditarMedicamentoDialog } from "@/components/dashboard/editar-medicamento-dialog"
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog"

interface MedicamentosTableProps {
  medicamentos: Medicamento[]
  loading: boolean
  onUpdated: (id: string, input: NuevoMedicamentoInput) => Promise<void>
  onDeleted: (id: string) => Promise<void>
}

export function MedicamentosTable({ medicamentos, loading, onUpdated, onDeleted }: MedicamentosTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (medicamentos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <Pill className="h-10 w-10 text-muted-foreground/40" />
        <p className="font-medium text-muted-foreground">No hay medicamentos registrados</p>
        <p className="text-sm text-muted-foreground">Agrega el primer medicamento con el botón de arriba</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Unidad</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medicamentos.map((med) => (
            <TableRow key={med.id}>
              <TableCell className="font-medium">{med.nombre}</TableCell>
              <TableCell className="max-w-sm text-muted-foreground">
                <p className="line-clamp-2 text-sm">{med.descripcion ?? "—"}</p>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{med.unidad}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <EditarMedicamentoDialog medicamento={med} onUpdated={onUpdated} />
                  <ConfirmDeleteDialog
                    title="Eliminar medicamento"
                    description="Esta accion eliminara el medicamento del catalogo."
                    onConfirm={() => onDeleted(med.id)}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    }
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
