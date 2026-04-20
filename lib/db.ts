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
  ActivityLog,
} from "./types"

const LS_PACIENTES = "hc_pacientes"
const LS_HISTORIAS = "hc_historias"
const LS_MEDICAMENTOS = "hc_medicamentos"
const LS_PRESCRIPCIONES = "hc_prescripciones"
const LS_ACTIVITY = "hc_activity"

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

function lsGetActivity(): ActivityLog[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(LS_ACTIVITY)
  return raw ? (JSON.parse(raw) as ActivityLog[]) : []
}

function lsSaveActivity(data: ActivityLog[]) {
  localStorage.setItem(LS_ACTIVITY, JSON.stringify(data))
}

async function logActivity(entry: Omit<ActivityLog, "id" | "created_at">) {
  try {
    const { data, error } = await supabase
      .from("activity_logs")
      .insert(entry)
      .select()
      .single()
    if (error) throw error
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("activity-log-updated"))
    }
    return data as ActivityLog
  } catch {
    const localEntry: ActivityLog = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...entry,
    }
    lsSaveActivity([localEntry, ...lsGetActivity()])
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("activity-log-updated"))
    }
    return localEntry
  }
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
    const created = data as Paciente
    await logActivity({
      entity_type: "paciente",
      entity_id: created.id,
      action: "create",
      summary: `Paciente registrado: ${created.nombre}`,
      meta: { cedula: created.cedula },
    })
    return created
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
    await logActivity({
      entity_type: "paciente",
      entity_id: newPaciente.id,
      action: "create",
      summary: `Paciente registrado: ${newPaciente.nombre}`,
      meta: { cedula: newPaciente.cedula },
    })
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
    const created = data as HistoriaClinica
    await logActivity({
      entity_type: "historia",
      entity_id: created.id,
      action: "create",
      summary: `Historia clinica registrada (${created.fecha})`,
      meta: { paciente_id: created.paciente_id },
    })
    return created
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
    await logActivity({
      entity_type: "historia",
      entity_id: newHistoria.id,
      action: "create",
      summary: `Historia clinica registrada (${newHistoria.fecha})`,
      meta: { paciente_id: newHistoria.paciente_id },
    })
    return newHistoria
  }
}

export async function updateHistoria(
  id: string,
  input: NuevaHistoriaInput,
): Promise<HistoriaClinica> {
  try {
    const { data, error } = await supabase
      .from("historias_clinicas")
      .update(input)
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    const updated = data as HistoriaClinica
    await logActivity({
      entity_type: "historia",
      entity_id: updated.id,
      action: "update",
      summary: `Historia clinica actualizada (${updated.fecha})`,
      meta: { paciente_id: updated.paciente_id },
    })
    return updated
  } catch {
    const existing = lsGetHistorias().find((h) => h.id === id)
    const updated: HistoriaClinica = {
      id,
      paciente_id: input.paciente_id,
      diagnostico: input.diagnostico,
      sintomas: input.sintomas,
      tratamiento: input.tratamiento,
      fecha: input.fecha,
      created_at: existing?.created_at ?? new Date().toISOString(),
    }
    lsSaveHistorias(lsGetHistorias().map((h) => (h.id === id ? updated : h)))
    await logActivity({
      entity_type: "historia",
      entity_id: updated.id,
      action: "update",
      summary: `Historia clinica actualizada (${updated.fecha})`,
      meta: { paciente_id: updated.paciente_id },
    })
    return updated
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
    const created = data as Medicamento
    await logActivity({
      entity_type: "medicamento",
      entity_id: created.id,
      action: "create",
      summary: `Medicamento registrado: ${created.nombre}`,
      meta: { unidad: created.unidad },
    })
    return created
  } catch {
    const nuevo: Medicamento = {
      id: crypto.randomUUID(),
      nombre: input.nombre,
      descripcion: input.descripcion || null,
      unidad: input.unidad,
      created_at: new Date().toISOString(),
    }
    lsSaveMedicamentos([...lsGetMedicamentos(), nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    await logActivity({
      entity_type: "medicamento",
      entity_id: nuevo.id,
      action: "create",
      summary: `Medicamento registrado: ${nuevo.nombre}`,
      meta: { unidad: nuevo.unidad },
    })
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
    const created = data as PrescripcionConMedicamento
    await logActivity({
      entity_type: "prescripcion",
      entity_id: created.id,
      action: "create",
      summary: `Prescripcion registrada: ${created.medicamento.nombre}`,
      meta: { paciente_id: created.paciente_id },
    })
    return created
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
    await logActivity({
      entity_type: "prescripcion",
      entity_id: nueva.id,
      action: "create",
      summary: `Prescripcion registrada: ${medicamento.nombre}`,
      meta: { paciente_id: nueva.paciente_id },
    })
    return { ...nueva, medicamento }
  }
}

export async function updatePrescripcion(
  id: string,
  input: NuevaPrescripcionInput,
): Promise<PrescripcionConMedicamento> {
  try {
    const { data, error } = await supabase
      .from("prescripciones")
      .update(input)
      .eq("id", id)
      .select("*, medicamento:medicamentos(*)")
      .single()
    if (error) throw error
    const updated = data as PrescripcionConMedicamento
    await logActivity({
      entity_type: "prescripcion",
      entity_id: updated.id,
      action: "update",
      summary: `Prescripcion actualizada: ${updated.medicamento.nombre}`,
      meta: { paciente_id: updated.paciente_id },
    })
    return updated
  } catch {
    const medicamentos = lsGetMedicamentos()
    const medicamento = medicamentos.find((m) => m.id === input.medicamento_id) ?? {
      id: input.medicamento_id,
      nombre: "Desconocido",
      descripcion: null,
      unidad: "",
      created_at: "",
    }
    const existing = lsGetPrescripciones().find((p) => p.id === id)
    const updated: Prescripcion = {
      id,
      paciente_id: input.paciente_id,
      medicamento_id: input.medicamento_id,
      dosis: input.dosis,
      frecuencia: input.frecuencia,
      fecha_inicio: input.fecha_inicio,
      fecha_fin: input.fecha_fin || null,
      notas: input.notas || null,
      created_at: existing?.created_at ?? new Date().toISOString(),
    }
    lsSavePrescripciones(
      lsGetPrescripciones().map((p) => (p.id === id ? updated : p)),
    )
    await logActivity({
      entity_type: "prescripcion",
      entity_id: updated.id,
      action: "update",
      summary: `Prescripcion actualizada: ${medicamento.nombre}`,
      meta: { paciente_id: updated.paciente_id },
    })
    return { ...updated, medicamento }
  }
}

export async function deletePaciente(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("pacientes").delete().eq("id", id)
    if (error) throw error
    await logActivity({
      entity_type: "paciente",
      entity_id: id,
      action: "delete",
      summary: "Paciente eliminado",
      meta: null,
    })
  } catch {
    lsSavePacientes(lsGetPacientes().filter((p) => p.id !== id))
    await logActivity({
      entity_type: "paciente",
      entity_id: id,
      action: "delete",
      summary: "Paciente eliminado",
      meta: null,
    })
  }
}

export async function deleteHistoria(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("historias_clinicas").delete().eq("id", id)
    if (error) throw error
    await logActivity({
      entity_type: "historia",
      entity_id: id,
      action: "delete",
      summary: "Historia clinica eliminada",
      meta: null,
    })
  } catch {
    lsSaveHistorias(lsGetHistorias().filter((h) => h.id !== id))
    await logActivity({
      entity_type: "historia",
      entity_id: id,
      action: "delete",
      summary: "Historia clinica eliminada",
      meta: null,
    })
  }
}

export async function deletePrescripcion(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("prescripciones").delete().eq("id", id)
    if (error) throw error
    await logActivity({
      entity_type: "prescripcion",
      entity_id: id,
      action: "delete",
      summary: "Prescripcion eliminada",
      meta: null,
    })
  } catch {
    lsSavePrescripciones(lsGetPrescripciones().filter((p) => p.id !== id))
    await logActivity({
      entity_type: "prescripcion",
      entity_id: id,
      action: "delete",
      summary: "Prescripcion eliminada",
      meta: null,
    })
  }
}

export async function deleteMedicamento(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("medicamentos").delete().eq("id", id)
    if (error) throw error
    await logActivity({
      entity_type: "medicamento",
      entity_id: id,
      action: "delete",
      summary: "Medicamento eliminado",
      meta: null,
    })
  } catch {
    lsSaveMedicamentos(lsGetMedicamentos().filter((m) => m.id !== id))
    await logActivity({
      entity_type: "medicamento",
      entity_id: id,
      action: "delete",
      summary: "Medicamento eliminado",
      meta: null,
    })
  }
}

export async function updatePaciente(
  id: string,
  input: NuevoPacienteInput,
): Promise<Paciente> {
  try {
    const { data, error } = await supabase
      .from("pacientes")
      .update(input)
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    const updated = data as Paciente
    await logActivity({
      entity_type: "paciente",
      entity_id: updated.id,
      action: "update",
      summary: `Paciente actualizado: ${updated.nombre}`,
      meta: { cedula: updated.cedula },
    })
    return updated
  } catch {
    const updated = { id, ...input, created_at: new Date().toISOString() }
    lsSavePacientes(lsGetPacientes().map((p) => (p.id === id ? updated : p)))
    await logActivity({
      entity_type: "paciente",
      entity_id: updated.id,
      action: "update",
      summary: `Paciente actualizado: ${updated.nombre}`,
      meta: { cedula: updated.cedula },
    })
    return updated
  }
}

export async function updateMedicamento(
  id: string,
  input: NuevoMedicamentoInput,
): Promise<Medicamento> {
  try {
    const { data, error } = await supabase
      .from("medicamentos")
      .update(input)
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    const updated = data as Medicamento
    await logActivity({
      entity_type: "medicamento",
      entity_id: updated.id,
      action: "update",
      summary: `Medicamento actualizado: ${updated.nombre}`,
      meta: { unidad: updated.unidad },
    })
    return updated
  } catch {
    const updated: Medicamento = {
      id,
      nombre: input.nombre,
      descripcion: input.descripcion || null,
      unidad: input.unidad,
      created_at: new Date().toISOString(),
    }
    lsSaveMedicamentos(
      lsGetMedicamentos()
        .map((m) => (m.id === id ? updated : m))
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    )
    await logActivity({
      entity_type: "medicamento",
      entity_id: updated.id,
      action: "update",
      summary: `Medicamento actualizado: ${updated.nombre}`,
      meta: { unidad: updated.unidad },
    })
    return updated
  }
}

export async function getActivityLogs(limit = 50): Promise<ActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data ?? []) as ActivityLog[]
  } catch {
    return lsGetActivity().slice(0, limit)
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
