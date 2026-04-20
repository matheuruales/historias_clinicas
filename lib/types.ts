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
