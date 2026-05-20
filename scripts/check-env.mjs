const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
]

const missing = requiredEnvVars.filter((key) => {
  const value = process.env[key]
  return !value || value.trim().length === 0
})

if (missing.length > 0) {
  console.error("[ENV] Missing required environment variables:")
  for (const key of missing) {
    console.error(`- ${key}`)
  }
  process.exit(1)
}

console.log("[ENV] Required environment variables are set.")
