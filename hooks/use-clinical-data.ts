"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getPacientes,
  createPaciente,
  getPacienteById,
  getHistoriasByPaciente,
  createHistoria,
  getTotalStats,
} from "@/lib/db"
import type {
  Paciente,
  HistoriaClinica,
  PacienteConConteo,
  NuevoPacienteInput,
  NuevaHistoriaInput,
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
    const created = await createPaciente(input)
    setPacientes((prev) => [{ ...created, historias_count: 0 }, ...prev])
    setTotalStats((prev) => ({ ...prev, totalPacientes: prev.totalPacientes + 1 }))
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { pacientes, totalStats, loading, error, addPaciente, refresh: fetchData }
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
    const created = await createHistoria(input)
    setHistorias((prev) => [created, ...prev])
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { historias, paciente, loading, error, addHistoria }
}
