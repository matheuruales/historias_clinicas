import { FileText } from "lucide-react"
import { Badge } from "@/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table"
import type { HistoriaClinica } from "@/lib/types"

interface HistoriasTableProps {
  historias: HistoriaClinica[]
  loading: boolean
}

function formatDate(fecha: string) {
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function HistoriasTable({ historias, loading }: HistoriasTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (historias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/40" />
        <p className="font-medium text-muted-foreground">No hay historias clínicas</p>
        <p className="text-sm text-muted-foreground">Registra la primera historia con el botón de arriba</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Diagnóstico</TableHead>
            <TableHead>Síntomas</TableHead>
            <TableHead>Tratamiento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {historias.map((historia) => (
            <TableRow key={historia.id}>
              <TableCell className="whitespace-nowrap">
                <Badge variant="outline">{formatDate(historia.fecha)}</Badge>
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="line-clamp-2 text-sm">{historia.diagnostico}</p>
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="line-clamp-2 text-sm text-muted-foreground">{historia.sintomas}</p>
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="line-clamp-2 text-sm text-muted-foreground">{historia.tratamiento}</p>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
