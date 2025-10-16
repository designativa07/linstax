-- Migration para suportar múltiplas categorias por conta

-- Criar tabela de relacionamento many-to-many
CREATE TABLE accounts_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, category_id)
);

-- Habilitar RLS na nova tabela
ALTER TABLE accounts_categories ENABLE ROW LEVEL SECURITY;

-- Políticas para accounts_categories
CREATE POLICY "Users can view own account categories" ON accounts_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE accounts.id = accounts_categories.account_id 
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own account categories" ON accounts_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE accounts.id = accounts_categories.account_id 
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own account categories" ON accounts_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE accounts.id = accounts_categories.account_id 
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own account categories" ON accounts_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE accounts.id = accounts_categories.account_id 
      AND accounts.user_id = auth.uid()
    )
  );

-- Política pública para visualização (para páginas públicas)
CREATE POLICY "Anyone can view account categories" ON accounts_categories
  FOR SELECT USING (true);

-- Migrar dados existentes da coluna category_id para a nova tabela
INSERT INTO accounts_categories (account_id, category_id)
SELECT id, category_id 
FROM accounts 
WHERE category_id IS NOT NULL;

-- Remover a coluna category_id da tabela accounts (opcional - comentado por segurança)
-- ALTER TABLE accounts DROP COLUMN category_id;

-- Adicionar índices para performance
CREATE INDEX idx_accounts_categories_account_id ON accounts_categories(account_id);
CREATE INDEX idx_accounts_categories_category_id ON accounts_categories(category_id);
