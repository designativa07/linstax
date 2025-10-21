-- Criar tabela de favoritos
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, account_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_account_id ON favorites(account_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados poderem ver apenas seus próprios favoritos
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários autenticados poderem inserir seus próprios favoritos
CREATE POLICY "Users can insert their own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários autenticados poderem deletar seus próprios favoritos
CREATE POLICY "Users can delete their own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Função para verificar se um perfil é favorito do usuário
CREATE OR REPLACE FUNCTION is_favorite(user_uuid UUID, account_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM favorites 
    WHERE user_id = user_uuid AND account_id = account_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para contar favoritos de um perfil
CREATE OR REPLACE FUNCTION count_favorites(account_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM favorites 
    WHERE account_id = account_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
