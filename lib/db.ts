import { Pool } from "pg"

let pool: Pool | null = null

function getPool(): Pool {
  if (pool) {
    return pool
  }

  const connectionString =
    process.env.DATABASE_URL ?? process.env.NEON_POSTGRES_URL ?? process.env.POSTGRES_URL

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL (o NEON_POSTGRES_URL / POSTGRES_URL) debe estar definida para conectar a PostgreSQL.",
    )
  }

  const lowerCasedUrl = connectionString.toLowerCase()
  const disableSSLFlag = (process.env.PGSSLMODE ?? "").toLowerCase() === "disable"
  const shouldDisableSSL =
    disableSSLFlag ||
    lowerCasedUrl.includes("localhost") ||
    lowerCasedUrl.includes("127.0.0.1") ||
    lowerCasedUrl.includes("railway.internal")

  pool = new Pool({
    connectionString,
    ssl: shouldDisableSSL ? false : { rejectUnauthorized: false },
  })

  pool.on("error", (error) => {
    console.error("[minibio] Error en la conexión de PostgreSQL:", error)
  })

  return pool
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

async function initializeDatabase() {
  if (dbInitialized) return

  try {
    console.log("[v0] Inicializando base de datos...")

    const pool = getPool()

    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`)

    // Crear tabla profiles si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        bio TEXT,
        profile_image_url TEXT,
        social_links JSONB DEFAULT '{}'::jsonb,
        custom_links JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Crear índice
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username)`)

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
    const pool = getPool()
    const { rows } = await pool.query<Profile>(`SELECT * FROM profiles WHERE username = $1`, [username])

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
    const pool = getPool()
    const existing = await pool.query<{ id: string }>(
      `SELECT id FROM profiles WHERE username = $1`,
      [data.username],
    )

    if (existing.rows.length > 0) {
      throw new Error("Este nombre de usuario ya está en uso")
    }

    const result = await pool.query<Profile>(
      `INSERT INTO profiles (username, display_name, bio, profile_image_url, social_links, custom_links)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb)
       RETURNING *`,
      [
        data.username,
        data.display_name,
        data.bio || null,
        data.profile_image_url || null,
        JSON.stringify(data.social_links),
        JSON.stringify(data.custom_links),
      ],
    )

    return result.rows[0] ?? null
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
    const pool = getPool()
    const existing = await pool.query<{ id: string }>(
      `SELECT id FROM profiles WHERE username = $1`,
      [username],
    )

    if (existing.rows.length === 0) {
      throw new Error("Perfil no encontrado")
    }

    const result = await pool.query<Profile>(
      `UPDATE profiles
       SET 
         display_name = $1,
         bio = $2,
         profile_image_url = $3,
         social_links = $4::jsonb,
         custom_links = $5::jsonb,
         updated_at = NOW()
       WHERE username = $6
       RETURNING *`,
      [
        data.display_name,
        data.bio || null,
        data.profile_image_url || null,
        JSON.stringify(data.social_links),
        JSON.stringify(data.custom_links),
        username,
      ],
    )

    return result.rows[0] ?? null
  } catch (error) {
    console.error("[v0] Error updating profile:", error)
    throw error
  }
}
