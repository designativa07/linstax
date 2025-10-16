-- Script para verificar e corrigir políticas públicas no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se a política pública existe
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'accounts' AND policyname = 'Anyone can view public accounts';

-- 2. Se a política não existir, criar ela
-- (Descomente as linhas abaixo se necessário)

-- DROP POLICY IF EXISTS "Anyone can view public accounts" ON accounts;
-- CREATE POLICY "Anyone can view public accounts" ON accounts
--   FOR SELECT USING (true);

-- 3. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'accounts';

-- 4. Verificar dados na tabela accounts
SELECT COUNT(*) as total_accounts FROM accounts;

-- 5. Testar uma consulta simples
SELECT id, name, type, created_at FROM accounts LIMIT 5;

-- 6. Verificar se há dados de usuários
SELECT COUNT(*) as total_users FROM users_profiles;

-- 7. Verificar se há categorias
SELECT COUNT(*) as total_categories FROM categories;
