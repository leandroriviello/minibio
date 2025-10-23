-- Migración para agregar la columna custom_social_links a la tabla profiles
-- Esta migración es necesaria para resolver el error: column "custom_social_links" of relation "profiles" does not exist

-- Agregar la columna custom_social_links si no existe
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS custom_social_links JSONB DEFAULT '[]'::jsonb;

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'custom_social_links';