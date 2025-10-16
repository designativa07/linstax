-- Adicionar coluna group_link à tabela accounts
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS group_link TEXT;

-- Adicionar comentário explicativo
COMMENT ON COLUMN accounts.group_link IS 'Link de convite do grupo WhatsApp (apenas para tipo whatsapp_group)';
