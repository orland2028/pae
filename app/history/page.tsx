'use client'

import { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'

import {
  getInspectionFields,
  listInspections,
  fetchInspectionHistory,
  type InspectionFieldRow,
  type InspectionRow,
} from '@/lib/inspections/repository'

export const dynamic = 'force-dynamic'

function HistoryPage() {
  const [rows, setRows] = useState<InspectionRow[] | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [fields, setFields] = useState<Record<string, InspectionFieldRow[]>>({})
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchList() {
      try {
        // Em produção, use a API server-side segura que usa SUPABASE_SERVICE_ROLE_KEY
        if (process.env.NODE_ENV === 'production') {
          const res = await fetch(`/api/inspections`)
          if (!res.ok) throw new Error(`API /api/inspections failed: ${res.status}`)
          const payload = await res.json()
          const r = Array.isArray(payload?.data) ? payload.data : []
          if (mounted) {
            if (Array.isArray(r) && r.length === 0) {
              try {
                const { listInspectionsWithFallback } = await import('@/lib/inspections/repository')
                const fallback = await listInspectionsWithFallback(200)
                setRows(fallback)
              } catch (fallbackErr) {
                setRows([])
              }
            } else {
              setRows(r)
            }
            setErr(null)
          }
          return
        }

        const r = await fetchInspectionHistory(200)
        if (mounted) {
          if (Array.isArray(r) && r.length === 0) {
            // tenta fallback quando não há registros pai
            try {
              const { listInspectionsWithFallback } = await import('@/lib/inspections/repository')
              const fallback = await listInspectionsWithFallback(200)
              setRows(fallback)
            } catch (fallbackErr) {
              setRows([])
            }
          } else {
            setRows(r)
          }
          setErr(null)
        }
      } catch (e) {
        if (mounted) setErr((e as Error).message)
      }
    }

    fetchList()

    // ouvindo notificações de salvar para atualizar automaticamente
    let bc: BroadcastChannel | null = null
    try {
      bc = new BroadcastChannel('inspections')
      bc.onmessage = (ev) => {
        const payload = ev.data as any
        if (payload?.type === 'saved') {
          fetchList()
        }
      }
    } catch {
      // BroadcastChannel pode não estar disponível — não é fatal
    }

    return () => {
      mounted = false
      if (bc) bc.close()
    }
  }, [])

  const toggle = async (id: string) => {
    if (expanded === id) {
      setExpanded(null)
      return
    }
    setExpanded(id)
    if (!fields[id]) {
      // verifica se a linha já inclui nested fields (evita chamada extra)
      const row = rows?.find((r) => r.id === id) as
        | (InspectionRow & { inspection_result_fields?: InspectionFieldRow[] })
        | undefined
      if (row && row.inspection_result_fields) {
        setFields((prev) => ({ ...prev, [id]: row.inspection_result_fields ?? [] }))
        return
      }
      const f = await getInspectionFields(id)
      setFields((prev) => ({ ...prev, [id]: f }))
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl flex items-center justify-between gap-4 px-3 py-2 sm:px-4 sm:py-3 lg:px-8">
          <Link href="/" className="font-mono text-xs sm:text-sm text-muted-foreground hover:text-foreground truncate">
            ← InspectorLS
          </Link>
          <Link
            href="/scanner"
            className="font-mono text-xs uppercase tracking-widest text-primary hover:underline truncate"
          >
            Scanner
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
        <h1 className="text-xl sm:text-2xl font-bold text-balance">Histórico de Inspeções</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Registros salvos automaticamente após cada captura completa.
        </p>

        {err && (
          <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs sm:text-sm text-destructive break-words">
            {err}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {/* Tabela para desktop, cards para mobile */}
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
            <thead className="bg-card text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-2 sm:px-3 py-2 text-xs">Data</th>
                <th className="px-2 sm:px-3 py-2 text-xs">Status</th>
                <th className="px-2 sm:px-3 py-2 text-xs hidden md:table-cell">EA</th>
                <th className="px-2 sm:px-3 py-2 text-xs">LS</th>
                <th className="px-2 sm:px-3 py-2 text-xs hidden lg:table-cell">Validade</th>
                <th className="px-2 sm:px-3 py-2 text-xs hidden xl:table-cell">Hora</th>
                <th className="px-2 sm:px-3 py-2 text-xs hidden 2xl:table-cell">OCR conf</th>
                <th className="px-2 sm:px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows === null && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-xs sm:text-sm text-muted-foreground">
                    Carregando…
                  </td>
                </tr>
              )}
              {rows?.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-xs sm:text-sm text-muted-foreground">
                    Nenhuma inspeção salva ainda.
                  </td>
                </tr>
              )}
              {rows?.length > 0 && rows[0].status === 'ORPHANED' && (
                <tr>
                  <td colSpan={8} className="px-3 py-3 text-center text-xs text-muted-foreground">
                    Há registros de campos no banco, mas faltam registros pai em `inspection_results`.
                  </td>
                </tr>
              )}
              {rows?.map((r) => (
                <Fragment key={r.id}>
                  <tr key={r.id} className="border-t border-border">
                    <td className="font-mono px-2 sm:px-3 py-2 text-xs">
                      {new Date(r.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-2 sm:px-3 py-2">
                      <span
                        className={
                          'font-mono rounded px-2 py-0.5 text-[10px] font-bold ' +
                          (r.aprovado
                            ? 'bg-success text-success-foreground'
                            : 'bg-destructive text-destructive-foreground')
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="font-mono px-2 sm:px-3 py-2 hidden md:table-cell text-xs">{r.ea ?? '—'}</td>
                    <td className="font-mono px-2 sm:px-3 py-2 text-xs">{r.ls ?? '—'}</td>
                    <td className="font-mono px-2 sm:px-3 py-2 hidden lg:table-cell text-xs">{r.data_validade ?? '—'}</td>
                    <td className="font-mono px-2 sm:px-3 py-2 hidden xl:table-cell text-xs">{r.hora ?? '—'}</td>
                    <td className="font-mono px-2 sm:px-3 py-2 hidden 2xl:table-cell text-xs text-muted-foreground">
                      {r.ocr_confidence ?? 0}%
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-right">
                      <button
                        onClick={() => toggle(r.id)}
                        className="rounded border border-border px-2 py-1 text-xs hover:bg-accent"
                      >
                        {expanded === r.id ? 'Fechar' : 'Ver'}
                      </button>
                    </td>
                  </tr>
                  {expanded === r.id && (
                    <tr key={r.id + '-details'} className="border-t border-border bg-card/40">
                      <td colSpan={8} className="px-2 sm:px-3 py-3">
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="rounded border border-border bg-background/40 p-2">
                            <div className="text-[10px] uppercase text-muted-foreground">OCR bruto</div>
                            <div className="font-mono break-all text-xs">{r.ocr_raw ?? '—'}</div>
                          </div>
                          <div className="rounded border border-border bg-background/40 p-2">
                            <div className="text-[10px] uppercase text-muted-foreground">Esperado</div>
                            <div className="font-mono text-xs break-all">
                              LS {r.expected_ls ?? '—'} · Validade {r.expected_expiration ?? '—'}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 space-y-1">
                          {(fields[r.id] ?? []).map((f) => (
                            <div
                              key={f.id}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded border border-border bg-background/40 px-2 sm:px-3 py-1.5 text-xs"
                            >
                              <div className="break-all">
                                <span className="text-muted-foreground">{f.field_name}: </span>
                                <span className="font-mono">{f.found_value ?? '—'}</span>
                                {f.expected_value && f.status === 'erro' && (
                                  <span className="text-muted-foreground"> · esp {f.expected_value}</span>
                                )}
                              </div>
                              <span
                                className={
                                  'font-mono rounded px-2 py-0.5 text-[10px] font-bold flex-shrink-0 ' +
                                  (f.status === 'ok'
                                    ? 'bg-success text-success-foreground'
                                    : f.status === 'erro'
                                      ? 'bg-destructive text-destructive-foreground'
                                      : 'bg-muted text-muted-foreground')
                                }
                              >
                                {f.status.toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
            </table>
          </div>

          {/* Cards para mobile */}
          <div className="sm:hidden space-y-3">
            {rows === null && (
              <div className="text-center py-6 text-muted-foreground text-sm">Carregando…</div>
            )}
            {rows?.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">Nenhuma inspeção salva ainda.</div>
            )}
            {rows?.map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">Data</div>
                    <div className="font-mono text-xs break-all">{new Date(r.created_at).toLocaleString('pt-BR')}</div>
                  </div>
                  <span
                    className={
                      'font-mono rounded px-2 py-0.5 text-[10px] font-bold flex-shrink-0 ' +
                      (r.aprovado
                        ? 'bg-success text-success-foreground'
                        : 'bg-destructive text-destructive-foreground')
                    }
                  >
                    {r.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">LS</div>
                    <div className="font-mono text-xs">{r.ls ?? '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">EA</div>
                    <div className="font-mono text-xs">{r.ea ?? '—'}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggle(r.id)}
                  className="w-full rounded border border-border bg-background px-3 py-2 text-xs hover:bg-accent"
                >
                  {expanded === r.id ? 'Fechar detalhes' : 'Ver detalhes'}
                </button>
                {expanded === r.id && (
                  <div className="mt-3 space-y-2 border-t border-border pt-3">
                    <div className="rounded border border-border bg-background/40 p-2">
                      <div className="text-[10px] uppercase text-muted-foreground">OCR bruto</div>
                      <div className="font-mono break-all text-xs">{r.ocr_raw ?? '—'}</div>
                    </div>
                    <div className="rounded border border-border bg-background/40 p-2">
                      <div className="text-[10px] uppercase text-muted-foreground">Esperado</div>
                      <div className="font-mono text-xs break-all">
                        LS {r.expected_ls ?? '—'} / Validade {r.expected_expiration ?? '—'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {(fields[r.id] ?? []).map((f) => (
                        <div key={f.id} className="rounded border border-border bg-background/40 px-2 py-1.5 text-xs space-y-1">
                          <div className="break-all">
                            <span className="text-muted-foreground">{f.field_name}: </span>
                            <span className="font-mono">{f.found_value ?? '—'}</span>
                          </div>
                          <span
                            className={
                              'font-mono rounded px-2 py-0.5 text-[10px] font-bold inline-block ' +
                              (f.status === 'ok'
                                ? 'bg-success text-success-foreground'
                                : f.status === 'erro'
                                  ? 'bg-destructive text-destructive-foreground'
                                  : 'bg-muted text-muted-foreground')
                            }
                          >
                            {f.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default HistoryPage
