-- Adicionar política pública para permitir que todos vejam os nomes de usuários
-- Isso é necessário para que a página de perfis possa mostrar quem criou cada perfil

-- Criar política para permitir que qualquer pessoa veja os perfis dos usuários
CREATE POLICY "Anyone can view users profiles" ON users_profiles
  FOR SELECT USING (true);

-- Esta política permite que a página pública de perfis mostre o display_name
-- de quem criou cada perfil, melhorando a transparência e UX

