export interface Paciente {
  id: string
  nombre: string
  edad: number
  cedula: string
  created_at: string
}

export interface HistoriaClinica {
  id: string
  paciente_id: string
  diagnostico: string
  sintomas: string
  tratamiento: string
  fecha: string
  created_at: string
}

export interface PacienteConConteo extends Paciente {
  historias_count: number
}

export interface NuevoPacienteInput {
  nombre: string
  edad: number
  cedula: string
}

export interface NuevaHistoriaInput {
  paciente_id: string
  diagnostico: string
  sintomas: string
  tratamiento: string
  fecha: string
}

export interface ActivityLog {
  id: string
  entity_type: string
  entity_id: string | null
  action: string
  summary: string
  meta: Record<string, unknown> | null
  created_at: string
}

export interface Medicamento {
  id: string
  nombre: string
  descripcion: string | null
  unidad: string
  created_at: string
}

export interface Prescripcion {
  id: string
  paciente_id: string
  medicamento_id: string
  dosis: string
  frecuencia: string
  fecha_inicio: string
  fecha_fin: string | null
  notas: string | null
  created_at: string
}

export interface PrescripcionConMedicamento extends Prescripcion {
  medicamento: Medicamento
}

export interface NuevoMedicamentoInput {
  nombre: string
  descripcion: string
  unidad: string
}

export interface NuevaPrescripcionInput {
  paciente_id: string
  medicamento_id: string
  dosis: string
  frecuencia: string
  fecha_inicio: string
  fecha_fin: string | null
  notas: string | null
}
