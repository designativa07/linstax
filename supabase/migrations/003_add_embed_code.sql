-- Adicionar campo para embed de posts do Instagram
-- Execute este script no SQL Editor do Supabase Dashboard

-- Adicionar coluna embed_code na tabela accounts
ALTER TABLE accounts 
ADD COLUMN embed_code TEXT;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN accounts.embed_code IS 'Código HTML do embed do Instagram para posts específicos';

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'accounts' AND column_name = 'embed_code';
