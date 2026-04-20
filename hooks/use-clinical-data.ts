"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  getPacientes,
  createPaciente,
  deletePaciente,
  updatePaciente,
  getPacienteById,
  getHistoriasByPaciente,
  createHistoria,
  deleteHistoria,
  getTotalStats,
  getMedicamentos,
  createMedicamento,
  deleteMedicamento,
  updateMedicamento,
  getPrescripcionesByPaciente,
  createPrescripcion,
  deletePrescripcion,
  updatePrescripcion,
  updateHistoria,
  getActivityLogs,
} from "@/lib/db"
import type {
  Paciente,
  HistoriaClinica,
  PacienteConConteo,
  NuevoPacienteInput,
  NuevaHistoriaInput,
  Medicamento,
  PrescripcionConMedicamento,
  NuevoMedicamentoInput,
  NuevaPrescripcionInput,
  ActivityLog,
} from "@/lib/types"

export function useClinicalData() {
  const [pacientes, setPacientes] = useState<PacienteConConteo[]>([])
  const [totalStats, setTotalStats] = useState({ totalPacientes: 0, totalHistorias: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [pacs, stats] = await Promise.all([getPacientes(), getTotalStats()])
      setPacientes(pacs)
      setTotalStats(stats)
    } catch {
      setError("Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }, [])

  const addPaciente = useCallback(async (input: NuevoPacienteInput) => {
    try {
      const created = await createPaciente(input)
      setPacientes((prev) => [{ ...created, historias_count: 0 }, ...prev])
      setTotalStats((prev) => ({ ...prev, totalPacientes: prev.totalPacientes + 1 }))
      toast.success("Paciente registrado correctamente")
    } catch {
      toast.error("Error al registrar el paciente")
      throw new Error("Error al registrar el paciente")
    }
  }, [])

  const removePaciente = useCallback(async (id: string) => {
    try {
      await deletePaciente(id)
      setPacientes((prev) => prev.filter((p) => p.id !== id))
      setTotalStats((prev) => ({ ...prev, totalPacientes: Math.max(0, prev.totalPacientes - 1) }))
      toast.success("Paciente eliminado")
    } catch {
      toast.error("Error al eliminar el paciente")
      throw new Error("Error al eliminar")
    }
  }, [])

  const editPaciente = useCallback(async (id: string, input: NuevoPacienteInput) => {
    try {
      const updated = await updatePaciente(id, input)
      setPacientes((prev) =>
        prev.map((p) => (p.id === id ? { ...updated, historias_count: p.historias_count } : p)),
      )
      toast.success("Paciente actualizado")
    } catch {
      toast.error("Error al actualizar el paciente")
      throw new Error("Error al actualizar")
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { pacientes, totalStats, loading, error, addPaciente, removePaciente, editPaciente, refresh: fetchData }
}

export function usePatientHistorias(pacienteId: string) {
  const [historias, setHistorias] = useState<HistoriaClinica[]>([])
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [pac, hists] = await Promise.all([
        getPacienteById(pacienteId),
        getHistoriasByPaciente(pacienteId),
      ])
      setPaciente(pac)
      setHistorias(hists)
    } catch {
      setError("Error al cargar los datos del paciente")
    } finally {
      setLoading(false)
    }
  }, [pacienteId])

  const addHistoria = useCallback(async (input: NuevaHistoriaInput) => {
    try {
      const created = await createHistoria(input)
      setHistorias((prev) => [created, ...prev])
      toast.success("Historia clínica registrada")
    } catch {
      toast.error("Error al registrar la historia clínica")
      throw new Error("Error al registrar")
    }
  }, [])

  const removeHistoria = useCallback(async (id: string) => {
    try {
      await deleteHistoria(id)
      setHistorias((prev) => prev.filter((h) => h.id !== id))
      toast.success("Historia clínica eliminada")
    } catch {
      toast.error("Error al eliminar la historia clínica")
      throw new Error("Error al eliminar")
    }
  }, [])

  const editHistoria = useCallback(async (id: string, input: NuevaHistoriaInput) => {
    try {
      const updated = await updateHistoria(id, input)
      setHistorias((prev) => prev.map((h) => (h.id === id ? updated : h)))
      toast.success("Historia clinica actualizada")
    } catch {
      toast.error("Error al actualizar la historia clinica")
      throw new Error("Error al actualizar")
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { historias, paciente, loading, error, addHistoria, removeHistoria, editHistoria }
}

export function useMedicamentos() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setMedicamentos(await getMedicamentos())
    } catch {
      setError("Error al cargar los medicamentos")
    } finally {
      setLoading(false)
    }
  }, [])

  const addMedicamento = useCallback(async (input: NuevoMedicamentoInput) => {
    try {
      const created = await createMedicamento(input)
      setMedicamentos((prev) =>
        [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre)),
      )
      toast.success("Medicamento registrado")
    } catch {
      toast.error("Error al registrar el medicamento")
      throw new Error("Error al registrar")
    }
  }, [])

  const removeMedicamento = useCallback(async (id: string) => {
    try {
      await deleteMedicamento(id)
      setMedicamentos((prev) => prev.filter((m) => m.id !== id))
      toast.success("Medicamento eliminado")
    } catch {
      toast.error("Error al eliminar el medicamento")
      throw new Error("Error al eliminar")
    }
  }, [])

  const editMedicamento = useCallback(async (id: string, input: NuevoMedicamentoInput) => {
    try {
      const updated = await updateMedicamento(id, input)
      setMedicamentos((prev) =>
        prev.map((m) => (m.id === id ? updated : m)).sort((a, b) => a.nombre.localeCompare(b.nombre)),
      )
      toast.success("Medicamento actualizado")
    } catch {
      toast.error("Error al actualizar el medicamento")
      throw new Error("Error al actualizar")
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { medicamentos, loading, error, addMedicamento, removeMedicamento, editMedicamento }
}

export function usePatientPrescripciones(pacienteId: string) {
  const [prescripciones, setPrescripciones] = useState<PrescripcionConMedicamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPrescripciones(await getPrescripcionesByPaciente(pacienteId))
    } catch {
      setError("Error al cargar las prescripciones")
    } finally {
      setLoading(false)
    }
  }, [pacienteId])

  const addPrescripcion = useCallback(async (input: NuevaPrescripcionInput) => {
    try {
      const created = await createPrescripcion(input)
      setPrescripciones((prev) => [created, ...prev])
      toast.success("Prescripción registrada")
    } catch {
      toast.error("Error al registrar la prescripción")
      throw new Error("Error al registrar")
    }
  }, [])

  const removePrescripcion = useCallback(async (id: string) => {
    try {
      await deletePrescripcion(id)
      setPrescripciones((prev) => prev.filter((p) => p.id !== id))
      toast.success("Prescripción eliminada")
    } catch {
      toast.error("Error al eliminar la prescripción")
      throw new Error("Error al eliminar")
    }
  }, [])

  const editPrescripcion = useCallback(async (id: string, input: NuevaPrescripcionInput) => {
    try {
      const updated = await updatePrescripcion(id, input)
      setPrescripciones((prev) => prev.map((p) => (p.id === id ? updated : p)))
      toast.success("Prescripcion actualizada")
    } catch {
      toast.error("Error al actualizar la prescripcion")
      throw new Error("Error al actualizar")
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { prescripciones, loading, error, addPrescripcion, removePrescripcion, editPrescripcion }
}

export function useActivityFeed(limit = 30) {
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setActivity(await getActivityLogs(limit))
    } catch {
      setError("Error al cargar la actividad")
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    function handleRefresh() {
      fetchData()
    }
    window.addEventListener("activity-log-updated", handleRefresh)
    return () => window.removeEventListener("activity-log-updated", handleRefresh)
  }, [fetchData])

  return { activity, loading, error, refresh: fetchData }
}
