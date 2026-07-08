import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

interface ParsedPrint {
  data?: string
  ls?: string
  ea?: string
  hora?: string
}

interface ValidationResult {
  aprovado: boolean
  campos: Array<{
    campo: string
    esperado?: string
    encontrado?: string
    status: string
  }>
}

interface InspectionInput {
  parsed: ParsedPrint
  result: ValidationResult
  ocrRaw: string
  ocrConfidence: number
  sharpness: number
  expectedLS: string | null
  expectedExpiration: string
  producaoISO: string
}

function toISO(dateLike: any): string | null {
  if (!dateLike) return null
  // already ISO YYYY-MM-DD?
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateLike)) return dateLike
  // DD/MM/YY or DD/MM/YYYY -> convert
  const m = String(dateLike).match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (m) {
    let [_, dd, mm, yy] = m
    dd = dd.padStart(2, '0')
    mm = mm.padStart(2, '0')
    if (yy.length === 2) {
      // assume 20YY for two-digit years
      yy = '20' + yy
    }
    return `${yy}-${mm}-${dd}`
  }
  // fallback try Date parse
  const d = new Date(dateLike)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  return null
}

async function insertInspection(supabase: any, input: InspectionInput) {
  const { parsed, result, ocrRaw, ocrConfidence, sharpness, expectedLS, expectedExpiration, producaoISO } = input

  // Use canonical column names that exist in the upstream schema.
  const payload = {
    production_date: toISO(producaoISO) ?? producaoISO,
    julian_code: expectedLS,
    expiration_date: toISO(expectedExpiration) ?? expectedExpiration,
    approved: result.aprovado,
    raw_text: ocrRaw || null,
    parsed_data: parsed?.data ?? null,
    parsed_ls: parsed?.ls ?? null,
    parsed_ea: parsed?.ea ?? null,
    parsed_hour: parsed?.hora ?? null,
    ocr_confidence: Math.round(ocrConfidence),
    sharpness,
    result_summary: result.aprovado ? 'Aprovado' : 'Reprovado',
  }

  const { data, error } = await supabase
    .from('inspection_results')
    .insert(payload)
    .select('id')
    .single()
  if (error) throw error
  if (!data || !data.id) throw new Error('Insert returned no id')

  const fieldsPayload = result.campos.map((c) => ({
    inspection_id: data.id,
    field_name: c.campo,
    expected_value: c.esperado,
    found_value: c.encontrado,
    status: c.status,
  }))

  const { error: fieldsErr } = await supabase.from('inspection_result_fields').insert(fieldsPayload)
  if (fieldsErr) {
    // try rollback
    try {
      await supabase.from('inspection_results').delete().eq('id', data.id)
    } catch {}
    throw fieldsErr
  }

  return data.id
}

export async function POST(request: NextRequest) {
  try {
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL in env' },
        { status: 500 }
      )
    }

    const body = (await request.json()) as InspectionInput

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const id = await insertInspection(supabase, body)

    return NextResponse.json({ id })
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
