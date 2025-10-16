-- Política alternativa para acesso público às contas
-- Execute este script no SQL Editor do Supabase Dashboard

-- Remover política existente se houver
DROP POLICY IF EXISTS "Anyone can view public accounts" ON accounts;

-- Criar nova política pública
CREATE POLICY "Public accounts access" ON accounts
  FOR SELECT 
  TO public
  USING (true);

-- Verificar se a política foi criada
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'accounts';
