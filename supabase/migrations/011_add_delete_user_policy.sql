-- ============================================
-- Migração 011: Adicionar Política de DELETE para users_profiles
-- ============================================

-- 1. Garantir que RLS está habilitado (caso tenha sido desabilitado)
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas conflitantes que possam existir
DROP POLICY IF EXISTS "Enable read access for all users" ON users_profiles;
DROP POLICY IF EXISTS "Anyone can view users profiles" ON users_profiles;
DROP POLICY IF EXISTS "Public read access for users profiles" ON users_profiles;

-- 3. Criar políticas completas para users_profiles

-- Política para SELECT (visualizar perfis)
CREATE POLICY "Public read access for users profiles" ON users_profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Política para UPDATE (atualizar perfis)
CREATE POLICY "Users can update own profile" ON users_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política para UPDATE (admins podem atualizar qualquer perfil)
CREATE POLICY "Admins can update all profiles" ON users_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. NOVA POLÍTICA: DELETE (exclusão de perfis)
-- Apenas administradores podem excluir perfis de usuários
CREATE POLICY "Admins can delete user profiles" ON users_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Verificação final
DO $$
BEGIN
  -- Verificar se RLS está habilitado
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'users_profiles' 
    AND rowsecurity = false
  ) THEN
    RAISE EXCEPTION '❌ RLS ainda está desabilitado em users_profiles';
  ELSE
    RAISE NOTICE '✅ RLS habilitado com sucesso em users_profiles';
  END IF;
  
  -- Verificar se a política de DELETE foi criada
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users_profiles' 
    AND policyname = 'Admins can delete user profiles'
  ) THEN
    RAISE NOTICE '✅ Política de DELETE criada com sucesso';
  ELSE
    RAISE EXCEPTION '❌ Falha ao criar política de DELETE';
  END IF;
  
  -- Listar todas as políticas atuais
  RAISE NOTICE '📋 Políticas atuais da tabela users_profiles:';
  FOR rec IN (
    SELECT policyname, cmd 
    FROM pg_policies 
    WHERE tablename = 'users_profiles'
    ORDER BY policyname
  ) LOOP
    RAISE NOTICE '  - %: %', rec.policyname, rec.cmd;
  END LOOP;
END $$;
