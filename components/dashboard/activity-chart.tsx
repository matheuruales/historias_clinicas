"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import type { ActivityLog } from "@/lib/types"

interface ActivityChartProps {
  activity: ActivityLog[]
}

function dayKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatDayLabel(value: string) {
  const date = new Date(value + "T00:00:00")
  return date.toLocaleDateString("es-CO", { weekday: "short", day: "numeric" })
}

export function ActivityChart({ activity }: ActivityChartProps) {
  const today = new Date()
  const days = Array.from({ length: 7 }).map((_, idx) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - idx))
    return dayKey(date)
  })

  const counts = days.map((day) =>
    activity.filter((item) => dayKey(new Date(item.created_at)) === day).length,
  )

  const max = Math.max(1, ...counts)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Ultimos 7 dias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          {days.map((day, idx) => (
            <div key={day} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-md bg-primary/20"
                style={{ height: `${Math.round((counts[idx] / max) * 120) + 12}px` }}
              />
              <span className="text-xs text-muted-foreground">{formatDayLabel(day)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
