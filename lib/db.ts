import { neon } from "@neondatabase/serverless"

type NeonClient = ReturnType<typeof neon>

let sqlClient: NeonClient | null = null

function getSqlClient(): NeonClient {
  if (sqlClient) {
    return sqlClient
  }

  const connectionString =
    process.env.DATABASE_URL ?? process.env.NEON_POSTGRES_URL ?? process.env.POSTGRES_URL

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL (or NEON_POSTGRES_URL / POSTGRES_URL) must be defined to connect to PostgreSQL.",
    )
  }

  sqlClient = neon(connectionString)
  return sqlClient
}

export interface CustomLink {
  title: string
  url: string
}

export interface Profile {
  id: string
  username: string
  display_name: string
  bio: string | null
  profile_image_url: string | null
  social_links: Record<string, string>
  custom_links: CustomLink[]
  created_at: string
  updated_at: string
}

let dbInitialized = false

function normalizeResult<T>(result: unknown): T[] {
  if (Array.isArray(result)) {
    return result as T[]
  }

  if (result && typeof result === "object" && "rows" in result && Array.isArray((result as { rows: unknown }).rows)) {
    return (result as { rows: unknown[] }).rows as T[]
  }

  return []
}

async function initializeDatabase() {
  if (dbInitialized) return

  try {
    console.log("[v0] Inicializando base de datos...")

    const sql = getSqlClient()

    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`

    // Crear tabla profiles si no existe
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        bio TEXT,
        profile_image_url TEXT,
        social_links JSONB DEFAULT '{}',
        custom_links JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Crear índice
    await sql`
      CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username)
    `

    console.log("[v0] Base de datos inicializada correctamente")
  } catch (error) {
    console.error("[v0] Error inicializando base de datos:", error)
    throw error
  } finally {
    dbInitialized = true
  }
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  await initializeDatabase()

  try {
    const sql = getSqlClient()
    const result = await sql`
      SELECT * FROM profiles WHERE username = ${username}
    `

    const rows = normalizeResult<Profile>(result)

    if (rows.length === 0) {
      return null
    }

    return rows[0]
  } catch (error) {
    console.error("[v0] Error fetching profile:", error)
    return null
  }
}

export async function createProfile(data: {
  username: string
  display_name: string
  bio?: string
  profile_image_url?: string
  social_links: Record<string, string>
  custom_links: CustomLink[]
}): Promise<Profile | null> {
  await initializeDatabase()

  try {
    const sql = getSqlClient()
    const existing = await sql`
      SELECT id FROM profiles WHERE username = ${data.username}
    `

    const existingRows = normalizeResult<{ id: string }>(existing)

    if (existingRows.length > 0) {
      throw new Error("Este nombre de usuario ya está en uso")
    }

    const result = await sql`
      INSERT INTO profiles (username, display_name, bio, profile_image_url, social_links, custom_links)
      VALUES (
        ${data.username}, 
        ${data.display_name}, 
        ${data.bio || null}, 
        ${data.profile_image_url || null}, 
        ${JSON.stringify(data.social_links)}, 
        ${JSON.stringify(data.custom_links)}
      )
      RETURNING *
    `

    const rows = normalizeResult<Profile>(result)

    return rows[0] ?? null
  } catch (error) {
    console.error("[v0] Error creating profile:", error)
    throw error
  }
}

export async function updateProfile(
  username: string,
  data: {
    display_name: string
    bio?: string
    profile_image_url?: string
    social_links: Record<string, string>
    custom_links: CustomLink[]
  },
): Promise<Profile | null> {
  await initializeDatabase()

  try {
    const sql = getSqlClient()
    const existing = await sql`
      SELECT id FROM profiles WHERE username = ${username}
    `

    const existingRows = normalizeResult<{ id: string }>(existing)

    if (existingRows.length === 0) {
      throw new Error("Perfil no encontrado")
    }

    const result = await sql`
      UPDATE profiles
      SET 
        display_name = ${data.display_name},
        bio = ${data.bio || null},
        profile_image_url = ${data.profile_image_url || null},
        social_links = ${JSON.stringify(data.social_links)},
        custom_links = ${JSON.stringify(data.custom_links)},
        updated_at = NOW()
      WHERE username = ${username}
      RETURNING *
    `

    const rows = normalizeResult<Profile>(result)

    return rows[0] ?? null
  } catch (error) {
    console.error("[v0] Error updating profile:", error)
    throw error
  }
}
