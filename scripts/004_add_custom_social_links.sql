-- Script para agregar la columna custom_social_links a la tabla profiles
-- Ejecutar este script para agregar soporte para redes sociales personalizadas

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS custom_social_links JSONB DEFAULT '[]'::jsonb;

-- Actualizar registros existentes para que tengan un array vacío
UPDATE profiles 
SET custom_social_links = '[]'::jsonb 
WHERE custom_social_links IS NULL;
