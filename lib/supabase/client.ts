import { createClient } from "@supabase/supabase-js"

// External Supabase project (pae). Anon key is publishable — safe on the client.
// Values come from environment variables (.env local / Vercel Project Settings).
// Fallbacks garantem funcionamento se as variáveis não estiverem definidas.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  "https://rpyejdtxsuodagbvakhw.supabase.co"

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  "sb_publishable_NBm1oeErb_4freVoLcbE7g_vAFTaawb"

// Em dev podemos usar a service role key definida em .env (SUPABASE_SERVICE_ROLE_KEY)
// para contornar RLS durante desenvolvimento. NÃO recomendável em produção.
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ??
  undefined

const KEY_TO_USE = SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, KEY_TO_USE, {
  auth: { persistSession: false, autoRefreshToken: false },
})

