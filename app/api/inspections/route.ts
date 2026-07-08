import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function normalizeRow(r: any) {
  const approved = r.approved ?? r.aprovado ?? false
  const statusStr =
    typeof r.result_summary === 'string' && r.result_summary.trim()
      ? r.result_summary
      : typeof r.status === 'string' && r.status.trim()
        ? r.status
        : approved === true
          ? 'APROVADO'
          : approved === false
            ? 'REPROVADO'
            : ''

  return {
    id: String(r.id ?? ''),
    created_at: String(r.created_at ?? new Date().toISOString()),
    status: String(statusStr ?? ''),
    aprovado: !!approved,
    ea: r.parsed_ea ?? r.ea ?? null,
    ls: r.parsed_ls ?? r.ls ?? r.julian_code ?? null,
    data_validade: r.parsed_data ?? r.data_validade ?? r.expiration_date ?? null,
    hora: r.parsed_hour ?? r.hora ?? null,
    producao: r.production_date ?? r.producao ?? null,
    ocr_raw: r.raw_text ?? r.ocr_raw ?? null,
    ocr_confidence: r.ocr_confidence ?? null,
    sharpness: r.sharpness ?? null,
    inspection_result_fields: Array.isArray(r.inspection_result_fields)
      ? r.inspection_result_fields
      : undefined,
  }
}

export async function GET() {
  try {
    const SUPABASE_URL =
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL in env' },
        { status: 500 }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data, error } = await supabase
      .from('inspection_results')
      .select('*, inspection_result_fields(*)')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 502 }
      )
    }

    const normalized = (data ?? []).map(normalizeRow)

    return NextResponse.json({ data: normalized })
  } catch (e) {
    const message =
      e instanceof Error ? e.message : String(e)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
