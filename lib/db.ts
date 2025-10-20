import { Pool, type PoolConfig } from "pg"

let pool: Pool | null = null

function resolveDatabaseConfig(): PoolConfig {
  const connectionString =
    process.env.DATABASE_URL ?? process.env.NEON_POSTGRES_URL ?? process.env.POSTGRES_URL

  const disableSSLFlag = (process.env.PGSSLMODE ?? "").toLowerCase() === "disable"

  if (connectionString) {
    const lowerCasedUrl = connectionString.toLowerCase()
    const shouldDisableSSL =
      disableSSLFlag ||
      lowerCasedUrl.includes("localhost") ||
      lowerCasedUrl.includes("127.0.0.1") ||
      lowerCasedUrl.includes("railway.internal")

    return {
      connectionString,
      ssl: shouldDisableSSL ? false : { rejectUnauthorized: false },
    }
  }

  const host = process.env.PGHOST
  const port = process.env.PGPORT ? Number(process.env.PGPORT) : undefined
  const database = process.env.PGDATABASE
  const user = process.env.PGUSER
  const password = process.env.PGPASSWORD

  if (host && database && user) {
    return {
      host,
      port,
      database,
      user,
      password,
      ssl: disableSSLFlag ? false : { rejectUnauthorized: false },
    }
  }

  throw new Error(
    "DATABASE_URL (o NEON_POSTGRES_URL / POSTGRES_URL / PGHOST, PGDATABASE, PGUSER) debe estar definida para conectar a PostgreSQL.",
  )
}

function getPool(): Pool {
  if (pool) {
    return pool
  }

  pool = new Pool(resolveDatabaseConfig())

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
  user_id: string | null
}

export interface User {
  id: string
  name: string
  email: string
  created_at: string
  updated_at: string
}

interface UserRow extends User {
  password_hash: string
}

let dbInitialized = false

async function initializeDatabase() {
  if (dbInitialized) return

  try {
    console.log("[v0] Inicializando base de datos...")

    const pool = getPool()

    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`)

    // Crear tabla usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`)

    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_users()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    await pool.query(`
      DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
      CREATE TRIGGER trg_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_users();
    `)

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
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    await pool.query(`
      ALTER TABLE profiles
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL
    `)

    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_profiles()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    await pool.query(`
      DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
      CREATE TRIGGER trg_profiles_updated_at
        BEFORE UPDATE ON profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_profiles();
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

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  await initializeDatabase()

  try {
    const pool = getPool()
    const { rows } = await pool.query<Profile>(`SELECT * FROM profiles WHERE user_id = $1`, [userId])
    return rows[0] ?? null
  } catch (error) {
    console.error("[v0] Error fetching profile by user id:", error)
    return null
  }
}

export async function createProfile(data: {
  userId: string | null
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

    const userId = data.userId ?? null

    const result = await pool.query<Profile>(
      `INSERT INTO profiles (user_id, username, display_name, bio, profile_image_url, social_links, custom_links)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)
       RETURNING *`,
      [
        userId,
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
    userId: string | null
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
    const ownerId = data.userId ?? null

    const existing = await pool.query<{ id: string }>(
      `SELECT id FROM profiles WHERE username = $1 AND ($2::uuid IS NULL OR user_id = $2 OR user_id IS NULL)`,
      [username, ownerId],
    )

    if (existing.rows.length === 0) {
      return null
    }

    const result = await pool.query<Profile>(
      `UPDATE profiles
       SET 
         display_name = $1,
         bio = $2,
         profile_image_url = $3,
         social_links = $4::jsonb,
         custom_links = $5::jsonb,
         updated_at = NOW(),
         user_id = COALESCE(user_id, $7)
       WHERE username = $6
         AND ($7::uuid IS NULL OR user_id = $7 OR user_id IS NULL)
       RETURNING *`,
      [
        data.display_name,
        data.bio || null,
        data.profile_image_url || null,
        JSON.stringify(data.social_links),
        JSON.stringify(data.custom_links),
        username,
        ownerId,
      ],
    )

    return result.rows[0] ?? null
  } catch (error) {
    console.error("[v0] Error updating profile:", error)
    return null
  }
}

export async function createUser(data: {
  name: string
  email: string
  passwordHash: string
}): Promise<User> {
  await initializeDatabase()

  try {
    const pool = getPool()
    const result = await pool.query<User>(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at, updated_at`,
      [data.name, data.email.toLowerCase(), data.passwordHash],
    )

    return result.rows[0]
  } catch (error) {
    console.error("[minibio] Error creando usuario:", error)
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  await initializeDatabase()
  try {
    const pool = getPool()
    const result = await pool.query<User>(
      `SELECT id, name, email, created_at, updated_at FROM users WHERE email = $1`,
      [email.toLowerCase()],
    )
    return result.rows[0] ?? null
  } catch (error) {
    console.error("[minibio] Error obteniendo usuario por email:", error)
    throw error
  }
}

export async function getUserWithPasswordByEmail(email: string): Promise<UserRow | null> {
  await initializeDatabase()
  try {
    const pool = getPool()
    const result = await pool.query<UserRow>(
      `SELECT * FROM users WHERE email = $1`,
      [email.toLowerCase()],
    )
    return result.rows[0] ?? null
  } catch (error) {
    console.error("[minibio] Error obteniendo hash de contraseña:", error)
    throw error
  }
}

export async function getUserById(id: string): Promise<User | null> {
  await initializeDatabase()
  try {
    const pool = getPool()
    const result = await pool.query<User>(
      `SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1`,
      [id],
    )
    return result.rows[0] ?? null
  } catch (error) {
    console.error("[minibio] Error obteniendo usuario por id:", error)
    throw error
  }
}
