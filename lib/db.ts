import { supabase } from "./supabase"
import type {
  Paciente,
  HistoriaClinica,
  PacienteConConteo,
  NuevoPacienteInput,
  NuevaHistoriaInput,
  Medicamento,
  Prescripcion,
  PrescripcionConMedicamento,
  NuevoMedicamentoInput,
  NuevaPrescripcionInput,
} from "./types"

const LS_PACIENTES = "hc_pacientes"
const LS_HISTORIAS = "hc_historias"
const LS_MEDICAMENTOS = "hc_medicamentos"
const LS_PRESCRIPCIONES = "hc_prescripciones"

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

function lsGetMedicamentos(): Medicamento[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(LS_MEDICAMENTOS)
  return raw ? (JSON.parse(raw) as Medicamento[]) : []
}

function lsSaveMedicamentos(data: Medicamento[]) {
  localStorage.setItem(LS_MEDICAMENTOS, JSON.stringify(data))
}

function lsGetPrescripciones(): Prescripcion[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(LS_PRESCRIPCIONES)
  return raw ? (JSON.parse(raw) as Prescripcion[]) : []
}

function lsSavePrescripciones(data: Prescripcion[]) {
  localStorage.setItem(LS_PRESCRIPCIONES, JSON.stringify(data))
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

export async function getMedicamentos(): Promise<Medicamento[]> {
  try {
    const { data, error } = await supabase
      .from("medicamentos")
      .select("*")
      .order("nombre")
    if (error) throw error
    return (data ?? []) as Medicamento[]
  } catch {
    return lsGetMedicamentos()
  }
}

export async function createMedicamento(input: NuevoMedicamentoInput): Promise<Medicamento> {
  try {
    const { data, error } = await supabase
      .from("medicamentos")
      .insert(input)
      .select()
      .single()
    if (error) throw error
    return data as Medicamento
  } catch {
    const nuevo: Medicamento = {
      id: crypto.randomUUID(),
      nombre: input.nombre,
      descripcion: input.descripcion || null,
      unidad: input.unidad,
      created_at: new Date().toISOString(),
    }
    lsSaveMedicamentos([...lsGetMedicamentos(), nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    return nuevo
  }
}

export async function getPrescripcionesByPaciente(
  pacienteId: string,
): Promise<PrescripcionConMedicamento[]> {
  try {
    const { data, error } = await supabase
      .from("prescripciones")
      .select("*, medicamento:medicamentos(*)")
      .eq("paciente_id", pacienteId)
      .order("fecha_inicio", { ascending: false })
    if (error) throw error
    return (data ?? []) as PrescripcionConMedicamento[]
  } catch {
    const prescripciones = lsGetPrescripciones().filter((p) => p.paciente_id === pacienteId)
    const medicamentos = lsGetMedicamentos()
    return prescripciones
      .map((p) => ({
        ...p,
        medicamento: medicamentos.find((m) => m.id === p.medicamento_id) ?? {
          id: p.medicamento_id,
          nombre: "Desconocido",
          descripcion: null,
          unidad: "",
          created_at: "",
        },
      }))
      .sort((a, b) => b.fecha_inicio.localeCompare(a.fecha_inicio))
  }
}

export async function createPrescripcion(
  input: NuevaPrescripcionInput,
): Promise<PrescripcionConMedicamento> {
  try {
    const { data, error } = await supabase
      .from("prescripciones")
      .insert(input)
      .select("*, medicamento:medicamentos(*)")
      .single()
    if (error) throw error
    return data as PrescripcionConMedicamento
  } catch {
    const medicamentos = lsGetMedicamentos()
    const medicamento = medicamentos.find((m) => m.id === input.medicamento_id) ?? {
      id: input.medicamento_id,
      nombre: "Desconocido",
      descripcion: null,
      unidad: "",
      created_at: "",
    }
    const nueva: Prescripcion = {
      id: crypto.randomUUID(),
      paciente_id: input.paciente_id,
      medicamento_id: input.medicamento_id,
      dosis: input.dosis,
      frecuencia: input.frecuencia,
      fecha_inicio: input.fecha_inicio,
      fecha_fin: input.fecha_fin || null,
      notas: input.notas || null,
      created_at: new Date().toISOString(),
    }
    lsSavePrescripciones([nueva, ...lsGetPrescripciones()])
    return { ...nueva, medicamento }
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
