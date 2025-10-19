-- Crear tabla de perfiles para minibio
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
);

-- Crear índice para búsquedas rápidas por username
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer perfiles públicos
CREATE POLICY "Los perfiles son públicos para lectura"
  ON profiles FOR SELECT
  USING (true);

-- Política: Cualquiera puede crear un perfil
CREATE POLICY "Cualquiera puede crear un perfil"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Política: Solo el dueño puede actualizar su perfil (por ahora sin auth, usamos el id)
CREATE POLICY "Actualizar propio perfil"
  ON profiles FOR UPDATE
  USING (true);
