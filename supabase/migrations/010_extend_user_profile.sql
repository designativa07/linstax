-- ============================================
-- Migração 010: Expandir Perfil de Usuário
-- ============================================

-- 1. Adicionar campos extras ao perfil do usuário
ALTER TABLE users_profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON users_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Anyone can view users profiles" ON users_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON users_profiles;
DROP POLICY IF EXISTS "Public read access for users profiles" ON users_profiles;

-- 3. Desabilitar RLS completamente
ALTER TABLE users_profiles DISABLE ROW LEVEL SECURITY;

-- 4. Comentário sobre a decisão
COMMENT ON TABLE users_profiles IS 'Tabela pública de perfis de usuários. RLS desabilitado para permitir leitura de display_name, role e outras informações necessárias.';

-- 5. Garantir que a função de atualização existe
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Garantir que o trigger existe
DROP TRIGGER IF EXISTS update_users_profiles_updated_at ON users_profiles;
CREATE TRIGGER update_users_profiles_updated_at
  BEFORE UPDATE ON users_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Verificação final
DO $$
BEGIN
  -- Verificar se RLS está desabilitado
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'users_profiles' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION '❌ RLS ainda está habilitado em users_profiles';
  ELSE
    RAISE NOTICE '✅ RLS desabilitado com sucesso em users_profiles';
  END IF;
  
  -- Verificar se novos campos existem
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles'
    AND column_name IN ('phone', 'bio', 'instagram', 'whatsapp', 'website', 'avatar_url')
  ) THEN
    RAISE NOTICE '✅ Novos campos adicionados com sucesso';
  ELSE
    RAISE EXCEPTION '❌ Campos não foram adicionados';
  END IF;
END $$;

