"use client"

import { useRouter } from "next/navigation"
import { Eye, Trash2, Users } from "lucide-react"
import { Button } from "@/ui/button"
import { Badge } from "@/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table"
import type { NuevoPacienteInput, PacienteConConteo } from "@/lib/types"
import { EditarPacienteDialog } from "@/components/dashboard/editar-paciente-dialog"
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog"

interface PacientesTableProps {
  pacientes: PacienteConConteo[]
  loading: boolean
  onUpdated: (id: string, input: NuevoPacienteInput) => Promise<void>
  onDeleted: (id: string) => Promise<void>
}

export function PacientesTable({ pacientes, loading, onUpdated, onDeleted }: PacientesTableProps) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (pacientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <Users className="h-10 w-10 text-muted-foreground/40" />
        <p className="font-medium text-muted-foreground">No hay pacientes registrados</p>
        <p className="text-sm text-muted-foreground">Crea el primer paciente con el botón de arriba</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Cédula</TableHead>
            <TableHead>Edad</TableHead>
            <TableHead>Historias</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pacientes.map((paciente) => (
            <TableRow key={paciente.id} className="group">
              <TableCell className="font-medium">{paciente.nombre}</TableCell>
              <TableCell className="text-muted-foreground">{paciente.cedula}</TableCell>
              <TableCell className="text-muted-foreground">{paciente.edad} años</TableCell>
              <TableCell>
                <Badge variant={paciente.historias_count > 0 ? "default" : "secondary"}>
                  {paciente.historias_count}{" "}
                  {paciente.historias_count === 1 ? "historia" : "historias"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/pacientes/${paciente.id}`)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Ver Historias
                  </Button>
                  <EditarPacienteDialog
                    paciente={paciente}
                    onUpdated={onUpdated}
                  />
                  <ConfirmDeleteDialog
                    title="Eliminar paciente"
                    description="Esta accion eliminara el paciente y sus historias clinicas."
                    onConfirm={() => onDeleted(paciente.id)}
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
