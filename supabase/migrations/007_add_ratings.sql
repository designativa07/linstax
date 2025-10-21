-- Criar tabela de avaliações
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, account_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_account_id ON ratings(account_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rating ON ratings(rating);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Criar função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Política para todos poderem ver as avaliações (públicas)
CREATE POLICY "Anyone can view ratings" ON ratings
  FOR SELECT USING (true);

-- Política para usuários autenticados poderem inserir suas próprias avaliações
CREATE POLICY "Authenticated users can insert their own ratings" ON ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários autenticados poderem atualizar suas próprias avaliações
CREATE POLICY "Users can update their own ratings" ON ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários autenticados poderem deletar suas próprias avaliações
CREATE POLICY "Users can delete their own ratings" ON ratings
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para obter a avaliação média de um perfil
CREATE OR REPLACE FUNCTION get_average_rating(account_uuid UUID)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
    FROM ratings 
    WHERE account_id = account_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para contar o número de avaliações de um perfil
CREATE OR REPLACE FUNCTION count_ratings(account_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM ratings 
    WHERE account_id = account_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter a avaliação de um usuário específico para um perfil
CREATE OR REPLACE FUNCTION get_user_rating(user_uuid UUID, account_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT rating
    FROM ratings 
    WHERE user_id = user_uuid AND account_id = account_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas detalhadas de avaliações
CREATE OR REPLACE FUNCTION get_rating_stats(account_uuid UUID)
RETURNS TABLE(
  average_rating NUMERIC,
  total_ratings INTEGER,
  rating_5 INTEGER,
  rating_4 INTEGER,
  rating_3 INTEGER,
  rating_2 INTEGER,
  rating_1 INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) as average_rating,
    COUNT(*)::INTEGER as total_ratings,
    COUNT(*) FILTER (WHERE r.rating = 5)::INTEGER as rating_5,
    COUNT(*) FILTER (WHERE r.rating = 4)::INTEGER as rating_4,
    COUNT(*) FILTER (WHERE r.rating = 3)::INTEGER as rating_3,
    COUNT(*) FILTER (WHERE r.rating = 2)::INTEGER as rating_2,
    COUNT(*) FILTER (WHERE r.rating = 1)::INTEGER as rating_1
  FROM ratings r
  WHERE r.account_id = account_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

