-- Add group_link column to accounts table
ALTER TABLE accounts ADD COLUMN group_link TEXT;

-- Add comment to explain the column purpose
COMMENT ON COLUMN accounts.group_link IS 'Link de convite do grupo WhatsApp (apenas para tipo whatsapp_group)';
