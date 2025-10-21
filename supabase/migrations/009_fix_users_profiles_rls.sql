-- ============================================
-- Correção Definitiva do Erro 406
-- Migração 009: Fix users_profiles RLS
-- ============================================

-- Primeiro, remover qualquer política existente que possa estar conflitando
DROP POLICY IF EXISTS "Anyone can view users profiles" ON users_profiles;
DROP POLICY IF EXISTS "Public read access for users profiles" ON users_profiles;
DROP POLICY IF EXISTS "Public users profiles access" ON users_profiles;

-- Garantir que RLS está habilitado
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- Criar política pública com TO anon, authenticated
-- Isso garante que tanto usuários anônimos quanto autenticados possam ler
CREATE POLICY "Enable read access for all users" ON users_profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Verificação: Testar se a política foi criada
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users_profiles' 
    AND policyname = 'Enable read access for all users'
  ) THEN
    RAISE NOTICE '✅ Política criada com sucesso!';
  ELSE
    RAISE EXCEPTION '❌ Falha ao criar política';
  END IF;
END $$;

