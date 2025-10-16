-- Script para aplicar múltiplas categorias
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de relacionamento many-to-many
CREATE TABLE IF NOT EXISTS accounts_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, category_id)
);

-- 2. Habilitar RLS
ALTER TABLE accounts_categories ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS (remover políticas existentes primeiro)
DROP POLICY IF EXISTS "Users can view own account categories" ON accounts_categories;
DROP POLICY IF EXISTS "Users can insert own account categories" ON accounts_categories;
DROP POLICY IF EXISTS "Users can update own account categories" ON accounts_categories;
DROP POLICY IF EXISTS "Users can delete own account categories" ON accounts_categories;
DROP POLICY IF EXISTS "Anyone can view account categories" ON accounts_categories;

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

-- 4. Política pública para visualização (páginas públicas)
CREATE POLICY "Anyone can view account categories" ON accounts_categories
  FOR SELECT USING (true);

-- 5. Migrar dados existentes da coluna category_id para a nova tabela
INSERT INTO accounts_categories (account_id, category_id)
SELECT id, category_id 
FROM accounts 
WHERE category_id IS NOT NULL
ON CONFLICT (account_id, category_id) DO NOTHING;

-- 6. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_accounts_categories_account_id ON accounts_categories(account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_categories_category_id ON accounts_categories(category_id);

-- 7. Adicionar coluna embed_code se não existir
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS embed_code TEXT;
