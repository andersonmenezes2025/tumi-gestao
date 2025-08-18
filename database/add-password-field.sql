-- Adicionar campo password_hash à tabela profiles existente
-- Execute apenas se a tabela profiles já existir sem este campo

-- Verificar se o campo já existe, se não, adicionar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE profiles ADD COLUMN password_hash text;
    END IF;
END $$;

-- Atualizar registros existentes com senha padrão (hash de 'admin123')
UPDATE profiles 
SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8.J7hb9e2QRzL3KuRrm'
WHERE password_hash IS NULL;