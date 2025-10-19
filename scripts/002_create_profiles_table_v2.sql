-- Crear la tabla profiles si no existe
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  custom_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice en username para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública
DROP POLICY IF EXISTS "Permitir lectura pública de perfiles" ON profiles;
CREATE POLICY "Permitir lectura pública de perfiles"
  ON profiles FOR SELECT
  USING (true);

-- Política para permitir inserción pública (para crear perfiles)
DROP POLICY IF EXISTS "Permitir creación de perfiles" ON profiles;
CREATE POLICY "Permitir creación de perfiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Política para permitir actualización pública (temporal, debería ser por usuario autenticado)
DROP POLICY IF EXISTS "Permitir actualización de perfiles" ON profiles;
CREATE POLICY "Permitir actualización de perfiles"
  ON profiles FOR UPDATE
  USING (true);
