const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

type SupabaseFetchOptions = RequestInit & {
  headers?: Record<string, string>
}

export async function supabaseFetch<T>(path: string, options: SupabaseFetchOptions = {}) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables.")
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}
