import { Users, FileText, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"

interface StatsCardsProps {
  totalPacientes: number
  totalHistorias: number
  loading: boolean
}

export function StatsCards({ totalPacientes, totalHistorias, loading }: StatsCardsProps) {
  const promedio =
    totalPacientes > 0 ? (totalHistorias / totalPacientes).toFixed(1) : "0"

  const cards = [
    {
      title: "Total Pacientes",
      value: totalPacientes,
      icon: Users,
      description: "Pacientes registrados",
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Total Historias",
      value: totalHistorias,
      icon: FileText,
      description: "Historias clínicas creadas",
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      title: "Promedio por Paciente",
      value: promedio,
      icon: TrendingUp,
      description: "Historias por paciente",
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold">{card.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
