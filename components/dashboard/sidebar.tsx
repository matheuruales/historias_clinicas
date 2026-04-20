"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Pill, Stethoscope, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard",              label: "Panel Principal", icon: LayoutDashboard, exact: true },
  { href: "/dashboard",              label: "Pacientes",       icon: Users,           exact: true },
  { href: "/dashboard/medicamentos", label: "Medicamentos",    icon: Pill,            exact: false },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Stethoscope className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">HistoriasMed</p>
          <p className="text-xs text-muted-foreground">Gestión Clínica</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.exact
            ? pathname === item.href || (item.href === "/dashboard" && pathname.startsWith("/dashboard/pacientes"))
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">Presiona D para cambiar tema</p>
      </div>
    </aside>
  )
}
