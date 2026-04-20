import { supabase } from "./supabase"
import type {
  Paciente,
  HistoriaClinica,
  PacienteConConteo,
  NuevoPacienteInput,
  NuevaHistoriaInput,
} from "./types"

const LS_PACIENTES = "hc_pacientes"
const LS_HISTORIAS = "hc_historias"

function lsGetPacientes(): Paciente[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(LS_PACIENTES)
  return raw ? (JSON.parse(raw) as Paciente[]) : []
}

function lsGetHistorias(): HistoriaClinica[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(LS_HISTORIAS)
  return raw ? (JSON.parse(raw) as HistoriaClinica[]) : []
}

function lsSavePacientes(data: Paciente[]) {
  localStorage.setItem(LS_PACIENTES, JSON.stringify(data))
}

function lsSaveHistorias(data: HistoriaClinica[]) {
  localStorage.setItem(LS_HISTORIAS, JSON.stringify(data))
}

export async function getPacientes(): Promise<PacienteConConteo[]> {
  try {
    const { data, error } = await supabase
      .from("pacientes")
      .select("*, historias_clinicas(count)")
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data ?? []).map((p) => ({
      id: p.id,
      nombre: p.nombre,
      edad: p.edad,
      cedula: p.cedula,
      created_at: p.created_at,
      historias_count: (p.historias_clinicas as { count: number }[])[0]?.count ?? 0,
    }))
  } catch {
    const pacientes = lsGetPacientes()
    const historias = lsGetHistorias()
    return pacientes.map((p) => ({
      ...p,
      historias_count: historias.filter((h) => h.paciente_id === p.id).length,
    }))
  }
}

export async function createPaciente(input: NuevoPacienteInput): Promise<Paciente> {
  try {
    const { data, error } = await supabase
      .from("pacientes")
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data as Paciente
  } catch {
    const newPaciente: Paciente = {
      id: crypto.randomUUID(),
      nombre: input.nombre,
      edad: input.edad,
      cedula: input.cedula,
      created_at: new Date().toISOString(),
    }
    const existing = lsGetPacientes()
    lsSavePacientes([newPaciente, ...existing])
    return newPaciente
  }
}

export async function getPacienteById(id: string): Promise<Paciente | null> {
  try {
    const { data, error } = await supabase
      .from("pacientes")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as Paciente
  } catch {
    return lsGetPacientes().find((p) => p.id === id) ?? null
  }
}

export async function getHistoriasByPaciente(pacienteId: string): Promise<HistoriaClinica[]> {
  try {
    const { data, error } = await supabase
      .from("historias_clinicas")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("fecha", { ascending: false })

    if (error) throw error
    return (data ?? []) as HistoriaClinica[]
  } catch {
    return lsGetHistorias()
      .filter((h) => h.paciente_id === pacienteId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
  }
}

export async function createHistoria(input: NuevaHistoriaInput): Promise<HistoriaClinica> {
  try {
    const { data, error } = await supabase
      .from("historias_clinicas")
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data as HistoriaClinica
  } catch {
    const newHistoria: HistoriaClinica = {
      id: crypto.randomUUID(),
      paciente_id: input.paciente_id,
      diagnostico: input.diagnostico,
      sintomas: input.sintomas,
      tratamiento: input.tratamiento,
      fecha: input.fecha,
      created_at: new Date().toISOString(),
    }
    const existing = lsGetHistorias()
    lsSaveHistorias([newHistoria, ...existing])
    return newHistoria
  }
}

export async function getTotalStats(): Promise<{
  totalPacientes: number
  totalHistorias: number
}> {
  try {
    const [pResult, hResult] = await Promise.all([
      supabase.from("pacientes").select("*", { count: "exact", head: true }),
      supabase.from("historias_clinicas").select("*", { count: "exact", head: true }),
    ])
    return {
      totalPacientes: pResult.count ?? 0,
      totalHistorias: hResult.count ?? 0,
    }
  } catch {
    return {
      totalPacientes: lsGetPacientes().length,
      totalHistorias: lsGetHistorias().length,
    }
  }
}
