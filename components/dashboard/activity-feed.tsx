"use client"

import { Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Badge } from "@/ui/badge"
import type { ActivityLog } from "@/lib/types"

interface ActivityFeedProps {
  activity: ActivityLog[]
  loading: boolean
  error: string | null
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function labelForAction(action: string) {
  if (action === "create") return "Creado"
  if (action === "update") return "Actualizado"
  if (action === "delete") return "Eliminado"
  return action
}

export function ActivityFeed({ activity, loading, error }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : activity.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sin actividad registrada</div>
        ) : (
          <div className="space-y-3">
            {activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="mt-0.5 rounded-full bg-primary/10 p-2">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{item.summary}</p>
                    <Badge variant="outline">{labelForAction(item.action)}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDateTime(item.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
